import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useShopStore } from './shopStore';
import api from '../services/api';
import type { Item, UserItem } from '../types';

// Mock API module
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock authStore
vi.mock('./authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: '',
        balance: 1000,
      },
      setUser: vi.fn(),
    })),
  },
}));

describe('shopStore', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset store to initial state
    useShopStore.setState({
      items: [],
      myItems: [],
      isLoading: false,
      error: null,
      filterType: 'all',
      filterRarity: 'all',
      minPrice: 0,
      maxPrice: 1000000,
    });

    // Clear mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useShopStore.getState();

      expect(state.items).toEqual([]);
      expect(state.myItems).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.filterType).toBe('all');
      expect(state.filterRarity).toBe('all');
      expect(state.minPrice).toBe(0);
      expect(state.maxPrice).toBe(1000000);
    });
  });

  describe('fetchItems', () => {
    it('should fetch items successfully', async () => {
      const mockItems: Item[] = [
        {
          id: '1',
          name: 'T-Shirt',
          type: 'clothing',
          rarity: 'common',
          price: 50,
          image_url: 'tshirt.png',
          description: 'A nice t-shirt',
        },
        {
          id: '2',
          name: 'Sedan',
          type: 'car',
          rarity: 'rare',
          price: 10000,
          image_url: 'sedan.png',
          description: 'A reliable car',
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: { items: mockItems, count: 2 },
        },
      });

      await useShopStore.getState().fetchItems();

      expect(api.get).toHaveBeenCalledWith('/shop/items?');

      const state = useShopStore.getState();
      expect(state.items).toEqual(mockItems);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state while fetching', async () => {
      vi.mocked(api.get).mockImplementation(() =>
        new Promise(resolve => {
          // Check loading state during API call
          expect(useShopStore.getState().isLoading).toBe(true);
          setTimeout(() => {
            resolve({
              data: {
                success: true,
                data: { items: [], count: 0 },
              },
            });
          }, 10);
        })
      );

      await useShopStore.getState().fetchItems();

      expect(useShopStore.getState().isLoading).toBe(false);
    });

    it('should fetch items with type filter', async () => {
      useShopStore.setState({ filterType: 'clothing' });

      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: { items: [], count: 0 },
        },
      });

      await useShopStore.getState().fetchItems();

      expect(api.get).toHaveBeenCalledWith('/shop/items?type=clothing');
    });

    it('should fetch items with rarity filter', async () => {
      useShopStore.setState({ filterRarity: 'rare' });

      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: { items: [], count: 0 },
        },
      });

      await useShopStore.getState().fetchItems();

      expect(api.get).toHaveBeenCalledWith('/shop/items?rarity=rare');
    });

    it('should fetch items with both filters', async () => {
      useShopStore.setState({
        filterType: 'clothing',
        filterRarity: 'epic',
      });

      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: { items: [], count: 0 },
        },
      });

      await useShopStore.getState().fetchItems();

      expect(api.get).toHaveBeenCalledWith('/shop/items?type=clothing&rarity=epic');
    });

    it('should handle fetch error', async () => {
      const errorMessage = 'Failed to fetch items';
      vi.mocked(api.get).mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });

      await useShopStore.getState().fetchItems();

      const state = useShopStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
      expect(state.items).toEqual([]);
    });

    it('should handle fetch error with default message', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

      await useShopStore.getState().fetchItems();

      const state = useShopStore.getState();
      expect(state.error).toBe('Failed to fetch items');
    });
  });

  describe('fetchMyItems', () => {
    it('should fetch user items successfully', async () => {
      const mockUserItems: UserItem[] = [
        {
          id: '1',
          user_id: '1',
          item_id: '1',
          is_equipped: true,
          purchased_at: '2025-01-15T10:00:00Z',
          item: {
            id: '1',
            name: 'T-Shirt',
            type: 'clothing',
            rarity: 'common',
            price: 50,
            image_url: 'tshirt.png',
            description: 'A nice t-shirt',
          },
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: { items: mockUserItems, count: 1 },
        },
      });

      await useShopStore.getState().fetchMyItems();

      expect(api.get).toHaveBeenCalledWith('/shop/my-items');

      const state = useShopStore.getState();
      expect(state.myItems).toEqual(mockUserItems);
    });

    it('should handle fetch error silently', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('API error'));

      // Should not throw
      await expect(useShopStore.getState().fetchMyItems()).resolves.toBeUndefined();

      const state = useShopStore.getState();
      expect(state.myItems).toEqual([]); // Should remain empty
    });
  });

  describe('buyItem', () => {
    it('should buy item and update balance', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user_item: { id: '1' },
            new_balance: 950,
            transaction_id: 1,
          },
        },
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: [], count: 0 } },
      });
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: [], count: 0 } },
      });

      await useShopStore.getState().buyItem('1');

      expect(api.post).toHaveBeenCalledWith('/shop/buy/1');
      // Should refresh items and my items
      expect(api.get).toHaveBeenCalledWith('/shop/items?');
      expect(api.get).toHaveBeenCalledWith('/shop/my-items');
    });

    it('should throw error if purchase fails', async () => {
      const errorMessage = 'Insufficient balance';
      vi.mocked(api.post).mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });

      await expect(useShopStore.getState().buyItem('1')).rejects.toThrow(errorMessage);
    });

    it('should throw default error message if no specific message', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Network error'));

      await expect(useShopStore.getState().buyItem('1')).rejects.toThrow('Failed to buy item');
    });
  });

  describe('sellItem', () => {
    it('should sell item and update balance', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            sale_price: 25,
            new_balance: 1025,
            transaction_id: 1,
          },
        },
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: [], count: 0 } },
      });

      await useShopStore.getState().sellItem('1');

      expect(api.post).toHaveBeenCalledWith('/shop/sell/1');
      // Should refresh my items
      expect(api.get).toHaveBeenCalledWith('/shop/my-items');
    });

    it('should throw error with message field', async () => {
      const errorMessage = 'Cannot sell equipped item';
      vi.mocked(api.post).mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });

      await expect(useShopStore.getState().sellItem('1')).rejects.toThrow(errorMessage);
    });

    it('should throw error with error field', async () => {
      const errorMessage = 'Item not found';
      vi.mocked(api.post).mockRejectedValueOnce({
        response: {
          data: {
            error: errorMessage,
          },
        },
      });

      await expect(useShopStore.getState().sellItem('1')).rejects.toThrow(errorMessage);
    });

    it('should throw default error message if no specific message', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error());

      await expect(useShopStore.getState().sellItem('1')).rejects.toThrow('Failed to sell item');
    });
  });

  describe('equipItem', () => {
    it('should equip item successfully', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: [], count: 0 } },
      });

      await useShopStore.getState().equipItem('1');

      expect(api.post).toHaveBeenCalledWith('/shop/equip/1');
      // Should refresh my items
      expect(api.get).toHaveBeenCalledWith('/shop/my-items');
    });

    it('should throw error if equip fails', async () => {
      const errorMessage = 'Item not owned';
      vi.mocked(api.post).mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });

      await expect(useShopStore.getState().equipItem('1')).rejects.toThrow(errorMessage);
    });

    it('should throw default error message', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error());

      await expect(useShopStore.getState().equipItem('1')).rejects.toThrow('Failed to equip item');
    });
  });

  describe('setFilterType', () => {
    it('should update filter type and fetch items', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: [], count: 0 } },
      });

      useShopStore.getState().setFilterType('clothing');

      expect(useShopStore.getState().filterType).toBe('clothing');
      // Wait for async fetchItems to complete
      await vi.waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/shop/items?type=clothing');
      });
    });

    it('should handle "all" filter', async () => {
      useShopStore.setState({ filterType: 'clothing' });

      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: [], count: 0 } },
      });

      useShopStore.getState().setFilterType('all');

      expect(useShopStore.getState().filterType).toBe('all');
      await vi.waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/shop/items?');
      });
    });
  });

  describe('setFilterRarity', () => {
    it('should update filter rarity and fetch items', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: [], count: 0 } },
      });

      useShopStore.getState().setFilterRarity('epic');

      expect(useShopStore.getState().filterRarity).toBe('epic');
      await vi.waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/shop/items?rarity=epic');
      });
    });

    it('should handle "all" filter', async () => {
      useShopStore.setState({ filterRarity: 'rare' });

      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: [], count: 0 } },
      });

      useShopStore.getState().setFilterRarity('all');

      expect(useShopStore.getState().filterRarity).toBe('all');
      await vi.waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/shop/items?');
      });
    });
  });

  describe('setPriceRange', () => {
    it('should update price range', () => {
      useShopStore.getState().setPriceRange(100, 5000);

      const state = useShopStore.getState();
      expect(state.minPrice).toBe(100);
      expect(state.maxPrice).toBe(5000);
    });

    it('should not fetch items automatically', async () => {
      useShopStore.getState().setPriceRange(100, 5000);

      // Wait a bit to ensure no API call is made
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to default and fetch items', async () => {
      useShopStore.setState({
        filterType: 'clothing',
        filterRarity: 'epic',
        minPrice: 100,
        maxPrice: 5000,
      });

      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: [], count: 0 } },
      });

      useShopStore.getState().resetFilters();

      const state = useShopStore.getState();
      expect(state.filterType).toBe('all');
      expect(state.filterRarity).toBe('all');
      expect(state.minPrice).toBe(0);
      expect(state.maxPrice).toBe(1000000);

      await vi.waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/shop/items?');
      });
    });
  });

  describe('integration: complete shop flow', () => {
    it('should handle complete buy flow', async () => {
      // Fetch items
      const mockItems: Item[] = [
        {
          id: '1',
          name: 'T-Shirt',
          type: 'clothing',
          rarity: 'common',
          price: 50,
          image_url: 'tshirt.png',
          description: 'A nice t-shirt',
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: mockItems, count: 1 } },
      });

      await useShopStore.getState().fetchItems();
      expect(useShopStore.getState().items).toHaveLength(1);

      // Buy item
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            user_item: { id: '1' },
            new_balance: 950,
            transaction_id: 1,
          },
        },
      });

      // Mock refreshes after buy
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: mockItems, count: 1 } },
      });

      const mockUserItems: UserItem[] = [
        {
          id: '1',
          user_id: '1',
          item_id: '1',
          is_equipped: false,
          purchased_at: '2025-01-15T10:00:00Z',
          item: mockItems[0],
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: mockUserItems, count: 1 } },
      });

      await useShopStore.getState().buyItem('1');

      // Verify myItems is updated
      expect(useShopStore.getState().myItems).toHaveLength(1);
    });

    it('should handle filtering and purchasing', async () => {
      // Set filter
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: [], count: 0 } },
      });

      useShopStore.getState().setFilterType('car');

      await vi.waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/shop/items?type=car');
      });

      // Reset filters
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { items: [], count: 0 } },
      });

      useShopStore.getState().resetFilters();

      await vi.waitFor(() => {
        expect(api.get).toHaveBeenLastCalledWith('/shop/items?');
      });
    });
  });
});
