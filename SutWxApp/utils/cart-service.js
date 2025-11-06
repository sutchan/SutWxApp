/**
 * 购物车服务
 * 提供购物车相关的API调用和数据管理功能
 */

// 导入工具函数
import { request } from './api';
import { validateCartItemQuantity, validateId, validateCartItems } from './validator';

// 缓存配置
const CACHE_KEY = 'cart_items_cache';
const CACHE_EXPIRE_TIME = 5 * 60 * 1000; // 5分钟

// 缓存控制器
let cacheData = null;
let cacheTimestamp = 0;
let cartRequestController = null;

/**
 * 获取购物车商品列表
 * @param {Object} options - 选项配置
 * @param {boolean} options.forceRefresh - 是否强制刷新（忽略缓存）
 * @returns {Promise<Array>} 购物车商品列表
 */
export async function getCartItems({ forceRefresh = false } = {}) {
  try {
    // 检查缓存是否有效
    const now = Date.now();
    if (!forceRefresh && cacheData && (now - cacheTimestamp) < CACHE_EXPIRE_TIME) {
      console.log('使用购物车缓存数据');
      return cacheData;
    }
    
    // 取消之前的请求
    if (cartRequestController) {
      cartRequestController.abort();
    }
    
    // 创建新的请求控制器
    cartRequestController = new AbortController();
    
    // 发起请求
    const response = await request('/api/cart/items', {
      method: 'GET',
      signal: cartRequestController.signal,
      retry: {
        attempts: 3,
        delay: 1000
      }
    });
    
    // 更新缓存
    cacheData = response.data || [];
    cacheTimestamp = now;
    
    return cacheData;
  } catch (error) {
    // 如果是缓存数据存在的情况下请求失败，返回缓存数据
    if (cacheData && error.name !== 'ValidationError') {
      console.warn('购物车请求失败，返回缓存数据');
      return cacheData;
    }
    throw error;
  }
}

/**
 * 添加商品到购物车
 * @param {number|string} productId - 商品ID
 * @param {number} quantity - 数量
 * @param {number|string|null} skuId - 规格ID
 * @returns {Promise<Object>} 添加结果
 */
export async function addToCart(productId, quantity = 1, skuId = null) {
  // 数据验证
  validateId(productId, '商品ID');
  validateCartItemQuantity(quantity);
  if (skuId) {
    validateId(skuId, '规格ID');
  }
  
  const response = await request('/api/cart/add', {
    method: 'POST',
    data: {
      product_id: productId,
      quantity,
      sku_id: skuId
    },
    retry: {
      attempts: 3,
      delay: 1000
    }
  });
  
  // 清除缓存
  clearCartCache();
  
  return response.data;
}

/**
 * 更新购物车商品数量
 * @param {number|string} cartItemId - 购物车商品ID
 * @param {number} quantity - 新数量
 * @returns {Promise<Object>} 更新结果
 */
export async function updateCartItem(cartItemId, quantity) {
  // 数据验证
  validateId(cartItemId, '购物车商品ID');
  validateCartItemQuantity(quantity);
  
  const response = await request(`/api/cart/update/${cartItemId}`, {
    method: 'POST',
    data: {
      quantity
    },
    retry: {
      attempts: 3,
      delay: 1000
    }
  });
  
  // 清除缓存
  clearCartCache();
  
  return response.data;
}

/**
 * 删除购物车商品
 * @param {number|string} cartItemId - 购物车商品ID
 * @returns {Promise<Object>} 删除结果
 */
export async function deleteCartItem(cartItemId) {
  // 数据验证
  validateId(cartItemId, '购物车商品ID');
  
  const response = await request(`/api/cart/delete/${cartItemId}`, {
    method: 'POST',
    retry: {
      attempts: 3,
      delay: 1000
    }
  });
  
  // 清除缓存
  clearCartCache();
  
  return response.data;
}

/**
 * 批量删除购物车商品
 * @param {Array<number|string>} cartItemIds - 购物车商品ID列表
 * @returns {Promise<Object>} 删除结果
 */
export async function deleteCartItems(cartItemIds) {
  // 数据验证
  if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
    throw new Error('请选择要删除的商品');
  }
  
  // 验证每个ID
  cartItemIds.forEach(id => validateId(id, '购物车商品ID'));
  
  const response = await request('/api/cart/delete-batch', {
    method: 'POST',
    data: {
      cart_item_ids: cartItemIds
    },
    retry: {
      attempts: 3,
      delay: 1000
    }
  });
  
  // 清除缓存
  clearCartCache();
  
  return response.data;
}

/**
 * 清空购物车
 * @returns {Promise<Object>} 清空结果
 */
export async function clearCart() {
  const response = await request('/api/cart/clear', {
    method: 'POST',
    retry: {
      attempts: 3,
      delay: 1000
    }
  });
  
  // 清除缓存
  clearCartCache();
  
  return response.data;
}

/**
 * 检查购物车商品库存
 * @param {Array<Object>} cartItems - 购物车商品列表
 * @returns {Promise<Object>} 库存检查结果
 */
export async function checkCartStock(cartItems) {
  // 数据验证
  validateCartItems(cartItems);
  
  const response = await request('/api/cart/check-stock', {
    method: 'POST',
    data: {
      items: cartItems.map(item => ({
        product_id: item.product_id,
        sku_id: item.sku_id,
        quantity: item.quantity
      }))
    },
    retry: {
      attempts: 2,
      delay: 500
    }
  });
  
  return response.data;
}

/**
 * 将购物车商品移至收藏
 * @param {number|string} cartItemId - 购物车商品ID
 * @returns {Promise<Object>} 操作结果
 */
export async function moveToFavorite(cartItemId) {
  // 数据验证
  validateId(cartItemId, '购物车商品ID');
  
  const response = await request(`/api/cart/move-to-favorite/${cartItemId}`, {
    method: 'POST',
    retry: {
      attempts: 3,
      delay: 1000
    }
  });
  
  // 清除缓存
  clearCartCache();
  
  return response.data;
}

/**
 * 同步购物车数据
 * @returns {Promise<Object>} 同步结果
 */
export async function syncCart() {
  const response = await request('/api/cart/sync', {
    method: 'POST',
    retry: {
      attempts: 3,
      delay: 1000
    }
  });
  
  // 清除缓存
  clearCartCache();
  
  return response.data;
}

/**
 * 清空购物车缓存
 */
export function clearCartCache() {
  cacheData = null;
  cacheTimestamp = 0;
}

/**
 * 获取购物车数量（从缓存）
 * @returns {number} 购物车商品数量
 */
export function getCartCountFromCache() {
  if (!cacheData) return 0;
  return cacheData.reduce((total, item) => total + item.quantity, 0);
}

// 导出默认对象
export default {
  getCartItems,
  addToCart,
  updateCartItem,
  deleteCartItem,
  deleteCartItems,
  clearCart,
  checkCartStock,
  moveToFavorite,
  syncCart,
  clearCartCache,
  getCartCountFromCache
};