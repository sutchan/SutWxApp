﻿/**
 * 鏂囦欢鍚? cartService.test.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-30
 * 浣滆€? Sut
 * 鎻忚堪: 璐墿杞︽湇鍔″崟鍏冩祴璇? */

// 妯℃嫙渚濊禆椤?jest.mock('../../utils/request', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const request = require('../../utils/request');
const CartService = require('../../services/cartService');

describe('CartService', () => {
  beforeEach(() => {
    // 娓呴櫎鎵€鏈夋ā鎷熻皟鐢?    jest.clearAllMocks();
  });

  describe('getCartList', () => {
    it('should get cart list successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockResponse = {
        list: [{ id: 'cart1', productId: 'prod1', quantity: 2 }],
        total: 2,
        totalPrice: 100
      };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.get.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.getCartList();
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/list', {}, {});
    });

    it('should get cart list with options', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockResponse = {
        list: [{ id: 'cart1', productId: 'prod1', quantity: 2 }],
        total: 2,
        totalPrice: 100
      };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.get.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const options = { needAuth: false };
      const result = await CartService.getCartList(options);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/list', {}, options);
    });
  });

  describe('addToCart', () => {
    it('should add product to cart successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockData = {
        productId: 'prod1',
        quantity: 2,
        skuId: 'sku1',
        specifications: { color: 'red', size: 'M' }
      };
      const mockResponse = { success: true, cartId: 'cart1' };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.post.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.addToCart(mockData);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/add', mockData);
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should update cart item quantity successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const cartId = 'cart1';
      const quantity = 3;
      const mockResponse = { success: true };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.put.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.updateCartItemQuantity(cartId, quantity);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith(`/cart/item/${cartId}`, { quantity });
    });
  });

  describe('updateCartItemSpecifications', () => {
    it('should update cart item specifications successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const cartId = 'cart1';
      const specifications = { color: 'blue', size: 'L' };
      const mockResponse = { success: true };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.put.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.updateCartItemSpecifications(cartId, specifications);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith(`/cart/item/${cartId}/specifications`, { specifications });
    });
  });

  describe('removeFromCart', () => {
    it('should remove single cart item successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const cartId = 'cart1';
      const mockResponse = { success: true, removedCount: 1 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.delete.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.removeFromCart(cartId);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith('/cart/remove', { cartIds: [cartId] });
    });

    it('should remove multiple cart items successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const cartIds = ['cart1', 'cart2', 'cart3'];
      const mockResponse = { success: true, removedCount: 3 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.delete.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.removeFromCart(cartIds);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith('/cart/remove', { cartIds });
    });
  });

  describe('clearCart', () => {
    it('should clear cart successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockResponse = { success: true, clearedCount: 5 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.delete.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.clearCart();
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith('/cart/clear');
    });
  });

  describe('updateCartItemSelection', () => {
    it('should update single cart item selection successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const cartId = 'cart1';
      const selected = true;
      const mockResponse = { success: true, updatedCount: 1 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.put.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.updateCartItemSelection(cartId, selected);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith('/cart/selection', { cartIds: [cartId], selected });
    });

    it('should update multiple cart items selection successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const cartIds = ['cart1', 'cart2', 'cart3'];
      const selected = false;
      const mockResponse = { success: true, updatedCount: 3 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.put.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.updateCartItemSelection(cartIds, selected);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith('/cart/selection', { cartIds, selected });
    });
  });

  describe('updateAllCartItemSelection', () => {
    it('should select all cart items successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const selected = true;
      const mockResponse = { success: true, updatedCount: 5 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.put.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.updateAllCartItemSelection(selected);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith('/cart/selection/all', { selected });
    });
  });

  describe('getCartCount', () => {
    it('should get cart count successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockResponse = { count: 5 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.get.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.getCartCount();
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/count');
    });
  });

  describe('getSelectedItemsTotal', () => {
    it('should get selected items total successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockResponse = { totalPrice: 200, totalQuantity: 4 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.get.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.getSelectedItemsTotal();
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/total');
    });
  });

  describe('batchAddToCart', () => {
    it('should batch add items to cart successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const items = [
        { productId: 'prod1', quantity: 2, skuId: 'sku1' },
        { productId: 'prod2', quantity: 1, specifications: { color: 'red' } }
      ];
      const mockResponse = { success: true, addedCount: 2 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.post.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.batchAddToCart(items);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/batch-add', { items });
    });
  });

  describe('moveToFavorite', () => {
    it('should move single cart item to favorite successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const cartId = 'cart1';
      const mockResponse = { success: true, movedCount: 1 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.post.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.moveToFavorite(cartId);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/move-to-favorite', { cartIds: [cartId] });
    });

    it('should move multiple cart items to favorite successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const cartIds = ['cart1', 'cart2', 'cart3'];
      const mockResponse = { success: true, movedCount: 3 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.post.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.moveToFavorite(cartIds);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/move-to-favorite', { cartIds });
    });
  });

  describe('checkCartItemsStock', () => {
    it('should check single cart item stock successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const cartId = 'cart1';
      const mockResponse = { stockStatus: 'in_stock', cartItems: [{ cartId, stock: 10 }] };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.post.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.checkCartItemsStock(cartId);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/check-stock', { cartIds: [cartId] });
    });

    it('should check multiple cart items stock successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const cartIds = ['cart1', 'cart2'];
      const mockResponse = {
        stockStatus: 'partial_out_of_stock',
        cartItems: [
          { cartId: 'cart1', stock: 0, status: 'out_of_stock' },
          { cartId: 'cart2', stock: 5, status: 'in_stock' }
        ]
      };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.post.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.checkCartItemsStock(cartIds);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/check-stock', { cartIds });
    });
  });

  describe('getInvalidItems', () => {
    it('should get invalid items successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockResponse = { invalidItems: [{ cartId: 'cart1', reason: 'expired' }] };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.get.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.getInvalidItems();
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/invalid-items');
    });
  });

  describe('clearInvalidItems', () => {
    it('should clear invalid items successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockResponse = { success: true, clearedCount: 2 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.delete.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.clearInvalidItems();
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith('/cart/invalid-items');
    });
  });

  describe('applyCoupon', () => {
    it('should apply coupon to cart successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const couponId = 'coupon1';
      const mockResponse = { success: true, discount: 20 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.post.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.applyCoupon(couponId);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/apply-coupon', { couponId });
    });
  });

  describe('removeCoupon', () => {
    it('should remove coupon from cart successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockResponse = { success: true };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.delete.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.removeCoupon();
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith('/cart/coupon');
    });
  });

  describe('calculateShipping', () => {
    it('should calculate shipping successfully with default options', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockResponse = { shippingFee: 10, estimatedDays: 3 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.get.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.calculateShipping();
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/shipping', {});
    });

    it('should calculate shipping with regionId', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const options = { regionId: 'region1' };
      const mockResponse = { shippingFee: 15, estimatedDays: 2 };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.get.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await CartService.calculateShipping(options);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/shipping', options);
    });
  });
});
