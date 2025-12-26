// 文件名: empty_state.dart
// 版本号: 1.0.0
// 更新日期: 2025-12-26
// 作者: Sut
// 描述: 空状态组件，用于在各种场景下显示空状态提示

import 'package:flutter/material.dart';

/// 空状态类型枚举
enum EmptyStateType {
  defaultType,
  search,
  cart,
  order,
  network,
  error,
}

/// 空状态组件
class EmptyState extends StatelessWidget {
  /// 空状态类型
  final EmptyStateType type;
  
  /// 自定义图片
  final String? image;
  
  /// 标题文本
  final String? title;
  
  /// 描述文本
  final String? description;
  
  /// 是否显示按钮
  final bool showButton;
  
  /// 按钮文本
  final String buttonText;
  
  /// 图片宽度
  final double imageWidth;
  
  /// 图片高度
  final double imageHeight;
  
  /// 按钮点击回调
  final VoidCallback? onButtonTap;

  /// 构造函数
  const EmptyState({
    super.key,
    this.type = EmptyStateType.defaultType,
    this.image,
    this.title,
    this.description,
    this.showButton = false,
    this.buttonText = '重新尝试',
    this.imageWidth = 100.0,
    this.imageHeight = 100.0,
    this.onButtonTap,
  });

  /// 默认空状态图片映射
  static const Map<EmptyStateType, String> _defaultImages = {
    EmptyStateType.defaultType: 'assets/images/empty.svg',
    EmptyStateType.search: 'assets/images/empty-search.svg',
    EmptyStateType.cart: 'assets/images/empty-cart.svg',
    EmptyStateType.order: 'assets/images/empty-order.svg',
    EmptyStateType.network: 'assets/images/error.svg',
    EmptyStateType.error: 'assets/images/error.svg',
  };

  /// 默认标题映射
  static const Map<EmptyStateType, String> _defaultTitles = {
    EmptyStateType.defaultType: '暂无数据',
    EmptyStateType.search: '没有找到相关内容',
    EmptyStateType.cart: '购物车是空的',
    EmptyStateType.order: '暂无订单',
    EmptyStateType.network: '网络连接失败',
    EmptyStateType.error: '出错了',
  };

  /// 默认描述映射
  static const Map<EmptyStateType, String> _defaultDescriptions = {
    EmptyStateType.defaultType: '',
    EmptyStateType.search: '换个关键词试试',
    EmptyStateType.cart: '快去选择喜欢的商品吧',
    EmptyStateType.order: '您还没有订单记录',
    EmptyStateType.network: '请检查网络连接后重试',
    EmptyStateType.error: '请稍后再试',
  };

  /// 获取最终显示的图片
  String get _displayImage {
    return image ?? _defaultImages[type] ?? _defaultImages[EmptyStateType.defaultType]!;
  }

  /// 获取最终显示的标题
  String get _displayTitle {
    return title ?? _defaultTitles[type] ?? _defaultTitles[EmptyStateType.defaultType]!;
  }

  /// 获取最终显示的描述
  String get _displayDescription {
    return description ?? _defaultDescriptions[type] ?? _defaultDescriptions[EmptyStateType.defaultType]!;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.center,
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // 空状态图片
          Image.asset(
            _displayImage,
            width: imageWidth,
            height: imageHeight,
            fit: BoxFit.contain,
          ),
          const SizedBox(height: 16.0),
          
          // 标题
          Text(
            _displayTitle,
            style: const TextStyle(
              fontSize: 18.0,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8.0),
          
          // 描述
          Text(
            _displayDescription,
            style: const TextStyle(
              fontSize: 14.0,
              color: Colors.grey,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24.0),
          
          // 按钮
          if (showButton)
            ElevatedButton(
              onPressed: onButtonTap,
              child: Text(buttonText),
            ),
        ],
      ),
    );
  }
}
