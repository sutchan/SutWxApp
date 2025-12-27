/**
 * 文件名: order_list_page.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-27
 * 描述: Flutter订单列表页面，实现订单状态筛选、订单卡片展示、订单操作等功能
 */

import 'package:flutter/material.dart';

class OrderListPage extends StatefulWidget {
  final int? initialStatus;

  const OrderListPage({super.key, this.initialStatus});

  @override
  State<OrderListPage> createState() => _OrderListPageState();
}

class OrderItem {
  final String id;
  final String orderNumber;
  final int status;
  final String statusText;
  final List<OrderProduct> products;
  final double totalAmount;
  final int productCount;
  final String createTime;
  final String? payTime;
  final String? shipTime;
  final String? receiveTime;

  const OrderItem({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.statusText,
    required this.products,
    required this.totalAmount,
    required this.productCount,
    required this.createTime,
    this.payTime,
    this.shipTime,
    this.receiveTime,
  });
}

class OrderProduct {
  final String id;
  final String name;
  final double price;
  final int quantity;
  final String image;

  const OrderProduct({
    required this.id,
    required this.name,
    required this.price,
    required this.quantity,
    required this.image,
  });

  double get totalPrice => price * quantity;
}

class _OrderListPageState extends State<OrderListPage> {
  int _currentStatus = 0;
  final List<int> _statusList = [0, 1, 2, 3, 4, 5];
  final List<String> _statusTextList = [
    '全部',
    '待付款',
    '待发货',
    '待收货',
    '待评价',
    '售后',
  ];

  final List<OrderItem> _orderList = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialStatus != null) {
      _currentStatus = widget.initialStatus!;
    }
    _loadOrders();
  }

  void _loadOrders() {
    setState(() => _isLoading = true);

    Future.delayed(const Duration(milliseconds: 500), () {
      setState(() {
        _orderList.addAll([
          OrderItem(
            id: '1',
            orderNumber: 'ORD20251227000001',
            status: 1,
            statusText: '待付款',
            products: [
              OrderProduct(
                id: 'p1',
                name: '苏铁精品盆栽',
                price: 199.00,
                quantity: 1,
                image: '',
              ),
              OrderProduct(
                id: 'p2',
                name: '多肉植物组合',
                price: 59.00,
                quantity: 2,
                image: '',
              ),
            ],
            totalAmount: 317.00,
            productCount: 3,
            createTime: '2025-12-27 10:30:00',
          ),
          OrderItem(
            id: '2',
            orderNumber: 'ORD20251226000002',
            status: 2,
            statusText: '待发货',
            products: [
              OrderProduct(
                id: 'p3',
                name: '绿萝吊兰',
                price: 39.00,
                quantity: 1,
                image: '',
              ),
            ],
            totalAmount: 39.00,
            productCount: 1,
            createTime: '2025-12-26 15:20:00',
            payTime: '2025-12-26 15:25:00',
          ),
          OrderItem(
            id: '3',
            orderNumber: 'ORD20251225000003',
            status: 3,
            statusText: '待收货',
            products: [
              OrderProduct(
                id: 'p4',
                name: '发财树盆栽',
                price: 299.00,
                quantity: 1,
                image: '',
              ),
            ],
            totalAmount: 299.00,
            productCount: 1,
            createTime: '2025-12-25 09:10:00',
            payTime: '2025-12-25 09:15:00',
            shipTime: '2025-12-26 14:00:00',
          ),
          OrderItem(
            id: '4',
            orderNumber: 'ORD20251224000004',
            status: 4,
            statusText: '待评价',
            products: [
              OrderProduct(
                id: 'p5',
                name: '君子兰盆栽',
                price: 159.00,
                quantity: 2,
                image: '',
              ),
            ],
            totalAmount: 318.00,
            productCount: 2,
            createTime: '2025-12-24 11:40:00',
            payTime: '2025-12-24 11:45:00',
            shipTime: '2025-12-25 16:30:00',
            receiveTime: '2025-12-26 10:20:00',
          ),
        ]);
        _isLoading = false;
      });
    });
  }

  List<OrderItem> get _displayOrders {
    if (_currentStatus == 0) {
      return _orderList;
    }
    return _orderList.where((order) => order.status == _currentStatus).toList();
  }

  void _onStatusChange(int index) {
    setState(() {
      _currentStatus = _statusList[index];
    });
  }

  void _onPayOrder(OrderItem order) {
    _showToast('跳转支付...');
  }

  void _onRemindShip(OrderItem order) {
    _showToast('已提醒卖家发货');
  }

  void _onConfirmReceive(OrderItem order) {
    _showConfirmDialog('确认收货', '请确认您已收到商品', () {
      _showToast('确认收货成功');
      _loadOrders();
    });
  }

  void _onReviewOrder(OrderItem order) {
    _showToast('跳转评价页面');
  }

  void _onAfterSales(OrderItem order) {
    _showToast('跳转售后页面');
  }

  void _onViewLogistics(OrderItem order) {
    _showToast('查看物流信息');
  }

  void _showToast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  Future<bool?> _showConfirmDialog(
    String title,
    String content,
    VoidCallback onConfirm,
  ) async {
    return showDialog<bool>(
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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: const Text('我的订单'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          _buildStatusTabs(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _displayOrders.isEmpty
                    ? _buildEmptyState()
                    : _buildOrderList(),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusTabs() {
    return Container(
      color: Colors.white,
      child: Row(
        children: _statusTextList.asMap().entries.map((entry) {
          final index = entry.key;
          final text = entry.value;
          final isSelected = _currentStatus == _statusList[index];
          return Expanded(
            child: GestureDetector(
              onTap: () => _onStatusChange(index),
              child: Container(
                alignment: Alignment.center,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: isSelected ? Colors.red : Colors.transparent,
                      width: 2,
                    ),
                  ),
                ),
                child: Text(
                  text,
                  style: TextStyle(
                    fontSize: 14,
                    color: isSelected ? Colors.red : Colors.grey.shade600,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.receipt_long_outlined,
            size: 80,
            color: Colors.grey.shade300,
          ),
          const SizedBox(height: 16),
          Text(
            _currentStatus == 0 ? '暂无订单' : '暂无该状态订单',
            style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderList() {
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _displayOrders.length,
      itemBuilder: (context, index) {
        final order = _displayOrders[index];
        return _buildOrderCard(order);
      },
    );
  }

  Widget _buildOrderCard(OrderItem order) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Column(
        children: [
          _buildOrderHeader(order),
          _buildOrderProducts(order),
          _buildOrderFooter(order),
        ],
      ),
    );
  }

  Widget _buildOrderHeader(OrderItem order) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '订单号: ${order.orderNumber}',
            style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
          ),
          Text(
            order.statusText,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.red,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderProducts(OrderItem order) {
    return Column(
      children: order.products.asMap().entries.map((entry) {
        final product = entry.value;
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Icon(Icons.image, color: Colors.grey),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      style: const TextStyle(fontSize: 14),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '¥${product.price.toStringAsFixed(2)} × ${product.quantity}',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildOrderFooter(OrderItem order) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(color: Colors.grey.shade200),
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Text(
                '共${order.productCount}件商品，合计: ',
                style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
              ),
              Text(
                '¥${order.totalAmount.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.red,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildOrderActions(order),
        ],
      ),
    );
  }

  Widget _buildOrderActions(OrderItem order) {
    List<Widget> actions = [];

    switch (order.status) {
      case 1:
        actions.add(_buildActionButton('去支付', Colors.red, _onPayOrder, order));
        break;
      case 2:
        actions.add(
          _buildActionButton('提醒发货', Colors.orange, _onRemindShip, order),
        );
        break;
      case 3:
        actions.addAll([
          _buildActionButton(
            '查看物流',
            Colors.grey,
            _onViewLogistics,
            order,
          ),
          const SizedBox(width: 8),
          _buildActionButton(
            '确认收货',
            Colors.red,
            _onConfirmReceive,
            order,
          ),
        ]);
        break;
      case 4:
        actions.addAll([
          _buildActionButton(
            '查看物流',
            Colors.grey,
            _onViewLogistics,
            order,
          ),
          const SizedBox(width: 8),
          _buildActionButton(
            '去评价',
            Colors.red,
            _onReviewOrder,
            order,
          ),
          const SizedBox(width: 8),
          _buildActionButton(
            '售后',
            Colors.grey,
            _onAfterSales,
            order,
          ),
        ]);
        break;
      case 5:
        actions.add(
          _buildActionButton('查看售后', Colors.grey, _onAfterSales, order),
        );
        break;
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: actions,
    );
  }

  Widget _buildActionButton(
    String text,
    Color color,
    void Function(OrderItem) onTap,
    OrderItem order,
  ) {
    return GestureDetector(
      onTap: () => onTap(order),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: color),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          text,
          style: TextStyle(fontSize: 12, color: color),
        ),
      ),
    );
  }
}
