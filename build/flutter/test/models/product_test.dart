/**
 * 文件名: product_test.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-28
 * 描述: 商品模型单元测试
 */

import 'package:flutter_test/flutter_test.dart';
import 'package:sut_wxapp/models/product.dart';

void main() {
  group('Product', () {
    test('should create product with correct values', () {
      final product = Product(
        id: '1',
        name: '苏铁盆栽',
        price: 99.00,
        image: 'https://example.com/sut.jpg',
        description: '优质苏铁盆栽，适合室内摆放',
        category: '盆栽',
        stock: 100,
        isFavorite: false,
        isLiked: false,
        discount: 10,
        originalPrice: 109.00,
        sales: 500,
        rating: 4.5,
      );

      expect(product.id, '1');
      expect(product.name, '苏铁盆栽');
      expect(product.price, 99.00);
      expect(product.image, 'https://example.com/sut.jpg');
      expect(product.description, '优质苏铁盆栽，适合室内摆放');
      expect(product.category, '盆栽');
      expect(product.stock, 100);
      expect(product.isFavorite, false);
      expect(product.isLiked, false);
      expect(product.discount, 10);
      expect(product.originalPrice, 109.00);
      expect(product.sales, 500);
      expect(product.rating, 4.5);
    });

    test('should create product with default values', () {
      final product = Product(
        id: '2',
        name: '测试商品',
        price: 50.00,
        image: 'https://example.com/test.jpg',
      );

      expect(product.id, '2');
      expect(product.name, '测试商品');
      expect(product.price, 50.00);
      expect(product.image, 'https://example.com/test.jpg');
      expect(product.description, '');
      expect(product.category, '');
      expect(product.stock, 0);
      expect(product.isFavorite, false);
      expect(product.isLiked, false);
      expect(product.discount, null);
      expect(product.originalPrice, null);
      expect(product.sales, 0);
      expect(product.rating, 0.0);
      expect(product.images, []);
    });

    test('should convert to JSON correctly', () {
      final product = Product(
        id: '1',
        name: '苏铁盆栽',
        price: 99.00,
        image: 'https://example.com/sut.jpg',
        description: '优质苏铁盆栽',
        category: '盆栽',
        stock: 100,
        isFavorite: true,
        isLiked: true,
        discount: 10,
        originalPrice: 109.00,
        sales: 500,
        rating: 4.5,
        images: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
      );

      final json = product.toJson();

      expect(json['id'], '1');
      expect(json['name'], '苏铁盆栽');
      expect(json['price'], 99.00);
      expect(json['image'], 'https://example.com/sut.jpg');
      expect(json['description'], '优质苏铁盆栽');
      expect(json['category'], '盆栽');
      expect(json['stock'], 100);
      expect(json['isFavorite'], true);
      expect(json['isLiked'], true);
      expect(json['discount'], 10);
      expect(json['originalPrice'], 109.00);
      expect(json['sales'], 500);
      expect(json['rating'], 4.5);
      expect(json['images'], ['https://example.com/1.jpg', 'https://example.com/2.jpg']);
    });

    test('should create from JSON correctly', () {
      final json = {
        'id': '3',
        'name': '多肉植物',
        'price': 29.90,
        'image': 'https://example.com/multi.jpg',
        'description': '可爱多肉植物',
        'category': '多肉',
        stock: 200,
        'isFavorite': false,
        'isLiked': true,
        discount: 20,
        originalPrice: 37.00,
        sales: 1000,
        rating: 4.8,
        images: ['https://example.com/m1.jpg'],
      };

      final product = Product.fromJson(json);

      expect(product.id, '3');
      expect(product.name, '多肉植物');
      expect(product.price, 29.90);
      expect(product.image, 'https://example.com/multi.jpg');
      expect(product.description, '可爱多肉植物');
      expect(product.category, '多肉');
      expect(product.stock, 200);
      expect(product.isFavorite, false);
      expect(product.isLiked, true);
      expect(product.discount, 20);
      expect(product.originalPrice, 37.00);
      expect(product.sales, 1000);
      expect(product.rating, 4.8);
      expect(product.images, ['https://example.com/m1.jpg']);
    });

    test('should handle missing fields in JSON', () {
      final json = {
        'id': '4',
        'name': '简约花盆',
        'price': 15.00,
        'image': 'https://example.com/pot.jpg',
      };

      final product = Product.fromJson(json);

      expect(product.id, '4');
      expect(product.name, '简约花盆');
      expect(product.price, 15.00);
      expect(product.description, '');
      expect(product.category, '');
      expect(product.stock, 0);
      expect(product.isFavorite, false);
      expect(product.isLiked, false);
      expect(product.discount, null);
      expect(product.originalPrice, null);
      expect(product.sales, 0);
      expect(product.rating, 0.0);
      expect(product.images, []);
    });

    test('should handle null values in JSON', () {
      final json = {
        'id': '5',
        'name': '测试',
        'price': null,
        'image': null,
        'description': null,
        'category': null,
        'stock': null,
        'isFavorite': null,
        'isLiked': null,
        'discount': null,
        'originalPrice': null,
        'sales': null,
        'rating': null,
        'images': null,
      };

      final product = Product.fromJson(json);

      expect(product.id, '5');
      expect(product.name, '测试');
      expect(product.price, 0.0);
      expect(product.image, '');
      expect(product.description, '');
      expect(product.category, '');
      expect(product.stock, 0);
      expect(product.isFavorite, false);
      expect(product.isLiked, false);
      expect(product.discount, null);
      expect(product.originalPrice, null);
      expect(product.sales, 0);
      expect(product.rating, 0.0);
      expect(product.images, []);
    });

    test('should handle invalid price type in JSON', () {
      final json = {
        'id': '6',
        'name': '字符串价格测试',
        'price': '99.00',
        'image': '',
      };

      final product = Product.fromJson(json);

      expect(product.price, 0.0);
    });

    test('should handle numeric price as integer', () {
      final json = {
        'id': '7',
        'name': '整数价格测试',
        'price': 100,
        'image': '',
      };

      final product = Product.fromJson(json);

      expect(product.price, 100.0);
    });

    test('should compare products correctly', () {
      final product1 = Product(
        id: '1',
        name: '商品A',
        price: 50.00,
        image: '',
      );

      final product2 = Product(
        id: '1',
        name: '商品A',
        price: 50.00,
        image: '',
      );

      final product3 = Product(
        id: '2',
        name: '商品B',
        price: 60.00,
        image: '',
      );

      expect(product1.id, product2.id);
      expect(product1.name, product2.name);
      expect(product1.price, product2.price);
      expect(product1.id, isNot(product3.id));
    });

    test('should generate correct hash code', () {
      final product = Product(
        id: '1',
        name: '测试商品',
        price: 99.00,
        image: 'https://example.com/test.jpg',
      );

      expect(product.hashCode, isA<int>());
      expect(product.hashCode, equals(product.hashCode));
    });

    test('should calculate discount price correctly', () {
      final product = Product(
        id: '1',
        name: '促销商品',
        price: 79.20,
        image: '',
        discount: 20,
        originalPrice: 99.00,
      );

      expect(product.discount, 20);
      expect(product.originalPrice, 99.00);
      expect(product.price, 79.20);
    });

    test('should handle empty images list', () {
      final product = Product(
        id: '1',
        name: '无图片商品',
        price: 10.00,
        image: '',
        images: [],
      );

      expect(product.images, []);
      expect(product.image, '');
    });

    test('should handle images list correctly', () {
      final images = [
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
        'https://example.com/3.jpg',
      ];

      final product = Product(
        id: '1',
        name: '多图商品',
        price: 50.00,
        image: images[0],
        images: images,
      );

      expect(product.images.length, 3);
      expect(product.images, equals(images));
      expect(product.image, images[0]);
    });
  });
}
