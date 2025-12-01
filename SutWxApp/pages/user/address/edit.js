/**
 * 文件名 edit.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-23
 * 閻劍鍩涢崷鏉挎絻缂傛牞绶い鐢告桨
 */
Page({
  data: {
    addressId: null,
    formData: {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false
    },
    rules: [
      { name: 'name', rules: { required: true, message: '鐠囩柉绶崗銉︽暪鐠愌傛眽婵挸鎮? } },
      { name: 'phone', rules: [{ required: true, message: '鐠囩柉绶崗銉﹀閺堝搫褰块惍? }, { mobile: true, message: '閹靛婧€閸欓鐖滈弽鐓庣础娑撳秵顒滅涵? }] },
      { name: 'province', rules: { required: true, message: '鐠囩兘鈧瀚ㄩ惇浣峰敜' } },
      { name: 'city', rules: { required: true, message: '鐠囩兘鈧瀚ㄩ崺搴＄' } },
      { name: 'detail', rules: { required: true, message: '鐠囩柉绶崗銉嚊缂佸棗婀撮崸鈧? } }
    ],
    timer: null
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @param {Object} options - 妞ょ敻娼伴崣鍌涙殶
   * @param {string} options.id - 閸︽澘娼僆D
   * @returns {void}
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ addressId: options.id });
      this.loadAddressDetail(options.id);
    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   * @returns {void}
   */
  onUnload() {
    // 濞撳懐鎮婄€规碍妞傞崳顭掔礉闂冨弶顒涢崘鍛摠濞夊嫭绱?    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 閸旂姾娴囬崷鏉挎絻鐠囷附鍎?   * @param {string} id - 閸︽澘娼僆D
   * @returns {void}
   */
  loadAddressDetail(id) {
    // 濡剝瀚欓弫鐗堝祦鐠囬攱鐪?    const timer = setTimeout(() => {
      const mockAddress = {
        id: id,
        name: '瀵姳绗?,
        phone: '13800138000',
        province: '楠炲じ绗㈤惇?,
        city: '楠炲灝绐炵敮?,
        district: '婢垛晜娓ら崠?,
        detail: 'XXX鐞涙浜綳XX閸?,
        isDefault: true
      };
      this.setData({ 
        'formData': mockAddress,
        timer: null
      });
    }, 500);
    
    this.setData({ timer });
  },

  /**
   * 鐞涖劌宕熸潏鎾冲弳閺€鐟板綁
   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  formInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  /**
   * 閹绘劒姘︾悰銊ュ礋
   * @returns {void}
   */
  submitForm() {
    this.selectComponent('#form').validate((valid, errors) => {
      if (valid) {
        wx.showToast({
          title: '閹绘劒姘﹂幋鎰',
          icon: 'success'
        });
        // 鐎圭偤妾幓鎰唉闁槒绶?      } else {
        const firstError = errors[0];
        wx.showToast({
          title: firstError.message,
          icon: 'none'
        });
      }
    });
  }
});
