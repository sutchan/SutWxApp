/**
 * 文件名: empty_state_test.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-28
 * 描述: EmptyState组件单元测试
 */

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sut_wxapp/components/empty_state.dart';

void main() {
  group('EmptyState', () {
    testWidgets('should display default icon for default type', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(type: EmptyStateType.defaultType),
          ),
        ),
      );

      expect(find.byIcon(Icons.inbox_outlined), findsOneWidget);
    });

    testWidgets('should display search icon for search type', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(type: EmptyStateType.search),
          ),
        ),
      );

      expect(find.byIcon(Icons.search_off), findsOneWidget);
    });

    testWidgets('should display cart icon for cart type', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(type: EmptyStateType.cart),
          ),
        ),
      );

      expect(find.byIcon(Icons.shopping_cart_outlined), findsOneWidget);
    });

    testWidgets('should display order icon for order type', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(type: EmptyStateType.order),
          ),
        ),
      );

      expect(find.byIcon(Icons.receipt_long_outlined), findsOneWidget);
    });

    testWidgets('should display network icon for network type', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(type: EmptyStateType.network),
          ),
        ),
      );

      expect(find.byIcon(Icons.cloud_off_outlined), findsOneWidget);
    });

    testWidgets('should display error icon for error type', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(type: EmptyStateType.error),
          ),
        ),
      );

      expect(find.byIcon(Icons.error_outline), findsOneWidget);
    });

    testWidgets('should display custom title', (tester) async {
      const customTitle = '自定义标题';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(
              title: customTitle,
            ),
          ),
        ),
      );

      expect(find.text(customTitle), findsOneWidget);
    });

    testWidgets('should display custom description', (tester) async {
      const customDescription = '自定义描述内容';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(
              description: customDescription,
            ),
          ),
        ),
      );

      expect(find.text(customDescription), findsOneWidget);
    });

    testWidgets('should display button when buttonText provided', (tester) async {
      const buttonText = '点击按钮';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(
              buttonText: buttonText,
              onButtonPressed: () {},
            ),
          ),
        ),
      );

      expect(find.text(buttonText), findsOneWidget);
      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('should not display button when buttonText is null', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(),
          ),
        ),
      );

      expect(find.byType(ElevatedButton), findsNothing);
    });

    testWidgets('should call onButtonPressed when button clicked', (tester) async {
      bool buttonPressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(
              buttonText: '确定',
              onButtonPressed: () {
                buttonPressed = true;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.byType(ElevatedButton));
      expect(buttonPressed, true);
    });

    testWidgets('should use custom icon when provided', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(
              customIcon: const Icon(Icons.star, size: 60),
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.star), findsOneWidget);
    });

    testWidgets('should apply custom icon size', (tester) async {
      const customSize = 120.0;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(
              iconSize: customSize,
            ),
          ),
        ),
      );

      final iconFinder = find.byType(Icon);
      expect(iconFinder, findsOneWidget);

      final iconWidget = tester.widget<Icon>(iconFinder);
      expect(iconWidget.size, customSize);
    });

    testWidgets('should apply custom title font size', (tester) async {
      const customTitleFontSize = 20.0;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(
              title: '测试标题',
              titleFontSize: customTitleFontSize,
            ),
          ),
        ),
      );

      final textFinder = find.text('测试标题');
      expect(textFinder, findsOneWidget);

      final textWidget = tester.widget<Text>(textFinder);
      expect(textWidget.style?.fontSize, customTitleFontSize);
    });

    testWidgets('should center content in the widget', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(
              type: EmptyStateType.cart,
            ),
          ),
        ),
      );

      final centerFinder = find.byType(Center);
      expect(centerFinder, findsAtLeastNWidgets(1));
    });

    testWidgets('should have column layout', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(),
          ),
        ),
      );

      expect(find.byType(Column), findsOneWidget);
    });

    testWidgets('should have proper spacing between elements', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(
              title: '标题',
              description: '描述',
              buttonText: '按钮',
              onButtonPressed: () {},
            ),
          ),
        ),
      );

      expect(find.byType(SizedBox), findsAtLeastNWidgets(2));
    });

    testWidgets('should handle all empty state types', (tester) async {
      for (final type in EmptyStateType.values) {
        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: EmptyState(type: type),
            ),
          ),
        );

        expect(find.byType(EmptyState), findsOneWidget);
      }
    });

    testWidgets('should have double infinity width', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(),
          ),
        ),
      );

      final containerFinder = find.byWidgetPredicate(
        (widget) => widget is Container && widget.width == double.infinity,
      );

      expect(containerFinder, findsOneWidget);
    });

    testWidgets('should apply custom background color', (tester) async {
      const customBackgroundColor = Colors.blue;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(
              backgroundColor: customBackgroundColor,
            ),
          ),
        ),
      );

      final containerFinder = find.byWidgetPredicate(
        (widget) => widget is Container && widget.color == customBackgroundColor,
      );

      expect(containerFinder, findsOneWidget);
    });
  });
}
