import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShopFilters from './ShopFilters';
import { useShopStore } from '../../store/shopStore';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, whileHover, whileTap, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'shop.filters': 'Filters',
        'shop.reset': 'Reset',
        'shop.category': 'Category',
        'shop.rarity': 'Rarity',
        'shop.all': 'All',
        'shop.clothing': 'Clothing',
        'shop.car': 'Car',
        'shop.house': 'House',
        'shop.accessories': 'Accessories',
        'shop.allRarities': 'All Rarities',
        'shop.common': 'Common',
        'shop.rare': 'Rare',
        'shop.epic': 'Epic',
        'shop.legendary': 'Legendary',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the shop store
vi.mock('../../store/shopStore');

describe('ShopFilters', () => {
  const mockSetFilterType = vi.fn();
  const mockSetFilterRarity = vi.fn();
  const mockResetFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    vi.mocked(useShopStore).mockReturnValue({
      filterType: 'all',
      filterRarity: 'all',
      setFilterType: mockSetFilterType,
      setFilterRarity: mockSetFilterRarity,
      resetFilters: mockResetFilters,
      // Add other store properties to satisfy TypeScript
      items: [],
      myItems: [],
      isLoading: false,
      priceRange: { min: 0, max: 1000000 },
      fetchItems: vi.fn(),
      fetchMyItems: vi.fn(),
      buyItem: vi.fn(),
      sellItem: vi.fn(),
      equipItem: vi.fn(),
      setPriceRange: vi.fn(),
    });
  });

  describe('rendering', () => {
    it('should render filters header', () => {
      render(<ShopFilters />);

      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should render category section', () => {
      render(<ShopFilters />);

      expect(screen.getByText('Category')).toBeInTheDocument();
    });

    it('should render rarity section', () => {
      render(<ShopFilters />);

      expect(screen.getByText('Rarity')).toBeInTheDocument();
    });

    it('should render all type filter buttons', () => {
      render(<ShopFilters />);

      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('Car')).toBeInTheDocument();
      expect(screen.getByText('House')).toBeInTheDocument();
      expect(screen.getByText('Accessories')).toBeInTheDocument();
    });

    it('should render all rarity filter buttons', () => {
      render(<ShopFilters />);

      expect(screen.getByText('All Rarities')).toBeInTheDocument();
      expect(screen.getByText('Common')).toBeInTheDocument();
      expect(screen.getByText('Rare')).toBeInTheDocument();
      expect(screen.getByText('Epic')).toBeInTheDocument();
      expect(screen.getByText('Legendary')).toBeInTheDocument();
    });

    it('should display type emojis', () => {
      const { container } = render(<ShopFilters />);

      expect(container.textContent).toContain('🛍️'); // All
      expect(container.textContent).toContain('👔'); // Clothing
      expect(container.textContent).toContain('🚗'); // Car
      expect(container.textContent).toContain('🏠'); // House
      expect(container.textContent).toContain('💎'); // Accessories
    });
  });

  describe('type filter interaction', () => {
    it('should call setFilterType when clicking All type', () => {
      render(<ShopFilters />);

      // There are multiple "All" buttons, get the one that says exactly "All" (not "All Rarities")
      const allButtons = screen.getAllByText('All');
      // The type "All" button is in the first filter section
      const typeAllButton = allButtons[0];
      fireEvent.click(typeAllButton);

      expect(mockSetFilterType).toHaveBeenCalledTimes(1);
      expect(mockSetFilterType).toHaveBeenCalledWith('all');
    });

    it('should call setFilterType when clicking Clothing', () => {
      render(<ShopFilters />);

      const clothingButton = screen.getByRole('button', { name: /clothing/i });
      fireEvent.click(clothingButton);

      expect(mockSetFilterType).toHaveBeenCalledTimes(1);
      expect(mockSetFilterType).toHaveBeenCalledWith('clothing');
    });

    it('should call setFilterType when clicking Car', () => {
      render(<ShopFilters />);

      const carButton = screen.getByRole('button', { name: /car/i });
      fireEvent.click(carButton);

      expect(mockSetFilterType).toHaveBeenCalledTimes(1);
      expect(mockSetFilterType).toHaveBeenCalledWith('car');
    });

    it('should call setFilterType when clicking House', () => {
      render(<ShopFilters />);

      const houseButton = screen.getByRole('button', { name: /house/i });
      fireEvent.click(houseButton);

      expect(mockSetFilterType).toHaveBeenCalledTimes(1);
      expect(mockSetFilterType).toHaveBeenCalledWith('house');
    });

    it('should call setFilterType when clicking Accessories', () => {
      render(<ShopFilters />);

      const accessoriesButton = screen.getByRole('button', { name: /accessories/i });
      fireEvent.click(accessoriesButton);

      expect(mockSetFilterType).toHaveBeenCalledTimes(1);
      expect(mockSetFilterType).toHaveBeenCalledWith('accessories');
    });
  });

  describe('rarity filter interaction', () => {
    it('should call setFilterRarity when clicking All Rarities', () => {
      render(<ShopFilters />);

      const allButton = screen.getByRole('button', { name: /all rarities/i });
      fireEvent.click(allButton);

      expect(mockSetFilterRarity).toHaveBeenCalledTimes(1);
      expect(mockSetFilterRarity).toHaveBeenCalledWith('all');
    });

    it('should call setFilterRarity when clicking Common', () => {
      render(<ShopFilters />);

      const commonButton = screen.getByRole('button', { name: /^common$/i });
      fireEvent.click(commonButton);

      expect(mockSetFilterRarity).toHaveBeenCalledTimes(1);
      expect(mockSetFilterRarity).toHaveBeenCalledWith('common');
    });

    it('should call setFilterRarity when clicking Rare', () => {
      render(<ShopFilters />);

      const rareButton = screen.getByRole('button', { name: /^rare$/i });
      fireEvent.click(rareButton);

      expect(mockSetFilterRarity).toHaveBeenCalledTimes(1);
      expect(mockSetFilterRarity).toHaveBeenCalledWith('rare');
    });

    it('should call setFilterRarity when clicking Epic', () => {
      render(<ShopFilters />);

      const epicButton = screen.getByRole('button', { name: /^epic$/i });
      fireEvent.click(epicButton);

      expect(mockSetFilterRarity).toHaveBeenCalledTimes(1);
      expect(mockSetFilterRarity).toHaveBeenCalledWith('epic');
    });

    it('should call setFilterRarity when clicking Legendary', () => {
      render(<ShopFilters />);

      const legendaryButton = screen.getByRole('button', { name: /^legendary$/i });
      fireEvent.click(legendaryButton);

      expect(mockSetFilterRarity).toHaveBeenCalledTimes(1);
      expect(mockSetFilterRarity).toHaveBeenCalledWith('legendary');
    });
  });

  describe('reset filters', () => {
    it('should call resetFilters when clicking reset button', () => {
      render(<ShopFilters />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);

      expect(mockResetFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe('selected state styling', () => {
    it('should show clothing filter as selected', () => {
      vi.mocked(useShopStore).mockReturnValue({
        filterType: 'clothing',
        filterRarity: 'all',
        setFilterType: mockSetFilterType,
        setFilterRarity: mockSetFilterRarity,
        resetFilters: mockResetFilters,
        items: [],
        myItems: [],
        isLoading: false,
        priceRange: { min: 0, max: 1000000 },
        fetchItems: vi.fn(),
        fetchMyItems: vi.fn(),
        buyItem: vi.fn(),
        sellItem: vi.fn(),
        equipItem: vi.fn(),
        setPriceRange: vi.fn(),
      });

      const { container } = render(<ShopFilters />);

      // The clothing button should have selected styling classes
      const buttons = container.querySelectorAll('button');
      const clothingButton = Array.from(buttons).find(btn =>
        btn.textContent?.includes('Clothing')
      );

      expect(clothingButton?.className).toContain('bg-yellow-600');
      expect(clothingButton?.className).toContain('border-yellow-500');
    });

    it('should show epic rarity as selected', () => {
      vi.mocked(useShopStore).mockReturnValue({
        filterType: 'all',
        filterRarity: 'epic',
        setFilterType: mockSetFilterType,
        setFilterRarity: mockSetFilterRarity,
        resetFilters: mockResetFilters,
        items: [],
        myItems: [],
        isLoading: false,
        priceRange: { min: 0, max: 1000000 },
        fetchItems: vi.fn(),
        fetchMyItems: vi.fn(),
        buyItem: vi.fn(),
        sellItem: vi.fn(),
        equipItem: vi.fn(),
        setPriceRange: vi.fn(),
      });

      const { container } = render(<ShopFilters />);

      // Find the Epic button (not the first "Epic" in category section)
      const buttons = container.querySelectorAll('button');
      const epicButton = Array.from(buttons).find(btn =>
        btn.textContent === 'Epic' &&
        btn.className.includes('bg-yellow-600')
      );

      expect(epicButton).toBeTruthy();
      expect(epicButton?.className).toContain('bg-yellow-600');
      expect(epicButton?.className).toContain('border-yellow-500');
    });

    it('should show both type and rarity selections', () => {
      vi.mocked(useShopStore).mockReturnValue({
        filterType: 'car',
        filterRarity: 'legendary',
        setFilterType: mockSetFilterType,
        setFilterRarity: mockSetFilterRarity,
        resetFilters: mockResetFilters,
        items: [],
        myItems: [],
        isLoading: false,
        priceRange: { min: 0, max: 1000000 },
        fetchItems: vi.fn(),
        fetchMyItems: vi.fn(),
        buyItem: vi.fn(),
        sellItem: vi.fn(),
        equipItem: vi.fn(),
        setPriceRange: vi.fn(),
      });

      const { container } = render(<ShopFilters />);

      // Both car and legendary should have selected styling
      const buttons = container.querySelectorAll('button');
      const selectedButtons = Array.from(buttons).filter(btn =>
        btn.className.includes('bg-yellow-600')
      );

      expect(selectedButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple filter changes', () => {
      render(<ShopFilters />);

      // Change type filter
      fireEvent.click(screen.getByRole('button', { name: /clothing/i }));
      expect(mockSetFilterType).toHaveBeenCalledWith('clothing');

      // Change rarity filter
      fireEvent.click(screen.getByRole('button', { name: /^rare$/i }));
      expect(mockSetFilterRarity).toHaveBeenCalledWith('rare');

      expect(mockSetFilterType).toHaveBeenCalledTimes(1);
      expect(mockSetFilterRarity).toHaveBeenCalledTimes(1);
    });

    it('should handle filter change then reset', () => {
      render(<ShopFilters />);

      // Change filters
      fireEvent.click(screen.getByRole('button', { name: /house/i }));
      fireEvent.click(screen.getByRole('button', { name: /^legendary$/i }));

      // Reset
      fireEvent.click(screen.getByRole('button', { name: /reset/i }));

      expect(mockSetFilterType).toHaveBeenCalledTimes(1);
      expect(mockSetFilterRarity).toHaveBeenCalledTimes(1);
      expect(mockResetFilters).toHaveBeenCalledTimes(1);
    });

    it('should work when switching between different types', () => {
      render(<ShopFilters />);

      // Click clothing
      fireEvent.click(screen.getByRole('button', { name: /clothing/i }));
      expect(mockSetFilterType).toHaveBeenCalledWith('clothing');

      // Click car
      fireEvent.click(screen.getByRole('button', { name: /car/i }));
      expect(mockSetFilterType).toHaveBeenCalledWith('car');

      // Click all - need to be specific as there are multiple "All" buttons
      // Find the "All" button in the category section (first section)
      const allButtons = screen.getAllByText(/all/i);
      const categoryAllButton = allButtons[0]; // First "All" is for categories
      fireEvent.click(categoryAllButton);
      expect(mockSetFilterType).toHaveBeenCalledWith('all');

      expect(mockSetFilterType).toHaveBeenCalledTimes(3);
    });
  });
});
