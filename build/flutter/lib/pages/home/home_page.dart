/// 文件名: home_page.dart
/// 版本号: 1.0.0
/// 更新日期: 2025-12-27
/// 描述: Flutter首页面，展示轮播图、分类导航、产品列表等功能

import 'package:flutter/material.dart';
import '../../models/product.dart';
import '../../components/lazy_image.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedCategoryIndex = 0;
  final List<Product> _productList = [];
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;
  bool _hasMore = true;
  int _pageNum = 1;
  int _pageSize = 10;

  final List<Map<String, dynamic>> _categoryList = [
    {'id': 0, 'name': '全部', 'icon': Icons.grid_view},
    {'id': 1, 'name': '电子产品', 'icon': Icons.devices},
    {'id': 2, 'name': '服装', 'icon': Icons.checkroom},
    {'id': 3, 'name': '家居', 'icon': Icons.home},
    {'id': 4, 'name': '食品', 'icon': Icons.restaurant},
    {'id': 5, 'name': '图书', 'icon': Icons.book},
  ];

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

  void _onCategoryTap(int index) {
    setState(() {
      _selectedCategoryIndex = index;
      _productList.clear();
      _pageNum = 1;
      _hasMore = true;
    });
    _loadProducts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('首页'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          _buildCategoryBar(),
          Expanded(
            child: _isLoading && _productList.isEmpty
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
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryBar() {
    return SizedBox(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _categoryList.length,
        itemBuilder: (context, index) {
          final category = _categoryList[index];
          final isSelected = index == _selectedCategoryIndex;
          return GestureDetector(
            onTap: () => _onCategoryTap(index),
            child: Container(
              width: 80,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                color: isSelected ? Colors.red : Colors.grey.shade200,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Center(
                child: Text(
                  category['name'],
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.black87,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          );
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
              debugPrint('Product image loaded: ${product.name}');
            },
            onLoadError: () {
              debugPrint('Product image failed: ${product.name}');
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
