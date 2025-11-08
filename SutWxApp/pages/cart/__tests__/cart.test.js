// 璐墿杞﹂〉闈㈠崟鍏冩祴璇?import { render } from '@testing-library/react-native';
import cartPage from '../cart';

// 妯℃嫙渚濊禆
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

// 妯℃嫙灏忕▼搴廇PI
const mockSetData = jest.fn();
const mockNavigateTo = jest.fn();

// 鍑嗗娴嬭瘯鏁版嵁
const mockCartItems = [
  {
    id: 1,
    product_id: 'prod001',
    name: '娴嬭瘯鍟嗗搧1',
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
    name: '娴嬭瘯鍟嗗搧2',
    price: 199.99,
    quantity: 1,
    stock: 0,
    available: true,
    status: 1,
    selected: false
  }
];

describe('璐墿杞﹂〉闈㈡祴璇?, () => {
  beforeEach(() => {
    // 閲嶇疆鎵€鏈夋ā鎷?    jest.clearAllMocks();
    
    // 妯℃嫙Page鏋勯€犲嚱鏁?    global.Page = jest.fn().mockImplementation((options) => {
      // 妯℃嫙灏忕▼搴忛〉闈㈠疄渚?      const page = {
        data: options.data,
        setData: mockSetData
      };
      
      // 澶嶅埗鎵€鏈夋柟娉曞埌瀹炰緥
      Object.keys(options).forEach(key => {
        if (typeof options[key] === 'function' && key !== 'data') {
          page[key] = options[key].bind(page);
        }
      });
      
      return page;
    });
    
    // 妯℃嫙灏忕▼搴忓叏灞€API
    global.wx = {
      navigateTo: mockNavigateTo,
      showToast: jest.fn(),
      showLoading: jest.fn(),
      hideLoading: jest.fn(),
      stopPullDownRefresh: jest.fn()
    };
  });

  test('鍔犺浇璐墿杞︽暟鎹?, async () => {
    const cartService = require('../../utils/cart-service');
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    
    // 鍒涘缓椤甸潰瀹炰緥
    const page = cartPage;
    
    // 璋冪敤鍔犺浇鏁版嵁鏂规硶
    await page.loadCartData();
    
    // 楠岃瘉璋冪敤
    expect(cartService.getCartItems).toHaveBeenCalledWith({ forceRefresh: false });
    
    // 楠岃瘉鏁版嵁鏇存柊
    expect(mockSetData).toHaveBeenCalled();
  });

  test('澧炲姞鍟嗗搧鏁伴噺', async () => {
    const cartService = require('../../utils/cart-service');
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.updateCartItem.mockResolvedValue({ success: true });
    
    const page = cartPage;
    await page.loadCartData();
    
    // 鍑嗗妯℃嫙浜嬩欢瀵硅薄
    const mockEvent = {
      currentTarget: {
        dataset: {
          index: 0
        }
      }
    };
    
    // 璋冪敤澧炲姞鏁伴噺鏂规硶
    await page.increaseQuantity(mockEvent);
    
    // 楠岃瘉璋冪敤
    expect(cartService.updateCartItem).toHaveBeenCalledWith(1, 3);
  });

  test('鍑忓皯鍟嗗搧鏁伴噺', async () => {
    const cartService = require('../../utils/cart-service');
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.updateCartItem.mockResolvedValue({ success: true });
    
    const page = cartPage;
    await page.loadCartData();
    
    // 鍑嗗妯℃嫙浜嬩欢瀵硅薄
    const mockEvent = {
      currentTarget: {
        dataset: {
          index: 0
        }
      }
    };
    
    // 璋冪敤鍑忓皯鏁伴噺鏂规硶
    await page.decreaseQuantity(mockEvent);
    
    // 楠岃瘉璋冪敤
    expect(cartService.updateCartItem).toHaveBeenCalledWith(1, 1);
  });

  test('鍒犻櫎鍗曚釜鍟嗗搧', async () => {
    const cartService = require('../../utils/cart-service');
    const { showConfirm } = require('../../utils/global');
    
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.deleteCartItem.mockResolvedValue({ success: true });
    showConfirm.mockResolvedValue(true); // 妯℃嫙鐢ㄦ埛纭鍒犻櫎
    
    const page = cartPage;
    await page.loadCartData();
    
    // 鍑嗗妯℃嫙浜嬩欢瀵硅薄
    const mockEvent = {
      currentTarget: {
        dataset: {
          index: 0
        }
      }
    };
    
    // 璋冪敤鍒犻櫎鏂规硶
    await page.deleteCartItem(mockEvent);
    
    // 楠岃瘉璋冪敤
    expect(cartService.deleteCartItem).toHaveBeenCalledWith(1);
  });

  test('鎵归噺鍒犻櫎閫変腑鍟嗗搧', async () => {
    const cartService = require('../../utils/cart-service');
    const { showConfirm } = require('../../utils/global');
    
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.deleteCartItems.mockResolvedValue({ success: true });
    showConfirm.mockResolvedValue(true); // 妯℃嫙鐢ㄦ埛纭鍒犻櫎
    
    const page = cartPage;
    await page.loadCartData();
    
    // 璋冪敤鎵归噺鍒犻櫎鏂规硶
    await page.deleteSelectedItems();
    
    // 楠岃瘉璋冪敤
    expect(cartService.deleteCartItems).toHaveBeenCalledWith([1]);
  });

  test('璁＄畻鎬讳环', () => {
    const page = cartPage;
    
    // 鎵嬪姩璁剧疆鏁版嵁
    page.setData({
      cartItems: mockCartItems
    });
    
    // 璋冪敤璁＄畻鎬讳环鏂规硶
    page.calculateTotal();
    
    // 楠岃瘉缁撴灉 (99.99 * 2 = 199.98)
    expect(mockSetData).toHaveBeenCalledWith({
      totalPrice: '199.98',
      selectedCount: 2,
      checkedGoodsList: [mockCartItems[0]]
    });
  });

  test('妫€鏌ュ叏閫夌姸鎬?, () => {
    const page = cartPage;
    
    // 鎵嬪姩璁剧疆鏁版嵁
    page.setData({
      cartItems: mockCartItems
    });
    
    // 璋冪敤妫€鏌ュ叏閫夌姸鎬佹柟娉?    page.checkAllSelected();
    
    // 楠岃瘉缁撴灉 (鍙湁涓€涓彲鐢ㄥ晢鍝佷笖宸查€変腑锛屾墍浠ュ簲璇ユ槸鍏ㄩ€夌姸鎬?
    expect(mockSetData).toHaveBeenCalledWith({ allSelected: true });
  });

  test('缁撶畻鍔熻兘', async () => {
    const cartService = require('../../utils/cart-service');
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.checkCartStock.mockResolvedValue({ out_of_stock: [] });
    
    const page = cartPage;
    await page.loadCartData();
    
    // 璋冪敤缁撶畻鏂规硶
    await page.checkout();
    
    // 楠岃瘉璋冪敤
    expect(cartService.checkCartStock).toHaveBeenCalledWith([mockCartItems[0]]);
    expect(mockNavigateTo).toHaveBeenCalled();
  });
});
\n