// 购物车页面单元测试
import { render } from '@testing-library/react-native';
import cartPage from '../cart';

// 模拟依赖
jest.mock('../../utils/cart-service', () => ({
  getCartItems: jest.fn(),
  updateCartItem: jest.fn(),
  deleteCartItem: jest.fn(),
  deleteCartItems: jest.fn(),
  clearCart: jest.fn(),
  moveToFavorite: jest.fn(),
  checkCartStock: jest.fn(),
  clearCartCache: jest.fn()
}));

jest.mock('../../utils/global', () => ({
  showToast: jest.fn(),
  showConfirm: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn()
}));

jest.mock('../../utils/validator', () => ({
  validateId: jest.fn(),
  validateCartItemQuantity: jest.fn()
}));

// 模拟小程序API
const mockSetData = jest.fn();
const mockNavigateTo = jest.fn();

// 准备测试数据
const mockCartItems = [
  {
    id: 1,
    product_id: 'prod001',
    name: '测试商品1',
    price: 99.99,
    quantity: 2,
    stock: 10,
    available: true,
    status: 1,
    selected: true
  },
  {
    id: 2,
    product_id: 'prod002',
    name: '测试商品2',
    price: 199.99,
    quantity: 1,
    stock: 0,
    available: true,
    status: 1,
    selected: false
  }
];

describe('购物车页面测试', () => {
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 模拟Page构造函数
    global.Page = jest.fn().mockImplementation((options) => {
      // 模拟小程序页面实例
      const page = {
        data: options.data,
        setData: mockSetData
      };
      
      // 复制所有方法到实例
      Object.keys(options).forEach(key => {
        if (typeof options[key] === 'function' && key !== 'data') {
          page[key] = options[key].bind(page);
        }
      });
      
      return page;
    });
    
    // 模拟小程序全局API
    global.wx = {
      navigateTo: mockNavigateTo,
      showToast: jest.fn(),
      showLoading: jest.fn(),
      hideLoading: jest.fn(),
      stopPullDownRefresh: jest.fn()
    };
  });

  test('加载购物车数据', async () => {
    const cartService = require('../../utils/cart-service');
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    
    // 创建页面实例
    const page = cartPage;
    
    // 调用加载数据方法
    await page.loadCartData();
    
    // 验证调用
    expect(cartService.getCartItems).toHaveBeenCalledWith({ forceRefresh: false });
    
    // 验证数据更新
    expect(mockSetData).toHaveBeenCalled();
  });

  test('增加商品数量', async () => {
    const cartService = require('../../utils/cart-service');
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.updateCartItem.mockResolvedValue({ success: true });
    
    const page = cartPage;
    await page.loadCartData();
    
    // 准备模拟事件对象
    const mockEvent = {
      currentTarget: {
        dataset: {
          index: 0
        }
      }
    };
    
    // 调用增加数量方法
    await page.increaseQuantity(mockEvent);
    
    // 验证调用
    expect(cartService.updateCartItem).toHaveBeenCalledWith(1, 3);
  });

  test('减少商品数量', async () => {
    const cartService = require('../../utils/cart-service');
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.updateCartItem.mockResolvedValue({ success: true });
    
    const page = cartPage;
    await page.loadCartData();
    
    // 准备模拟事件对象
    const mockEvent = {
      currentTarget: {
        dataset: {
          index: 0
        }
      }
    };
    
    // 调用减少数量方法
    await page.decreaseQuantity(mockEvent);
    
    // 验证调用
    expect(cartService.updateCartItem).toHaveBeenCalledWith(1, 1);
  });

  test('删除单个商品', async () => {
    const cartService = require('../../utils/cart-service');
    const { showConfirm } = require('../../utils/global');
    
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.deleteCartItem.mockResolvedValue({ success: true });
    showConfirm.mockResolvedValue(true); // 模拟用户确认删除
    
    const page = cartPage;
    await page.loadCartData();
    
    // 准备模拟事件对象
    const mockEvent = {
      currentTarget: {
        dataset: {
          index: 0
        }
      }
    };
    
    // 调用删除方法
    await page.deleteCartItem(mockEvent);
    
    // 验证调用
    expect(cartService.deleteCartItem).toHaveBeenCalledWith(1);
  });

  test('批量删除选中商品', async () => {
    const cartService = require('../../utils/cart-service');
    const { showConfirm } = require('../../utils/global');
    
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.deleteCartItems.mockResolvedValue({ success: true });
    showConfirm.mockResolvedValue(true); // 模拟用户确认删除
    
    const page = cartPage;
    await page.loadCartData();
    
    // 调用批量删除方法
    await page.deleteSelectedItems();
    
    // 验证调用
    expect(cartService.deleteCartItems).toHaveBeenCalledWith([1]);
  });

  test('计算总价', () => {
    const page = cartPage;
    
    // 手动设置数据
    page.setData({
      cartItems: mockCartItems
    });
    
    // 调用计算总价方法
    page.calculateTotal();
    
    // 验证结果 (99.99 * 2 = 199.98)
    expect(mockSetData).toHaveBeenCalledWith({
      totalPrice: '199.98',
      selectedCount: 2,
      checkedGoodsList: [mockCartItems[0]]
    });
  });

  test('检查全选状态', () => {
    const page = cartPage;
    
    // 手动设置数据
    page.setData({
      cartItems: mockCartItems
    });
    
    // 调用检查全选状态方法
    page.checkAllSelected();
    
    // 验证结果 (只有一个可用商品且已选中，所以应该是全选状态)
    expect(mockSetData).toHaveBeenCalledWith({ allSelected: true });
  });

  test('结算功能', async () => {
    const cartService = require('../../utils/cart-service');
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.checkCartStock.mockResolvedValue({ out_of_stock: [] });
    
    const page = cartPage;
    await page.loadCartData();
    
    // 调用结算方法
    await page.checkout();
    
    // 验证调用
    expect(cartService.checkCartStock).toHaveBeenCalledWith([mockCartItems[0]]);
    expect(mockNavigateTo).toHaveBeenCalled();
  });
});
