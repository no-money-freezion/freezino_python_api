import { describe, it, expect } from 'vitest';

import GameCard from './GameCard';
import { render } from '../test/utils';

describe('GameCard Snapshots', () => {
  it('should match snapshot for regular game card', () => {
    const { container } = render(
      <GameCard
        title="Roulette"
        icon="🎰"
        description="Classic casino game"
        minBet={10}
        onClick={() => {}}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot for coming soon card', () => {
    const { container } = render(
      <GameCard
        title="Poker"
        icon="🃏"
        description="Coming soon"
        minBet={20}
        isComingSoon={true}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
