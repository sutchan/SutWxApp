/**
 * 文件名: address_test.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-27
 * 描述: 地址模型单元测试
 */

import 'package:flutter_test/flutter_test.dart';
import 'package:sut_wxapp/models/address.dart';

void main() {
  group('AddressInfo', () {
    test('should create address with correct values', () {
      final address = AddressInfo(
        id: '1',
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '望京街道1号',
        isDefault: true,
      );

      expect(address.id, '1');
      expect(address.name, '张三');
      expect(address.phone, '13800138000');
      expect(address.province, '北京市');
      expect(address.city, '北京市');
      expect(address.district, '朝阳区');
      expect(address.detail, '望京街道1号');
      expect(address.isDefault, true);
    });

    test('should generate correct full address', () {
      final address = AddressInfo(
        id: '1',
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '上海市',
        district: '浦东新区',
        detail: '陆家嘴环路1号',
        isDefault: false,
      );

      expect(
        address.fullAddress,
        '北京市上海市浦东新区陆家嘴环路1号',
      );
    });

    test('should generate correct masked phone', () {
      final address = AddressInfo(
        id: '1',
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '望京街道1号',
        isDefault: false,
      );

      expect(address.maskedPhone, '138****8000');
    });

    test('should convert to JSON correctly', () {
      final address = AddressInfo(
        id: '1',
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '望京街道1号',
        isDefault: true,
      );

      final json = address.toJson();

      expect(json['id'], '1');
      expect(json['name'], '张三');
      expect(json['phone'], '13800138000');
      expect(json['province'], '北京市');
      expect(json['city'], '北京市');
      expect(json['district'], '朝阳区');
      expect(json['detail'], '望京街道1号');
      expect(json['isDefault'], 1);
    });

    test('should create from JSON correctly', () {
      final json = {
        'id': '1',
        'name': '李四',
        'phone': '13900139000',
        'province': '上海市',
        'city': '上海市',
        'district': '浦东新区',
        'detail': '陆家嘴环路2号',
        'isDefault': 0,
      };

      final address = AddressInfo.fromJson(json);

      expect(address.id, '1');
      expect(address.name, '李四');
      expect(address.phone, '13900139000');
      expect(address.province, '上海市');
      expect(address.city, '上海市');
      expect(address.district, '浦东新区');
      expect(address.detail, '陆家嘴环路2号');
      expect(address.isDefault, false);
    });

    test('should handle missing isDefault in JSON', () {
      final json = {
        'id': '1',
        'name': '王五',
        'phone': '13600136000',
        'province': '广州市',
        'city': '广州市',
        'district': '天河区',
        'detail': '体育西路1号',
      };

      final address = AddressInfo.fromJson(json);

      expect(address.isDefault, false);
    });

    test('should copy with new values correctly', () {
      final original = AddressInfo(
        id: '1',
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '望京街道1号',
        isDefault: false,
      );

      final copied = original.copyWith(
        name: '李四',
        isDefault: true,
      );

      expect(copied.id, '1');
      expect(copied.name, '李四');
      expect(copied.phone, '13800138000');
      expect(copied.isDefault, true);
      expect(copied.province, '北京市');
    });

    test('should compare addresses correctly', () {
      final address1 = AddressInfo(
        id: '1',
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '望京街道1号',
        isDefault: true,
      );

      final address2 = AddressInfo(
        id: '1',
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '望京街道1号',
        isDefault: true,
      );

      final address3 = AddressInfo(
        id: '2',
        name: '李四',
        phone: '13900139000',
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        detail: '陆家嘴环路1号',
        isDefault: false,
      );

      expect(address1 == address2, true);
      expect(address1 == address3, false);
    });

    test('should generate correct hash code', () {
      final address = AddressInfo(
        id: '1',
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '望京街道1号',
        isDefault: true,
      );

      expect(address.hashCode, isA<int>());
      expect(address.hashCode, equals(address.hashCode));
    });

    test('should generate correct toString', () {
      final address = AddressInfo(
        id: '1',
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '望京街道1号',
        isDefault: true,
      );

      final str = address.toString();

      expect(str, contains('id: 1'));
      expect(str, contains('name: 张三'));
      expect(str, contains('phone: 13800138000'));
      expect(str, contains('isDefault: true'));
    });
  });
}
