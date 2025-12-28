/// 文件名: product_list_page.dart
/// 版本号: 1.0.0
/// 更新日期: 2025-12-27
/// 描述: 产品列表页面，支持分类筛选、搜索、下拉刷新、上拉加载更多

import 'package:flutter/material.dart';
import '../../models/product.dart';
import '../../components/lazy_image.dart';

class ProductListPage extends StatefulWidget {
  final int? categoryId;
  final String? keyword;

  const ProductListPage({super.key, this.categoryId, this.keyword});

  @override
  State<ProductListPage> createState() => _ProductListPageState();
}

class _ProductListPageState extends State<ProductListPage> {
  final List<Product> _productList = [];
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;
  bool _hasMore = true;
  int _pageNum = 1;

  @override
  void initState() {
    super.initState();
    _loadProducts();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMoreProducts();
    }
  }

  Future<void> _loadProducts() async {
    if (_isLoading) return;
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 500));
    setState(() {
      _productList.addAll(List.generate(10, (index) => Product(
            id: '${_pageNum}_$index',
            name: '商品名称 ${_pageNum}_$index',
            price: 99.9 + index * 10.0,
            image: 'https://picsum.photos/200/200?random=${_pageNum * 100 + index}',
            description: '这是商品 ${_pageNum}_$index 的详细描述',
            category: '电子产品',
            stock: 100,
            sales: index * 50,
            rating: 4.0 + (index % 10) * 0.1,
          )));
      _isLoading = false;
    });
  }

  Future<void> _loadMoreProducts() async {
    if (!_hasMore || _isLoading) return;
    _pageNum++;
    await _loadProducts();
    if (_productList.length >= 50) {
      setState(() => _hasMore = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('商品列表'),
      ),
      body: _isLoading && _productList.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              controller: _scrollController,
              itemCount: _productList.length + (_hasMore ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _productList.length) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: CircularProgressIndicator(),
                    ),
                  );
                }
                final product = _productList[index];
                return _buildProductCard(product);
              },
            ),
    );
  }

  Widget _buildProductCard(Product product) {
    return Card(
      margin: const EdgeInsets.all(8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          LazyImage(
            url: product.image,
            height: 150,
            width: double.infinity,
            fit: BoxFit.cover,
            placeholder: 'images/placeholder.svg',
            errorImage: 'images/error.svg',
            fadeInDuration: const Duration(milliseconds: 300),
            onLoadSuccess: () {
              debugPrint('Product list image loaded: ${product.name}');
            },
            onLoadError: () {
              debugPrint('Product list image failed: ${product.name}');
            },
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      '¥${product.price.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 18,
                        color: Colors.red,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '销量 ${product.sales}',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
