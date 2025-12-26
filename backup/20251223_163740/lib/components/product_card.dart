// 文件名: product_card.dart
// 版本号: 1.0.1
// 更新日期: 2025-12-26
// 描述: 商品卡片组件，用于展示商品信息，支持点赞、收藏、分享等功能
import 'package:flutter/material.dart';
import '../models/product.dart';
import 'lazy_image.dart';

class ProductCard extends StatefulWidget {
  final Product product;
  final bool bordered;
  final bool showActions;
  final double? width;
  final double imageHeight;
  final Function(Product)? onTap;
  final Function(Product)? onAddToCart;
  final Function(Product, bool)? onFavorite;
  final Function(Product)? onShare;
  final Function(Product, bool)? onLike;

  const ProductCard({
    super.key,
    required this.product,
    this.bordered = true,
    this.showActions = true,
    this.width,
    this.imageHeight = 160,
    this.onTap,
    this.onAddToCart,
    this.onFavorite,
    this.onShare,
    this.onLike,
  });

  @override
  State<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard> {
  bool _isFavorite = false;
  bool _isLiked = false;

  @override
  void initState() {
    super.initState();
    _isFavorite = widget.product.isFavorite;
    _isLiked = widget.product.isLiked;
  }

  void _handleFavorite() {
    setState(() {
      _isFavorite = !_isFavorite;
    });
    widget.onFavorite?.call(widget.product, _isFavorite);
  }

  void _handleLike() {
    setState(() {
      _isLiked = !_isLiked;
    });
    widget.onLike?.call(widget.product, _isLiked);
  }

  void _handleShare() {
    widget.onShare?.call(widget.product);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.width,
      decoration: BoxDecoration(
        border: widget.bordered ? Border.all(color: Colors.grey.shade200, width: 1) : null,
        borderRadius: BorderRadius.circular(12),
        color: Colors.white,
        boxShadow: widget.bordered ? [
          BoxShadow(
            color: Colors.grey.shade100,
            spreadRadius: 2,
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ] : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildImageSection(),
          _buildInfoSection(),
          if (widget.showActions) _buildActionsSection(),
        ],
      ),
    );
  }

  Widget _buildImageSection() {
    return GestureDetector(
      onTap: () => widget.onTap?.call(widget.product),
      child: Stack(
        children: [
          SizedBox(
            height: widget.imageHeight,
            width: double.infinity,
            child: LazyImage(
              src: widget.product.image,
              height: widget.imageHeight,
              mode: BoxFit.cover,
            ),
          ),
          Positioned(
            top: 8,
            right: 8,
            child: Row(
              children: [
                _buildLikeButton(),
                const SizedBox(width: 8),
                _buildFavoriteButton(),
              ],
            ),
          ),
          if (widget.product.discount != null && widget.product.discount! > 0)
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
                  '${widget.product.discount}%OFF',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildLikeButton() {
    return GestureDetector(
      onTap: _handleLike,
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: const Color.fromARGB(229, 255, 255, 255), // 0.9 opacity
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: const Color.fromARGB(26, 0, 0, 0), // 0.1 opacity
              blurRadius: 2,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Icon(
          _isLiked ? Icons.thumb_up : Icons.thumb_up_alt_outlined,
          color: _isLiked ? Colors.red : Colors.grey,
          size: 18,
        ),
      ),
    );
  }

  Widget _buildFavoriteButton() {
    return GestureDetector(
      onTap: _handleFavorite,
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: const Color.fromARGB(229, 255, 255, 255), // 0.9 opacity
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: const Color.fromARGB(26, 0, 0, 0), // 0.1 opacity
              blurRadius: 2,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Icon(
          _isFavorite ? Icons.favorite : Icons.favorite_border,
          color: _isFavorite ? Colors.red : Colors.grey,
          size: 18,
        ),
      ),
    );
  }

  Widget _buildInfoSection() {
    return GestureDetector(
      onTap: () => widget.onTap?.call(widget.product),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.product.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.black87,
                height: 1.3,
              ),
            ),
            const SizedBox(height: 8),
            _buildPriceRow(),
            const SizedBox(height: 6),
            _buildStatsRow(),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceRow() {
    final price = widget.product.price;
    final originalPrice = widget.product.originalPrice;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          '¥$price',
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.red,
          ),
        ),
        if (originalPrice != null && originalPrice > price) ...[
          const SizedBox(width: 8),
          Text(
            '¥$originalPrice',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade400,
              decoration: TextDecoration.lineThrough,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildStatsRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          '销量 ${widget.product.sales}',
          style: TextStyle(
            fontSize: 11,
            color: Colors.grey.shade500,
          ),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.star,
              size: 12,
              color: Colors.yellow.shade700,
            ),
            const SizedBox(width: 2),
            Text(
              widget.product.rating.toStringAsFixed(1),
              style: TextStyle(
                fontSize: 11,
                color: Colors.grey.shade500,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionsSection() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(color: Colors.grey.shade100, width: 1),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () => widget.onAddToCart?.call(widget.product),
              icon: const Icon(Icons.shopping_cart, size: 16),
              label: const Text('加入购物车'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
                textStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
                padding: const EdgeInsets.symmetric(vertical: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(6),
                ),
                elevation: 0,
              ),
            ),
          ),
          const SizedBox(width: 10),
          IconButton(
            onPressed: _handleShare,
            icon: Icon(
              Icons.share_outlined,
              color: Colors.grey.shade600,
              size: 22,
            ),
            style: IconButton.styleFrom(
              backgroundColor: Colors.grey.shade100,
              padding: const EdgeInsets.all(8),
            ),
          ),
        ],
      ),
    );
  }
}
