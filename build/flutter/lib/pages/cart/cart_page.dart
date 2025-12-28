/**
 * 文件名: cart_page.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-27
 * 描述: Flutter购物车页面，实现商品选择、数量修改、删除、结算等功能
 */

import 'package:flutter/material.dart';
import '../../models/product.dart';

class CartPage extends StatefulWidget {
  const CartPage({super.key});

  @override
  State<CartPage> createState() => _CartPageState();
}

class CartItem {
  final String id;
  final Product product;
  int quantity;
  bool selected;
  String specName;

  CartItem({
    required this.id,
    required this.product,
    this.quantity = 1,
    this.selected = false,
    this.specName = '',
  });

  double get totalPrice => product.price * quantity;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productId': product.id,
      'quantity': quantity,
      'selected': selected ? 1 : 0,
      'specName': specName,
    };
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'] ?? '',
      product: Product.fromJson(json['product'] ?? {}),
      quantity: json['quantity'] ?? 1,
      selected: json['selected'] == 1 || json['selected'] == true,
      specName: json['specName'] ?? '',
    );
  }
}

class _CartPageState extends State<CartPage> {
  final List<CartItem> _cartItems = [];
  final List<Product> _productList = [];
  bool _isEditMode = false;

  @override
  void initState() {
    super.initState();
    _loadProducts();
    _loadCartItems();
  }

  void _loadProducts() {
    _productList.addAll([
      Product(
        id: '1',
        name: '苏铁精品盆栽',
        price: 199.0,
        image: 'https://via.placeholder.com/100',
        description: '优质苏铁盆栽，适合家居装饰',
        category: '盆栽',
        stock: 100,
        isFavorite: false,
        isLiked: false,
        discount: 0,
        originalPrice: 299.0,
        sales: 500,
        rating: 4.8,
      ),
      Product(
        id: '2',
        name: '多肉植物组合',
        price: 59.0,
        image: 'https://via.placeholder.com/100',
        description: '精选多肉植物，精致可爱',
        category: '盆栽',
        stock: 200,
        isFavorite: false,
        isLiked: false,
        discount: 0,
        originalPrice: 49.0,
        sales: 800,
        rating: 4.7,
      ),
      Product(
        id: '3',
        name: '绿萝吊兰',
        price: 39.0,
        image: 'https://via.placeholder.com/100',
        description: '空气净化利器，易养护',
        category: '盆栽',
        stock: 300,
        isFavorite: false,
        isLiked: false,
        discount: 0,
        originalPrice: 49.0,
        sales: 800,
        rating: 4.7,
      ),
    ]);
  }

  void _loadCartItems() {
    setState(() {
      _cartItems.addAll([
        CartItem(
          id: '1',
          product: _productList[0],
          quantity: 1,
          selected: true,
          specName: '大号',
        ),
        CartItem(
          id: '2',
          product: _productList[1],
          quantity: 2,
          selected: true,
          specName: '组合装',
        ),
        CartItem(
          id: '3',
          product: _productList[2],
          quantity: 1,
          selected: false,
          specName: '中号',
        ),
      ]);
    });
  }

  bool get _allSelected {
    return _cartItems.isNotEmpty && _cartItems.every((item) => item.selected);
  }

  double get _totalPrice {
    return _cartItems
        .where((item) => item.selected)
        .fold(0.0, (sum, item) => sum + item.totalPrice);
  }

  int get _selectedCount {
    return _cartItems.where((item) => item.selected).length;
  }

  void _onSelectAll(bool? value) {
    if (value == null) return;
    setState(() {
      for (var item in _cartItems) {
        item.selected = value;
      }
    });
  }

  void _onItemSelect(CartItem item) {
    setState(() {
      item.selected = !item.selected;
    });
  }

  void _onIncrease(CartItem item) {
    setState(() {
      if (item.quantity < item.product.stock) {
        item.quantity++;
      }
    });
  }

  void _onDecrease(CartItem item) {
    setState(() {
      if (item.quantity > 1) {
        item.quantity--;
      }
    });
  }

  void _onDeleteSelected() {
    final selectedItems = _cartItems.where((item) => item.selected).toList();
    if (selectedItems.isEmpty) {
      _showToast('请先选择要删除的商品');
      return;
    }

    _showConfirmDialog('确认删除', '确定要删除选中的商品吗？', () {
      setState(() {
        _cartItems.removeWhere((item) => item.selected);
      });
      _showToast('已删除');
      _isEditMode = false;
    });
  }

  void _onCheckout() {
    final selectedItems = _cartItems.where((item) => item.selected).toList();
    if (selectedItems.isEmpty) {
      _showToast('请先选择要结算的商品');
      return;
    }

    Navigator.pushNamed(context, '/order/confirm', arguments: selectedItems);
  }

  void _showToast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  Future<void> _showConfirmDialog(
    String title,
    String content,
    VoidCallback onConfirm,
  ) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('确认'),
          ),
        ],
      ),
    );

    if (result == true) {
      onConfirm();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: const Text('购物车'),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                _isEditMode = !_isEditMode;
              });
            },
            child: Text(
              _isEditMode ? '完成' : '编辑',
              style: const TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
      body: _cartItems.isEmpty ? _buildEmptyState() : _buildCartList(),
      bottomSheet: _cartItems.isEmpty ? null : _buildBottomBar(),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_cart_outlined,
            size: 80,
            color: Colors.grey.shade300,
          ),
          const SizedBox(height: 16),
          const Text(
            '购物车是空的',
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              Navigator.pushNamed(context, '/product/list');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('去逛逛'),
          ),
        ],
      ),
    );
  }

  Widget _buildCartList() {
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _cartItems.length,
      itemBuilder: (context, index) {
        final item = _cartItems[index];
        return _buildCartItem(item);
      },
    );
  }

  Widget _buildCartItem(CartItem item) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Checkbox(
              value: item.selected,
              onChanged: (_) => _onItemSelect(item),
              activeColor: Colors.red,
            ),
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.image,
                size: 40,
                color: Colors.grey.shade400,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.product.name,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (item.specName.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        '规格: ${item.specName}',
                        style:
                            TextStyle(fontSize: 12, color: Colors.grey.shade600),
                      ),
                    ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '¥${item.product.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.red,
                        ),
                      ),
                      _buildQuantityControl(item),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuantityControl(CartItem item) {
    return Row(
      children: [
        GestureDetector(
          onTap: () => _onDecrease(item),
          child: Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: const BorderRadius.horizontal(
                left: Radius.circular(4),
              ),
            ),
            child: const Icon(Icons.remove, size: 16),
          ),
        ),
        Container(
          width: 40,
          height: 28,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(color: Colors.grey.shade300),
              bottom: BorderSide(color: Colors.grey.shade300),
            ),
          ),
          child: Text(
            '${item.quantity}',
            style: const TextStyle(fontSize: 14),
          ),
        ),
        GestureDetector(
          onTap: () => _onIncrease(item),
          child: Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: const BorderRadius.horizontal(
                right: Radius.circular(4),
              ),
            ),
            child: const Icon(Icons.add, size: 16),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Row(
              children: [
                Checkbox(
                  value: _allSelected,
                  onChanged: _onSelectAll,
                  activeColor: Colors.red,
                ),
                const Text('全选'),
              ],
            ),
            const Spacer(),
            Row(
              children: [
                const Text('合计: '),
                Text(
                  '¥${_totalPrice.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.red,
                  ),
                ),
              ],
            ),
            const SizedBox(width: 16),
            ElevatedButton(
              onPressed: _isEditMode ? _onDeleteSelected : _onCheckout,
              style: ElevatedButton.styleFrom(
                backgroundColor: _isEditMode ? Colors.grey : Colors.red,
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              ),
              child: Text(_isEditMode ? '删除(${_selectedCount})' : '结算(${_selectedCount})'),
            ),
          ],
        ),
      ),
    );
  }
}
