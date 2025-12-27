/**
 * 文件名: cart_test.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-27
 * 描述: 购物车模型单元测试
 */

import 'package:flutter_test/flutter_test.dart';
import 'package:sut_wxapp/models/product.dart';
import 'package:sut_wxapp/pages/cart/cart_page.dart';

void main() {
  group('CartItem', () {
    late Product testProduct;

    setUp(() {
      testProduct = Product(
        id: '1',
        name: '测试商品',
        price: 99.00,
        image: 'https://example.com/image.jpg',
        description: '测试商品描述',
        category: '测试分类',
        stock: 100,
        isFavorite: false,
        isLiked: false,
        discount: 10,
        originalPrice: 109.00,
        sales: 500,
        rating: 4.5,
      );
    });

    test('should create cart item with correct values', () {
      final cartItem = CartItem(
        id: 'cart1',
        product: testProduct,
        quantity: 2,
        selected: true,
        specName: '大号',
      );

      expect(cartItem.id, 'cart1');
      expect(cartItem.product, testProduct);
      expect(cartItem.quantity, 2);
      expect(cartItem.selected, true);
      expect(cartItem.specName, '大号');
    });

    test('should calculate total price correctly', () {
      final cartItem = CartItem(
        id: 'cart1',
        product: testProduct,
        quantity: 3,
        selected: false,
        specName: '',
      );

      expect(cartItem.totalPrice, 297.00);
    });

    test('should handle zero quantity', () {
      final cartItem = CartItem(
        id: 'cart1',
        product: testProduct,
        quantity: 0,
        selected: false,
        specName: '',
      );

      expect(cartItem.totalPrice, 0.0);
    });

    test('should convert to JSON correctly', () {
      final cartItem = CartItem(
        id: 'cart1',
        product: testProduct,
        quantity: 2,
        selected: true,
        specName: '大号',
      );

      final json = cartItem.toJson();

      expect(json['id'], 'cart1');
      expect(json['productId'], '1');
      expect(json['quantity'], 2);
      expect(json['selected'], 1);
      expect(json['specName'], '大号');
    });

    test('should create from JSON correctly', () {
      final json = {
        'id': 'cart1',
        'product': {
          'id': '1',
          'name': '测试商品',
          'price': 99.00,
          'image': 'https://example.com/image.jpg',
          'description': '测试商品描述',
          'category': '测试分类',
          'stock': 100,
          'isFavorite': false,
          'isLiked': false,
          'discount': 10,
          'originalPrice': 109.00,
          'sales': 500,
          'rating': 4.5,
        },
        'quantity': 2,
        'selected': 1,
        'specName': '大号',
      };

      final cartItem = CartItem.fromJson(json);

      expect(cartItem.id, 'cart1');
      expect(cartItem.product.id, '1');
      expect(cartItem.quantity, 2);
      expect(cartItem.selected, true);
      expect(cartItem.specName, '大号');
    });

    test('should handle unselected item in JSON', () {
      final json = {
        'id': 'cart1',
        'product': {
          'id': '1',
          'name': '测试商品',
          'price': 99.00,
          'image': '',
          'description': '',
          'category': '',
          'stock': 100,
          'isFavorite': false,
          'isLiked': false,
          'discount': 0,
          'originalPrice': 99.00,
          'sales': 0,
          'rating': 0,
        },
        'quantity': 1,
        'selected': 0,
        'specName': '',
      };

      final cartItem = CartItem.fromJson(json);

      expect(cartItem.selected, false);
    });
  });

  group('CartPage Logic', () {
    test('should calculate all selected correctly when all items selected', () {
      final items = [
        CartItem(
          id: '1',
          product: Product(
            id: 'p1',
            name: '商品1',
            price: 100,
            image: '',
            description: '',
            category: '',
            stock: 10,
            isFavorite: false,
            isLiked: false,
            discount: 0,
            originalPrice: 100,
            sales: 0,
            rating: 0,
          ),
          quantity: 1,
          selected: true,
          specName: '',
        ),
        CartItem(
          id: '2',
          product: Product(
            id: 'p2',
            name: '商品2',
            price: 200,
            image: '',
            description: '',
            category: '',
            stock: 10,
            isFavorite: false,
            isLiked: false,
            discount: 0,
            originalPrice: 200,
            sales: 0,
            rating: 0,
          ),
          quantity: 1,
          selected: true,
          specName: '',
        ),
      ];

      final allSelected = items.isNotEmpty && items.every((item) => item.selected);
      expect(allSelected, true);
    });

    test('should calculate all selected correctly when not all items selected',
        () {
      final items = [
        CartItem(
          id: '1',
          product: Product(
            id: 'p1',
            name: '商品1',
            price: 100,
            image: '',
            description: '',
            category: '',
            stock: 10,
            isFavorite: false,
            isLiked: false,
            discount: 0,
            originalPrice: 100,
            sales: 0,
            rating: 0,
          ),
          quantity: 1,
          selected: true,
          specName: '',
        ),
        CartItem(
          id: '2',
          product: Product(
            id: 'p2',
            name: '商品2',
            price: 200,
            image: '',
            description: '',
            category: '',
            stock: 10,
            isFavorite: false,
            isLiked: false,
            discount: 0,
            originalPrice: 200,
            sales: 0,
            rating: 0,
          ),
          quantity: 1,
          selected: false,
          specName: '',
        ),
      ];

      final allSelected = items.isNotEmpty && items.every((item) => item.selected);
      expect(allSelected, false);
    });

    test('should calculate total price correctly', () {
      final items = [
        CartItem(
          id: '1',
          product: Product(
            id: 'p1',
            name: '商品1',
            price: 100,
            image: '',
            description: '',
            category: '',
            stock: 10,
            isFavorite: false,
            isLiked: false,
            discount: 0,
            originalPrice: 100,
            sales: 0,
            rating: 0,
          ),
          quantity: 2,
          selected: true,
          specName: '',
        ),
        CartItem(
          id: '2',
          product: Product(
            id: 'p2',
            name: '商品2',
            price: 200,
            image: '',
            description: '',
            category: '',
            stock: 10,
            isFavorite: false,
            isLiked: false,
            discount: 0,
            originalPrice: 200,
            sales: 0,
            rating: 0,
          ),
          quantity: 1,
          selected: true,
          specName: '',
        ),
        CartItem(
          id: '3',
          product: Product(
            id: 'p3',
            name: '商品3',
            price: 300,
            image: '',
            description: '',
            category: '',
            stock: 10,
            isFavorite: false,
            isLiked: false,
            discount: 0,
            originalPrice: 300,
            sales: 0,
            rating: 0,
          ),
          quantity: 1,
          selected: false,
          specName: '',
        ),
      ];

      final totalPrice = items
          .where((item) => item.selected)
          .fold(0.0, (sum, item) => sum + item.totalPrice);

      expect(totalPrice, 400.00);
    });

    test('should calculate selected count correctly', () {
      final items = [
        CartItem(
          id: '1',
          product: Product(id: 'p1', name: '', price: 0, image: '', description: '', category: '', stock: 0, isFavorite: false, isLiked: false, discount: 0, originalPrice: 0, sales: 0, rating: 0),
          quantity: 1,
          selected: true,
          specName: '',
        ),
        CartItem(
          id: '2',
          product: Product(id: 'p2', name: '', price: 0, image: '', description: '', category: '', stock: 0, isFavorite: false, isLiked: false, discount: 0, originalPrice: 0, sales: 0, rating: 0),
          quantity: 1,
          selected: true,
          specName: '',
        ),
        CartItem(
          id: '3',
          product: Product(id: 'p3', name: '', price: 0, image: '', description: '', category: '', stock: 0, isFavorite: false, isLiked: false, discount: 0, originalPrice: 0, sales: 0, rating: 0),
          quantity: 1,
          selected: false,
          specName: '',
        ),
      ];

      final selectedCount = items.where((item) => item.selected).length;

      expect(selectedCount, 2);
    });
  });
}
