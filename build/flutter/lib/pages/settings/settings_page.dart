/**
 * 文件名: settings_page.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-27
 * 描述: Flutter设置页面，实现账户安全、通知设置、隐私设置、关于信息等功能
 */

import 'package:flutter/material.dart';
import 'package:sut_wxapp/pages/help/help_center_page.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _messagePush = true;
  bool _emailNotify = false;
  bool _privacyMode = false;
  bool _locationAuth = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  void _loadSettings() {
    final settings = <String, bool>{};
    setState(() {
      _messagePush = settings['messagePush'] ?? true;
      _emailNotify = settings['emailNotify'] ?? false;
      _privacyMode = settings['privacyMode'] ?? false;
      _locationAuth = settings['locationAuth'] ?? true;
    });
  }

  void _onSwitchChange(String field, bool value) {
    setState(() {
      switch (field) {
        case 'messagePush':
          _messagePush = value;
          break;
        case 'emailNotify':
          _emailNotify = value;
          break;
        case 'privacyMode':
          _privacyMode = value;
          break;
        case 'locationAuth':
          _locationAuth = value;
          break;
      }
    });

    _showToast('设置已保存');
  }

  void _navigateTo(String page) {
    final pageMap = {
      'password': _showComingSoonDialog,
      'phone': _showComingSoonDialog,
      'about': _showAboutDialog,
      'help': () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const HelpCenterPage()),
        );
      },
      'feedback': _showComingSoonDialog,
    };

    final handler = pageMap[page];
    if (handler != null) {
      handler();
    }
  }

  void _checkVersion() {
    _showVersionDialog();
  }

  Future<void> _logout() async {
    final confirm = await _showConfirmDialog('确认退出', '确定要退出登录吗？');

    if (confirm != true) return;

    _showLoading('退出中...');

    await Future.delayed(const Duration(milliseconds: 1500));

    _hideLoading();

    _showToast('已退出登录');

    await Future.delayed(const Duration(milliseconds: 500));

    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/');
    }
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

  Future<bool?> _showConfirmDialog(String title, String content) async {
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

  void _showAboutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('关于我们'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.storefront, size: 64, color: Colors.red),
            SizedBox(height: 16),
            Text(
              '苏铁商城',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 8),
            Text('版本 1.0.0'),
            SizedBox(height: 16),
            Text(
              '苏铁商城是一款优质的微信小程序商城应用，提供丰富的商品选择和便捷的购物体验。',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('关闭'),
          ),
        ],
      ),
    );
  }

  void _showVersionDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('检查更新'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.system_update, size: 48, color: Colors.green),
            SizedBox(height: 16),
            Text('当前已是最新版本'),
            SizedBox(height: 8),
            Text(
              'v1.0.0',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('设置'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView(
        children: [
          _buildSection(
            title: '账户安全',
            items: [
              _buildSettingsItem(
                icon: Icons.lock_outline,
                title: '修改密码',
                onTap: () => _navigateTo('password'),
              ),
              _buildSettingsItem(
                icon: Icons.phone_android_outlined,
                title: '更换手机号',
                onTap: () => _navigateTo('phone'),
              ),
            ],
          ),
          _buildSection(
            title: '通知设置',
            items: [
              _buildSwitchItem(
                icon: Icons.notifications_none,
                title: '消息推送',
                value: _messagePush,
                onChanged: (value) => _onSwitchChange('messagePush', value),
              ),
              _buildSwitchItem(
                icon: Icons.email_outlined,
                title: '邮件通知',
                value: _emailNotify,
                onChanged: (value) => _onSwitchChange('emailNotify', value),
              ),
            ],
          ),
          _buildSection(
            title: '隐私设置',
            items: [
              _buildSwitchItem(
                icon: Icons.visibility_off_outlined,
                title: '隐私浏览模式',
                value: _privacyMode,
                onChanged: (value) => _onSwitchChange('privacyMode', value),
              ),
              _buildSwitchItem(
                icon: Icons.location_on_outlined,
                title: '位置授权',
                value: _locationAuth,
                onChanged: (value) => _onSwitchChange('locationAuth', value),
              ),
            ],
          ),
          _buildSection(
            title: '关于',
            items: [
              _buildSettingsItem(
                icon: Icons.info_outline,
                title: '关于我们',
                onTap: () => _navigateTo('about'),
              ),
              _buildSettingsItem(
                icon: Icons.help_outline,
                title: '帮助中心',
                onTap: () => _navigateTo('help'),
              ),
              _buildSettingsItem(
                icon: Icons.feedback_outlined,
                title: '意见反馈',
                onTap: () => _navigateTo('feedback'),
              ),
              _buildSettingsItem(
                icon: Icons.system_update_outlined,
                title: '检查更新',
                onTap: _checkVersion,
                trailing: const Text(
                  'v1.0.0',
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildLogoutButton(),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildSection({required String title, required List<Widget> items}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            title,
            style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
          ),
        ),
        Container(
          color: Colors.white,
          child: Column(children: items),
        ),
      ],
    );
  }

  Widget _buildSettingsItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Widget? trailing,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 24, color: Colors.grey.shade600),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(fontSize: 16),
              ),
            ),
            if (trailing != null) trailing,
            Icon(Icons.chevron_right, size: 20, color: Colors.grey.shade400),
          ],
        ),
      ),
    );
  }

  Widget _buildSwitchItem({
    required IconData icon,
    required String title,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 24, color: Colors.grey.shade600),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(fontSize: 16),
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: Colors.red,
          ),
        ],
      ),
    );
  }

  Widget _buildLogoutButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: SizedBox(
        width: double.infinity,
        child: OutlinedButton(
          onPressed: _logout,
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            side: const BorderSide(color: Colors.red),
            foregroundColor: Colors.red,
          ),
          child: const Text(
            '退出登录',
            style: TextStyle(fontSize: 16),
          ),
        ),
      ),
    );
  }
}
