// Dashboard.jsx
function Dashboard({ onPlay }) {
  const games = [
    { id: 'roulette', title: 'Roulette', icon: '🎡', description: 'European roulette, place your bets', minBet: 10, isComingSoon: false },
    { id: 'slots',    title: 'Slots',    icon: '🎰', description: '5-reel machine · 10 paylines', minBet: 5, isComingSoon: false },
    { id: 'blackjack',title: 'Blackjack',icon: '🃏', description: 'Beat the dealer to 21', minBet: 20, isComingSoon: true },
    { id: 'craps',    title: 'Craps',    icon: '🎲', description: 'Dice table classic', minBet: 15, isComingSoon: true },
    { id: 'crash',    title: 'Crash',    icon: '📈', description: 'Cash out before it crashes', minBet: 10, isComingSoon: true },
    { id: 'hilo',     title: 'Hi-Lo',    icon: '🔼', description: 'Guess higher or lower', minBet: 5, isComingSoon: true },
    { id: 'wheel',    title: 'Wheel',    icon: '🎪', description: 'Fortune wheel multipliers', minBet: 10, isComingSoon: true },
    { id: 'poker',    title: 'Poker',    icon: '♠️', description: 'Texas hold\'em', minBet: 25, isComingSoon: true },
  ];
  const stats = [
    { icon: '🎮', label: 'Available games', value: '2', color: '#fff' },
    { icon: '⏰', label: 'Time played', value: '0h', color: '#fff' },
    { icon: '🏆', label: 'Total won', value: '$0', color: '#FBBF24' },
  ];
  return (
    <div className="p-6 md:p-8" style={{ minHeight: '100vh' }}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to <span style={{ color: '#DC2626' }}>Freezino</span>
        </h1>
        <p style={{ color: '#9CA3AF' }}>Play with virtual money · learn how fast it disappears</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl p-6 border"
               style={{ background: '#1F2937', borderColor: '#374151' }}>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{s.icon}</span>
              <div>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Casino Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map(g => (
            <GameCard key={g.id} {...g} onClick={() => onPlay(g.id)}/>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-6 text-center border"
           style={{ background: 'linear-gradient(90deg, rgba(220,38,38,.2), rgba(251,191,36,.2))',
                    borderColor: 'rgba(220,38,38,.3)' }}>
        <p className="text-white font-semibold mb-2">🎓 Educational purposes only</p>
        <p className="text-sm" style={{ color: '#D1D5DB' }}>
          No real money is used. This tool teaches you how quickly casinos take virtual dollars — so you protect your real ones.
        </p>
      </div>
    </div>
  );
}
window.Dashboard = Dashboard;
