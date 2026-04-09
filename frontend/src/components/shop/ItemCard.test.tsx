import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemCard from './ItemCard';
import type { Item } from '../../types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, animate, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'shop.common': 'Common',
        'shop.rare': 'Rare',
        'shop.epic': 'Epic',
        'shop.legendary': 'Legendary',
        'shop.owned': 'Owned',
        'shop.price': 'Price',
        'shop.buy': 'Buy',
      };
      return translations[key] || key;
    },
  }),
}));

describe('ItemCard', () => {
  const mockOnBuy = vi.fn();

  const createMockItem = (overrides?: Partial<Item>): Item => ({
    id: '1',
    name: 'Test Item',
    type: 'clothing',
    price: 1000,
    rarity: 'common',
    image_url: 'https://example.com/test.jpg',
    description: 'A test item description',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render item with all properties', () => {
      const item = createMockItem();
      render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByText('A test item description')).toBeInTheDocument();
      expect(screen.getByText('$1,000')).toBeInTheDocument();
      expect(screen.getByText('Common')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /buy/i })).toBeInTheDocument();
    });

    it('should display type emoji', () => {
      const item = createMockItem({ type: 'car' });
      const { container } = render(<ItemCard item={item} onBuy={mockOnBuy} />);

      // Car emoji should be present
      expect(container.textContent).toContain('🚗');
    });

    it('should display image when image_url is provided', () => {
      const item = createMockItem({ image_url: 'https://example.com/test.jpg' });
      render(<ItemCard item={item} onBuy={mockOnBuy} />);

      const img = screen.getByAltText('Test Item');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/test.jpg');
    });

    it('should display emoji fallback when image fails to load', () => {
      const item = createMockItem({ type: 'clothing' });
      const { container } = render(<ItemCard item={item} onBuy={mockOnBuy} />);

      const img = screen.getByAltText('Test Item');

      // Simulate image error
      fireEvent.error(img);

      // Clothing emoji should now be visible
      expect(container.textContent).toContain('👔');
    });

    it('should use default emoji when type is unknown', () => {
      const item = createMockItem({ type: 'unknown' as any });
      const { container } = render(<ItemCard item={item} onBuy={mockOnBuy} />);

      // Simulate image error to show emoji
      const img = screen.getByAltText('Test Item');
      fireEvent.error(img);

      // Default package emoji
      expect(container.textContent).toContain('📦');
    });
  });

  describe('rarity levels', () => {
    it('should render common rarity with correct styling', () => {
      const item = createMockItem({ rarity: 'common' });
      render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(screen.getByText('Common')).toBeInTheDocument();
    });

    it('should render rare rarity with correct styling', () => {
      const item = createMockItem({ rarity: 'rare' });
      render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(screen.getByText('Rare')).toBeInTheDocument();
    });

    it('should render epic rarity with correct styling', () => {
      const item = createMockItem({ rarity: 'epic' });
      render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(screen.getByText('Epic')).toBeInTheDocument();
    });

    it('should render legendary rarity with correct styling', () => {
      const item = createMockItem({ rarity: 'legendary' });
      render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(screen.getByText('Legendary')).toBeInTheDocument();
    });

    it('should default to common when rarity is undefined', () => {
      const item = createMockItem({ rarity: undefined as any });
      render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(screen.getByText('Common')).toBeInTheDocument();
    });
  });

  describe('owned state', () => {
    it('should show owned badge when owned is true', () => {
      const item = createMockItem();
      render(<ItemCard item={item} onBuy={mockOnBuy} owned={true} />);

      const badges = screen.getAllByText('Owned');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should not show owned badge when owned is false', () => {
      const item = createMockItem();
      render(<ItemCard item={item} onBuy={mockOnBuy} owned={false} />);

      const badges = screen.queryAllByText('Owned');
      // Should only be in button text if owned
      expect(badges.length).toBe(0);
    });

    it('should disable buy button when owned is true', () => {
      const item = createMockItem();
      render(<ItemCard item={item} onBuy={mockOnBuy} owned={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should enable buy button when owned is false', () => {
      const item = createMockItem();
      render(<ItemCard item={item} onBuy={mockOnBuy} owned={false} />);

      const button = screen.getByRole('button', { name: /buy/i });
      expect(button).not.toBeDisabled();
    });

    it('should change button text to "Owned" when owned is true', () => {
      const item = createMockItem();
      render(<ItemCard item={item} onBuy={mockOnBuy} owned={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Owned');
    });
  });

  describe('buy functionality', () => {
    it('should call onBuy when buy button is clicked', () => {
      const item = createMockItem();
      render(<ItemCard item={item} onBuy={mockOnBuy} />);

      const button = screen.getByRole('button', { name: /buy/i });
      fireEvent.click(button);

      expect(mockOnBuy).toHaveBeenCalledTimes(1);
      expect(mockOnBuy).toHaveBeenCalledWith(item);
    });

    it('should not call onBuy when item is owned', () => {
      const item = createMockItem();
      render(<ItemCard item={item} onBuy={mockOnBuy} owned={true} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnBuy).not.toHaveBeenCalled();
    });
  });

  describe('price formatting', () => {
    it('should format price with thousands separator', () => {
      const item = createMockItem({ price: 1000 });
      render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(screen.getByText('$1,000')).toBeInTheDocument();
    });

    it('should format large prices correctly', () => {
      const item = createMockItem({ price: 1000000 });
      render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });

    it('should format small prices correctly', () => {
      const item = createMockItem({ price: 50 });
      render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(screen.getByText('$50')).toBeInTheDocument();
    });
  });

  describe('description truncation', () => {
    it('should display short descriptions fully', () => {
      const item = createMockItem({ description: 'Short description' });
      render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(screen.getByText('Short description')).toBeInTheDocument();
    });

    it('should handle long descriptions with line-clamp', () => {
      const longDescription = 'A'.repeat(200);
      const item = createMockItem({ description: longDescription });
      const { container } = render(<ItemCard item={item} onBuy={mockOnBuy} />);

      // Check that the description container has line-clamp class
      const descElement = container.querySelector('.line-clamp-2');
      expect(descElement).toBeInTheDocument();
    });
  });

  describe('all item types', () => {
    it('should render clothing type with correct emoji', () => {
      const item = createMockItem({ type: 'clothing' });
      const { container } = render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(container.textContent).toContain('👔');
    });

    it('should render car type with correct emoji', () => {
      const item = createMockItem({ type: 'car' });
      const { container } = render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(container.textContent).toContain('🚗');
    });

    it('should render house type with correct emoji', () => {
      const item = createMockItem({ type: 'house' });
      const { container } = render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(container.textContent).toContain('🏠');
    });

    it('should render accessories type with correct emoji', () => {
      const item = createMockItem({ type: 'accessories' });
      const { container } = render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(container.textContent).toContain('💎');
    });
  });

  describe('integration scenarios', () => {
    it('should render legendary item with all features', () => {
      const item = createMockItem({
        name: 'Golden Car',
        type: 'car',
        rarity: 'legendary',
        price: 1000000,
        description: 'The most expensive car in the game',
      });
      render(<ItemCard item={item} onBuy={mockOnBuy} />);

      expect(screen.getByText('Golden Car')).toBeInTheDocument();
      expect(screen.getByText('Legendary')).toBeInTheDocument();
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(screen.getByText('The most expensive car in the game')).toBeInTheDocument();
    });

    it('should render owned epic item correctly', () => {
      const item = createMockItem({
        rarity: 'epic',
      });
      render(<ItemCard item={item} onBuy={mockOnBuy} owned={true} />);

      expect(screen.getByText('Epic')).toBeInTheDocument();
      expect(screen.getAllByText('Owned').length).toBeGreaterThan(0);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
