锘?/ 鐠愵厾澧挎潪锕傘€夐棃銏犲礋閸忓啯绁寸拠?import { render } from '@testing-library/react-native';
import cartPage from '../cart';

// 濡剝瀚欐笟婵婄
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

// 濡剝瀚欑亸蹇曗柤鎼村粐PI
const mockSetData = jest.fn();
const mockNavigateTo = jest.fn();

// 閸戝棗顦ù瀣槸閺佺増宓?const mockCartItems = [
  {
    id: 1,
    product_id: 'prod001',
    name: '濞村鐦崯鍡楁惂1',
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
    name: '濞村鐦崯鍡楁惂2',
    price: 199.99,
    quantity: 1,
    stock: 0,
    available: true,
    status: 1,
    selected: false
  }
];

describe('鐠愵厾澧挎潪锕傘€夐棃銏＄ゴ鐠?, () => {
  beforeEach(() => {
    // 闁插秶鐤嗛幍鈧張澶嬆侀幏?    jest.clearAllMocks();
    
    // 濡剝瀚橮age閺嬪嫰鈧姴鍤遍弫?    global.Page = jest.fn().mockImplementation((options) => {
      // 濡剝瀚欑亸蹇曗柤鎼村繘銆夐棃銏犵杽娓?      const page = {
        data: options.data,
        setData: mockSetData
      };
      
      // 婢跺秴鍩楅幍鈧張澶嬫煙濞夋洖鍩岀€圭偘绶?      Object.keys(options).forEach(key => {
        if (typeof options[key] === 'function' && key !== 'data') {
          page[key] = options[key].bind(page);
        }
      });
      
      return page;
    });
    
    // 濡剝瀚欑亸蹇曗柤鎼村繐鍙忕仦鈧珹PI
    global.wx = {
      navigateTo: mockNavigateTo,
      showToast: jest.fn(),
      showLoading: jest.fn(),
      hideLoading: jest.fn(),
      stopPullDownRefresh: jest.fn()
    };
  });

  test('閸旂姾娴囩拹顓犲⒖鏉烇附鏆熼幑?, async () => {
    const cartService = require('../../utils/cart-service');
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    
    // 閸掓稑缂撴い鐢告桨鐎圭偘绶?    const page = cartPage;
    
    // 鐠嬪啰鏁ら崝鐘烘祰閺佺増宓侀弬瑙勭《
    await page.loadCartData();
    
    // 妤犲矁鐦夌拫鍐暏
    expect(cartService.getCartItems).toHaveBeenCalledWith({ forceRefresh: false });
    
    // 妤犲矁鐦夐弫鐗堝祦閺囧瓨鏌?    expect(mockSetData).toHaveBeenCalled();
  });

  test('婢х偛濮為崯鍡楁惂閺佷即鍣?, async () => {
    const cartService = require('../../utils/cart-service');
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.updateCartItem.mockResolvedValue({ success: true });
    
    const page = cartPage;
    await page.loadCartData();
    
    // 閸戝棗顦Ο鈩冨珯娴滃娆㈢€电钖?    const mockEvent = {
      currentTarget: {
        dataset: {
          index: 0
        }
      }
    };
    
    // 鐠嬪啰鏁ゆ晶鐐插閺佷即鍣洪弬瑙勭《
    await page.increaseQuantity(mockEvent);
    
    // 妤犲矁鐦夌拫鍐暏
    expect(cartService.updateCartItem).toHaveBeenCalledWith(1, 3);
  });

  test('閸戝繐鐨崯鍡楁惂閺佷即鍣?, async () => {
    const cartService = require('../../utils/cart-service');
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.updateCartItem.mockResolvedValue({ success: true });
    
    const page = cartPage;
    await page.loadCartData();
    
    // 閸戝棗顦Ο鈩冨珯娴滃娆㈢€电钖?    const mockEvent = {
      currentTarget: {
        dataset: {
          index: 0
        }
      }
    };
    
    // 鐠嬪啰鏁ら崙蹇撶毌閺佷即鍣洪弬瑙勭《
    await page.decreaseQuantity(mockEvent);
    
    // 妤犲矁鐦夌拫鍐暏
    expect(cartService.updateCartItem).toHaveBeenCalledWith(1, 1);
  });

  test('閸掔娀娅庨崡鏇氶嚋閸熷棗鎼?, async () => {
    const cartService = require('../../utils/cart-service');
    const { showConfirm } = require('../../utils/global');
    
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.deleteCartItem.mockResolvedValue({ success: true });
    showConfirm.mockResolvedValue(true); // 濡剝瀚欓悽銊﹀煕绾喛顓婚崚鐘绘珟
    
    const page = cartPage;
    await page.loadCartData();
    
    // 閸戝棗顦Ο鈩冨珯娴滃娆㈢€电钖?    const mockEvent = {
      currentTarget: {
        dataset: {
          index: 0
        }
      }
    };
    
    // 鐠嬪啰鏁ら崚鐘绘珟閺傝纭?    await page.deleteCartItem(mockEvent);
    
    // 妤犲矁鐦夌拫鍐暏
    expect(cartService.deleteCartItem).toHaveBeenCalledWith(1);
  });

  test('閹靛綊鍣洪崚鐘绘珟闁鑵戦崯鍡楁惂', async () => {
    const cartService = require('../../utils/cart-service');
    const { showConfirm } = require('../../utils/global');
    
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.deleteCartItems.mockResolvedValue({ success: true });
    showConfirm.mockResolvedValue(true); // 濡剝瀚欓悽銊﹀煕绾喛顓婚崚鐘绘珟
    
    const page = cartPage;
    await page.loadCartData();
    
    // 鐠嬪啰鏁ら幍褰掑櫤閸掔娀娅庨弬瑙勭《
    await page.deleteSelectedItems();
    
    // 妤犲矁鐦夌拫鍐暏
    expect(cartService.deleteCartItems).toHaveBeenCalledWith([1]);
  });

  test('鐠侊紕鐣婚幀璁崇幆', () => {
    const page = cartPage;
    
    // 閹靛濮╃拋鍓х枂閺佺増宓?    page.setData({
      cartItems: mockCartItems
    });
    
    // 鐠嬪啰鏁ょ拋锛勭暬閹鐜弬瑙勭《
    page.calculateTotal();
    
    // 妤犲矁鐦夌紒鎾寸亯 (99.99 * 2 = 199.98)
    expect(mockSetData).toHaveBeenCalledWith({
      totalPrice: '199.98',
      selectedCount: 2,
      checkedGoodsList: [mockCartItems[0]]
    });
  });

  test('濡偓閺屻儱鍙忛柅澶屽Ц閹?, () => {
    const page = cartPage;
    
    // 閹靛濮╃拋鍓х枂閺佺増宓?    page.setData({
      cartItems: mockCartItems
    });
    
    // 鐠嬪啰鏁ゅΛ鈧弻銉ュ弿闁濮搁幀浣规煙濞?    page.checkAllSelected();
    
    // 妤犲矁鐦夌紒鎾寸亯 (閸欘亝婀佹稉鈧稉顏勫讲閻劌鏅㈤崫浣风瑬瀹告煡鈧鑵戦敍灞惧娴犮儱绨茬拠銉︽Ц閸忋劑鈧濮搁幀?
    expect(mockSetData).toHaveBeenCalledWith({ allSelected: true });
  });

  test('缂佹挾鐣婚崝鐔诲厴', async () => {
    const cartService = require('../../utils/cart-service');
    cartService.getCartItems.mockResolvedValue(mockCartItems);
    cartService.checkCartStock.mockResolvedValue({ out_of_stock: [] });
    
    const page = cartPage;
    await page.loadCartData();
    
    // 鐠嬪啰鏁ょ紒鎾剁暬閺傝纭?    await page.checkout();
    
    // 妤犲矁鐦夌拫鍐暏
    expect(cartService.checkCartStock).toHaveBeenCalledWith([mockCartItems[0]]);
    expect(mockNavigateTo).toHaveBeenCalled();
  });
});
\n