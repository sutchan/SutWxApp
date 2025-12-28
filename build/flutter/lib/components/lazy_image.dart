/// 文件名: lazy_image.dart
/// 版本号: 1.0.0
/// 更新日期: 2025-12-28
/// 描述: Flutter图片懒加载组件，支持网络图片加载、占位符、错误图片、缓存功能

import 'package:flutter/material.dart';

class LazyImage extends StatefulWidget {
  final String? url;
  final String? placeholder;
  final String? errorImage;
  final double width;
  final double height;
  final BoxFit fit;
  final bool useCache;
  final Duration fadeInDuration;
  final VoidCallback? onLoadSuccess;
  final VoidCallback? onLoadError;

  const LazyImage({
    super.key,
    this.url,
    this.placeholder,
    this.errorImage,
    this.width = 100,
    this.height = 100,
    this.fit = BoxFit.cover,
    this.useCache = true,
    this.fadeInDuration = const Duration(milliseconds: 300),
    this.onLoadSuccess,
    this.onLoadError,
  });

  @override
  State<LazyImage> createState() => _LazyImageState();
}

class _LazyImageState extends State<LazyImage> with AutomaticKeepAliveClientMixin {
  bool _isLoading = true;
  bool _hasError = false;
  ImageProvider? _imageProvider;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _loadImage();
  }

  @override
  void didUpdateWidget(LazyImage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.url != widget.url) {
      _resetAndLoadImage();
    }
  }

  void _resetAndLoadImage() {
    if (mounted) {
      setState(() {
        _isLoading = true;
        _hasError = false;
        _imageProvider = null;
      });
      _loadImage();
    }
  }

  Future<void> _loadImage() async {
    if (widget.url == null || widget.url!.isEmpty) {
      _handleLoadError();
      return;
    }

    try {
      final provider = NetworkImage(
        widget.url!,
      );

      await provider.resolve(ImageConfiguration.empty);

      if (mounted) {
        setState(() {
          _imageProvider = provider;
          _isLoading = false;
        });
        widget.onLoadSuccess?.call();
      }
    } catch (e) {
      debugPrint('LazyImage load error: $e');
      _handleLoadError();
    }
  }

  void _handleLoadError() {
    if (mounted) {
      setState(() {
        _isLoading = false;
        _hasError = true;
      });
      widget.onLoadError?.call();
    }
  }

  void _retryLoad() {
    _resetAndLoadImage();
  }

  Widget _buildPlaceholder() {
    return widget.placeholder != null && widget.placeholder!.isNotEmpty
        ? Image.asset(
            widget.placeholder!,
            width: widget.width,
            height: widget.height,
            fit: widget.fit,
            errorBuilder: (context, error, stack) {
              return _buildDefaultPlaceholder();
            },
          )
        : _buildDefaultPlaceholder();
  }

  Widget _buildDefaultPlaceholder() {
    return Container(
      width: widget.width,
      height: widget.height,
      color: const Color.fromARGB(255, 238, 238, 238),
      child: const Icon(
        Icons.image,
        color: Color.fromARGB(255, 158, 158, 158),
        size: 40,
      ),
    );
  }

  Widget _buildErrorImage() {
    return widget.errorImage != null && widget.errorImage!.isNotEmpty
        ? Image.asset(
            widget.errorImage!,
            width: widget.width,
            height: widget.height,
            fit: widget.fit,
            errorBuilder: (context, error, stack) {
              return _buildDefaultErrorImage();
            },
          )
        : _buildDefaultErrorImage();
  }

  Widget _buildDefaultErrorImage() {
    return Container(
      width: widget.width,
      height: widget.height,
      color: const Color.fromARGB(255, 245, 245, 245),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.broken_image,
            color: const Color.fromARGB(255, 189, 189, 189),
            size: 40,
          ),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: _retryLoad,
            child: const Text(
              '点击重试',
              style: TextStyle(
                fontSize: 12,
                color: Color.fromARGB(255, 117, 117, 117),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImage() {
    if (_imageProvider != null) {
      return Image(
        image: _imageProvider!,
        width: widget.width,
        height: widget.height,
        fit: widget.fit,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Center(
            child: CircularProgressIndicator(
              value: loadingProgress.expectedTotalBytes != null
                  ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                  : null,
              strokeWidth: 2,
            ),
          );
        },
        errorBuilder: (context, error, stack) {
          _handleLoadError();
          return _buildErrorImage();
        },
      );
    }
    return const SizedBox.shrink();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return AnimatedOpacity(
      duration: widget.fadeInDuration,
      opacity: _isLoading ? 0.5 : 1.0,
      child: _isLoading
          ? _buildPlaceholder()
          : _hasError
              ? _buildErrorImage()
              : _buildImage(),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }
}

class CachedNetworkImage extends StatelessWidget {
  final String url;
  final double width;
  final double height;
  final BoxFit fit;
  final String? placeholder;
  final String? errorImage;
  final VoidCallback? onLoadSuccess;
  final VoidCallback? onLoadError;

  const CachedNetworkImage({
    super.key,
    required this.url,
    this.width = 100,
    this.height = 100,
    this.fit = BoxFit.cover,
    this.placeholder,
    this.errorImage,
    this.onLoadSuccess,
    this.onLoadError,
  });

  @override
  Widget build(BuildContext context) {
    return LazyImage(
      url: url,
      width: width,
      height: height,
      fit: fit,
      placeholder: placeholder,
      errorImage: errorImage,
      useCache: true,
      onLoadSuccess: onLoadSuccess,
      onLoadError: onLoadError,
    );
  }
}

class ImageCacheManager {
  static final ImageCacheManager _instance = ImageCacheManager._internal();
  factory ImageCacheManager() => _instance;
  ImageCacheManager._internal();

  final Map<String, ImageProvider> _cache = {};
  final int _maxCacheSize = 100;
  int _currentCacheSize = 0;

  void preloadImage(String url, {Map<String, String>? headers}) {
    if (url.isEmpty || _cache.containsKey(url)) return;

    if (_currentCacheSize >= _maxCacheSize) {
      _evictOldestImage();
    }

    final provider = NetworkImage(url, headers: headers);
    provider.resolve(ImageConfiguration.empty).addListener(
      ImageStreamListener(
        (image, synchronousCall) {
          _cache[url] = provider;
          _currentCacheSize++;
        },
        onError: (error, stack) {
          debugPrint('Image preload error: $error');
        },
      ),
    );
  }

  void _evictOldestImage() {
    if (_cache.isNotEmpty) {
      final oldestKey = _cache.keys.first;
      _cache.remove(oldestKey);
      _currentCacheSize--;
    }
  }

  void clearCache() {
    _cache.clear();
    _currentCacheSize = 0;
    PaintingBinding.instance.imageCache.clear();
    PaintingBinding.instance.imageCache.clearLiveImages();
  }

  int get cacheSize => _currentCacheSize;
}
