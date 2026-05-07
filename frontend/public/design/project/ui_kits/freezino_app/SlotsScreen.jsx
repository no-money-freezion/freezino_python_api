// SlotsScreen.jsx
const SYMBOLS = ['🍒','🍋','🍊','🍇','💎','⭐','7️⃣'];
const BET_OPTS = [10, 25, 50, 100, 500, 1000];
const randSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
const randReel = () => [randSymbol(), randSymbol(), randSymbol()];

function SlotsScreen({ balance, onBalanceChange }) {
  const [reels, setReels] = React.useState([
    ['🍒','🍋','🍊'],['🍇','💎','⭐'],['7️⃣','🍒','🍋'],['🍊','🍇','💎'],['⭐','7️⃣','🍒'],
  ]);
  const [bet, setBet] = React.useState(10);
  const [spinning, setSpinning] = React.useState(false);
  const [winAmount, setWinAmount] = React.useState(0);
  const [message, setMessage] = React.useState('');

  const spin = () => {
    if (spinning || balance < bet) return;
    setSpinning(true); setWinAmount(0); setMessage('');
    const final = [randReel(), randReel(), randReel(), randReel(), randReel()];
    const mid = final.map(r => r[1]);
    const allSame = mid.every(s => s === mid[0]);
    const threeSame = mid[0] === mid[1] && mid[1] === mid[2];

    // animate
    let ticks = 0;
    const id = setInterval(() => {
      setReels([randReel(), randReel(), randReel(), randReel(), randReel()]);
      ticks++;
      if (ticks >= 14) {
        clearInterval(id);
        setReels(final);
        const win = allSame ? bet * 50 : threeSame ? bet * 5 : 0;
        setWinAmount(win);
        setMessage(win > 0 ? `You won $${win}!` : 'Try again!');
        onBalanceChange(balance - bet + win);
        setSpinning(false);
      }
    }, 80);
  };

  return (
    <div className="p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #111827, #581C87, #111827)', minHeight: '100vh' }}>
      <div className="mx-auto" style={{ maxWidth: 960 }}>
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 brand-gradient"
              style={{ backgroundImage: 'linear-gradient(90deg, #FACC15, #DC2626, #EC4899)',
                       WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            🎰 Slot Machine
          </h1>
          <div className="text-xl text-white">
            Balance: <span className="font-bold" style={{ color: '#10B981' }}>${balance.toLocaleString()}</span>
          </div>
        </div>
        <div className="rounded-3xl p-8 shadow-2xl"
             style={{ background: 'linear-gradient(180deg, #7F1D1D, #991B1B)', border: '8px solid #D97706' }}>
          <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="flex justify-center gap-3">
              {reels.map((reel, ri) => (
                <div key={ri} className="rounded-xl p-2"
                     style={{ background: 'rgba(255,255,255,0.1)', border: '4px solid rgba(234,179,8,0.5)' }}>
                  <div className="flex flex-col gap-2">
                    {reel.map((s, si) => (
                      <div key={si}
                           className="w-20 h-20 flex items-center justify-center rounded-lg"
                           style={{
                             fontSize: 48,
                             background: si === 1 ? 'rgba(234,179,8,0.2)' : 'transparent',
                             transform: spinning ? `translateY(${Math.random()*4-2}px)` : 'none',
                             transition: 'transform 0.1s',
                           }}>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {winAmount > 0 && (
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-2" style={{ color: '#FBBF24' }}>
                🎉 WIN: ${winAmount} 🎉
              </div>
            </div>
          )}
          {message && (
            <div className="text-center mb-4 text-lg font-semibold"
                 style={{ color: winAmount > 0 ? '#10B981' : '#EF4444' }}>
              {message}
            </div>
          )}
          <div className="mb-6">
            <div className="text-white text-center mb-3 text-lg font-semibold">Select Bet</div>
            <div className="flex justify-center gap-2 flex-wrap">
              {BET_OPTS.map(v => (
                <button key={v} onClick={() => setBet(v)} disabled={spinning}
                        className="px-6 py-3 rounded-lg font-bold transition-all"
                        style={{
                          background: bet === v ? '#EAB308' : '#374151',
                          color: bet === v ? '#000' : '#fff',
                          transform: bet === v ? 'scale(1.1)' : 'none',
                          opacity: spinning ? 0.5 : 1,
                        }}>
                  ${v}
                </button>
              ))}
              <button onClick={() => setBet(balance)} disabled={spinning || balance <= 0}
                      className="px-6 py-3 rounded-lg font-bold text-white"
                      style={{ background: 'linear-gradient(90deg, #DC2626, #B91C1C)' }}>🎰 ALL IN</button>
            </div>
          </div>
          <div className="text-center">
            <button onClick={spin} disabled={spinning || balance < bet}
                    className="px-16 py-6 rounded-2xl text-3xl font-bold text-white shadow-lg transition-all"
                    style={{
                      background: spinning || balance < bet ? '#4B5563'
                        : 'linear-gradient(90deg, #10B981, #059669)',
                      opacity: spinning || balance < bet ? 0.7 : 1,
                      boxShadow: spinning || balance < bet ? 'none' : '0 10px 25px rgba(16,185,129,0.5)',
                    }}>
              {spinning ? '🎰 SPINNING…' : '🎰 SPIN'}
            </button>
          </div>
        </div>
        <div className="mt-6 text-center text-sm" style={{ color: '#9CA3AF' }}>
          10 paylines · Match 3+ symbols to win · Higher bets = higher wins
        </div>
      </div>
    </div>
  );
}
window.SlotsScreen = SlotsScreen;
