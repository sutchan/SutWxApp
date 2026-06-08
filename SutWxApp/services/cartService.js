
/**
 * 文件名: cartService.js
 * 版本号: 2.0.0
 * 更新日期: 2026-05-06
 * 描述: 购物车服务层，提供购物车相关的API调用和本地存储管理
 */

const request = require("../utils/request");

const STORAGE_KEY_CART = "cart_list";

const mockProducts = [
  {
    id: 1,
    name: "绿萝盆栽",
    price: 29.9,
    image: "/images/placeholder.svg",
    spec: "中号盆"
  },
  {
    id: 2,
    name: "多肉植物组合",
    price: 49.9,
    image: "/images/placeholder.svg",
    spec: "5株装"
  },
  {
    id: 3,
    name: "发财树",
    price: 88.0,
    image: "/images/placeholder.svg",
    spec: "1米高"
  }
];

function getCartFromStorage() {
  try {
    const cartData = wx.getStorageSync(STORAGE_KEY_CART);
    return cartData ? JSON.parse(cartData) : [];
  } catch (e) {
    console.error("读取购物车数据失败:", e);
    return [];
  }
}

function saveCartToStorage(cartList) {
  try {
    wx.setStorageSync(STORAGE_KEY_CART, JSON.stringify(cartList));
  } catch (e) {
    console.error("保存购物车数据失败:", e);
  }
}

function calculateCartCount(cartList) {
  return cartList.reduce(function (total, item) {
    return total + (item.selected ? item.quantity : 0);
  }, 0);
}

function getMockProduct(productId) {
  return mockProducts.find(p =&gt; p.id === productId) || mockProducts[0];
}

async function addToCart(options) {
  const { productId, specId, quantity = 1 } = options;

  try {
    const product = getMockProduct(productId);
    const cartList = getCartFromStorage();
    const existingIndex = cartList.findIndex(function (item) {
      return item.productId === productId &amp;&amp; item.specId === specId;
    });

    if (existingIndex &gt;= 0) {
      cartList[existingIndex].quantity += quantity;
    } else {
      cartList.push({
        id: Date.now(),
        productId,
        specId,
        name: product.name,
        image: product.image,
        price: product.price,
        spec: product.spec,
        quantity,
        selected: true,
        addTime: new Date().toISOString(),
      });
    }

    saveCartToStorage(cartList);
    wx.setStorageSync("cartCount", calculateCartCount(cartList));

    return {
      success: true,
      message: "添加成功"
    };
  } catch (error) {
    console.error("添加到购物车失败:", error);
    return {
      success: false,
      message: "添加失败，请稍后重试",
    };
  }
}

async function getCartList() {
  try {
    let cartList = getCartFromStorage();
    
    if (cartList.length === 0) {
      const product = getMockProduct(1);
      cartList = [{
        id: 1,
        productId: 1,
        name: product.name,
        image: product.image,
        price: product.price,
        spec: product.spec,
        quantity: 1,
        selected: true,
        addTime: new Date().toISOString(),
      }];
      saveCartToStorage(cartList);
    }

    return cartList;
  } catch (error) {
    console.error("获取购物车列表失败:", error);
    return [];
  }
}

async function updateCartItem(item) {
  try {
    const cartList = getCartFromStorage();
    const targetIndex = cartList.findIndex(function (cartItem) {
      return cartItem.id === item.id;
    });

    if (targetIndex &gt;= 0) {
      cartList[targetIndex] = { ...cartList[targetIndex], ...item };
      saveCartToStorage(cartList);
      wx.setStorageSync("cartCount", calculateCartCount(cartList));
    }

    return { success: true };
  } catch (error) {
    console.error("更新购物车商品失败:", error);
    return { success: false };
  }
}

async function removeFromCart(cartId) {
  try {
    let cartList = getCartFromStorage();
    cartList = cartList.filter(function (item) {
      return item.id !== cartId;
    });
    saveCartToStorage(cartList);
    wx.setStorageSync("cartCount", calculateCartCount(cartList));

    return { success: true };
  } catch (error) {
    console.error("删除购物车商品失败:", error);
    return { success: false };
  }
}

async function clearCart() {
  try {
    saveCartToStorage([]);
    wx.setStorageSync("cartCount", 0);
    return { success: true };
  } catch (error) {
    console.error("清空购物车失败:", error);
    return { success: false };
  }
}

module.exports = {
  addToCart,
  getCartList,
  updateCartItem,
  removeFromCart,
  clearCart,
};

