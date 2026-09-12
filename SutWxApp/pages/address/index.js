/**
 * 文件名: index.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 地址管理页面，处理收货地址的增删改查（校验/格式化/回调见同级子模块）
 */

const authService = require("../../../services/authService");

const { validateAddress } = require("./validators");
const { mapAddressItem, buildSavePayload, emptyForm, selectAddressPatch } = require("./format");
const { confirmDeleteAddress, buildSaveCallbacks } = require("./handlers");

const themeBehavior = require("../../behaviors/theme");

Page({
  behaviors: [themeBehavior],
  data: {
    addressList: [],
    showModal: false,
    isEdit: false,
    editId: null,
    region: [],
    formData: {
      name: "",
      phone: "",
      province: "",
      city: "",
      district: "",
      detail: "",
      isDefault: false,
    },
  },

  onLoad: function (options) {
    this.loadAddressList();
  },

  onShow: function () {
    this.loadAddressList();
  },

  loadAddressList: function () {
    const that = this;
    wx.showLoading({ title: "加载中..." });

    authService.getAddressList({
      success: function (res) {
        wx.hideLoading();
        if (res.code === 0 && res.data) {
          that.setData({ addressList: res.data.map((item) => mapAddressItem(item)) });
        } else {
          that.setData({ addressList: [] });
        }
      },
      fail: function (err) {
        wx.hideLoading();
        console.error("获取地址列表失败:", err);
        wx.showToast({ title: "加载失败", icon: "none" });
      },
    });
  },

  onSelectAddress: function (e) {
    const id = e.currentTarget.dataset.id;
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      const prevPage = pages[pages.length - 2];
      const address = this.data.addressList.find((item) => item.id === id);
      if (address) {
        prevPage.setData(selectAddressPatch(address));
      }
    }
    wx.navigateBack();
  },

  onAddAddress: function () {
    this.setData({
      showModal: true,
      isEdit: false,
      editId: null,
      region: [],
      formData: emptyForm(this.data.addressList.length === 0),
    });
  },

  onEditAddress: function (e) {
    const id = e.currentTarget.dataset.id;
    const address = this.data.addressList.find((item) => item.id === id);
    if (address) {
      this.setData({
        showModal: true,
        isEdit: true,
        editId: id,
        region: [address.province, address.city, address.district],
        formData: {
          name: address.name,
          phone: address.fullPhone,
          province: address.province,
          city: address.city,
          district: address.district,
          detail: address.detail,
          isDefault: address.isDefault,
        },
      });
    }
  },

  onDeleteAddress: function (e) {
    const id = e.currentTarget.dataset.id;
    confirmDeleteAddress(this, id);
  },

  onInputChange: function (e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData.${field}`]: e.detail.value });
  },

  onRegionChange: function (e) {
    const region = e.detail.value;
    this.setData({
      region: region,
      "formData.province": region[0],
      "formData.city": region[1],
      "formData.district": region[2],
    });
  },

  onSwitchChange: function (e) {
    this.setData({ "formData.isDefault": e.detail.value });
  },

  onCloseModal: function () {
    this.setData({ showModal: false });
  },

  onSaveAddress: function () {
    const { formData, isEdit, editId } = this.data;
    const { valid, message } = validateAddress(formData);
    if (!valid) {
      wx.showToast({ title: message, icon: "none" });
      return;
    }

    wx.showLoading({ title: "保存中..." });
    const requestData = buildSavePayload(formData);
    const { success, fail } = buildSaveCallbacks(this);

    if (isEdit) {
      authService.updateAddress({ id: editId, ...requestData, success, fail });
    } else {
      authService.addAddress({ ...requestData, success, fail });
    }
  },

  onPullDownRefresh: function () {
    this.loadAddressList();
    wx.stopPullDownRefresh();
  },
});
