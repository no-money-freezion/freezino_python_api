// RouletteScreen.jsx
const WHEEL_NUMBERS = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const colorOf = n => n === 0 ? 'green' : (RED_NUMBERS.includes(n) ? 'red' : 'black');
const bgOf = n => colorOf(n) === 'red' ? '#DC2626' : colorOf(n) === 'green' ? '#16A34A' : '#111827';

function RouletteScreen({ balance, onBalanceChange }) {
  const [chip, setChip] = React.useState(10);
  const [bets, setBets] = React.useState([]);
  const [spinning, setSpinning] = React.useState(false);
  const [recent, setRecent] = React.useState([17, 0, 32, 8, 11, 26, 3]);
  const [result, setResult] = React.useState(null);
  const [rotation, setRotation] = React.useState(0);

  const chipValues = [10, 25, 50, 100, 500, 1000];
  const totalBet = bets.reduce((s,b) => s + b.amount, 0);

  const addBet = (type, value) => {
    if (totalBet + chip > balance) return;
    setBets([...bets, { type, amount: chip, value }]);
  };
  const clear = () => { setBets([]); setResult(null); };
  const spin = () => {
    if (bets.length === 0) return;
    setSpinning(true); setResult(null);
    const winNum = WHEEL_NUMBERS[Math.floor(Math.random() * WHEEL_NUMBERS.length)];
    const idx = WHEEL_NUMBERS.indexOf(winNum);
    setRotation(rotation + 360 * 5 + idx * (360 / WHEEL_NUMBERS.length));
    setTimeout(() => {
      const won = bets.some(b =>
        (b.type === 'red' && colorOf(winNum) === 'red') ||
        (b.type === 'black' && colorOf(winNum) === 'black') ||
        (b.type === 'straight' && b.value === winNum)
      );
      const payout = won ? totalBet * 2 : 0;
      setResult({ number: winNum, total_win: payout, profit: payout - totalBet, total_bet: totalBet });
      onBalanceChange(balance - totalBet + payout);
      setRecent([winNum, ...recent].slice(0, 10));
      setSpinning(false); setBets([]);
    }, 3500);
  };

  return (
    <div className="p-4 md:p-6" style={{ background: '#111827', minHeight: '100vh' }}>
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white">Roulette</h1>
          <div className="text-white text-xl">Balance: <span style={{ color: '#FBBF24', fontWeight: 700 }}>${balance.toLocaleString()}</span></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="rounded-lg p-6" style={{ background: '#1F2937' }}>
              <h2 className="text-xl font-bold text-white mb-4 text-center">Wheel</h2>
              <div className="relative mx-auto" style={{ width: 256, height: 256 }}>
                <div className="w-full h-full rounded-full relative overflow-hidden"
                     style={{
                       border: '8px solid #D97706',
                       background: 'radial-gradient(circle, #D97706, #78350F)',
                       transform: `rotate(${rotation}deg)`,
                       transition: 'transform 3.5s cubic-bezier(0.17, 0.67, 0.22, 1)',
                     }}>
                  {WHEEL_NUMBERS.map((n, i) => {
                    const angle = (360 / WHEEL_NUMBERS.length) * i;
                    return (
                      <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${angle}deg)` }}>
                        <div className="absolute top-1 left-1/2 w-7 h-7 flex items-center justify-center rounded text-white text-xs font-bold"
                             style={{ transform: 'translateX(-50%)', background: bgOf(n) }}>
                          {n}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full border-2"
                     style={{ transform: 'translate(-50%, -50%)', background: '#fff', borderColor: '#D1D5DB' }}/>
              </div>
              {result && (
                <div className="mt-4 text-center">
                  <div className="inline-block px-6 py-3 rounded-lg text-3xl font-bold text-white"
                       style={{ background: bgOf(result.number) }}>
                    {result.number}
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-lg p-4" style={{ background: '#1F2937' }}>
              <h3 className="text-lg font-bold text-white mb-3">Recent</h3>
              <div className="flex flex-wrap gap-2">
                {recent.map((n,i) => (
                  <div key={i} className="w-10 h-10 flex items-center justify-center rounded-full text-white font-bold"
                       style={{ background: bgOf(n) }}>{n}</div>
                ))}
              </div>
            </div>
            {result && (
              <div className="rounded-lg p-4 border-2"
                   style={{ background: '#1F2937', borderColor: result.profit > 0 ? '#10B981' : '#DC2626' }}>
                <h3 className="text-lg font-bold text-white mb-2">{result.profit > 0 ? 'You won!' : 'You lost'}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between" style={{ color: '#D1D5DB' }}><span>Total bet:</span><span>${result.total_bet}</span></div>
                  <div className="flex justify-between" style={{ color: '#D1D5DB' }}><span>Total win:</span><span>${result.total_win}</span></div>
                  <div className="flex justify-between font-bold" style={{ color: result.profit > 0 ? '#10B981' : '#EF4444' }}>
                    <span>Profit:</span><span>${result.profit}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-lg p-6" style={{ background: '#1F2937' }}>
              <h2 className="text-xl font-bold text-white mb-4">Betting board</h2>
              <div className="flex gap-2 mb-4 flex-wrap">
                {chipValues.map(v => (
                  <button key={v} onClick={() => setChip(v)}
                          className="px-4 py-2 rounded-full font-bold transition-all"
                          style={{
                            background: chip === v ? '#FBBF24' : '#374151',
                            color: chip === v ? '#1F2937' : '#fff',
                            transform: chip === v ? 'scale(1.1)' : 'none',
                          }}>
                    ${v}
                  </button>
                ))}
                <button onClick={() => setChip(balance)}
                        className="px-4 py-2 rounded-full font-bold text-white"
                        style={{ background: 'linear-gradient(90deg, #DC2626, #B91C1C)' }}>🎰 ALL IN</button>
              </div>
              <div className="flex gap-1 mb-3">
                <button onClick={() => addBet('straight', 0)} disabled={spinning}
                        className="w-12 h-36 text-white font-bold rounded flex-shrink-0"
                        style={{ background: '#16A34A' }}>0</button>
                <div className="grid grid-cols-12 gap-1 flex-1">
                  {[...Array(36)].map((_, i) => {
                    const n = i + 1;
                    return (
                      <button key={n} onClick={() => addBet('straight', n)} disabled={spinning}
                              className="text-white font-bold py-2 rounded text-sm"
                              style={{ background: colorOf(n) === 'red' ? '#DC2626' : '#111827' }}>
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-6 gap-2 mb-3">
                <button onClick={() => addBet('low')} disabled={spinning} className="text-white font-bold py-3 rounded" style={{ background: '#374151' }}>1-18</button>
                <button onClick={() => addBet('even')} disabled={spinning} className="text-white font-bold py-3 rounded" style={{ background: '#374151' }}>Even</button>
                <button onClick={() => addBet('red')} disabled={spinning} className="text-white font-bold py-3 rounded" style={{ background: '#DC2626' }}>Red</button>
                <button onClick={() => addBet('black')} disabled={spinning} className="text-white font-bold py-3 rounded" style={{ background: '#111827' }}>Black</button>
                <button onClick={() => addBet('odd')} disabled={spinning} className="text-white font-bold py-3 rounded" style={{ background: '#374151' }}>Odd</button>
                <button onClick={() => addBet('high')} disabled={spinning} className="text-white font-bold py-3 rounded" style={{ background: '#374151' }}>19-36</button>
              </div>
              <div className="space-y-3 mt-6">
                <div className="rounded-lg p-4" style={{ background: '#374151' }}>
                  <div className="flex justify-between text-white mb-1"><span>Active bets:</span><span className="font-bold">{bets.length}</span></div>
                  <div className="flex justify-between text-white text-lg font-bold"><span>Total bet:</span><span style={{ color: '#FBBF24' }}>${totalBet}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={clear} disabled={spinning || bets.length === 0}
                          className="text-white font-bold py-3 rounded"
                          style={{ background: '#DC2626', opacity: (spinning || bets.length === 0) ? 0.5 : 1 }}>Clear</button>
                  <button onClick={spin} disabled={spinning || bets.length === 0}
                          className="text-white font-bold py-3 rounded"
                          style={{ background: '#16A34A', opacity: (spinning || bets.length === 0) ? 0.5 : 1 }}>
                    {spinning ? 'Spinning…' : 'Spin'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.RouletteScreen = RouletteScreen;
