/**
 * 文件名: index.js
 * 版本号: 3.4.1
 * 更新日期: 2026-09-19
 * 描述: 地址管理页面，处理收货地址的增删改查（校验/格式化/删除回调见同级子模块）
 */

const addressService = require("../../services/addressService");

const { validateAddress } = require("./validators");
const { mapAddressItem, buildSavePayload, emptyForm, selectAddressPatch } = require("./format");
const { confirmDeleteAddress } = require("./handlers");

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

  loadAddressList: async function () {
    wx.showLoading({ title: "加载中..." });
    try {
      const list = await addressService.getAddressList();
      this.setData({
        addressList: (list || []).map((item) => mapAddressItem(item)),
      });
    } catch (err) {
      console.error("获取地址列表失败:", err);
      wx.showToast({ title: "加载失败", icon: "none" });
    } finally {
      wx.hideLoading();
    }
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

  onSaveAddress: async function () {
    const { formData, isEdit, editId } = this.data;
    const { valid, message } = validateAddress(formData);
    if (!valid) {
      wx.showToast({ title: message, icon: "none" });
      return;
    }

    wx.showLoading({ title: "保存中..." });
    const requestData = buildSavePayload(formData);

    try {
      if (isEdit) {
        await addressService.updateAddress(editId, requestData);
      } else {
        await addressService.addAddress(requestData);
      }
      wx.hideLoading();
      wx.showToast({ title: "保存成功", icon: "success" });
      this.setData({ showModal: false });
      this.loadAddressList();
    } catch (err) {
      wx.hideLoading();
      console.error("保存地址失败:", err);
      wx.showToast({ title: "保存失败", icon: "none" });
    }
  },

  onPullDownRefresh: function () {
    this.loadAddressList();
    wx.stopPullDownRefresh();
  },
});
