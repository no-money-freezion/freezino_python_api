import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

interface CrashResult {
  success: boolean;
  crash_point: number;
  player_cashout: number;
  bet_amount: number;
  win_amount: number;
  new_balance: number;
  won: boolean;
}

const Crash = () => {
  const { t } = useTranslation();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [cashoutAt, setCashoutAt] = useState<number>(2.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [crashed, setCrashed] = useState(false);
  const [result, setResult] = useState<CrashResult | null>(null);
  const [balance, setBalance] = useState<number>(1000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch user balance
    const fetchBalance = async () => {
      try {
        const response = await api.get('/user/balance');
        setBalance(response.data.data.balance);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };
    fetchBalance();
  }, []);

  const startGame = async () => {
    if (betAmount <= 0 || betAmount > balance) {
      alert(t('games.crash.insufficientBalance', 'Insufficient balance'));
      return;
    }

    if (cashoutAt < 1.0 || cashoutAt > 100.0) {
      alert(t('games.crash.invalidCashout', 'Cashout must be between 1.0x and 100.0x'));
      return;
    }

    setLoading(true);
    setIsPlaying(true);
    setCrashed(false);
    setResult(null);
    setCurrentMultiplier(1.0);

    try {
      // Get user_id from localStorage or auth context
      const userId = localStorage.getItem('user_id') || '1';

      const response = await api.post('/games/crash/bet', {
        user_id: parseInt(userId),
        bet_amount: betAmount,
        cashout_at: cashoutAt,
      });

      const data: CrashResult = response.data;

      // Animate the multiplier
      animateMultiplier(data.crash_point, data.won);

      setResult(data);
      setBalance(data.new_balance);
    } catch (error: unknown) {
      console.error('Failed to place bet:', error);
      alert((error as { response?: { data?: { message?: string } } }).response?.data?.message || t('games.crash.error', 'Failed to place bet'));
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  const animateMultiplier = (crashPoint: number, won: boolean) => {
    let current = 1.0;
    const targetMultiplier = won ? cashoutAt : crashPoint;
    const increment = 0.01;
    const interval = 50; // ms

    const timer = setInterval(() => {
      current += increment;
      setCurrentMultiplier(parseFloat(current.toFixed(2)));

      if (current >= targetMultiplier) {
        clearInterval(timer);
        setCurrentMultiplier(crashPoint);
        setCrashed(true);
        setTimeout(() => {
          setIsPlaying(false);
        }, 2000);
      }
    }, interval);
  };

  const getMultiplierColor = () => {
    if (crashed) return 'text-red-500';
    if (currentMultiplier >= cashoutAt) return 'text-green-500';
    return 'text-yellow-500';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-center mb-2">
            {t('games.crash.title', 'Crash')}
          </h1>
          <p className="text-gray-400 text-center">
            {t('games.crash.description', 'Cash out before the crash!')}
          </p>
        </div>

        {/* Balance */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 text-center">
          <span className="text-gray-400 mr-2">{t('games.balance', 'Balance')}:</span>
          <span className="text-2xl font-bold text-yellow-500">{formatCurrency(balance)}</span>
        </div>

        {/* Game Display */}
        <motion.div
          className={`bg-gradient-to-br ${
            crashed ? 'from-red-900 to-red-700' : 'from-gray-800 to-gray-900'
          } rounded-xl p-8 mb-6 border-2 ${
            crashed ? 'border-red-500' : 'border-gray-700'
          } transition-all duration-300`}
          animate={{
            scale: crashed ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            <div className={`text-8xl font-bold mb-4 ${getMultiplierColor()}`}>
              {currentMultiplier.toFixed(2)}x
            </div>
            {crashed && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-red-400"
              >
                {t('games.crash.crashed', 'CRASHED!')}
              </motion.div>
            )}
            {isPlaying && !crashed && (
              <div className="text-gray-400">
                {t('games.crash.cashingOutAt', 'Cashing out at')} {cashoutAt.toFixed(2)}x...
              </div>
            )}
          </div>
        </motion.div>

        {/* Result */}
        {result && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-4 mb-6 ${
              result.won ? 'bg-green-900/50 border-2 border-green-500' : 'bg-red-900/50 border-2 border-red-500'
            }`}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                {result.won ? t('games.won', 'You Won!') : t('games.lost', 'You Lost!')}
              </div>
              <div className="text-gray-300">
                {t('games.crash.crashedAt', 'Crashed at')}: {result.crash_point.toFixed(2)}x
              </div>
              <div className="text-gray-300">
                {t('games.crash.yourCashout', 'Your cashout')}: {result.player_cashout.toFixed(2)}x
              </div>
              <div className={`text-xl font-bold mt-2 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                {result.won ? '+' : '-'}{formatCurrency(Math.abs(result.win_amount - result.bet_amount))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Bet Amount */}
            <div>
              <label className="block text-gray-400 mb-2">
                {t('games.betAmount', 'Bet Amount')}
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                disabled={isPlaying}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50"
                min="1"
                step="1"
              />
            </div>

            {/* Cashout At */}
            <div>
              <label className="block text-gray-400 mb-2">
                {t('games.crash.cashoutAt', 'Cashout At (multiplier)')}
              </label>
              <input
                type="number"
                value={cashoutAt}
                onChange={(e) => setCashoutAt(parseFloat(e.target.value) || 1.0)}
                disabled={isPlaying}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50"
                min="1.0"
                max="100.0"
                step="0.1"
              />
            </div>
          </div>

          {/* Play Button */}
          <motion.button
            whileHover={{ scale: isPlaying ? 1 : 1.05 }}
            whileTap={{ scale: isPlaying ? 1 : 0.95 }}
            onClick={startGame}
            disabled={isPlaying || loading}
            className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
              isPlaying || loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600'
            }`}
          >
            {loading ? t('games.loading', 'Loading...') : isPlaying ? t('games.playing', 'Playing...') : t('games.play', 'Play')}
          </motion.button>
        </div>

        {/* Game Info */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-2">{t('games.crash.howToPlay', 'How to Play')}</h3>
          <ul className="text-gray-400 space-y-1 text-sm">
            <li>• {t('games.crash.rule1', 'Set your bet amount and desired cashout multiplier')}</li>
            <li>• {t('games.crash.rule2', 'The multiplier will increase from 1.00x')}</li>
            <li>• {t('games.crash.rule3', 'If the game crashes before your cashout, you lose')}</li>
            <li>• {t('games.crash.rule4', 'If you cash out before crash, you win bet × multiplier')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Crash;
