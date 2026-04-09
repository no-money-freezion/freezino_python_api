import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface NoMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasItems: boolean;
}

const NoMoneyModal = ({ isOpen, onClose, hasItems }: NoMoneyModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    navigate('/profile');
    onClose();
  };

  const handleGoToWork = () => {
    navigate('/dashboard');
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gray-900 border-2 border-red-500/30 rounded-2xl shadow-2xl max-w-lg w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-gray-800 p-6">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-bounce">💸</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {t('shop.noMoney') || 'No Money!'}
                  </h2>
                  <p className="text-gray-300">
                    {t('shop.noMoneyDescription') || 'You have run out of money'}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Balance Display */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                  <p className="text-red-400 text-sm mb-2">
                    {t('shop.currentBalance') || 'Current Balance'}
                  </p>
                  <p className="text-5xl font-bold text-red-500">$0</p>
                </div>

                {/* Message */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 text-center">
                    {hasItems ? (
                      <>
                        {t('shop.noMoneyWithItems') ||
                          'You have no money to continue playing. You can sell your items to get money back!'}
                      </>
                    ) : (
                      <>
                        {t('shop.noMoneyNoItems') ||
                          'You have no money and no items. You need to work to earn money!'}
                      </>
                    )}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {hasItems ? (
                    <>
                      {/* Sell Items Option */}
                      <button
                        onClick={handleGoToProfile}
                        className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 group"
                      >
                        <span className="text-2xl">💰</span>
                        <div className="text-left flex-1">
                          <p className="font-bold">
                            {t('shop.sellItems') || 'Sell Your Items'}
                          </p>
                          <p className="text-sm text-gray-200">
                            {t('shop.sellItemsDescription') || 'Get 50% of the original price back'}
                          </p>
                        </div>
                        <svg
                          className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>

                      {/* Work Option */}
                      <button
                        onClick={handleGoToWork}
                        className="w-full bg-secondary/20 hover:bg-secondary/30 border border-secondary/50 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 group"
                      >
                        <span className="text-2xl">⏰</span>
                        <div className="text-left flex-1">
                          <p className="font-bold">
                            {t('shop.workToEarn') || 'Work to Earn Money'}
                          </p>
                          <p className="text-sm text-gray-300">
                            {t('shop.workDescription') || '3 minutes = $500'}
                          </p>
                        </div>
                        <svg
                          className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Work Option (Primary when no items) */}
                      <button
                        onClick={handleGoToWork}
                        className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 group"
                      >
                        <span className="text-2xl">⏰</span>
                        <div className="text-left flex-1">
                          <p className="font-bold">
                            {t('shop.workToEarn') || 'Work to Earn Money'}
                          </p>
                          <p className="text-sm text-gray-200">
                            {t('shop.workDescription') || '3 minutes = $500'}
                          </p>
                        </div>
                        <svg
                          className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {/* Educational Note */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex gap-3">
                    <span className="text-blue-400 text-xl flex-shrink-0">💡</span>
                    <p className="text-blue-300 text-sm">
                      <span className="font-semibold">{t('common.tip') || 'Tip'}:</span>{' '}
                      {t('shop.noMoneyTip') ||
                        'This is a simulation to show how quickly money can be lost to gambling. In real life, never gamble money you cannot afford to lose.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-800 border-t border-gray-700 p-6">
                <button
                  onClick={onClose}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {t('common.close') || 'Close'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NoMoneyModal;
