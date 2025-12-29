/// 文件名: product_card.dart
/// 版本号: 1.0.0
/// 更新日期: 2025-12-28
/// 描述: Flutter产品卡片组件，展示商品图片、名称、价格等信息，支持点赞、收藏、分享功能

import 'package:flutter/material.dart';
import '../../models/product.dart';
import 'lazy_image.dart';

class ProductCard extends StatefulWidget {
  final Product product;
  final VoidCallback? onTap;
  final VoidCallback? onLikePressed;
  final VoidCallback? onFavoritePressed;
  final VoidCallback? onSharePressed;
  final VoidCallback? onAddToCart;
  final bool showActions;
  final bool showDiscount;
  final bool compactMode;

  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
    this.onLikePressed,
    this.onFavoritePressed,
    this.onSharePressed,
    this.onAddToCart,
    this.showActions = true,
    this.showDiscount = true,
    this.compactMode = false,
  });

  @override
  State<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard> {
  bool _isLiked = false;
  bool _isFavorite = false;

  @override
  void initState() {
    super.initState();
    _isLiked = widget.product.isLiked;
    _isFavorite = widget.product.isFavorite;
  }

  void _handleLike() {
    setState(() {
      _isLiked = !_isLiked;
    });
    widget.onLikePressed?.call();
  }

  void _handleFavorite() {
    setState(() {
      _isFavorite = !_isFavorite;
    });
    widget.onFavoritePressed?.call();
  }

  void _handleShare() {
    widget.onSharePressed?.call();
  }

  void _handleAddToCart() {
    widget.onAddToCart?.call();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildImageSection(),
            _buildInfoSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildImageSection() {
    return Stack(
      children: [
        AspectRatio(
          aspectRatio: widget.compactMode ? 1.0 : 1.2,
          child: ClipRRect(
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(12),
            ),
            child: LazyImage(
              url: widget.product.image,
              width: double.infinity,
              height: double.infinity,
              fit: BoxFit.cover,
              placeholder: 'images/placeholder.svg',
              errorImage: 'images/error.svg',
            ),
          ),
        ),
        if (widget.showDiscount && widget.product.discount != null && widget.product.discount! > 0)
          Positioned(
            top: 8,
            left: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                '-${widget.product.discount}%',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        if (widget.showActions)
          Positioned(
            top: 8,
            right: 8,
            child: Column(
              children: [
                _buildActionButton(
                  icon: _isLiked ? Icons.thumb_up : Icons.thumb_up_outlined,
                  isActive: _isLiked,
                  activeColor: Colors.red,
                  onTap: _handleLike,
                ),
                const SizedBox(height: 8),
                _buildActionButton(
                  icon: _isFavorite ? Icons.favorite : Icons.favorite_outline,
                  isActive: _isFavorite,
                  activeColor: Colors.red,
                  onTap: _handleFavorite,
                ),
                const SizedBox(height: 8),
                _buildActionButton(
                  icon: Icons.share,
                  isActive: false,
                  onTap: _handleShare,
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required bool isActive,
    VoidCallback? onTap,
    Color? activeColor,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.9),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 4,
            ),
          ],
        ),
        child: Icon(
          icon,
          size: 18,
          color: isActive ? (activeColor ?? Colors.red) : Colors.grey.shade600,
        ),
      ),
    );
  }

  Widget _buildInfoSection() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.product.name,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '¥${widget.product.price.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.red,
                ),
              ),
              if (widget.product.originalPrice != null && widget.product.originalPrice! > widget.product.price)
                Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: Text(
                    '¥${widget.product.originalPrice!.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade400,
                      decoration: TextDecoration.lineThrough,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Text(
                  '${widget.product.sales}人已购',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade500,
                  ),
                ),
              ),
              if (widget.onAddToCart != null)
                GestureDetector(
                  onTap: _handleAddToCart,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.add_shopping_cart,
                          size: 14,
                          color: Colors.red.shade400,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '加购',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.red.shade400,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
