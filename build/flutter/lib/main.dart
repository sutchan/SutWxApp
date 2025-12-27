/**
 * 文件名: main.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-27
 * 描述: Flutter应用入口，配置路由和主题
 */

import 'package:flutter/material.dart';
import 'package:sut_wxapp/pages/home/home_page.dart';
import 'package:sut_wxapp/pages/product/product_list_page.dart';
import 'package:sut_wxapp/pages/product/product_detail_page.dart';
import 'package:sut_wxapp/pages/cart/cart_page.dart';
import 'package:sut_wxapp/pages/user/user_center_page.dart';
import 'package:sut_wxapp/pages/address/address_page.dart';
import 'package:sut_wxapp/pages/settings/settings_page.dart';
import 'package:sut_wxapp/pages/help/help_center_page.dart';
import 'package:sut_wxapp/pages/order/order_list_page.dart';
import 'package:sut_wxapp/pages/order/order_confirm_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '苏铁商城',
      theme: ThemeData(
        primarySwatch: Colors.red,
        scaffoldBackgroundColor: Colors.grey.shade100,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          iconTheme: IconThemeData(color: Colors.black87),
          titleTextStyle: TextStyle(
            color: Colors.black87,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        tabBarTheme: const TabBarThemeData(
          labelColor: Colors.red,
          unselectedLabelColor: Colors.grey,
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const MainPage(),
        '/home': (context) => const HomePage(),
        '/product/list': (context) => const ProductListPage(),
        '/product/detail': (context) {
          final args = ModalRoute.of(context)?.settings.arguments;
          final productId = args is String ? args : '1';
          return ProductDetailPage(productId: productId);
        },
        '/cart': (context) => const CartPage(),
        '/user': (context) => const UserCenterPage(),
        '/address': (context) => const AddressPage(),
        '/settings': (context) => const SettingsPage(),
        '/help': (context) => const HelpCenterPage(),
        '/order/list': (context) {
          final args = ModalRoute.of(context)?.settings.arguments;
          final initialStatus = args is int ? args : null;
          return OrderListPage(initialStatus: initialStatus);
        },
        '/order/confirm': (context) => const OrderConfirmPage(),
      },
    );
  }
}

class MainPage extends StatefulWidget {
  const MainPage({super.key});

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  int _currentIndex = 0;

  final List<Widget> _pages = [
    const HomePage(),
    const ProductListPage(categoryId: 0),
    const CartPage(),
    const UserCenterPage(),
  ];

  final List<BottomNavigationBarItem> _navItems = [
    const BottomNavigationBarItem(
      icon: Icon(Icons.home_outlined),
      activeIcon: Icon(Icons.home),
      label: '首页',
    ),
    const BottomNavigationBarItem(
      icon: Icon(Icons.category_outlined),
      activeIcon: Icon(Icons.category),
      label: '分类',
    ),
    const BottomNavigationBarItem(
      icon: Icon(Icons.shopping_cart_outlined),
      activeIcon: Icon(Icons.shopping_cart),
      label: '购物车',
    ),
    const BottomNavigationBarItem(
      icon: Icon(Icons.person_outline),
      activeIcon: Icon(Icons.person),
      label: '我的',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.red,
        unselectedItemColor: Colors.grey.shade600,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        iconSize: 24,
        items: _navItems,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}
