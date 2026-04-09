import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useSound } from '../../hooks/useSound';
import type { UserItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: UserItem | null;
  onConfirm: (itemId: string) => Promise<void>;
  isLoading?: boolean;
}

const SellModal = ({ isOpen, onClose, item, onConfirm, isLoading = false }: SellModalProps) => {
  const { t } = useTranslation();
  const { playSound } = useSound();

  if (!item) return null;

  const sellPrice = item.item.price * 0.5; // 50% of original price

  const handleConfirm = async () => {
    playSound('sell', 0.5);
    await onConfirm(item.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gray-900 border-2 border-primary/30 rounded-2xl shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-3xl">💰</span>
                    {t('shop.sellItem') || 'Sell Item'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                    aria-label="Close"
                    disabled={isLoading}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Item Preview */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center text-4xl">
                      {item.item.image_url ? (
                        <img
                          src={item.item.image_url}
                          alt={item.item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">
                        {item.item.name}
                      </h3>
                      <p className="text-gray-400 text-sm capitalize">
                        {item.item.type}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {t('shop.purchasedFor') || 'Purchased for'}: {formatCurrency(item.item.price)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">
                      {t('shop.originalPrice') || 'Original Price'}:
                    </span>
                    <span className="text-white font-semibold">
                      {formatCurrency(item.item.price)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-secondary/20 to-secondary/10 border border-secondary/30 rounded-lg">
                    <span className="text-secondary font-semibold">
                      {t('shop.sellPrice') || 'Sell Price'} (50%):
                    </span>
                    <span className="text-secondary font-bold text-xl">
                      {formatCurrency(sellPrice)}
                    </span>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex gap-3">
                    <span className="text-yellow-400 text-xl flex-shrink-0">⚠️</span>
                    <p className="text-yellow-300 text-sm">
                      {t('shop.sellWarning') ||
                        'You will receive 50% of the original price. This action cannot be undone.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-800 border-t border-gray-700 p-6 flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1 bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t('common.selling') || 'Selling...'}
                    </>
                  ) : (
                    <>
                      💰 {t('shop.confirmSell') || 'Confirm Sell'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SellModal;
