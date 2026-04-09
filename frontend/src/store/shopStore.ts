import { create } from 'zustand';

import api from '../services/api';
import type { Item, UserItem, ItemType, ItemRarity } from '../types';

interface ShopState {
  items: Item[];
  myItems: UserItem[];
  isLoading: boolean;
  error: string | null;

  // Filters
  filterType: ItemType | 'all';
  filterRarity: ItemRarity | 'all';
  minPrice: number;
  maxPrice: number;

  // Actions
  fetchItems: () => Promise<void>;
  fetchMyItems: () => Promise<void>;
  buyItem: (itemId: string) => Promise<void>;
  sellItem: (itemId: string) => Promise<void>;
  equipItem: (itemId: string) => Promise<void>;
  setFilterType: (type: ItemType | 'all') => void;
  setFilterRarity: (rarity: ItemRarity | 'all') => void;
  setPriceRange: (min: number, max: number) => void;
  resetFilters: () => void;
}

export const useShopStore = create<ShopState>((set, get) => ({
  items: [],
  myItems: [],
  isLoading: false,
  error: null,

  // Default filter values
  filterType: 'all',
  filterRarity: 'all',
  minPrice: 0,
  maxPrice: 1000000,

  fetchItems: async () => {
    set({ isLoading: true, error: null });

    try {
      const { filterType, filterRarity } = get();

      // Build query params
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterRarity !== 'all') params.append('rarity', filterRarity);

      const response = await api.get<{ success: boolean; data: { items: Item[]; count: number } }>(`/shop/items?${params.toString()}`);

      set({
        items: response.data.data.items,
        isLoading: false
      });
    } catch (error: unknown) {
      set({
        error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch items',
        isLoading: false
      });
    }
  },

  fetchMyItems: async () => {
    try {
      const response = await api.get<{ success: boolean; data: { items: UserItem[]; count: number } }>('/shop/my-items');
      set({ myItems: response.data.data.items });
    } catch (error: unknown) {
      console.error('Failed to fetch my items:', error);
    }
  },

  buyItem: async (itemId: string) => {
    try {
      const response = await api.post<{
        success: boolean;
        data: {
          user_item: unknown;
          new_balance: number;
          transaction_id: number
        }
      }>(`/shop/buy/${itemId}`);

      // Update user balance in authStore
      const { useAuthStore } = await import('./authStore');
      const authStore = useAuthStore.getState();
      if (authStore.user) {
        authStore.setUser({
          ...authStore.user,
          balance: response.data.data.new_balance
        });
      }

      // Refresh items and user items
      await get().fetchItems();
      await get().fetchMyItems();
    } catch (error: unknown) {
      throw new Error((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to buy item');
    }
  },

  sellItem: async (itemId: string) => {
    try {
      const response = await api.post<{
        success: boolean;
        data: {
          sale_price: number;
          new_balance: number;
          transaction_id: number
        }
      }>(`/shop/sell/${itemId}`);

      // Update user balance in authStore
      const { useAuthStore } = await import('./authStore');
      const authStore = useAuthStore.getState();
      if (authStore.user) {
        authStore.setUser({
          ...authStore.user,
          balance: response.data.data.new_balance
        });
      }

      // Refresh my items
      await get().fetchMyItems();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || axiosError.message || 'Failed to sell item';
      console.error('Sell item error details:', error);
      throw new Error(errorMessage);
    }
  },

  equipItem: async (itemId: string) => {
    try {
      await api.post(`/shop/equip/${itemId}`);

      // Refresh my items
      await get().fetchMyItems();
    } catch (error: unknown) {
      throw new Error((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to equip item');
    }
  },

  setFilterType: (type) => {
    set({ filterType: type });
    get().fetchItems();
  },

  setFilterRarity: (rarity) => {
    set({ filterRarity: rarity });
    get().fetchItems();
  },

  setPriceRange: (min, max) => {
    set({ minPrice: min, maxPrice: max });
  },

  resetFilters: () => {
    set({
      filterType: 'all',
      filterRarity: 'all',
      minPrice: 0,
      maxPrice: 1000000,
    });
    get().fetchItems();
  },
}));
