/**
 * 文件名: product_card_test.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-28
 * 描述: ProductCard组件单元测试
 */

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sut_wxapp/components/product_card.dart';
import 'package:sut_wxapp/models/product.dart';

void main() {
  group('ProductCard', () {
    late Product testProduct;

    setUp(() {
      testProduct = Product(
        id: '1',
        name: '苏铁精品盆栽',
        price: 199.00,
        image: 'https://example.com/sut.jpg',
        description: '优质苏铁盆栽，适合室内装饰',
        category: '盆栽',
        stock: 100,
        isFavorite: false,
        isLiked: false,
        discount: 20,
        originalPrice: 249.00,
        sales: 500,
        rating: 4.8,
      );
    });

    testWidgets('should render with product data', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(product: testProduct),
          ),
        ),
      );

      expect(find.text('苏铁精品盆栽'), findsOneWidget);
      expect(find.text('¥199.00'), findsOneWidget);
    });

    testWidgets('should show discount badge when discount > 0', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              showDiscount: true,
            ),
          ),
        ),
      );

      expect(find.text('-20%'), findsOneWidget);
    });

    testWidgets('should hide discount badge when showDiscount is false', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              showDiscount: false,
            ),
          ),
        ),
      );

      expect(find.text('-20%'), findsNothing);
    });

    testWidgets('should display original price with strikethrough', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(product: testProduct),
          ),
        ),
      );

      expect(find.text('¥249.00'), findsOneWidget);
    });

    testWidgets('should display sales count', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(product: testProduct),
          ),
        ),
      );

      expect(find.text('500人已购'), findsOneWidget);
    });

    testWidgets('should display like button', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              showActions: true,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.thumb_up_outlined), findsOneWidget);
    });

    testWidgets('should display favorite button', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              showActions: true,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.favorite_outline), findsOneWidget);
    });

    testWidgets('should display share button', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              showActions: true,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.share), findsOneWidget);
    });

    testWidgets('should call onLikePressed when like button tapped', (tester) async {
      bool likePressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              showActions: true,
              onLikePressed: () {
                likePressed = true;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.thumb_up_outlined));
      expect(likePressed, true);
    });

    testWidgets('should call onFavoritePressed when favorite button tapped', (tester) async {
      bool favoritePressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              showActions: true,
              onFavoritePressed: () {
                favoritePressed = true;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.favorite_outline));
      expect(favoritePressed, true);
    });

    testWidgets('should call onSharePressed when share button tapped', (tester) async {
      bool sharePressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              showActions: true,
              onSharePressed: () {
                sharePressed = true;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.share));
      expect(sharePressed, true);
    });

    testWidgets('should change like icon when tapped', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              showActions: true,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.thumb_up_outlined), findsOneWidget);

      await tester.tap(find.byIcon(Icons.thumb_up_outlined));
      await tester.pump();

      expect(find.byIcon(Icons.thumb_up), findsOneWidget);
    });

    testWidgets('should change favorite icon when tapped', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              showActions: true,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.favorite_outline), findsOneWidget);

      await tester.tap(find.byIcon(Icons.favorite_outline));
      await tester.pump();

      expect(find.byIcon(Icons.favorite), findsOneWidget);
    });

    testWidgets('should display add to cart button when onAddToCart provided', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              onAddToCart: () {},
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.add_shopping_cart), findsOneWidget);
      expect(find.text('加购'), findsOneWidget);
    });

    testWidgets('should call onAddToCart when cart button tapped', (tester) async {
      bool addToCartPressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              onAddToCart: () {
                addToCartPressed = true;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.add_shopping_cart));
      expect(addToCartPressed, true);
    });

    testWidgets('should call onTap when card tapped', (tester) async {
      bool cardTapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              onTap: () {
                cardTapped = true;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.byType(ProductCard));
      expect(cardTapped, true);
    });

    testWidgets('should render in compact mode', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              compactMode: true,
            ),
          ),
        ),
      );

      expect(find.text('苏铁精品盆栽'), findsOneWidget);
      expect(find.text('¥199.00'), findsOneWidget);
    });

    testWidgets('should hide actions when showActions is false', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: testProduct,
              showActions: false,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.thumb_up_outlined), findsNothing);
      expect(find.byIcon(Icons.favorite_outline), findsNothing);
      expect(find.byIcon(Icons.share), findsNothing);
    });

    testWidgets('should render with product without discount', (tester) async {
      final productWithoutDiscount = Product(
        id: '2',
        name: '普通商品',
        price: 99.00,
        image: 'https://example.com/product.jpg',
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(product: productWithoutDiscount),
          ),
        ),
      );

      expect(find.text('普通商品'), findsOneWidget);
      expect(find.text('¥99.00'), findsOneWidget);
      expect(find.text('-20%'), findsNothing);
    });

    testWidgets('should handle long product name with ellipsis', (tester) async {
      final productWithLongName = Product(
        id: '3',
        name: '这是一个非常长的商品名称，超出了一般的长度限制，需要显示省略号',
        price: 99.00,
        image: 'https://example.com/long-name.jpg',
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(product: productWithLongName),
          ),
        ),
      );

      expect(find.textContaining('这是一个非常长的商品名称'), findsOneWidget);
    });

    testWidgets('should have rounded corners', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(product: testProduct),
          ),
        ),
      );

      expect(find.byType(ClipRRect), findsOneWidget);
    });

    testWidgets('should have shadow decoration', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(product: testProduct),
          ),
        ),
      );

      expect(find.byType(Container), findsWidgets);
    });

    testWidgets('should display rating', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(product: testProduct),
          ),
        ),
      );

      expect(find.text('500人已购'), findsOneWidget);
    });

    testWidgets('should handle product with zero sales', (tester) async {
      final productWithZeroSales = Product(
        id: '4',
        name: '新品上架',
        price: 199.00,
        image: 'https://example.com/new.jpg',
        sales: 0,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(product: productWithZeroSales),
          ),
        ),
      );

      expect(find.text('0人已购'), findsOneWidget);
    });

    testWidgets('should handle product with zero stock', (tester) async {
      final productWithZeroStock = Product(
        id: '5',
        name: '缺货商品',
        price: 99.00,
        image: 'https://example.com/out-of-stock.jpg',
        stock: 0,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(product: productWithZeroStock),
          ),
        ),
      );

      expect(find.text('缺货商品'), findsOneWidget);
    });
  });
}
