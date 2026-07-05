
/**
 * 文件名: productService.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-05
 * 描述: 产品服务层，提供产品相关功能
 */

const mockProducts = [
  {
    id: 1,
    name: "绿萝盆栽",
    price: 29.9,
    originPrice: 39.9,
    image: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    categoryId: 2,
    categoryName: "绿色植物",
    sales: 1288,
    stock: 100,
    desc: "室内净化空气必备",
    description: "绿萝是净化空气的最佳植物之一，适合放在室内养护",
    isFavorite: false,
    rating: 4.8,
    reviewCount: 256
  },
  {
    id: 2,
    name: "多肉植物组合",
    price: 49.9,
    originPrice: 69.9,
    image: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    categoryId: 3,
    categoryName: "多肉植物",
    sales: 968,
    stock: 50,
    desc: "5株精美多肉组合",
    description: "精选5种不同的多肉植物，包含精美花盆",
    isFavorite: false,
    rating: 4.9,
    reviewCount: 189
  },
  {
    id: 3,
    name: "发财树",
    price: 88.0,
    originPrice: 128.0,
    image: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    categoryId: 2,
    categoryName: "绿色植物",
    sales: 756,
    stock: 30,
    desc: "寓意吉祥，招财进宝",
    description: "发财树寓意吉祥，适合放在办公室或家中",
    isFavorite: false,
    rating: 4.7,
    reviewCount: 134
  },
  {
    id: 4,
    name: "蝴蝶兰盆栽",
    price: 128.0,
    originPrice: 168.0,
    image: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    categoryId: 4,
    categoryName: "鲜花花卉",
    sales: 526,
    stock: 25,
    desc: "高雅优美，送礼首选",
    description: "精选优质蝴蝶兰，花期长，花色艳丽",
    isFavorite: false,
    rating: 4.9,
    reviewCount: 98
  },
  {
    id: 5,
    name: "陶瓷花盆",
    price: 39.9,
    originPrice: 59.9,
    image: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    categoryId: 5,
    categoryName: "花盆花器",
    sales: 1356,
    stock: 200,
    desc: "简约现代风格",
    description: "优质陶瓷材质，简约现代设计",
    isFavorite: false,
    rating: 4.6,
    reviewCount: 312
  },
  {
    id: 6,
    name: "营养土",
    price: 19.9,
    originPrice: 29.9,
    image: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    categoryId: 7,
    categoryName: "营养土肥",
    sales: 2568,
    stock: 500,
    desc: "专用营养土",
    description: "专门为绿植配置的营养土，富含养分",
    isFavorite: false,
    rating: 4.8,
    reviewCount: 456
  }
];

/**
 * 获取产品列表
 * @param {Object} params { categoryId, keyword }
 * @returns {Promise<Array>} 产品列表
 */
async function getProductList(params = {}) {
  try {
    let products = [...mockProducts];

    if (params.categoryId) {
      products = products.filter(p => p.categoryId == params.categoryId);
    }

    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.desc.toLowerCase().includes(keyword)
      );
    }

    return products;
  } catch (error) {
    console.error("获取产品列表失败:", error);
    return [];
  }
}

/**
 * 获取产品详情
 * @param {number} productId 产品ID
 * @returns {Promise<Object>} 产品详情
 */
async function getProductDetail(productId) {
  try {
    const product = mockProducts.find(p => p.id == productId);
    if (!product) {
      throw new Error("产品不存在");
    }

    return {
      ...product,
      details: [
        "品种：优质绿植",
        "规格：标准盆栽",
        "养护：喜阴凉通风环境",
        "配送：全国包邮（偏远地区除外）"
      ],
      tags: ["热销", "新品"],
      specs: [
        { id: 1, name: "中号盆", price: product.price, stock: product.stock },
        { id: 2, name: "大号盆", price: product.price + 20, stock: Math.floor(product.stock / 2) }
      ]
    };
  } catch (error) {
    console.error("获取产品详情失败:", error);
    throw error;
  }
}

/**
 * 获取相关产品
 * @param {number} productId 产品ID
 * @param {number} limit 数量限制
 * @returns {Promise<Array>} 相关产品列表
 */
async function getRelatedProducts(productId, limit = 4) {
  try {
    const product = mockProducts.find(p => p.id == productId);
    if (!product) return [];

    let related = mockProducts.filter(p => p.id != productId && p.categoryId == product.categoryId);
    return related.slice(0, limit);
  } catch (error) {
    console.error("获取相关产品失败:", error);
    return [];
  }
}

/**
 * 收藏产品
 * @param {number} productId 产品ID
 * @returns {Promise<boolean>} 操作结果
 */
async function addToFavorite(productId) {
  try {
    const product = mockProducts.find(p => p.id == productId);
    if (product) {
      product.isFavorite = true;
    }
    return true;
  } catch (error) {
    console.error("收藏产品失败:", error);
    return false;
  }
}

/**
 * 取消收藏
 * @param {number} productId 产品ID
 * @returns {Promise<boolean>} 操作结果
 */
async function removeFromFavorite(productId) {
  try {
    const product = mockProducts.find(p => p.id == productId);
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
  removeFromFavorite
};
