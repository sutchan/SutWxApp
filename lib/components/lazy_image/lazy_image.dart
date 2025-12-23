/**
 * 文件名: lazy_image.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-23
 * 作者: Sut
 * 描述: 图片懒加载组件，用于优化图片加载性能
 */

import 'package:cached_network_image/cached_network_image.dart';
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
    Key? key,
    required this.src,
    this.placeholder = 'assets/images/placeholder.svg',
    this.errorImage = 'assets/images/error.svg',
    this.fit = BoxFit.cover,
    this.lazy = true,
    this.width,
    this.height,
    this.onLoad,
    this.onError,
  }) : super(key: key);

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

    // 使用cached_network_image实现懒加载和缓存
    return CachedNetworkImage(
      imageUrl: src,
      width: width,
      height: height,
      fit: fit,
      placeholder: (context, url) => Image.asset(
        placeholder,
        width: width,
        height: height,
        fit: fit,
      ),
      errorWidget: (context, url, error) {
        // 触发错误回调
        if (onError != null) {
          onError!();
        }
        return Image.asset(
          errorImage,
          width: width,
          height: height,
          fit: fit,
        );
      },
      imageBuilder: (context, imageProvider) {
        // 触发加载成功回调
        if (onLoad != null) {
          onLoad!();
        }
        return Image(
          image: imageProvider,
          width: width,
          height: height,
          fit: fit,
        );
      },
      // 禁用缓存（如果需要），默认启用
      // cacheManager: CustomCacheManager(),
    );
  }
}