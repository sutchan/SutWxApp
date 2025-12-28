/**
 * 文件名: address_page.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-27
 * 描述: Flutter地址管理页面，实现收货地址的增删改查功能
 */

import 'package:flutter/material.dart';
import 'package:sut_wxapp/models/address.dart';

class AddressPage extends StatefulWidget {
  final bool selectMode;
  final Function(AddressInfo)? onAddressSelected;

  const AddressPage({
    super.key,
    this.selectMode = false,
    this.onAddressSelected,
  });

  @override
  State<AddressPage> createState() => _AddressPageState();
}

class _AddressPageState extends State<AddressPage> {
  List<AddressInfo> _addressList = [];
  bool _isLoading = false;
  bool _showEditDialog = false;
  bool _isEditMode = false;
  AddressInfo? _editingAddress;
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _detailController = TextEditingController();
  List<String> _selectedRegion = ['北京市', '北京市', '朝阳区'];
  bool _isDefault = false;

  @override
  void initState() {
    super.initState();
    _loadAddressList();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _detailController.dispose();
    super.dispose();
  }

  Future<void> _loadAddressList() async {
    setState(() => _isLoading = true);

    try {
      await Future.delayed(const Duration(milliseconds: 500));

      setState(() {
        _addressList = [
          AddressInfo(
            id: '1',
            name: '张三',
            phone: '13800138000',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            detail: '望京街道阜通东大街6号院3号楼18层1801室',
            isDefault: true,
          ),
          AddressInfo(
            id: '2',
            name: '李四',
            phone: '13900139000',
            province: '上海市',
            city: '上海市',
            district: '浦东新区',
            detail: '陆家嘴环路1000号汇丰银行大厦25层',
            isDefault: false,
          ),
        ];
      });
    } catch (e) {
      debugPrint('加载地址列表失败: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showAddAddressDialog() {
    setState(() {
      _isEditMode = false;
      _editingAddress = null;
      _nameController.clear();
      _phoneController.clear();
      _detailController.clear();
      _selectedRegion = ['北京市', '北京市', '朝阳区'];
      _isDefault = _addressList.isEmpty;
      _showEditDialog = true;
    });
  }

  void _showEditAddressDialog(AddressInfo address) {
    setState(() {
      _isEditMode = true;
      _editingAddress = address;
      _nameController.text = address.name;
      _phoneController.text = address.phone;
      _detailController.text = address.detail;
      _selectedRegion = [address.province, address.city, address.district];
      _isDefault = address.isDefault;
      _showEditDialog = true;
    });
  }

  void _closeEditDialog() {
    setState(() => _showEditDialog = false);
  }

  Future<void> _saveAddress() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    final detail = _detailController.text.trim();

    if (name.isEmpty) {
      _showToast('请输入收货人姓名');
      return;
    }

    if (phone.isEmpty) {
      _showToast('请输入手机号码');
      return;
    }

    if (!_isValidPhone(phone)) {
      _showToast('手机号码格式不正确');
      return;
    }

    if (_selectedRegion.length < 3) {
      _showToast('请选择所在地区');
      return;
    }

    if (detail.isEmpty) {
      _showToast('请输入详细地址');
      return;
    }

    setState(() => _isLoading = true);

    try {
      await Future.delayed(const Duration(milliseconds: 500));

      setState(() {
        if (_isEditMode && _editingAddress != null) {
          final index = _addressList.indexWhere((a) => a.id == _editingAddress!.id);
          if (index != -1) {
            _addressList[index] = AddressInfo(
              id: _editingAddress!.id,
              name: name,
              phone: phone,
              province: _selectedRegion[0],
              city: _selectedRegion[1],
              district: _selectedRegion[2],
              detail: detail,
              isDefault: _isDefault,
            );
          }
        } else {
          final newAddress = AddressInfo(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            name: name,
            phone: phone,
            province: _selectedRegion[0],
            city: _selectedRegion[1],
            district: _selectedRegion[2],
            detail: detail,
            isDefault: _isDefault,
          );

          if (_isDefault) {
            _addressList = _addressList.map((a) => AddressInfo(
              id: a.id,
              name: a.name,
              phone: a.phone,
              province: a.province,
              city: a.city,
              district: a.district,
              detail: a.detail,
              isDefault: false,
            )).toList();
          }

          _addressList.insert(0, newAddress);
        }

        _showEditDialog = false;
      });

      _showToast(_isEditMode ? '修改成功' : '添加成功');
    } catch (e) {
      debugPrint('保存地址失败: $e');
      _showToast('保存失败，请重试');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _deleteAddress(AddressInfo address) async {
    final confirm = await _showConfirmDialog('确认删除', '确定要删除这个收货地址吗？');

    if (confirm != true) return;

    setState(() => _isLoading = true);

    try {
      await Future.delayed(const Duration(milliseconds: 500));

      setState(() {
        _addressList.removeWhere((a) => a.id == address.id);
      });

      _showToast('删除成功');
    } catch (e) {
      debugPrint('删除地址失败: $e');
      _showToast('删除失败，请重试');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _onSelectAddress(AddressInfo address) {
    if (widget.selectMode && widget.onAddressSelected != null) {
      widget.onAddressSelected!(address);
      Navigator.pop(context);
    }
  }

  bool _isValidPhone(String phone) {
    final RegExp phoneReg = RegExp(r'^1[3-9]\d{9}$');
    return phoneReg.hasMatch(phone);
  }

  void _showToast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  Future<bool?> _showConfirmDialog(String title, String content) async {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('确认'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('地址管理'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Stack(
        children: [
          _buildAddressList(),
          if (_isLoading)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddAddressDialog,
        backgroundColor: Colors.red,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      bottomSheet: _showEditDialog ? _buildEditDialog() : null,
    );
  }

  Widget _buildAddressList() {
    if (_addressList.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.location_off_outlined,
              size: 80,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              '暂无收货地址',
              style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _showAddAddressDialog,
              child: const Text('添加新地址'),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _addressList.length,
      itemBuilder: (context, index) {
        final address = _addressList[index];
        return _buildAddressCard(address);
      },
    );
  }

  Widget _buildAddressCard(AddressInfo address) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _onSelectAddress(address),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    address.name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    address.phone.replaceRange(3, 7, '****'),
                    style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
                  ),
                  if (address.isDefault)
                    Container(
                      margin: const EdgeInsets.only(left: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        '默认',
                        style: TextStyle(fontSize: 12, color: Colors.white),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '${address.province}${address.city}${address.district}${address.detail}',
                style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  _buildActionButton(
                    icon: Icons.edit,
                    label: '编辑',
                    onTap: () => _showEditAddressDialog(address),
                  ),
                  const SizedBox(width: 8),
                  _buildActionButton(
                    icon: Icons.delete,
                    label: '删除',
                    onTap: () => _deleteAddress(address),
                    isDelete: true,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool isDelete = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Row(
          children: [
            Icon(icon, size: 16, color: isDelete ? Colors.red : Colors.grey),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: isDelete ? Colors.red : Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEditDialog() {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          _buildDialogHeader(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildTextField(
                    controller: _nameController,
                    label: '收货人',
                    hint: '请输入收货人姓名',
                  ),
                  const SizedBox(height: 16),
                  _buildTextField(
                    controller: _phoneController,
                    label: '手机号码',
                    hint: '请输入手机号码',
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 16),
                  _buildRegionPicker(),
                  const SizedBox(height: 16),
                  _buildTextField(
                    controller: _detailController,
                    label: '详细地址',
                    hint: '请输入详细地址',
                    maxLines: 3,
                  ),
                  const SizedBox(height: 16),
                  _buildDefaultSwitch(),
                ],
              ),
            ),
          ),
          _buildDialogFooter(),
        ],
      ),
    );
  }

  Widget _buildDialogHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: _closeEditDialog,
            icon: const Icon(Icons.close),
          ),
          Expanded(
            child: Text(
              _isEditMode ? '编辑地址' : '新增地址',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(width: 48),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 14, color: Colors.black87),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
        ),
      ],
    );
  }

  Widget _buildRegionPicker() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '所在地区',
          style: TextStyle(fontSize: 14, color: Colors.black87),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade300),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            '${_selectedRegion[0]} ${_selectedRegion[1]} ${_selectedRegion[2]}',
            style: const TextStyle(fontSize: 16),
          ),
        ),
      ],
    );
  }

  Widget _buildDefaultSwitch() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text(
          '设为默认地址',
          style: TextStyle(fontSize: 14, color: Colors.black87),
        ),
        Switch(
          value: _isDefault,
          onChanged: (value) => setState(() => _isDefault = value),
          activeTrackColor: Colors.red.withValues(alpha: 0.5),
          activeThumbColor: Colors.red,
        ),
      ],
    );
  }

  Widget _buildDialogFooter() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: _closeEditDialog,
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: BorderSide(color: Colors.grey.shade300),
              ),
              child: const Text('取消'),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: ElevatedButton(
              onPressed: _isLoading ? null : _saveAddress,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                backgroundColor: Colors.red,
              ),
              child: const Text('保存'),
            ),
          ),
        ],
      ),
    );
  }
}
