// 文件名: lazy_image.dart
// 版本号: 1.0.0
// 更新日期: 2025-12-26
// 作者: Sut
// 描述: 图片懒加载组件，用于优化图片加载性能

import 'package:flutter/material.dart';

class LazyImage extends StatelessWidget {
  /// 图片地址
  final String src;
  
  /// 占位符图片地址
  final String placeholder;
  
  /// 错误图片地址
  final String errorImage;
  
  /// 图片填充模式
  final BoxFit fit;
  
  /// 是否启用懒加载
  final bool lazy;
  
  /// 宽度
  final double? width;
  
  /// 高度
  final double? height;
  
  /// 图片加载成功回调
  final VoidCallback? onLoad;
  
  /// 图片加载失败回调
  final VoidCallback? onError;

  const LazyImage({
    super.key,
    required this.src,
    this.placeholder = 'assets/images/placeholder.svg',
    this.errorImage = 'assets/images/error.svg',
    this.fit = BoxFit.cover,
    this.lazy = true,
    this.width,
    this.height,
    this.onLoad,
    this.onError,
  });

  @override
  Widget build(BuildContext context) {
    // 如果src为空，显示占位符
    if (src.isEmpty) {
      return Image.asset(
        placeholder,
        width: width,
        height: height,
        fit: fit,
      );
    }
    
    // 正常加载图片
    return Image.network(
      src,
      width: width,
      height: height,
      fit: fit,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) {
          onLoad?.call();
          return child;
        }
        return Image.asset(
          placeholder,
          width: width,
          height: height,
          fit: fit,
        );
      },
      errorBuilder: (context, error, stackTrace) {
        onError?.call();
        return Image.asset(
          errorImage,
          width: width,
          height: height,
          fit: fit,
        );
      },
    );
  }
}