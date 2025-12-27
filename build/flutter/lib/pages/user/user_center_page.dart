/// 文件名: user_center_page.dart
/// 版本号: 1.0.0
/// 更新日期: 2025-12-27
/// 描述: 用户中心页面，展示用户信息、订单、收藏等功能

import 'package:flutter/material.dart';

class UserCenterPage extends StatefulWidget {
  const UserCenterPage({super.key});

  @override
  State<UserCenterPage> createState() => _UserCenterPageState();
}

class _UserCenterPageState extends State<UserCenterPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('用户中心'),
      ),
      body: ListView(
        children: [
          _buildUserInfo(),
          _buildMenuSection(),
          _buildOrderSection(),
          _buildFavoriteSection(),
          _buildSettingsSection(),
        ],
      ),
    );
  }

  Widget _buildUserInfo() {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const CircleAvatar(
              radius: 30,
              backgroundImage: NetworkImage('https://i.pravatar.cc/150?img=1'),
            ),
            const SizedBox(width: 16),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '用户昵称',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '13800138000',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
            const Spacer(),
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () {},
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuSection() {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildMenuItem(Icons.shopping_bag, '我的订单', () {}),
          _buildMenuItem(Icons.favorite, '我的收藏', () {}),
          _buildMenuItem(Icons.history, '浏览历史', () {}),
          _buildMenuItem(Icons.location_on, '收货地址', () {}),
          _buildMenuItem(Icons.card_giftcard, '优惠券', () {}),
          _buildMenuItem(Icons.star, '积分中心', () {}),
        ],
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }

  Widget _buildOrderSection() {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
                  '我的订单',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildOrderStatus(Icons.payment, '待付款', 0),
                _buildOrderStatus(Icons.local_shipping, '待发货', 0),
                _buildOrderStatus(Icons.local_mall, '待收货', 0),
                _buildOrderStatus(Icons.rate_review, '待评价', 0),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderStatus(IconData icon, String title, int count) {
    return Column(
      children: [
        Icon(icon, size: 32, color: Colors.grey.shade600),
        const SizedBox(height: 8),
        Text(title, style: const TextStyle(fontSize: 12)),
        const SizedBox(height: 4),
        Text(
              '$count',
              style: const TextStyle(
                fontSize: 12,
                color: Colors.red,
                fontWeight: FontWeight.bold,
              ),
            ),
      ],
    );
  }

  Widget _buildFavoriteSection() {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                      '我的收藏',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                TextButton(
                  onPressed: () {},
                  child: const Text('查看全部'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...List.generate(3, (index) => _buildFavoriteItem(index)),
          ],
        ),
      ),
    );
  }

  Widget _buildFavoriteItem(int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Image.network(
                'https://picsum.photos/100/100?random=$index',
                width: 80,
                height: 80,
                fit: BoxFit.cover,
              ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                      '收藏商品 ${index + 1}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                const SizedBox(height: 4),
                Text(
                      '¥${(99.9 + index * 10.0).toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.red,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.favorite, color: Colors.red),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsSection() {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildMenuItem(Icons.settings, '账户设置', () {}),
          _buildMenuItem(Icons.notifications, '消息通知', () {}),
          _buildMenuItem(Icons.security, '隐私设置', () {}),
          _buildMenuItem(Icons.help, '帮助中心', () {}),
          _buildMenuItem(Icons.info, '关于我们', () {}),
        ],
      ),
    );
  }
}
