/// 文件名: product.dart
/// 版本号: 1.0.0
/// 更新日期: 2025-12-27
/// 描述: 商品模型类，定义商品数据结构
class Product {
  /// 商品ID
  final String id;
  
  /// 商品名称
  final String name;
  
  /// 商品价格
  final double price;
  
  /// 商品图片
  final String image;
  
  /// 商品图片列表
  final List<String> images;
  
  /// 商品描述
  final String description;
  
  /// 商品分类
  final String category;
  
  /// 商品库存
  final int stock;
  
  /// 是否收藏
  final bool isFavorite;
  
  /// 是否点赞
  final bool isLiked;
  
  /// 折扣百分比
  final int? discount;
  
  /// 原价
  final double? originalPrice;
  
  /// 商品销量
  final int sales;
  
  /// 商品评分
  final double rating;
  
  /// 构造函数
  Product({
    required this.id,
    required this.name,
    required this.price,
    required this.image,
    this.images = const [],
    this.description = '',
    this.category = '',
    this.stock = 0,
    this.isFavorite = false,
    this.isLiked = false,
    this.discount,
    this.originalPrice,
    this.sales = 0,
    this.rating = 0.0,
  });
  
  /// 从JSON创建Product实例
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      price: json['price']?.toDouble() ?? 0.0,
      image: json['image'] ?? '',
      images: json['images'] != null && json['images'] is List ? List<String>.from(json['images']) : [],
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      stock: json['stock'] ?? 0,
      isFavorite: json['isFavorite'] ?? false,
      isLiked: json['isLiked'] ?? false,
      discount: json['discount'],
      originalPrice: json['originalPrice']?.toDouble(),
      sales: json['sales'] ?? 0,
      rating: json['rating']?.toDouble() ?? 0.0,
    );
  }
  
  /// 转换为JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'image': image,
      'images': images,
      'description': description,
      'category': category,
      'stock': stock,
      'isFavorite': isFavorite,
      'isLiked': isLiked,
      'discount': discount,
      'originalPrice': originalPrice,
      'sales': sales,
      'rating': rating,
    };
  }
}
