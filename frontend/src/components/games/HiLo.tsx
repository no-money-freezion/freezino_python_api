import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

interface HiLoResult {
  success: boolean;
  current_card: number;
  next_card: number;
  current_suit: string;
  next_suit: string;
  bet_amount: number;
  win_amount: number;
  new_balance: number;
  won: boolean;
}

const cardNames: { [key: number]: string } = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K',
};

const suitSymbols: { [key: string]: string } = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: { [key: string]: string } = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-white',
  spades: 'text-white',
};

const HiLo = () => {
  const { t } = useTranslation();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<HiLoResult | null>(null);
  const [balance, setBalance] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

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

  const getCardDisplay = (card: number): string => {
    return cardNames[card] || card.toString();
  };

  const placeBet = async (guess: 'higher' | 'lower') => {
    if (betAmount <= 0 || betAmount > balance) {
      alert(t('games.hilo.insufficientBalance', 'Insufficient balance'));
      return;
    }

    setLoading(true);
    setIsPlaying(true);
    setShowResult(false);

    try {
      // Get user_id from localStorage or auth context
      const userId = localStorage.getItem('user_id') || '1';

      const response = await api.post('/games/hilo/bet', {
        user_id: parseInt(userId),
        bet_amount: betAmount,
        guess: guess,
      });

      const data: HiLoResult = response.data;

      setResult(data);
      setBalance(data.new_balance);

      // Show result after a brief delay
      setTimeout(() => {
        setShowResult(true);
      }, 500);

    } catch (error: unknown) {
      console.error('Failed to place bet:', error);
      alert((error as { response?: { data?: { message?: string } } }).response?.data?.message || t('games.hilo.error', 'Failed to place bet'));
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  const playAgain = () => {
    setIsPlaying(false);
    setShowResult(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-center mb-2">
            {t('games.hilo.title', 'Hi-Lo')}
          </h1>
          <p className="text-gray-400 text-center">
            {t('games.hilo.description', 'Guess if the next card is higher or lower!')}
          </p>
        </div>

        {/* Balance */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 text-center">
          <span className="text-gray-400 mr-2">{t('games.balance', 'Balance')}:</span>
          <span className="text-2xl font-bold text-yellow-500">{formatCurrency(balance)}</span>
        </div>

        {/* Cards Display */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {/* Current Card */}
            {result && (
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 0 }}
                className="relative"
              >
                <div className="bg-white rounded-xl p-8 shadow-2xl border-4 border-gray-700">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${suitColors[result.current_suit]}`}>
                      {getCardDisplay(result.current_card)}
                    </div>
                    <div className={`text-4xl ${suitColors[result.current_suit]}`}>
                      {suitSymbols[result.current_suit]}
                    </div>
                  </div>
                </div>
                <div className="text-center mt-2 text-gray-400 text-sm">
                  {t('games.hilo.currentCard', 'Current')}
                </div>
              </motion.div>
            )}

            {/* Next Card */}
            {result && showResult && (
              <motion.div
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className={`rounded-xl p-8 shadow-2xl border-4 ${
                  result.won ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
                }`}>
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${suitColors[result.next_suit]}`}>
                      {getCardDisplay(result.next_card)}
                    </div>
                    <div className={`text-4xl ${suitColors[result.next_suit]}`}>
                      {suitSymbols[result.next_suit]}
                    </div>
                  </div>
                </div>
                <div className="text-center mt-2 text-gray-400 text-sm">
                  {t('games.hilo.nextCard', 'Next')}
                </div>
              </motion.div>
            )}

            {/* Placeholder if no result */}
            {!result && (
              <>
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl p-8 shadow-2xl border-4 border-blue-500">
                    <div className="text-center text-6xl">?</div>
                  </div>
                  <div className="text-center mt-2 text-gray-400 text-sm">
                    {t('games.hilo.waitingForBet', 'Place your bet')}
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-xl p-8 shadow-2xl border-4 border-purple-500">
                    <div className="text-center text-6xl">?</div>
                  </div>
                  <div className="text-center mt-2 text-gray-400 text-sm">
                    {t('games.hilo.nextCard', 'Next')}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Result */}
        {result && showResult && (
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
              <div className={`text-xl font-bold ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                {result.won ? '+' : '-'}{formatCurrency(Math.abs(result.win_amount - result.bet_amount))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6">
          {!isPlaying ? (
            <>
              {/* Bet Amount */}
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">
                  {t('games.betAmount', 'Bet Amount')}
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  min="1"
                  step="1"
                />
              </div>

              {/* Guess Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => placeBet('higher')}
                  disabled={loading}
                  className="py-4 rounded-lg font-bold text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('games.hilo.higher', '⬆ Higher')}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => placeBet('lower')}
                  disabled={loading}
                  className="py-4 rounded-lg font-bold text-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('games.hilo.lower', '⬇ Lower')}
                </motion.button>
              </div>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playAgain}
              disabled={!showResult}
              className="w-full py-4 rounded-lg font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('games.playAgain', 'Play Again')}
            </motion.button>
          )}
        </div>

        {/* Game Info */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-2">{t('games.hilo.howToPlay', 'How to Play')}</h3>
          <ul className="text-gray-400 space-y-1 text-sm">
            <li>• {t('games.hilo.rule1', 'Set your bet amount')}</li>
            <li>• {t('games.hilo.rule2', 'Guess if the next card will be higher or lower')}</li>
            <li>• {t('games.hilo.rule3', 'Ace is 1, Jack is 11, Queen is 12, King is 13')}</li>
            <li>• {t('games.hilo.rule4', 'Win 2x your bet if you guess correctly')}</li>
            <li>• {t('games.hilo.rule5', 'If cards are equal, it\'s a push (bet returned)')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HiLo;
