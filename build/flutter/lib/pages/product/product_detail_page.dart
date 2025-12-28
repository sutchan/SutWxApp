/// 文件名: product_detail_page.dart
/// 版本号: 1.0.0
/// 更新日期: 2025-12-27
/// 描述: 产品详情页面，展示商品详细信息、规格选择、评论等功能

import 'package:flutter/material.dart';
import '../../models/product.dart';

class ProductDetailPage extends StatefulWidget {
  final String productId;

  const ProductDetailPage({super.key, required this.productId});

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  Product? _product;
  int _currentImageIndex = 0;
  bool _isLoading = true;
  bool _isFavorite = false;
  bool _isLiked = false;
  int _quantity = 1;
  bool _showSpecPopup = false;
  final PageController _pageController = PageController();

  @override
  void initState() {
    super.initState();
    _loadProductDetail();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _loadProductDetail() async {
    await Future.delayed(const Duration(milliseconds: 500));

    final price = (int.parse(widget.productId) * 10.5).toDouble();
    final originalPrice = price * 1.2;

    setState(() {
      _product = Product(
        id: widget.productId,
        name: '商品名称 ${widget.productId} - 优质精品商品推荐',
        price: price,
        image: 'https://picsum.photos/800/800?random=${int.parse(widget.productId) + 2000}',
        images: [
          'https://picsum.photos/800/800?random=${int.parse(widget.productId) + 2000}',
          'https://picsum.photos/800/800?random=${int.parse(widget.productId) + 2001}',
          'https://picsum.photos/800/800?random=${int.parse(widget.productId) + 2002}',
        ],
        description: '这是商品 ${widget.productId} 的详细描述，包含商品的特点、材质、使用方法等详细信息。',
        category: '电子产品',
        stock: 100,
        isFavorite: false,
        isLiked: false,
        discount: int.parse(widget.productId) % 3 == 0 ? 15 : null,
        originalPrice: int.parse(widget.productId) % 3 == 0 ? originalPrice : null,
        sales: int.parse(widget.productId) * 50,
        rating: 4.0 + (int.parse(widget.productId) % 10) * 0.05,
      );
      _isLoading = false;
    });
  }

  void _onImageChanged(int index) {
    setState(() => _currentImageIndex = index);
  }

  void _onToggleFavorite() {
    setState(() {
      _isFavorite = !_isFavorite;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(_isFavorite ? '已收藏' : '取消收藏')),
    );
  }

  void _onShowSpecPopup() {
    setState(() {
      _showSpecPopup = true;
    });
  }

  void _onHideSpecPopup() {
    setState(() {
      _showSpecPopup = false;
    });
  }

  void _onQuantityChange(int delta) {
    setState(() {
      _quantity = (_quantity + delta).clamp(1, 99);
    });
  }

  void _onAddToCart() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('已加入购物车')),
    );
  }

  void _onBuyNow() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('立即购买功能开发中')),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_product == null) {
      return const Scaffold(
        body: Center(child: Text('商品信息加载失败')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_product!.name),
        actions: [
          IconButton(
            icon: Icon(_isFavorite ? Icons.favorite : Icons.favorite_border),
            color: _isFavorite ? Colors.red : null,
            onPressed: _onToggleFavorite,
          ),
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildImageCarousel(),
            _buildPriceInfo(),
            _buildSpecSection(),
            _buildQuantitySelector(),
            _buildActionButtons(),
            _buildDescription(),
            _buildComments(),
          ],
        ),
      ),
    );
  }

  Widget _buildImageCarousel() {
    return SizedBox(
      height: 400,
      child: Stack(
        children: [
          PageView.builder(
            controller: _pageController,
            onPageChanged: _onImageChanged,
            itemCount: _product!.images.length,
            itemBuilder: (context, index) {
              return Image.network(
                _product!.images[index],
                fit: BoxFit.cover,
                loadingBuilder: (context, child, progress) {
                  if (progress == null) return child;
                  return const Center(child: CircularProgressIndicator());
                },
                errorBuilder: (context, error, stack) =>
                    const Icon(Icons.broken_image, size: 80),
              );
            },
          ),
          Positioned(
            bottom: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.6),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                '${_currentImageIndex + 1}/${_product!.images.length}',
                style: const TextStyle(color: Colors.white, fontSize: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceInfo() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_product!.discount != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                '${_product!.discount}% OFF',
                style: const TextStyle(color: Colors.white, fontSize: 12),
              ),
            ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                '¥${_product!.price.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.red,
                ),
              ),
              if (_product!.originalPrice != null) ...[
                const SizedBox(width: 8),
                Text(
                  '¥${_product!.originalPrice!.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey.shade600,
                    decoration: TextDecoration.lineThrough,
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.star, color: Colors.orange, size: 16),
              const SizedBox(width: 4),
              Text(
                '${_product!.rating}',
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(width: 16),
              Text(
                '销量 ${_product!.sales}',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSpecSection() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '规格选择',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ['规格1', '规格2', '规格3'].map((spec) {
              return ChoiceChip(
                label: Text(spec),
                selected: false,
                onSelected: (_) {},
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildQuantitySelector() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          const Text('数量', style: TextStyle(fontSize: 16)),
          const Spacer(),
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.remove),
                  onPressed: _quantity > 1 ? () => _onQuantityChange(-1) : null,
                ),
                Container(
                  width: 40,
                  alignment: Alignment.center,
                  child: Text('$_quantity'),
                ),
                IconButton(
                  icon: const Icon(Icons.add),
                  onPressed: () => _onQuantityChange(1),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: _onAddToCart,
              child: const Text('加入购物车'),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: ElevatedButton(
              onPressed: _onBuyNow,
              style: ElevatedButton.styleFrom(
                backgroundColor: MaterialStateProperty.all(Colors.red),
              ),
              child: const Text('立即购买'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDescription() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '商品详情',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(_product!.description),
        ],
      ),
    );
  }

  Widget _buildComments() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '用户评价',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          ...List.generate(3, (index) => _buildCommentItem(index)),
        ],
      ),
    );
  }

  Widget _buildCommentItem(int index) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const CircleAvatar(
                  radius: 16,
                  backgroundImage: const NetworkImage('https://i.pravatar.cc/150?img=$index'),
                ),
                const SizedBox(width: 8),
                Text('用户${index + 1}'),
                const Spacer(),
                Row(
                  children: List.generate(5, (i) => Icon(
                        Icons.star,
                        color: i < 4 ? Colors.orange : Colors.grey,
                        size: 16,
                      )),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('这是用户${index + 1}对商品的评价内容，非常满意！'),
          ],
        ),
      ),
    );
  }
}
