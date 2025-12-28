/**
 * 文件名: help_center_page.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-27
 * 描述: Flutter帮助中心页面，提供常见问题解答和客服联系方式
 */

import 'package:flutter/material.dart';

class HelpCenterPage extends StatefulWidget {
  const HelpCenterPage({super.key});

  @override
  State<HelpCenterPage> createState() => _HelpCenterPageState();
}

class FAQItem {
  final String id;
  String question;
  String answer;
  bool expanded;

  FAQItem({
    required this.id,
    required this.question,
    required this.answer,
    this.expanded = false,
  });
}

class _HelpCenterPageState extends State<HelpCenterPage> {
  final TextEditingController _searchController = TextEditingController();
  String _searchKeyword = '';
  final List<FAQItem> _faqList = [
    FAQItem(
      id: '1',
      question: '如何下单购买商品？',
      answer: '浏览商品后，选择规格和数量，点击"加入购物车"或"立即购买"，然后在购物车页面确认商品信息，点击"去结算"，填写收货地址并选择支付方式，最后提交订单完成购买。',
    ),
    FAQItem(
      id: '2',
      question: '支持哪些支付方式？',
      answer: '我们支持微信支付、支付宝支付、银行卡支付等多种支付方式。您可以在结算页面选择最适合您的支付方式进行付款。',
    ),
    FAQItem(
      id: '3',
      question: '下单后多久发货？',
      answer: '一般情况下，您下单后24小时内我们会安排发货。发货后，您可以在订单详情页面查看物流信息，跟踪包裹的配送进度。',
    ),
    FAQItem(
      id: '4',
      question: '如何查看物流信息？',
      answer: '您可以进入"我的订单"页面，点击相应的订单即可查看详细的物流信息。如有疑问，您可以联系我们的客服人员进行咨询。',
    ),
    FAQItem(
      id: '5',
      question: '支持退货退款吗？',
      answer: '我们支持7天无理由退货退款服务。如商品存在质量问题或与描述不符，您可以在收货后7天内申请退货退款。具体退货流程请咨询客服。',
    ),
    FAQItem(
      id: '6',
      question: '如何修改收货地址？',
      answer: '未发货的订单，您可以进入订单详情页面点击"修改地址"进行更改。如订单已发货，则无法修改地址，建议您联系客服尝试拦截快递。',
    ),
    FAQItem(
      id: '7',
      question: '积分有什么用途？',
      answer: '积分可以在结算时抵扣现金（100积分=1元），也可以参与积分商城兑换商品。此外，积分还可以参与不定期的积分抽奖活动。',
    ),
    FAQItem(
      id: '8',
      question: '如何联系客服？',
      answer: '您可以通过以下方式联系客服：1）拨打客服热线400-888-8888；2）点击页面右下角在线客服图标；3）发送邮件至support@sut.com。',
    ),
  ];

  final List<Map<String, dynamic>> _categories = [
    {'id': 1, 'name': '购物指南', 'icon': '🛒', 'count': 8},
    {'id': 2, 'name': '支付问题', 'icon': '💳', 'count': 6},
    {'id': 3, 'name': '配送说明', 'icon': '📦', 'count': 5},
    {'id': 4, 'name': '售后服务', 'icon': '🔧', 'count': 7},
  ];

  List<FAQItem> get _displayFaqList {
    if (_searchKeyword.isEmpty) return _faqList;
    return _faqList
        .where((item) =>
            item.question.contains(_searchKeyword) ||
            item.answer.contains(_searchKeyword))
        .map((item) {
      item.expanded = true;
      return item;
    }).toList();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchInput(String value) {
    setState(() {
      _searchKeyword = value.trim();
    });
  }

  void _onToggleQuestion(String id) {
    setState(() {
      final item = _faqList.firstWhere((item) => item.id == id);
      item.expanded = !item.expanded;
    });
  }

  void _onSelectCategory(int id) {
    setState(() {
      _faqList.forEach((item) => item.expanded = true);
    });
    _showToast('查看${_categories.firstWhere((c) => c['id'] == id)['name']}');
  }

  void _onCallService() {
    _showToast('拨打客服热线: 400-888-8888');
  }

  void _onContactService() {
    _showComingSoonDialog();
  }

  void _onSendEmail() {
    _showToast('商务合作邮箱: business@sut.com');
  }

  void _onFeedback() {
    _showComingSoonDialog();
  }

  void _showToast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  void _showComingSoonDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('提示'),
        content: const Text('功能开发中，敬请期待'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('知道了'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('帮助中心'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView(
        children: [
          _buildHeader(),
          _buildSearchBox(),
          _buildCategories(),
          _buildFAQSection(),
          _buildContactSection(),
          _buildFeedbackSection(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xffff4d4f), Color(0xffff7875)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '帮助中心',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          SizedBox(height: 8),
          Text(
            '常见问题解答',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBox() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, -20, 16, 16),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Icon(Icons.search, color: Colors.grey),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      onChanged: _onSearchInput,
                      decoration: const InputDecoration(
                        hintText: '搜索问题',
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            height: 48,
            width: 48,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xffff4d4f), Color(0xffff7875)],
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: IconButton(
              onPressed: () {},
              icon: const Icon(Icons.search, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategories() {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final category = _categories[index];
          return _buildCategoryItem(category);
        },
      ),
    );
  }

  Widget _buildCategoryItem(Map<String, dynamic> category) {
    return GestureDetector(
      onTap: () => _onSelectCategory(category['id']),
      child: Container(
        width: 80,
        margin: const EdgeInsets.symmetric(horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              category['icon'],
              style: const TextStyle(fontSize: 28),
            ),
            const SizedBox(height: 8),
            Text(
              category['name'],
              style: const TextStyle(fontSize: 12),
              textAlign: TextAlign.center,
            ),
            Text(
              '${category['count']}个问题',
              style: TextStyle(fontSize: 10, color: Colors.grey.shade500),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFAQSection() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.quiz, color: Colors.red, size: 20),
              SizedBox(width: 8),
              Text(
                '常见问题',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _displayFaqList.length,
            itemBuilder: (context, index) {
              final item = _displayFaqList[index];
              return _buildFAQItem(item);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildFAQItem(FAQItem item) {
    return Column(
      children: [
        GestureDetector(
          onTap: () => _onToggleQuestion(item.id),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    item.question,
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
                Icon(
                  item.expanded ? Icons.remove : Icons.add,
                  color: Colors.grey,
                ),
              ],
            ),
          ),
        ),
        if (item.expanded)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(
              item.answer,
              style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
            ),
          ),
        Divider(color: Colors.grey.shade200, height: 1),
      ],
    );
  }

  Widget _buildContactSection() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.contact_phone, color: Colors.red, size: 20),
              SizedBox(width: 8),
              Text(
                '联系我们',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildContactItem(
            icon: Icons.phone,
            label: '客服热线',
            value: '400-888-8888',
            onTap: _onCallService,
          ),
          _buildContactItem(
            icon: Icons.chat_bubble_outline,
            label: '在线客服',
            value: '点击咨询',
            onTap: _onContactService,
          ),
          _buildContactItem(
            icon: Icons.email_outlined,
            label: '商务合作',
            value: 'business@sut.com',
            onTap: _onSendEmail,
          ),
        ],
      ),
    );
  }

  Widget _buildContactItem({
    required IconData icon,
    required String label,
    required String value,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Icon(icon, color: Colors.grey.shade600),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(fontSize: 14),
              ),
            ),
            Text(
              value,
              style: TextStyle(fontSize: 14, color: Colors.red.shade400),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeedbackSection() {
    return GestureDetector(
      onTap: _onFeedback,
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xffff4d4f), Color(0xffff7875)],
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            const Text(
              '意见反馈',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '帮助我们做得更好',
              style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.8)),
            ),
          ],
        ),
      ),
    );
  }
}
