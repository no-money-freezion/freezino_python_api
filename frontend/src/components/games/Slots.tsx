import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useSound } from '../../hooks/useSound';
import api from '../../services/api';
import { WinConfetti } from '../animations';

// Paytable entry from API
interface PaytableEntry {
  symbol: string;
  three_of_kind: number;
  four_of_kind: number;
  five_of_kind: number;
}

// Bet options
const BET_OPTIONS = [10, 25, 50, 100, 250, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];

// Paylines - standard 10 paylines for 5-reel slots
// Each array represents row indices (0=top, 1=middle, 2=bottom) for each of the 5 reels
const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // Line 1: Middle horizontal
  [0, 0, 0, 0, 0], // Line 2: Top horizontal
  [2, 2, 2, 2, 2], // Line 3: Bottom horizontal
  [0, 1, 2, 1, 0], // Line 4: V shape
  [2, 1, 0, 1, 2], // Line 5: Inverted V
  [1, 0, 1, 0, 1], // Line 6: Zigzag
  [1, 2, 1, 2, 1], // Line 7: Reverse zigzag
  [0, 1, 0, 1, 0], // Line 8: W shape
  [2, 1, 2, 1, 2], // Line 9: M shape
  [0, 0, 1, 2, 2], // Line 10: Diagonal
];

interface WinningLine {
  line_number: number;
  symbol: string;
  count: number;
  multiplier: number;
  win: number;
}

interface SlotResult {
  reels: string[][];
  winning_line: WinningLine[];
  total_win: number;
  multiplier: number;
}

interface SlotsProps {
  userBalance: number;
  userId: number;
  onBalanceChange?: (newBalance: number) => void;
}

const Slots = ({ userBalance, userId, onBalanceChange }: SlotsProps) => {
  const { t } = useTranslation();
  const { playSound } = useSound();
  const [reels, setReels] = useState<string[][]>([
    ['🍒', '🍋', '🍊'],
    ['🍇', '💎', '⭐'],
    ['7️⃣', '🍒', '🍋'],
    ['🍊', '🍇', '💎'],
    ['⭐', '7️⃣', '🍒'],
  ]);
  const [spinning, setSpinning] = useState(false);
  const [selectedBet, setSelectedBet] = useState(BET_OPTIONS[0]);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [winningLines, setWinningLines] = useState<WinningLine[]>([]);
  const [showPaytable, setShowPaytable] = useState(false);
  const [paytable, setPaytable] = useState<PaytableEntry[]>([]);
  const [balance, setBalance] = useState(userBalance);
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const spinTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reelsContainerRef = useRef<HTMLDivElement>(null);
  const symbolRefs = useRef<(HTMLDivElement | null)[][][]>([]);

  // Initialize refs array
  useEffect(() => {
    symbolRefs.current = Array(5)
      .fill(null)
      .map(() =>
        Array(3)
          .fill(null)
          .map(() => [null])
      );
  }, []);

  useEffect(() => {
    console.log('[Slots] Setting balance from userBalance prop:', userBalance);
    setBalance(userBalance);
  }, [userBalance]);

  // Load paytable on mount
  useEffect(() => {
    const loadPaytable = async () => {
      try {
        const response = await api.get('/api/games/slots/payouts');
        if (response.data.success && response.data.data) {
          setPaytable(response.data.data);
          console.log('[Slots] Paytable loaded:', response.data.data);
        }
      } catch (error) {
        console.error('[Slots] Failed to load paytable:', error);
      }
    };
    loadPaytable();
  }, []);

  // Debug: log initial state
  useEffect(() => {
    console.log('[Slots] Component mounted. Initial userBalance:', userBalance, 'userId:', userId);
  }, []);

  // Generate random symbols for animation
  const generateRandomSymbols = () => {
    const symbols = paytable.length > 0
      ? paytable.map(entry => entry.symbol)
      : ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '7️⃣']; // Fallback
    return Array(3)
      .fill(0)
      .map(() => symbols[Math.floor(Math.random() * symbols.length)]);
  };

  // Spin animation
  const animateReels = (finalReels: string[][]) => {
    setSpinning(true);
    setWinAmount(0);
    setWinningLines([]);
    setMessage('');

    // Play spin sound
    playSound('slot-spin', 0.5);

    // Clear any existing timeouts
    spinTimeouts.current.forEach(timeout => clearTimeout(timeout));
    spinTimeouts.current = [];

    // Animate each reel
    reels.forEach((_, index) => {
      let spinCount = 0;
      const maxSpins = 20 + index * 5; // Each reel spins longer

      const spinInterval = setInterval(() => {
        setReels(prevReels => {
          const newReels = [...prevReels];
          newReels[index] = generateRandomSymbols();
          return newReels;
        });

        spinCount++;

        if (spinCount >= maxSpins) {
          clearInterval(spinInterval);
          setReels(prevReels => {
            const newReels = [...prevReels];
            newReels[index] = finalReels[index];
            return newReels;
          });

          // Play stop sound for each reel
          playSound('slot-stop', 0.4);

          // If this is the last reel, stop spinning
          if (index === reels.length - 1) {
            const timeout = setTimeout(() => {
              setSpinning(false);
            }, 300);
            spinTimeouts.current.push(timeout);
          }
        }
      }, 50);
    });
  };

  // Handle spin
  const handleSpin = async () => {
    if (spinning) return;
    if (balance < selectedBet) {
      setMessage(t('slots.insufficientBalance') || 'Insufficient balance!');
      return;
    }

    try {
      const response = await api.post(
        `/games/slots/spin?user_id=${userId}`,
        { bet: selectedBet }
      );

      if (response.data.success) {
        const result: SlotResult = response.data.data.result;
        const newBalance = response.data.data.new_balance;

        // Animate reels with final result
        animateReels(result.reels);

        // Update balance and results after animation
        setTimeout(() => {
          setBalance(newBalance);
          setWinAmount(result.total_win);
          setWinningLines(result.winning_line || []);

          if (onBalanceChange) {
            onBalanceChange(newBalance);
          }

          // Play win or lose sound
          if (result.total_win > 0) {
            playSound('win', 0.6);
            setMessage(
              t('slots.youWon', { amount: result.total_win.toFixed(2) }) ||
                `You won $${result.total_win.toFixed(2)}!`
            );
            setShowConfetti(true);
          } else {
            playSound('lose', 0.4);
            setMessage(t('slots.tryAgain') || 'Try again!');
          }
        }, (reels.length + 1) * 300);
      }
    } catch (error: unknown) {
      console.error('Spin error:', error);
      setMessage(
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
          t('slots.error') ||
          'An error occurred'
      );
      setSpinning(false);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      spinTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Check if a symbol at a specific position is part of a winning line
  const isWinningSymbol = (reelIndex: number, symbolIndex: number): boolean => {
    return winningLines.some(line => {
      const payline = PAYLINES[line.line_number - 1];
      if (!payline) return false;

      // Check if this reel is part of the winning combination
      if (reelIndex >= line.count) return false;

      // Check if the symbol position matches the payline pattern
      return payline[reelIndex] === symbolIndex;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-4">
            🎰 {t('slots.title') || 'Slot Machine'}
          </h1>
          <div className="flex justify-center items-center gap-8 text-white">
            <div className="text-xl">
              <span className="text-gray-400">{t('slots.balance') || 'Balance'}:</span>{' '}
              <span className="font-bold text-green-400">${balance.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowPaytable(!showPaytable)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              {showPaytable
                ? t('slots.hidePaytable') || 'Hide Paytable'
                : t('slots.showPaytable') || 'Show Paytable'}
            </button>
          </div>
        </motion.div>

        {/* Paytable */}
        <AnimatePresence>
          {showPaytable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30"
            >
              <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
                {t('slots.paytable') || 'Paytable'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paytable.map((entry) => (
                  <div
                    key={entry.symbol}
                    className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="text-4xl text-center mb-2">{entry.symbol}</div>
                    <div className="text-white text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>5x:</span>
                        <span className="text-yellow-400 font-bold">{entry.five_of_kind}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>4x:</span>
                        <span className="text-yellow-400 font-bold">{entry.four_of_kind}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3x:</span>
                        <span className="text-yellow-400 font-bold">{entry.three_of_kind}x</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-gray-400 text-sm">
                {t('slots.paytableInfo') ||
                  'Win by matching 3+ symbols on any of the 10 paylines'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slot Machine */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-b from-red-900 to-red-700 rounded-3xl p-8 shadow-2xl border-8 border-yellow-600"
        >
          {/* Reels */}
          <div className="bg-black/50 rounded-2xl p-6 mb-6 relative">
            {/* SVG overlay for winning lines */}
            {!spinning && winningLines.length > 0 && (
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              >
                {winningLines.map((line, lineIdx) => {
                  const payline = PAYLINES[line.line_number - 1];
                  if (!payline) return null;

                  // Get the SVG container position
                  const svgContainer = reelsContainerRef.current?.parentElement;
                  if (!svgContainer) return null;
                  const svgRect = svgContainer.getBoundingClientRect();

                  // Calculate path through winning symbols using actual element positions
                  const points: { x: number; y: number }[] = [];

                  for (let i = 0; i < line.count; i++) {
                    const symbolRow = payline[i];
                    const symbolEl = symbolRefs.current[i]?.[symbolRow]?.[0];

                    if (!symbolEl) continue;

                    // Get the symbol's position relative to the viewport
                    const symbolRect = symbolEl.getBoundingClientRect();

                    // Calculate center of symbol relative to SVG container
                    const x = symbolRect.left - svgRect.left + symbolRect.width / 2;
                    const y = symbolRect.top - svgRect.top + symbolRect.height / 2;

                    points.push({ x, y });
                  }

                  if (points.length === 0) return null;

                  const pathData = points
                    .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
                    .join(' ');

                  return (
                    <motion.path
                      key={lineIdx}
                      d={pathData}
                      stroke="#eab308"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: [0, 1, 1, 0],
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: lineIdx * 0.3,
                      }}
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.8))',
                      }}
                    />
                  );
                })}
              </svg>
            )}

            <div className="flex justify-center gap-4" ref={reelsContainerRef}>
              {reels.map((reel, reelIndex) => (
                <div
                  key={reelIndex}
                  className="bg-white/10 rounded-xl p-2 border-4 border-yellow-500/50"
                >
                  <div className="flex flex-col gap-2">
                    {reel.map((symbol, symbolIndex) => {
                      const isWinning = !spinning && isWinningSymbol(reelIndex, symbolIndex);
                      return (
                        <motion.div
                          key={`${reelIndex}-${symbolIndex}`}
                          ref={(el) => {
                            if (!symbolRefs.current[reelIndex]) {
                              symbolRefs.current[reelIndex] = [];
                            }
                            if (!symbolRefs.current[reelIndex][symbolIndex]) {
                              symbolRefs.current[reelIndex][symbolIndex] = [];
                            }
                            symbolRefs.current[reelIndex][symbolIndex][0] = el;
                          }}
                          animate={
                            spinning
                              ? { y: [0, -10, 0] }
                              : isWinning
                              ? {
                                  scale: [1, 1.1, 1],
                                  boxShadow: [
                                    '0 0 0px rgba(234, 179, 8, 0)',
                                    '0 0 20px rgba(234, 179, 8, 0.8)',
                                    '0 0 0px rgba(234, 179, 8, 0)',
                                  ],
                                }
                              : { y: 0 }
                          }
                          transition={{
                            duration: spinning ? 0.1 : 1,
                            repeat: spinning ? Infinity : isWinning ? Infinity : 0,
                          }}
                          className={`text-6xl w-20 h-20 flex items-center justify-center rounded-lg transition-all ${
                            symbolIndex === 1 ? 'bg-yellow-500/20' : ''
                          } ${
                            isWinning
                              ? 'bg-yellow-500/40 border-4 border-yellow-400 shadow-lg shadow-yellow-400/50'
                              : ''
                          }`}
                        >
                          {symbol}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Win Display */}
          <AnimatePresence>
            {winAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-center mb-4"
              >
                <div className="text-4xl font-bold text-yellow-400 mb-2">
                  🎉 {t('slots.win') || 'WIN'}: ${winAmount.toFixed(2)} 🎉
                </div>
                {winningLines.map((line, index) => (
                  <div key={index} className="text-white text-sm">
                    {t('slots.line') || 'Line'} {line.line_number}: {line.symbol} x{line.count} ={' '}
                    {line.multiplier}x (${line.win.toFixed(2)})
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message */}
          {message && (
            <div
              className={`text-center mb-4 text-lg font-semibold ${
                winAmount > 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {message}
            </div>
          )}

          {/* Bet Selection */}
          <div className="mb-6">
            <div className="text-white text-center mb-3 text-lg font-semibold">
              {t('slots.selectBet') || 'Select Bet'}
            </div>
            <div className="flex justify-center gap-2 flex-wrap">
              {BET_OPTIONS.map(bet => (
                <button
                  key={bet}
                  onClick={() => setSelectedBet(bet)}
                  disabled={spinning}
                  className={`px-6 py-3 rounded-lg font-bold transition-all ${
                    selectedBet === bet
                      ? 'bg-yellow-500 text-black scale-110'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  } ${spinning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  ${bet}
                </button>
              ))}
              {/* All In Button */}
              <button
                onClick={() => setSelectedBet(balance)}
                disabled={spinning || balance <= 0}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  selectedBet === balance
                    ? 'bg-red-500 text-white scale-110'
                    : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600'
                } ${spinning || balance <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                🎰 ALL IN
              </button>
            </div>
          </div>

          {/* Spin Button */}
          <div className="text-center">
            <motion.button
              whileHover={!spinning ? { scale: 1.05 } : {}}
              whileTap={!spinning ? { scale: 0.95 } : {}}
              onClick={handleSpin}
              disabled={spinning || balance < selectedBet}
              className={`px-16 py-6 rounded-2xl text-3xl font-bold transition-all shadow-lg ${
                spinning || balance < selectedBet
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/50'
              }`}
            >
              {spinning ? '🎰 ' + (t('slots.spinning') || 'SPINNING...') : '🎰 ' + (t('slots.spin') || 'SPIN')}
            </motion.button>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-gray-400 text-sm"
        >
          <p>{t('slots.info') || '10 paylines • Match 3+ symbols to win • Higher bets = higher wins'}</p>
        </motion.div>
      </div>

      {/* Win Confetti */}
      <WinConfetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
};

export default Slots;
