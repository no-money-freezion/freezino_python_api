import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useSound } from '../../hooks/useSound';
import api from '../../services/api';
import type { RouletteBet, RouletteResult } from '../../types';
import { formatCurrency } from '../../utils/formatters';

// Roulette wheel numbers in order
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

// Red numbers
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Get number color
const getNumberColor = (num: number): string => {
  if (num === 0) return 'green';
  return RED_NUMBERS.includes(num) ? 'red' : 'black';
};

interface RouletteProps {
  userId: number;
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

const Roulette = ({ userId, balance, onBalanceUpdate }: RouletteProps) => {
  const { t } = useTranslation();
  const { playSound } = useSound();
  const [bets, setBets] = useState<RouletteBet[]>([]);
  const [currentChip, setCurrentChip] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<RouletteResult | null>(null);
  const [recentNumbers, setRecentNumbers] = useState<number[]>([]);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const chipValues = [10, 25, 50, 100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];

  // Fetch recent numbers on mount
  useEffect(() => {
    fetchRecentNumbers();
  }, []);

  const fetchRecentNumbers = async () => {
    try {
      const response = await api.get('/games/roulette/recent?limit=10');
      if (response.data.success) {
        setRecentNumbers(response.data.data.numbers);
      }
    } catch (error) {
      console.error('Failed to fetch recent numbers:', error);
    }
  };

  const getTotalBet = () => {
    return bets.reduce((sum, bet) => sum + bet.amount, 0);
  };

  const addBet = (type: RouletteBet['type'], value?: number) => {
    if (getTotalBet() + currentChip > balance) {
      alert(t('roulette.insufficientBalance'));
      return;
    }

    const newBet: RouletteBet = {
      type,
      amount: currentChip,
      ...(value !== undefined && { value }),
    };

    playSound('click', 0.4);
    setBets([...bets, newBet]);
  };

  const clearBets = () => {
    playSound('click', 0.4);
    setBets([]);
    setResult(null);
  };

  const placeBet = async () => {
    if (bets.length === 0) {
      alert(t('roulette.noBets'));
      return;
    }

    if (getTotalBet() > balance) {
      alert(t('roulette.insufficientBalance'));
      return;
    }

    setIsSpinning(true);
    setResult(null);
    playSound('roulette-spin', 0.5);

    try {
      const response = await api.post(`/games/roulette/bet?user_id=${userId}`, {
        bets,
      });

      if (response.data.success) {
        const gameResult: RouletteResult = response.data.data;

        // Calculate spin rotation
        const numberIndex = WHEEL_NUMBERS.indexOf(gameResult.number);
        const degreePerSlot = 360 / WHEEL_NUMBERS.length;
        const targetRotation = 360 * 5 + numberIndex * degreePerSlot; // 5 full spins + target

        setRotation(rotation + targetRotation);
        setWinningNumber(gameResult.number);

        // Wait for animation
        setTimeout(() => {
          setResult(gameResult);
          setIsSpinning(false);
          onBalanceUpdate(gameResult.new_balance);
          fetchRecentNumbers();
          setBets([]);

          // Play win or lose sound
          if (gameResult.total_win > 0) {
            playSound('win', 0.6);
          } else {
            playSound('lose', 0.4);
          }
        }, 4000);
      }
    } catch (error: unknown) {
      console.error('Failed to place bet:', error);
      alert((error as { response?: { data?: { message?: string } } }).response?.data?.message || t('roulette.betFailed'));
      setIsSpinning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white">
            {t('games.roulette.title')}
          </h1>
          <div className="text-white text-xl">
            {t('common.balance')}: {formatCurrency(balance)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Wheel & Recent Numbers */}
          <div className="lg:col-span-1 space-y-4">
            {/* Roulette Wheel */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 text-center">
                {t('roulette.wheel')}
              </h2>
              <div className="relative w-64 h-64 mx-auto">
                <motion.div
                  className="w-full h-full rounded-full border-8 border-yellow-600 bg-gradient-to-br from-yellow-700 to-yellow-900 relative overflow-hidden"
                  animate={{ rotate: rotation }}
                  transition={{ duration: 4, ease: 'easeOut' }}
                >
                  {WHEEL_NUMBERS.map((num, index) => {
                    const angle = (360 / WHEEL_NUMBERS.length) * index;
                    const color = getNumberColor(num);
                    return (
                      <div
                        key={index}
                        className="absolute w-full h-full"
                        style={{
                          transform: `rotate(${angle}deg)`,
                        }}
                      >
                        <div
                          className={`absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center rounded-sm text-white text-xs font-bold ${
                            color === 'red'
                              ? 'bg-red-600'
                              : color === 'black'
                              ? 'bg-gray-900'
                              : 'bg-green-600'
                          }`}
                        >
                          {num}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
                {/* Ball indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-gray-300" />
              </div>

              {winningNumber !== null && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-4 text-center"
                >
                  <div
                    className={`inline-block px-6 py-3 rounded-lg text-3xl font-bold text-white ${
                      getNumberColor(winningNumber) === 'red'
                        ? 'bg-red-600'
                        : getNumberColor(winningNumber) === 'black'
                        ? 'bg-gray-900'
                        : 'bg-green-600'
                    }`}
                  >
                    {winningNumber}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Recent Numbers */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-3">
                {t('roulette.recentNumbers')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentNumbers.map((num, index) => {
                  const color = getNumberColor(num);
                  return (
                    <div
                      key={index}
                      className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${
                        color === 'red'
                          ? 'bg-red-600'
                          : color === 'black'
                          ? 'bg-gray-900'
                          : 'bg-green-600'
                      }`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Result Display */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`bg-gray-800 rounded-lg p-4 border-2 ${
                    result.profit > 0 ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <h3 className="text-lg font-bold text-white mb-2">
                    {result.profit > 0 ? t('roulette.win') : t('roulette.lose')}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>{t('roulette.totalBet')}:</span>
                      <span>{formatCurrency(result.total_bet)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>{t('roulette.totalWin')}:</span>
                      <span>{formatCurrency(result.total_win)}</span>
                    </div>
                    <div
                      className={`flex justify-between font-bold ${
                        result.profit > 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      <span>{t('roulette.profit')}:</span>
                      <span>{formatCurrency(result.profit)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Betting Board */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {t('roulette.bettingBoard')}
              </h2>

              {/* Chip Selector */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {chipValues.map((value) => (
                  <button
                    key={value}
                    onClick={() => setCurrentChip(value)}
                    className={`px-4 py-2 rounded-full font-bold transition-all ${
                      currentChip === value
                        ? 'bg-yellow-500 text-gray-900 scale-110'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {formatCurrency(value)}
                  </button>
                ))}
                {/* All In Button */}
                <button
                  onClick={() => setCurrentChip(balance)}
                  disabled={balance <= 0}
                  className={`px-4 py-2 rounded-full font-bold transition-all ${
                    currentChip === balance
                      ? 'bg-red-500 text-white scale-110'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600'
                  } ${balance <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  🎰 ALL IN
                </button>
              </div>

              {/* Betting Grid */}
              <div className="space-y-4">
                {/* Numbers Grid */}
                <div className="flex gap-1">
                  {/* 0 */}
                  <button
                    onClick={() => addBet('straight', 0)}
                    disabled={isSpinning}
                    className="w-12 h-36 bg-green-600 hover:bg-green-500 text-white font-bold rounded disabled:opacity-50 flex-shrink-0"
                  >
                    0
                  </button>

                  {/* Numbers 1-36 */}
                  <div className="grid grid-cols-12 gap-1 flex-1">
                    {[...Array(36)].map((_, index) => {
                      const num = index + 1;
                      const color = getNumberColor(num);
                      return (
                        <button
                          key={num}
                          onClick={() => addBet('straight', num)}
                          disabled={isSpinning}
                          className={`${
                            color === 'red'
                              ? 'bg-red-600 hover:bg-red-500'
                              : 'bg-gray-900 hover:bg-gray-800'
                          } text-white font-bold py-2 px-1 rounded disabled:opacity-50 text-sm`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Outside Bets */}
                <div className="grid grid-cols-6 gap-2">
                  <button
                    onClick={() => addBet('low')}
                    disabled={isSpinning}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded disabled:opacity-50"
                  >
                    1-18
                  </button>
                  <button
                    onClick={() => addBet('even')}
                    disabled={isSpinning}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded disabled:opacity-50"
                  >
                    {t('roulette.even')}
                  </button>
                  <button
                    onClick={() => addBet('red')}
                    disabled={isSpinning}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded disabled:opacity-50"
                  >
                    {t('roulette.red')}
                  </button>
                  <button
                    onClick={() => addBet('black')}
                    disabled={isSpinning}
                    className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded disabled:opacity-50"
                  >
                    {t('roulette.black')}
                  </button>
                  <button
                    onClick={() => addBet('odd')}
                    disabled={isSpinning}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded disabled:opacity-50"
                  >
                    {t('roulette.odd')}
                  </button>
                  <button
                    onClick={() => addBet('high')}
                    disabled={isSpinning}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded disabled:opacity-50"
                  >
                    19-36
                  </button>
                </div>

                {/* Dozens */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => addBet('dozen', 1)}
                    disabled={isSpinning}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded disabled:opacity-50"
                  >
                    1st 12
                  </button>
                  <button
                    onClick={() => addBet('dozen', 2)}
                    disabled={isSpinning}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded disabled:opacity-50"
                  >
                    2nd 12
                  </button>
                  <button
                    onClick={() => addBet('dozen', 3)}
                    disabled={isSpinning}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded disabled:opacity-50"
                  >
                    3rd 12
                  </button>
                </div>
              </div>

              {/* Bet Summary & Actions */}
              <div className="mt-6 space-y-3">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between text-white mb-2">
                    <span>{t('roulette.activeBets')}:</span>
                    <span className="font-bold">{bets.length}</span>
                  </div>
                  <div className="flex justify-between text-white text-lg font-bold">
                    <span>{t('roulette.totalBet')}:</span>
                    <span className="text-yellow-500">{formatCurrency(getTotalBet())}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={clearBets}
                    disabled={isSpinning || bets.length === 0}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('roulette.clear')}
                  </button>
                  <button
                    onClick={placeBet}
                    disabled={isSpinning || bets.length === 0}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSpinning ? t('roulette.spinning') : t('roulette.spin')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roulette;
