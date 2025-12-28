/**
 * 文件名: order_confirm_page.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-27
 * 描述: Flutter订单确认页面，实现收货地址选择、商品信息确认、支付方式选择、价格明细、提交订单等功能
 */

import 'package:flutter/material.dart';
import '../../models/product.dart';

class OrderConfirmPage extends StatefulWidget {
  const OrderConfirmPage({super.key});

  @override
  State<OrderConfirmPage> createState() => _OrderConfirmPageState();
}

class AddressInfo {
  final String id;
  final String name;
  final String phone;
  final String province;
  final String city;
  final String district;
  final String detail;
  final bool isDefault;

  const AddressInfo({
    required this.id,
    required this.name,
    required this.phone,
    required this.province,
    required this.city,
    required this.district,
    required this.detail,
    required this.isDefault,
  });

  String get fullAddress => '$province$city$district$detail';

  String get maskedPhone => phone.replaceRange(3, 7, '****');
}

class _OrderConfirmPageState extends State<OrderConfirmPage> {
  AddressInfo _selectedAddress = const AddressInfo(
    id: '1',
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '望京街道阜通东大街6号院3号楼18层1801室',
    isDefault: true,
  );

  int _paymentMethod = 0;
  final List<Map<String, dynamic>> _paymentMethods = [
    {'id': 0, 'name': '微信支付', 'icon': Icons.chat_bubble_outline},
    {'id': 1, 'name': '支付宝', 'icon': Icons.payment},
    {'id': 2, 'name': '银行卡', 'icon': Icons.credit_card},
  ];

  final TextEditingController _remarkController = TextEditingController();
  bool _usePoints = false;
  int _points = 1000;
  int _usePointsAmount = 0;

  final List<Product> _products = [
    Product(
      id: '1',
      name: '苏铁精品盆栽',
      price: 199.0,
      image: '',
      description: '',
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
      image: '',
      description: '',
      category: '盆栽',
      stock: 200,
      isFavorite: false,
      isLiked: false,
      discount: 10,
      originalPrice: 69.0,
      sales: 1200,
      rating: 4.9,
    ),
  ];

  double get _totalAmount {
    return _products.fold(0, (sum, p) => sum + p.price * 1);
  }

  double get _freight => _totalAmount >= 99 ? 0 : 8;

  double get _discount {
    return _usePoints ? _usePointsAmount / 100.0 : 0;
  }

  double get _finalAmount => _totalAmount + _freight - _discount;

  @override
  void dispose() {
    _remarkController.dispose();
    super.dispose();
  }

  void _onSelectAddress() {
    _showAddressBottomSheet();
  }

  void _onPaymentMethodChange(int method) {
    setState(() {
      _paymentMethod = method;
    });
  }

  void _onUsePointsChange(bool value) {
    setState(() {
      _usePoints = value;
      _usePointsAmount = value ? 100 : 0;
    });
  }

  void _onSubmitOrder() {
    if (_selectedAddress.name.isEmpty) {
      _showToast('请选择收货地址');
      return;
    }

    _showLoading('提交订单中...');

    Future.delayed(const Duration(milliseconds: 1500), () {
      _hideLoading();
      _showToast('订单提交成功');

      Future.delayed(const Duration(milliseconds: 1000), () {
        if (mounted) {
          Navigator.popUntil(context, (route) => route.isFirst);
          Navigator.pushNamed(context, '/order/list', arguments: 1);
        }
      });
    });
  }

  void _showToast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  void _showLoading(String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        content: Row(
          children: [
            const CircularProgressIndicator(),
            const SizedBox(width: 16),
            Text(message),
          ],
        ),
      ),
    );
  }

  void _hideLoading() {
    Navigator.pop(context);
  }

  void _showAddressBottomSheet() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        height: 400,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('选择收货地址', style: TextStyle(fontSize: 16)),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                children: [
                  _buildAddressOption(_selectedAddress, true),
                  _buildAddAddressOption(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddressOption(AddressInfo address, bool isSelected) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedAddress = address;
        });
        Navigator.pop(context);
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.red.shade50 : Colors.grey.shade100,
          border: Border.all(
            color: isSelected ? Colors.red : Colors.grey.shade300,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
              color: isSelected ? Colors.red : Colors.grey,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        address.name,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        address.maskedPhone,
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                      if (address.isDefault)
                        Container(
                          margin: const EdgeInsets.only(left: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(2),
                          ),
                          child: const Text(
                            '默认',
                            style: TextStyle(fontSize: 10, color: Colors.white),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    address.fullAddress,
                    style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddAddressOption() {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context);
        Navigator.pushNamed(context, '/address');
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add, color: Colors.red),
            SizedBox(width: 8),
            Text(
              '添加新地址',
              style: TextStyle(color: Colors.red),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: const Text('确认订单'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView(
        children: [
          _buildAddressSection(),
          _buildProductSection(),
          _buildPaymentMethodSection(),
          _buildPointsSection(),
          _buildPriceDetailSection(),
          _buildRemarkSection(),
          const SizedBox(height: 80),
        ],
      ),
      bottomSheet: _buildBottomBar(),
    );
  }

  Widget _buildAddressSection() {
    return GestureDetector(
      onTap: _onSelectAddress,
      child: Container(
        margin: const EdgeInsets.all(12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            const Icon(Icons.location_on, color: Colors.red),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        _selectedAddress.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        _selectedAddress.maskedPhone,
                        style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _selectedAddress.fullAddress,
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _buildProductSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '商品信息',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          ..._products.map((product) => _buildProductItem(product)),
        ],
      ),
    );
  }

  Widget _buildProductItem(Product product) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '¥${product.price.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.red,
                      ),
                    ),
                    Text(
                      '×1',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
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

  Widget _buildPaymentMethodSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '支付方式',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          Row(
            children: _paymentMethods.map((method) {
              final isSelected = _paymentMethod == method['id'];
              return Expanded(
                child: GestureDetector(
                  onTap: () => _onPaymentMethodChange(method['id']),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.red.shade50 : Colors.grey.shade100,
                      border: Border.all(
                        color: isSelected ? Colors.red : Colors.grey.shade300,
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          method['icon'],
                          color: isSelected ? Colors.red : Colors.grey,
                          size: 20,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          method['name'],
                          style: TextStyle(
                            fontSize: 12,
                            color: isSelected ? Colors.red : Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildPointsSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '积分抵扣',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              Text(
                '可用 $_points 积分抵扣 ¥${(_points / 100).toStringAsFixed(2)}',
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              ),
            ],
          ),
          Switch(
            value: _usePoints,
            onChanged: _onUsePointsChange,
            activeColor: Colors.red,
          ),
        ],
      ),
    );
  }

  Widget _buildPriceDetailSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '价格明细',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          _buildPriceRow('商品总额', '¥${_totalAmount.toStringAsFixed(2)}'),
          _buildPriceRow('运费', _freight == 0 ? '免运费' : '¥${_freight.toStringAsFixed(2)}'),
          if (_usePoints) _buildPriceRow('积分抵扣', '-¥${_discount.toStringAsFixed(2)}'),
          Divider(color: Colors.grey.shade200),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              const Text('合计: '),
              Text(
                '¥${_finalAmount.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.red,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPriceRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
          Text(
            value,
            style: const TextStyle(fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildRemarkSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '订单备注',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _remarkController,
            maxLines: 3,
            decoration: const InputDecoration(
              hintText: '请输入订单备注（选填）',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.all(12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('实付款:'),
                Text(
                  '¥${_finalAmount.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Colors.red,
                  ),
                ),
              ],
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: _onSubmitOrder,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
              ),
              child: const Text('提交订单'),
            ),
          ],
        ),
      ),
    );
  }
}
