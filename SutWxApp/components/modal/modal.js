/**
 * 文件名: modal.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 作者: Sut
 * 描述: 弹窗组件
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示弹窗
    show: {
      type: Boolean,
      value: false
    },
    // 弹窗类型：alert, confirm, prompt
    type: {
      type: String,
      value: 'alert'
    },
    // 标题
    title: {
      type: String,
      value: '提示'
    },
    // 内容
    content: {
      type: String,
      value: ''
    },
    // 确认按钮文本
    confirmText: {
      type: String,
      value: '确定'
    },
    // 取消按钮文本
    cancelText: {
      type: String,
      value: '取消'
    },
    // 是否显示遮罩
    showMask: {
      type: Boolean,
      value: true
    },
    // 点击遮罩是否关闭
    maskClosable: {
      type: Boolean,
      value: false
    },
    // 是否显示输入框（仅prompt类型）
    showInput: {
      type: Boolean,
      value: false
    },
    // 输入框占位符
    inputPlaceholder: {
      type: String,
      value: '请输入内容'
    },
    // 输入框类型
    inputType: {
      type: String,
      value: 'text'
    },
    // 输入框最大长度
    maxLength: {
      type: Number,
      value: 140
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    inputValue: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 阻止事件冒泡
     */
    stopPropagation() {
      // 阻止事件冒泡
    },

    /**
     * 点击遮罩
     */
    onMaskTap() {
      if (this.data.maskClosable) {
        this.onCancel();
      }
    },

    /**
     * 点击确认
     */
    onConfirm() {
      const result = {
        confirm: true,
        cancel: false
      };

      // 如果是prompt类型，返回输入值
      if (this.data.type === 'prompt') {
        result.value = this.data.inputValue;
      }

      this.triggerEvent('confirm', result);
      this.close();
    },

    /**
     * 点击取消
     */
    onCancel() {
      this.triggerEvent('cancel', {
        confirm: false,
        cancel: true
      });
      this.close();
    },

    /**
     * 输入框值变化
     */
    onInputChange(e) {
      this.setData({
        inputValue: e.detail.value
      });
    },

    /**
     * 关闭弹窗
     */
    close() {
      this.setData({
        show: false,
        inputValue: ''
      });
    }
  }
});