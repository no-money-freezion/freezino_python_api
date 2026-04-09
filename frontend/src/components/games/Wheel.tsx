import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

interface WheelResult {
  success: boolean;
  segment: number;
  multiplier: number;
  color: string;
  bet_amount: number;
  win_amount: number;
  new_balance: number;
}

interface Segment {
  multiplier: number;
  color: string;
  label: string;
}

// Define wheel segments matching backend
const wheelSegments: Segment[] = [
  { multiplier: 1.2, color: '#3B82F6', label: '1.2x' },   // blue
  { multiplier: 1.5, color: '#10B981', label: '1.5x' },   // green
  { multiplier: 2.0, color: '#EAB308', label: '2.0x' },   // yellow
  { multiplier: 3.0, color: '#F97316', label: '3.0x' },   // orange
  { multiplier: 5.0, color: '#EF4444', label: '5.0x' },   // red
  { multiplier: 10.0, color: '#8B5CF6', label: '10x' },   // purple
  { multiplier: 20.0, color: '#F59E0B', label: '20x' },   // gold
  { multiplier: 50.0, color: '#EC4899', label: '50x' },   // rainbow
  { multiplier: 0.0, color: '#000000', label: 'LOSE' },   // black
  { multiplier: 100.0, color: '#06B6D4', label: '100x' }, // diamond
];

const Wheel = () => {
  const { t } = useTranslation();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelResult | null>(null);
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

  const spinWheel = async () => {
    if (betAmount <= 0 || betAmount > balance) {
      alert(t('games.wheel.insufficientBalance', 'Insufficient balance'));
      return;
    }

    setLoading(true);
    setIsSpinning(true);
    setResult(null);

    try {
      // Get user_id from localStorage or auth context
      const userId = localStorage.getItem('user_id') || '1';

      const response = await api.post('/games/wheel/spin', {
        user_id: parseInt(userId),
        bet_amount: betAmount,
      });

      const data: WheelResult = response.data;

      // Calculate rotation to land on winning segment
      const segmentAngle = 360 / wheelSegments.length;
      const targetAngle = data.segment * segmentAngle;
      const spins = 5; // Number of full rotations
      const finalRotation = rotation + (360 * spins) - targetAngle + (segmentAngle / 2);

      setRotation(finalRotation);

      // Show result after spin completes
      setTimeout(() => {
        setResult(data);
        setBalance(data.new_balance);
        setIsSpinning(false);
      }, 4000);

    } catch (error: unknown) {
      console.error('Failed to spin wheel:', error);
      alert((error as { response?: { data?: { message?: string } } }).response?.data?.message || t('games.wheel.error', 'Failed to spin wheel'));
      setIsSpinning(false);
    } finally {
      setLoading(false);
    }
  };

  const getSegmentColor = (segment: Segment) => {
    return segment.color;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-center mb-2">
            {t('games.wheel.title', 'Wheel of Fortune')}
          </h1>
          <p className="text-gray-400 text-center">
            {t('games.wheel.description', 'Spin the wheel and win big!')}
          </p>
        </div>

        {/* Balance */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 text-center">
          <span className="text-gray-400 mr-2">{t('games.balance', 'Balance')}:</span>
          <span className="text-2xl font-bold text-yellow-500">{formatCurrency(balance)}</span>
        </div>

        {/* Wheel Container */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Pointer */}
          <div className="absolute top-0 z-20 transform -translate-y-4">
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500"></div>
          </div>

          {/* Wheel */}
          <div className="relative w-96 h-96">
            <motion.div
              className="w-full h-full rounded-full relative overflow-hidden shadow-2xl border-8 border-yellow-500"
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: 'easeOut' }}
            >
              {wheelSegments.map((segment, index) => {
                const segmentAngle = 360 / wheelSegments.length;
                const rotation = index * segmentAngle;

                return (
                  <div
                    key={index}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: 'center',
                    }}
                  >
                    <div
                      className="absolute top-0 left-1/2 w-0 h-0"
                      style={{
                        borderLeft: '96px solid transparent',
                        borderRight: '96px solid transparent',
                        borderTop: `192px solid ${getSegmentColor(segment)}`,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div
                        className="absolute text-white font-bold text-lg"
                        style={{
                          top: '-140px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {segment.label}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-900 rounded-full border-4 border-yellow-500 flex items-center justify-center">
                <div className="text-yellow-500 font-bold text-sm">SPIN</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Result */}
        {result && !isSpinning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-4 mb-6 ${
              result.multiplier > 0 && result.win_amount > result.bet_amount
                ? 'bg-green-900/50 border-2 border-green-500'
                : 'bg-red-900/50 border-2 border-red-500'
            }`}
          >
            <div className="text-center">
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: wheelSegments[result.segment].color }}
              >
                {result.multiplier === 0 ? t('games.wheel.loseAll', 'Lost Everything!') : `${result.multiplier}x`}
              </div>
              <div className={`text-xl font-bold ${
                result.multiplier > 0 && result.win_amount > result.bet_amount ? 'text-green-400' : 'text-red-400'
              }`}>
                {result.multiplier > 0 && result.win_amount > result.bet_amount ? '+' : '-'}
                {formatCurrency(Math.abs(result.win_amount - result.bet_amount))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6">
          {/* Bet Amount */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">
              {t('games.betAmount', 'Bet Amount')}
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
              disabled={isSpinning}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50"
              min="1"
              step="1"
            />
          </div>

          {/* Spin Button */}
          <motion.button
            whileHover={{ scale: isSpinning ? 1 : 1.05 }}
            whileTap={{ scale: isSpinning ? 1 : 0.95 }}
            onClick={spinWheel}
            disabled={isSpinning || loading}
            className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
              isSpinning || loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
            }`}
          >
            {loading ? t('games.loading', 'Loading...') : isSpinning ? t('games.wheel.spinning', 'Spinning...') : t('games.wheel.spin', 'Spin the Wheel')}
          </motion.button>
        </div>

        {/* Multipliers Legend */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3">{t('games.wheel.multipliers', 'Multipliers')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {wheelSegments.map((segment, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 rounded"
                style={{ backgroundColor: `${segment.color}33` }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: segment.color }}
                ></div>
                <span className="text-sm font-semibold">{segment.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-2">{t('games.wheel.howToPlay', 'How to Play')}</h3>
          <ul className="text-gray-400 space-y-1 text-sm">
            <li>• {t('games.wheel.rule1', 'Set your bet amount')}</li>
            <li>• {t('games.wheel.rule2', 'Click "Spin the Wheel"')}</li>
            <li>• {t('games.wheel.rule3', 'Win your bet multiplied by the segment multiplier')}</li>
            <li>• {t('games.wheel.rule4', 'Higher multipliers are rarer')}</li>
            <li>• {t('games.wheel.rule5', 'Black segment = lose everything!')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Wheel;
