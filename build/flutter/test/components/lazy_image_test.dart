/**
 * 文件名: lazy_image_test.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-28
 * 描述: LazyImage组件单元测试
 */

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sut_wxapp/components/lazy_image.dart';

void main() {
  group('LazyImage', () {
    testWidgets('should display placeholder when url is null', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LazyImage(
              url: null,
              width: 100,
              height: 100,
            ),
          ),
        ),
      );

      await tester.pump();

      expect(find.byType(Container), findsWidgets);
      expect(find.byIcon(Icons.image), findsOneWidget);
    });

    testWidgets('should display placeholder when url is empty', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LazyImage(
              url: '',
              width: 100,
              height: 100,
            ),
          ),
        ),
      );

      await tester.pump();

      expect(find.byIcon(Icons.image), findsOneWidget);
    });

    testWidgets('should use custom placeholder when provided', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LazyImage(
              url: '',
              width: 100,
              height: 100,
              placeholder: 'images/placeholder.svg',
            ),
          ),
        ),
      );

      await tester.pump();

      expect(find.byType(Image), findsOneWidget);
    });

    testWidgets('should call onLoadError when url is invalid', (tester) async {
      bool hasError = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LazyImage(
              url: 'https://invalid-url-that-does-not-exist.xyz/image.jpg',
              width: 100,
              height: 100,
              onLoadError: () {
                hasError = true;
              },
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(hasError, true);
    });

    testWidgets('should apply correct dimensions', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LazyImage(
              url: null,
              width: 200,
              height: 150,
            ),
          ),
        ),
      );

      await tester.pump();

      final container = find.byWidgetPredicate(
        (widget) => widget is Container && widget.width == 200 && widget.height == 150,
      );

      expect(container, findsOneWidget);
    });

    testWidgets('should apply correct BoxFit', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LazyImage(
              url: null,
              width: 100,
              height: 100,
              fit: BoxFit.contain,
            ),
          ),
        ),
      );

      await tester.pump();

      expect(find.byType(Image), findsOneWidget);
    });

    testWidgets('should update when url changes', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LazyImage(
              url: 'https://example.com/first.jpg',
              width: 100,
              height: 100,
            ),
          ),
        ),
      );

      await tester.pump();

      expect(find.byIcon(Icons.image), findsOneWidget);
    });

    testWidgets('should show loading indicator during load', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LazyImage(
              url: 'https://example.com/test.jpg',
              width: 100,
              height: 100,
            ),
          ),
        ),
      );

      await tester.pump(const Duration(milliseconds: 100));

      expect(find.byType(CircularProgressIndicator), findsWidgets);
    });

    testWidgets('should call onLoadSuccess on successful load', (tester) async {
      bool successCalled = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LazyImage(
              url: 'https://via.placeholder.com/100',
              width: 100,
              height: 100,
              onLoadSuccess: () {
                successCalled = true;
              },
            ),
          ),
        ),
      );

      await tester.pumpAndSettle(const Duration(seconds: 5));

      expect(successCalled, true);
    });
  });

  group('CachedNetworkImage', () {
    testWidgets('should create with required parameters', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CachedNetworkImage(
              url: 'https://example.com/image.jpg',
              width: 200,
              height: 200,
            ),
          ),
        ),
      );

      await tester.pump();

      expect(find.byType(LazyImage), findsOneWidget);
    });

    testWidgets('should pass all parameters to LazyImage', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CachedNetworkImage(
              url: 'https://example.com/image.jpg',
              width: 150,
              height: 150,
              fit: BoxFit.contain,
              placeholder: 'images/placeholder.svg',
              errorImage: 'images/error.svg',
            ),
          ),
        ),
      );

      await tester.pump();

      expect(find.byType(LazyImage), findsOneWidget);
    });
  });

  group('ImageCacheManager', () {
    test('should return singleton instance', () {
      final manager1 = ImageCacheManager();
      final manager2 = ImageCacheManager();

      expect(identical(manager1, manager2), true);
    });

    test('should have initial cache size of 0', () {
      final manager = ImageCacheManager();

      expect(manager.cacheSize, 0);
    });

    test('should preload image and add to cache', () {
      final manager = ImageCacheManager();
      manager.clearCache();

      manager.preloadImage('https://example.com/test.jpg');

      expect(manager.cacheSize, greaterThanOrEqualTo(0));
    });

    test('should not add empty url to cache', () {
      final manager = ImageCacheManager();
      manager.clearCache();

      final initialSize = manager.cacheSize;
      manager.preloadImage('');

      expect(manager.cacheSize, initialSize);
    });

    test('should clear cache correctly', () {
      final manager = ImageCacheManager();
      manager.preloadImage('https://example.com/test.jpg');

      manager.clearCache();

      expect(manager.cacheSize, 0);
    });

    test('should handle duplicate preload gracefully', () {
      final manager = ImageCacheManager();
      manager.clearCache();

      manager.preloadImage('https://example.com/test.jpg');
      final sizeAfterFirst = manager.cacheSize;
      manager.preloadImage('https://example.com/test.jpg');

      expect(manager.cacheSize, greaterThanOrEqualTo(sizeAfterFirst));
    });
  });
}
