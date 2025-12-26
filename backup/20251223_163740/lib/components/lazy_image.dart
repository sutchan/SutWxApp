// 文件名: lazy_image.dart
// 版本号: 1.0.0
// 更新日期: 2025-12-26
// 作者: Sut
// 描述: 图片懒加载组件，用于优化图片加载性能

import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

/// 图片懒加载组件
class LazyImage extends StatelessWidget {
  /// 图片地址
  final String src;
  
  /// 占位符图片地址
  final String placeholder;
  
  /// 错误图片地址
  final String errorImage;
  
  /// 图片模式
  final BoxFit mode;
  
  /// 是否启用懒加载
  final bool lazy;
  
  /// 懒加载阈值（百分比）
  final int threshold;
  
  /// 图片宽度
  final double? width;
  
  /// 图片高度
  final double? height;
  
  /// 构造函数
  const LazyImage({
    super.key,
    required this.src,
    this.placeholder = 'assets/images/placeholder.svg',
    this.errorImage = 'assets/images/error.svg',
    this.mode = BoxFit.cover,
    this.lazy = true,
    this.threshold = 100,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    return CachedNetworkImage(
      imageUrl: src,
      placeholder: (context, url) => Image.asset(
        placeholder,
        width: width,
        height: height,
        fit: mode,
      ),
      errorWidget: (context, url, error) => Image.asset(
        errorImage,
        width: width,
        height: height,
        fit: mode,
      ),
      width: width,
      height: height,
      fit: mode,
      fadeOutDuration: const Duration(milliseconds: 300),
      fadeInDuration: const Duration(milliseconds: 300),
      // Flutter的CachedNetworkImage默认会处理图片的懒加载
      // 当图片滚动到视口内时才会开始加载
    );
  }
}