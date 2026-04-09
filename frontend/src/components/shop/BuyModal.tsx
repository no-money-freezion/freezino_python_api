import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useTranslation } from 'react-i18next';

import { useSound } from '../../hooks/useSound';
import { useAuthStore } from '../../store/authStore';
import { useShopStore } from '../../store/shopStore';
import type { Item } from '../../types';

interface BuyModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

const rarityColors: Record<string, string> = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
};

export default function BuyModal({ item, isOpen, onClose }: BuyModalProps) {
  const { t } = useTranslation();
  const { playSound } = useSound();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const user = useAuthStore((state) => state.user);
  const { buyItem, fetchMyItems } = useShopStore();

  // Update window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close confetti after 5 seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  if (!item) return null;

  const canAfford = user && user.balance >= item.price;
  const isRareItem = item.rarity === 'epic' || item.rarity === 'legendary';

  const handleBuy = async () => {
    if (!canAfford) {
      setError('Insufficient balance');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await buyItem(item.id);

      // Refresh user balance
      const checkAuth = useAuthStore.getState().checkAuth;
      await checkAuth();

      // Fetch updated items
      await fetchMyItems();

      // Purchase successful - stop loading
      setIsLoading(false);

      // Play purchase sound
      playSound('purchase', 0.6);

      // Show confetti for rare items
      if (isRareItem) {
        setShowConfetti(true);
      }

      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setShowConfetti(false);
      }, isRareItem ? 3000 : 1000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to purchase item');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti */}
          {showConfetti && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.3}
            />
          )}

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="buy-modal-title"
              aria-describedby="buy-modal-description"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full overflow-hidden border-2 border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-4">
                <h2 id="buy-modal-title" className="text-2xl font-bold text-white flex items-center gap-2">
                  <span aria-hidden="true">🛒</span>
                  {t('shop.confirmPurchase')}
                </h2>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="text-6xl mb-4">
                    {item.type === 'clothing' && '👔'}
                    {item.type === 'car' && '🚗'}
                    {item.type === 'house' && '🏠'}
                    {item.type === 'accessories' && '💎'}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{item.name}</h3>
                  <p className={`text-sm font-semibold uppercase ${rarityColors[item.rarity]}`}>
                    {item.rarity}
                  </p>
                </div>

                <p id="buy-modal-description" className="text-gray-400 text-center mb-6">{item.description}</p>

                {/* Pricing Info */}
                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400">{t('shop.price')}:</span>
                    <span className="text-yellow-400 text-xl font-bold">${item.price.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400">{t('shop.yourBalance')}:</span>
                    <span className={`text-xl font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                      ${user?.balance.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">{t('shop.afterPurchase')}:</span>
                      <span className="text-white text-xl font-bold">
                        ${((user?.balance || 0) - item.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-900/50 border border-red-500 text-red-300 rounded-lg p-3 mb-4 text-sm">
                    {error}
                  </div>
                )}

                {/* Warning for expensive items */}
                {!canAfford && (
                  <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-300 rounded-lg p-3 mb-4 text-sm">
                    <strong>{t('shop.insufficientBalance')}</strong> {t('shop.youNeedMore', { amount: (item.price - (user?.balance || 0)).toLocaleString() })}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {t('shop.cancel')}
                  </button>

                  <button
                    onClick={handleBuy}
                    disabled={isLoading || !canAfford}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-500/50"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t('shop.buying')}
                      </span>
                    ) : (
                      t('shop.buyNow')
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
