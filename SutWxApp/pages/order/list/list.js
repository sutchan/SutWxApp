// 订单列表页面JS
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 订单列表数据
    orderList: [],
    // 订单状态选项
    statusOptions: [
      { id: 'all', name: '全部' },
      { id: 'pending_payment', name: '待付款' },
      { id: 'pending_shipping', name: '待发货' },
      { id: 'pending_receipt', name: '待收货' },
      { id: 'completed', name: '已完成' }
    ],
    // 当前选中的状态
    currentStatus: 'all',
    // 加载状态
    loading: false,
    // 错误信息
    error: false,
    errorMsg: '',
    // 分页参数
    pageNum: 1,
    pageSize: 10,
    // 是否还有更多数据
    hasMore: true,
    // 空状态
    empty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 设置初始状态
    if (options.status) {
      this.setData({
        currentStatus: options.status
      });
    }
    // 加载订单数据
    this.loadOrderList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 如果页面已经加载过数据，则重新加载
    if (this.data.orderList.length > 0) {
      this.loadOrderList();
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    // 重置分页参数
    this.setData({
      pageNum: 1,
      hasMore: true
    });
    // 重新加载数据
    this.loadOrderList();
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function() {
    // 如果还有更多数据，则加载下一页
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreOrderList();
    }
  },

  /**
   * 加载订单列表
   */
  loadOrderList: function() {
    // 检查登录状态
    if (!wx.getApp().isLoggedIn()) {
      this.setData({
        loading: false,
        empty: true,
        orderList: [],
        error: false
      });
      return;
    }

    // 设置加载状态
    this.setData({
      loading: true,
      error: false
    });

    // 模拟API请求
    setTimeout(() => {
      try {
        // 模拟订单数据
        const mockOrders = this.generateMockOrders(this.data.pageNum, this.data.pageSize);
        
        // 更新数据
        if (this.data.pageNum === 1) {
          this.setData({
            orderList: mockOrders,
            empty: mockOrders.length === 0
          });
        } else {
          this.setData({
            orderList: [...this.data.orderList, ...mockOrders]
          });
        }

        // 判断是否还有更多数据
        if (mockOrders.length < this.data.pageSize) {
          this.setData({
            hasMore: false
          });
        }

        // 结束下拉刷新
        wx.stopPullDownRefresh();
      } catch (err) {
        this.setData({
          error: true,
          errorMsg: '加载失败，请重试',
          empty: false
        });
        console.error('加载订单列表失败:', err);
      } finally {
        this.setData({
          loading: false
        });
      }
    }, 1000);
  },

  /**
   * 加载更多订单列表
   */
  loadMoreOrderList: function() {
    // 增加页码
    this.setData({
      pageNum: this.data.pageNum + 1
    });
    // 加载数据
    this.loadOrderList();
  },

  /**
   * 切换订单状态
   */
  onStatusChange: function(e) {
    const status = e.currentTarget.dataset.status;
    // 更新选中状态
    this.setData({
      currentStatus: status,
      pageNum: 1,
      hasMore: true
    });
    // 重新加载数据
    this.loadOrderList();
  },

  /**
   * 跳转到订单详情
   */
  onOrderTap: function(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${orderId}`
    });
  },

  /**
   * 去支付
   */
  onPayOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    // 跳转到支付页面
    wx.navigateTo({
      url: `/pages/order/pay/pay?id=${orderId}`
    });
  },

  /**
   * 确认收货
   */
  onConfirmReceipt: function(e) {
    const orderId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    
    // 弹出确认框
    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品吗？',
      success: (res) => {
        if (res.confirm) {
          // 模拟API调用
          this.setData({
            loading: true
          });
          
          setTimeout(() => {
            try {
              // 更新订单状态
              const orderList = this.data.orderList;
              orderList[index].status = 'completed';
              
              this.setData({
                orderList: orderList,
                loading: false
              });
              
              wx.showToast({
                title: '收货成功',
                icon: 'success'
              });
            } catch (err) {
              this.setData({
                loading: false
              });
              wx.showToast({
                title: '操作失败，请重试',
                icon: 'none'
              });
              console.error('确认收货失败:', err);
            }
          }, 1000);
        }
      }
    });
  },

  /**
   * 取消订单
   */
  onCancelOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    
    // 弹出确认框
    wx.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          // 模拟API调用
          this.setData({
            loading: true
          });
          
          setTimeout(() => {
            try {
              // 更新订单状态
              const orderList = this.data.orderList;
              orderList[index].status = 'cancelled';
              
              this.setData({
                orderList: orderList,
                loading: false
              });
              
              wx.showToast({
                title: '取消成功',
                icon: 'success'
              });
            } catch (err) {
              this.setData({
                loading: false
              });
              wx.showToast({
                title: '操作失败，请重试',
                icon: 'none'
              });
              console.error('取消订单失败:', err);
            }
          }, 1000);
        }
      }
    });
  },

  /**
   * 去评价
   */
  onReviewOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    // 跳转到评价页面
    wx.navigateTo({
      url: `/pages/order/review/review?id=${orderId}`
    });
  },

  /**
   * 重试加载
   */
  onRetry: function() {
    this.loadOrderList();
  },

  /**
   * 去登录
   */
  onLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login/login'
    });
  },

  /**
   * 模拟生成订单数据
   */
  generateMockOrders: function(pageNum, pageSize) {
    const orders = [];
    // 根据当前状态过滤数据
    const status = this.data.currentStatus;
    
    // 生成模拟数据
    for (let i = 0; i < pageSize; i++) {
      const index = (pageNum - 1) * pageSize + i;
      
      // 只生成20条数据，模拟分页效果
      if (index >= 20) break;
      
      // 随机状态
      const statuses = ['pending_payment', 'pending_shipping', 'pending_receipt', 'completed'];
      let orderStatus;
      
      if (status === 'all') {
        orderStatus = statuses[Math.floor(Math.random() * statuses.length)];
      } else {
        orderStatus = status;
      }
      
      // 生成商品列表
      const productCount = Math.floor(Math.random() * 3) + 1;
      const products = [];
      let totalPrice = 0;
      
      for (let j = 0; j < productCount; j++) {
        const price = Math.floor(Math.random() * 900) + 100;
        const quantity = Math.floor(Math.random() * 5) + 1;
        totalPrice += price * quantity;
        
        products.push({
          id: `product_${index}_${j}`,
          title: `模拟商品${index + 1}-${j + 1}`,
          image: '/images/default-post.svg',
          price: price,
          quantity: quantity
        });
      }
      
      orders.push({
        id: `order_${index}`,
        orderNo: `20240${index + 1}`,
        status: orderStatus,
        statusText: this.getStatusText(orderStatus),
        createTime: new Date().toLocaleString(),
        products: products,
        totalPrice: totalPrice,
        totalCount: productCount
      });
    }
    
    return orders;
  },

  /**
   * 获取订单状态文本
   */
  getStatusText: function(status) {
    const statusMap = {
      'pending_payment': '待付款',
      'pending_shipping': '待发货',
      'pending_receipt': '待收货',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || '未知';
  }
});