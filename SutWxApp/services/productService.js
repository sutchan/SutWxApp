/**
 * 文件名: productService.js
 * 版本号: 3.0.14
 * 更新日期: 2026-09-12
 * 描述: 产品服务层，提供产品相关功能（支持 WooCommerce 数据源）
 */

const request = require("../utils/request");
const { unwrap } = require("../utils/api");
const { getDataSource } = require("./dataSource");
const { mapWooCommerceProduct, mapWooCommerceProducts } = require("../models/product");
const { mockProducts } = require("./productService.mock");

async function getProductList(params = {}) {
  if (getDataSource() === "woocommerce") {
    try {
      const raw = await request.get("/api/product/list", params, { needAuth: false });
      const payload = unwrap(raw);
      const list = (payload && (payload.list || payload)) || [];
      return mapWooCommerceProducts(list);
    } catch (error) {
      console.error("WooCommerce 商品列表获取失败:", error);
      return [];
    }
  }

  try {
    let products = [...mockProducts];

    if (params.categoryId) {
      products = products.filter((p) => p.categoryId == params.categoryId);
    }

    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.desc.toLowerCase().includes(keyword),
      );
    }

    return products;
  } catch (error) {
    console.error("获取产品列表失败:", error);
    return [];
  }
}

async function getProductDetail(productId, options = {}) {
  if (getDataSource() === "woocommerce") {
    const reqOptions = { needAuth: false };
    if (options && options.cancelToken) reqOptions.cancelToken = options.cancelToken;
    const raw = await request.get(
      "/api/product/detail",
      { id: productId },
      reqOptions,
    );
    const product = mapWooCommerceProduct(unwrap(raw));
    if (!product) {
      throw new Error("产品不存在");
    }
    return product;
  }

  try {
    const product = mockProducts.find((p) => p.id == productId);
    if (!product) {
      throw new Error("产品不存在");
    }

    return {
      ...product,
      details: ["产品参数1", "产品参数2", "产品参数3"],
      tags: ["热销", "新品"],
    };
  } catch (error) {
    console.error("获取产品详情失败:", error);
    throw error;
  }
}

async function getRelatedProducts(productId, limit = 4) {
  try {
    const product = mockProducts.find((p) => p.id == productId);
    if (!product) return [];

    let related = mockProducts.filter(
      (p) => p.id != productId && p.categoryId == product.categoryId,
    );
    return related.slice(0, limit);
  } catch (error) {
    console.error("获取相关产品失败:", error);
    return [];
  }
}

async function addToFavorite(productId) {
  try {
    const product = mockProducts.find((p) => p.id == productId);
    if (product) {
      product.isFavorite = true;
    }
    return true;
  } catch (error) {
    console.error("收藏产品失败:", error);
    return false;
  }
}

async function removeFromFavorite(productId) {
  try {
    const product = mockProducts.find((p) => p.id == productId);
    if (product) {
      product.isFavorite = false;
    }
    return true;
  } catch (error) {
    console.error("取消收藏失败:", error);
    return false;
  }
}

module.exports = {
  getProductList,
  getProductDetail,
  getRelatedProducts,
  addToFavorite,
  removeFromFavorite,
  mapWooCommerceProduct,
  mapWooCommerceProducts,
};
