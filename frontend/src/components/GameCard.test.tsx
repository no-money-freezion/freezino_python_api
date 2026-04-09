import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import GameCard from './GameCard';
import { render, screen } from '../test/utils';

describe('GameCard', () => {
  const defaultProps = {
    title: 'Roulette',
    icon: '🎰',
    description: 'Classic casino game',
    minBet: 10,
    onClick: vi.fn(),
  };

  it('renders game card with all props', () => {
    render(<GameCard {...defaultProps} />);

    expect(screen.getByText('Roulette')).toBeInTheDocument();
    expect(screen.getByText('🎰')).toBeInTheDocument();
    expect(screen.getByText('Classic casino game')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<GameCard {...defaultProps} onClick={onClick} />);

    const card = screen.getByText('Roulette').closest('div')?.parentElement;
    if (card) {
      await user.click(card);
      expect(onClick).toHaveBeenCalledTimes(1);
    }
  });

  it('shows "Coming Soon" badge when isComingSoon is true', () => {
    render(<GameCard {...defaultProps} isComingSoon={true} />);

    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it('does not call onClick when coming soon', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<GameCard {...defaultProps} isComingSoon={true} onClick={onClick} />);

    const card = screen.getByText('Roulette').closest('div')?.parentElement;
    if (card) {
      await user.click(card);
      expect(onClick).not.toHaveBeenCalled();
    }
  });

  it('displays min bet amount', () => {
    render(<GameCard {...defaultProps} minBet={50} />);

    expect(screen.getByText(/minimum bet/i)).toBeInTheDocument();
  });

  it('hides min bet when coming soon', () => {
    render(<GameCard {...defaultProps} isComingSoon={true} />);

    expect(screen.queryByText(/minimum bet/i)).not.toBeInTheDocument();
  });
});
