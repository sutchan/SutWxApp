/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-05
 * 描述: 地址管理页面，处理收货地址的增删改查
 */

const app = getApp();
const authService = require("../../../services/authService");

// 错误色（与全局 --error-color 保持一致）
const ERROR_COLOR = "#F44336";

Page({
  data: {
    addressList: [],
    showModal: false,
    isEdit: false,
    editId: null,
    region: [],
    // 是否为选择模式（从确认订单页等进入）
    isSelectMode: false,
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
    // 保存 select 参数：仅在选择模式下点击地址才回传并返回上一页
    const isSelectMode =
      options.select === "true" || options.select === true;
    this.setData({ isSelectMode });
    this.loadAddressList();
  },

  onShow: function () {
    this.loadAddressList();
  },

  // 加载地址列表（getAddressList 回调直接接收数组）
  loadAddressList: function () {
    const that = this;
    wx.showLoading({ title: "加载中..." });

    authService.getAddressList({
      success: function (list) {
        wx.hideLoading();
        const addressList = (list || []).map((item) => ({
          id: item.id,
          name: item.name,
          phone: String(item.phone || "").replace(
            /(\d{3})\d{4}(\d{4})/,
            "$1****$2"
          ),
          fullPhone: item.phone,
          province: item.province,
          city: item.city,
          district: item.district,
          detail: item.detail,
          isDefault: item.isDefault === 1 || item.isDefault === true,
          address: `${item.province}${item.city}${item.district}${item.detail}`,
        }));
        that.setData({ addressList });
      },
      fail: function (err) {
        wx.hideLoading();
        console.error("获取地址列表失败:", err);
        wx.showToast({ title: "加载失败", icon: "none" });
      },
    });
  },

  // 选择地址（仅选择模式生效）
  onSelectAddress: function (e) {
    if (!this.data.isSelectMode) return;

    const id = e.currentTarget.dataset.id;
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      const prevPage = pages[pages.length - 2];
      const address = this.data.addressList.find((item) => item.id == id);
      if (address) {
        prevPage.setData({
          selectedAddress: address,
          address: address,
        });
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
      formData: {
        name: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        detail: "",
        isDefault: this.data.addressList.length === 0,
      },
    });
  },

  onEditAddress: function (e) {
    const id = e.currentTarget.dataset.id;
    const address = this.data.addressList.find((item) => item.id == id);
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
    const that = this;

    wx.showModal({
      title: "确认删除",
      content: "确定要删除这个收货地址吗？",
      confirmColor: ERROR_COLOR,
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({ title: "删除中..." });

          authService.deleteAddress({
            id: id,
            success: function (deleteRes) {
              wx.hideLoading();
              if (deleteRes.code === 0) {
                wx.showToast({ title: "删除成功", icon: "success" });
                that.loadAddressList();
              } else {
                wx.showToast({
                  title: deleteRes.message || "删除失败",
                  icon: "none",
                });
              }
            },
            fail: function (err) {
              wx.hideLoading();
              console.error("删除地址失败:", err);
              wx.showToast({ title: "删除失败", icon: "none" });
            },
          });
        }
      },
    });
  },

  onInputChange: function (e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value,
    });
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
    this.setData({
      "formData.isDefault": e.detail.value,
    });
  },

  onCloseModal: function () {
    this.setData({ showModal: false });
  },

  onSaveAddress: function () {
    const { formData } = this.data;

    if (!formData.name.trim()) {
      wx.showToast({ title: "请输入收货人姓名", icon: "none" });
      return;
    }

    if (!formData.phone.trim()) {
      wx.showToast({ title: "请输入手机号码", icon: "none" });
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      wx.showToast({ title: "手机号码格式不正确", icon: "none" });
      return;
    }

    if (!formData.province || !formData.city || !formData.district) {
      wx.showToast({ title: "请选择所在地区", icon: "none" });
      return;
    }

    if (!formData.detail.trim()) {
      wx.showToast({ title: "请输入详细地址", icon: "none" });
      return;
    }

    wx.showLoading({ title: "保存中..." });

    const requestData = {
      name: formData.name,
      phone: formData.phone,
      province: formData.province,
      city: formData.city,
      district: formData.district,
      detail: formData.detail,
      isDefault: formData.isDefault ? 1 : 0,
    };

    const successCallback = (res) => {
      wx.hideLoading();
      if (res.code === 0) {
        wx.showToast({ title: "保存成功", icon: "success" });
        this.setData({ showModal: false });
        this.loadAddressList();
      } else {
        wx.showToast({ title: res.message || "保存失败", icon: "none" });
      }
    };

    const failCallback = (err) => {
      wx.hideLoading();
      console.error("保存地址失败:", err);
      wx.showToast({ title: "保存失败", icon: "none" });
    };

    if (this.data.isEdit) {
      authService.updateAddress({
        id: this.data.editId,
        ...requestData,
        success: successCallback,
        fail: failCallback,
      });
    } else {
      authService.addAddress({
        ...requestData,
        success: successCallback,
        fail: failCallback,
      });
    }
  },

  onPullDownRefresh: function () {
    this.loadAddressList();
    wx.stopPullDownRefresh();
  },
});
