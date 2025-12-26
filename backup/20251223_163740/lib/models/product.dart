/// 文件名: product.dart
/// 版本号: 1.0.0
/// 更新日期: 2025-12-26
/// 作者: Sut
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
  
  /// 商品描述
  final String description;
  
  /// 商品分类
  final String category;
  
  /// 商品库存
  final int stock;
  
  /// 是否收藏
  final bool isFavorite;
  
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
    this.description = '',
    this.category = '',
    this.stock = 0,
    this.isFavorite = false,
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
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      stock: json['stock'] ?? 0,
      isFavorite: json['isFavorite'] ?? false,
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
      'description': description,
      'category': category,
      'stock': stock,
      'isFavorite': isFavorite,
      'sales': sales,
      'rating': rating,
    };
  }
}