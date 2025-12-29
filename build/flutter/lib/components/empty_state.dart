/// 文件名: empty_state.dart
/// 版本号: 1.0.0
/// 更新日期: 2025-12-28
/// 描述: Flutter空状态组件，支持多种空状态类型展示

import 'package:flutter/material.dart';

enum EmptyStateType {
  defaultType,
  search,
  cart,
  order,
  network,
  error,
}

class EmptyState extends StatelessWidget {
  final EmptyStateType type;
  final String? title;
  final String? description;
  final String? buttonText;
  final VoidCallback? onButtonPressed;
  final Widget? customIcon;
  final double iconSize;
  final double titleFontSize;
  final double descriptionFontSize;
  final Color? iconColor;
  final Color? titleColor;
  final Color? descriptionColor;
  final Color? buttonColor;
  final Color? backgroundColor;

  const EmptyState({
    super.key,
    this.type = EmptyStateType.defaultType,
    this.title,
    this.description,
    this.buttonText,
    this.onButtonPressed,
    this.customIcon,
    this.iconSize = 80,
    this.titleFontSize = 16,
    this.descriptionFontSize = 14,
    this.iconColor,
    this.titleColor,
    this.descriptionColor,
    this.buttonColor,
    this.backgroundColor,
  });

  IconData get _icon {
    switch (type) {
      case EmptyStateType.defaultType:
        return Icons.inbox_outlined;
      case EmptyStateType.search:
        return Icons.search_off;
      case EmptyStateType.cart:
        return Icons.shopping_cart_outlined;
      case EmptyStateType.order:
        return Icons.receipt_long_outlined;
      case EmptyStateType.network:
        return Icons.cloud_off_outlined;
      case EmptyStateType.error:
        return Icons.error_outline;
    }
  }

  String get _defaultTitle {
    switch (type) {
      case EmptyStateType.defaultType:
        return '暂无数据';
      case EmptyStateType.search:
        return '未找到相关结果';
      case EmptyStateType.cart:
        return '购物车是空的';
      case EmptyStateType.order:
        return '暂无订单';
      case EmptyStateType.network:
        return '网络连接失败';
      case EmptyStateType.error:
        return '出了点问题';
    }
  }

  String get _defaultDescription {
    switch (type) {
      case EmptyStateType.defaultType:
        return '请稍后再试';
      case EmptyStateType.search:
        return '试试其他关键词';
      case EmptyStateType.cart:
        return '快去挑选心仪的商品吧';
      case EmptyStateType.order:
        return '快去下单吧';
      case EmptyStateType.network:
        return '请检查网络连接';
      case EmptyStateType.error:
        return '请稍后重试';
    }
  }

  Color get _defaultIconColor {
    switch (type) {
      case EmptyStateType.defaultType:
        return Colors.grey.shade300;
      case EmptyStateType.search:
        return Colors.grey.shade400;
      case EmptyStateType.cart:
        return Colors.grey.shade300;
      case EmptyStateType.order:
        return Colors.grey.shade300;
      case EmptyStateType.network:
        return Colors.grey.shade400;
      case EmptyStateType.error:
        return Colors.red.shade200;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveIconColor = iconColor ?? _defaultIconColor;
    final effectiveTitleColor = titleColor ?? theme.textTheme.bodyLarge?.color ?? Colors.grey;
    final effectiveDescriptionColor = descriptionColor ?? theme.textTheme.bodyMedium?.color ?? Colors.grey.shade500;
    final effectiveButtonColor = buttonColor ?? theme.primaryColor;

    return Center(
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(32),
        color: backgroundColor ?? Colors.transparent,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            customIcon ??
                Icon(
                  _icon,
                  size: iconSize,
                  color: effectiveIconColor,
                ),
            const SizedBox(height: 16),
            Text(
              title ?? _defaultTitle,
              style: TextStyle(
                fontSize: titleFontSize,
                color: effectiveTitleColor,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
            if (description != null || _defaultDescription.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                description ?? _defaultDescription,
                style: TextStyle(
                  fontSize: descriptionFontSize,
                  color: effectiveDescriptionColor,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (buttonText != null && onButtonPressed != null) ...[
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: onButtonPressed,
                style: ElevatedButton.styleFrom(
                  backgroundColor: effectiveButtonColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 12,
                  ),
                ),
                child: Text(buttonText!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
