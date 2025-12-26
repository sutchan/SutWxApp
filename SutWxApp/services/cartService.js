/**
 * 文件名: cartService.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-26
 * 描述: 购物车服务层，提供购物车相关的API调用和本地存储管理
 */

const request = require('../utils/request');
const store = require('../utils/store');

const STORAGE_KEY_CART = 'cart_list';

function getCartFromStorage() {
  try {
    const cartData = wx.getStorageSync(STORAGE_KEY_CART);
    return cartData ? JSON.parse(cartData) : [];
  } catch (e) {
    console.error('读取购物车数据失败:', e);
    return [];
  }
}

function saveCartToStorage(cartList) {
  try {
    wx.setStorageSync(STORAGE_KEY_CART, JSON.stringify(cartList));
  } catch (e) {
    console.error('保存购物车数据失败:', e);
  }
}

function calculateCartCount(cartList) {
  return cartList.reduce(function(total, item) {
    return total + (item.selected ? item.quantity : 0);
  }, 0);
}

async function addToCart(options) {
  const { productId, specId, quantity = 1 } = options;

  try {
    const res = await request.request({
      url: '/api/cart/add',
      method: 'POST',
      data: {
        productId,
        specId,
        quantity
      }
    });

    if (res.success) {
      const cartList = getCartFromStorage();
      const existingIndex = cartList.findIndex(function(item) {
        return item.productId === productId && item.specId === specId;
      });

      if (existingIndex >= 0) {
        cartList[existingIndex].quantity += quantity;
      } else {
        cartList.push({
          id: res.data.id || Date.now(),
          productId,
          specId,
          quantity,
          selected: true,
          addTime: new Date().toISOString()
        });
      }

      saveCartToStorage(cartList);
      wx.setStorageSync('cartCount', calculateCartCount(cartList));
    }

    return res;
  } catch (error) {
    console.error('添加到购物车失败:', error);
    return {
      success: false,
      message: '网络请求失败，请稍后重试'
    };
  }
}

async function getCartList() {
  try {
    const res = await request.request({
      url: '/api/cart/list',
      method: 'GET'
    });

    if (res.success && res.data) {
      const cartList = res.data.map(function(item) {
        return {
          id: item.id,
          productId: item.productId,
          specId: item.specId,
          productName: item.productName,
          productImage: item.productImage,
          specName: item.specName,
          specPrice: item.specPrice,
          quantity: item.quantity,
          stock: item.stock || 99,
          selected: item.selected !== false,
          addTime: item.addTime
        };
      });

      saveCartToStorage(cartList);
      wx.setStorageSync('cartCount', calculateCartCount(cartList));

      return {
        success: true,
        data: cartList
      };
    }

    return {
      success: false,
      message: res.message || '获取购物车列表失败'
    };
  } catch (error) {
    console.error('获取购物车列表失败:', error);

    const localCart = getCartFromStorage();
    return {
      success: true,
      data: localCart,
      message: '已加载本地购物车数据'
    };
  }
}

async function updateCartItem(options) {
  const { cartId, quantity, selected } = options;

  try {
    const res = await request.request({
      url: '/api/cart/update',
      method: 'POST',
      data: {
        cartId,
        quantity,
        selected
      }
    });

    if (res.success) {
      const cartList = getCartFromStorage();
      const targetIndex = cartList.findIndex(function(item) {
        return item.id === cartId;
      });

      if (targetIndex >= 0) {
        if (quantity !== undefined) {
          cartList[targetIndex].quantity = Math.max(1, Math.min(cartList[targetIndex].stock || 99, quantity));
        }
        if (selected !== undefined) {
          cartList[targetIndex].selected = selected;
        }
        saveCartToStorage(cartList);
        wx.setStorageSync('cartCount', calculateCartCount(cartList));
      }
    }

    return res;
  } catch (error) {
    console.error('更新购物车商品失败:', error);
    return {
      success: false,
      message: '网络请求失败，请稍后重试'
    };
  }
}

async function removeCartItem(cartId) {
  try {
    const res = await request.request({
      url: '/api/cart/remove',
      method: 'POST',
      data: { cartId }
    });

    if (res.success) {
      let cartList = getCartFromStorage();
      cartList = cartList.filter(function(item) {
        return item.id !== cartId;
      });
      saveCartToStorage(cartList);
      wx.setStorageSync('cartCount', calculateCartCount(cartList));
    }

    return res;
  } catch (error) {
    console.error('删除购物车商品失败:', error);
    return {
      success: false,
      message: '网络请求失败，请稍后重试'
    };
  }
}

async function clearCart() {
  try {
    const res = await request.request({
      url: '/api/cart/clear',
      method: 'POST'
    });

    if (res.success) {
      saveCartToStorage([]);
      wx.setStorageSync('cartCount', 0);
    }

    return res;
  } catch (error) {
    console.error('清空购物车失败:', error);

    saveCartToStorage([]);
    wx.setStorageSync('cartCount', 0);

    return {
      success: true,
      message: '本地购物车已清空'
    };
  }
}

async function selectCartItem(cartId, selected) {
  const cartList = getCartFromStorage();
  const targetIndex = cartList.findIndex(function(item) {
    return item.id === cartId;
  });

  if (targetIndex >= 0) {
    cartList[targetIndex].selected = selected;
    saveCartToStorage(cartList);
    wx.setStorageSync('cartCount', calculateCartCount(cartList));
  }

  try {
    await request.request({
      url: '/api/cart/select',
      method: 'POST',
      data: {
        cartId,
        selected
      }
    });
  } catch (e) {
    console.error('更新选中状态失败:', e);
  }
}

async function selectAllCartItems(selected) {
  const cartList = getCartFromStorage();
  cartList.forEach(function(item) {
    item.selected = selected;
  });
  saveCartToStorage(cartList);
  wx.setStorageSync('cartCount', calculateCartCount(cartList));

  try {
    await request.request({
      url: '/api/cart/selectAll',
      method: 'POST',
      data: { selected }
    });
  } catch (e) {
    console.error('更新全选状态失败:', e);
  }
}

function getCartCountSync() {
  const cartList = getCartFromStorage();
  return calculateCartCount(cartList);
}

async function getCartCount() {
  try {
    const res = await request.request({
      url: '/api/cart/count',
      method: 'GET'
    });

    if (res.success && res.data) {
      wx.setStorageSync('cartCount', res.data.count || 0);
      return res.data.count || 0;
    }

    return getCartCountSync();
  } catch (error) {
    console.error('获取购物车数量失败:', error);
    return getCartCountSync();
  }
}

async function checkStock(cartId) {
  try {
    const res = await request.request({
      url: '/api/cart/checkStock',
      method: 'POST',
      data: { cartId }
    });

    return res;
  } catch (error) {
    console.error('检查库存失败:', error);
    return {
      success: false,
      message: '网络请求失败'
    };
  }
}

module.exports = {
  addToCart,
  getCartList,
  updateCartItem,
  removeCartItem,
  clearCart,
  selectCartItem,
  selectAllCartItems,
  getCartCount,
  getCartCountSync,
  checkStock
};
