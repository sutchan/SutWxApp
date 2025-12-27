/**
 * 文件名: address.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-27
 * 描述: 地址信息数据模型类
 */

class AddressInfo {
  final String id;
  final String name;
  final String phone;
  final String province;
  final String city;
  final String district;
  final String detail;
  final bool isDefault;

  const AddressInfo({
    required this.id,
    required this.name,
    required this.phone,
    required this.province,
    required this.city,
    required this.district,
    required this.detail,
    required this.isDefault,
  });

  String get fullAddress => '$province$city$district$detail';

  String get maskedPhone => phone.replaceRange(3, 7, '****');

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'province': province,
      'city': city,
      'district': district,
      'detail': detail,
      'isDefault': isDefault ? 1 : 0,
    };
  }

  factory AddressInfo.fromJson(Map<String, dynamic> json) {
    return AddressInfo(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      province: json['province'] ?? '',
      city: json['city'] ?? '',
      district: json['district'] ?? '',
      detail: json['detail'] ?? '',
      isDefault: json['isDefault'] == 1 || json['isDefault'] == true,
    );
  }

  AddressInfo copyWith({
    String? id,
    String? name,
    String? phone,
    String? province,
    String? city,
    String? district,
    String? detail,
    bool? isDefault,
  }) {
    return AddressInfo(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      province: province ?? this.province,
      city: city ?? this.city,
      district: district ?? this.district,
      detail: detail ?? this.detail,
      isDefault: isDefault ?? this.isDefault,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AddressInfo &&
        other.id == id &&
        other.name == name &&
        other.phone == phone &&
        other.province == province &&
        other.city == city &&
        other.district == district &&
        other.detail == detail &&
        other.isDefault == isDefault;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      name,
      phone,
      province,
      city,
      district,
      detail,
      isDefault,
    );
  }

  @override
  String toString() {
    return 'AddressInfo(id: $id, name: $name, phone: $phone, province: $province, city: $city, district: $district, detail: $detail, isDefault: $isDefault)';
  }
}
