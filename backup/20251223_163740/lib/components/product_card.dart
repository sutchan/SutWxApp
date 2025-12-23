/**
 * 文件名: product_card.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-23
 * 作者: Sut
 * 描述: 商品卡片组件，用于展示商品信息
 */

import 'package:flutter/material.dart';
import '../models/product.dart';
import 'lazy_image.dart';

/// 商品卡片组件
class ProductCard extends StatelessWidget {
  /// 商品数据
  final Product product;
  
  /// 是否显示边框
  final bool bordered;
  
  /// 是否显示操作按钮
  final bool showActions;
  
  /// 卡片宽度
  final double? width;
  
  /// 图片高度
  final double imageHeight;
  
  /// 商品点击回调
  final Function(Product)? onTap;
  
  /// 加入购物车回调
  final Function(Product)? onAddToCart;
  
  /// 收藏回调
  final Function(Product, bool)? onFavorite;
  
  /// 构造函数
  const ProductCard({
    Key? key,
    required this.product,
    this.bordered = true,
    this.showActions = true,
    this.width,
    this.imageHeight = 200,
    this.onTap,
    this.onAddToCart,
    this.onFavorite,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      decoration: BoxDecoration(
        border: bordered ? Border.all(color: Colors.grey.shade200, width: 1) : null,
        borderRadius: BorderRadius.circular(8),
        boxShadow: bordered ? [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ] : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 商品图片
          GestureDetector(
            onTap: () => onTap?.call(product),
            child: Stack(
              children: [
                Container(
                  height: imageHeight,
                  width: double.infinity,
                  child: LazyImage(
                    src: product.image,
                    height: imageHeight,
                    mode: BoxFit.cover,
                  ),
                ),
                // 收藏按钮
                Positioned(
                  top: 8,
                  right: 8,
                  child: GestureDetector(
                    onTap: () => onFavorite?.call(product, !product.isFavorite),
                    child: Icon(
                      product.isFavorite ? Icons.favorite : Icons.favorite_border,
                      color: product.isFavorite ? Colors.red : Colors.white,
                      size: 24,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // 商品信息
          Padding(
            padding: const EdgeInsets.all(12),
            child: GestureDetector(
              onTap: () => onTap?.call(product),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 商品名称
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 4),
                  // 商品价格
                  Text(
                    '¥${product.price.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.red,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // 商品销量和评分
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '销量: ${product.sales}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                      Row(
                        children: [
                          const Icon(
                            Icons.star,
                            size: 14,
                            color: Colors.yellow,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            product.rating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          // 操作按钮
          if (showActions)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => onAddToCart?.call(product),
                      icon: const Icon(Icons.shopping_cart, size: 16),
                      label: const Text('加入购物车'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
                        foregroundColor: Colors.white,
                        textStyle: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}