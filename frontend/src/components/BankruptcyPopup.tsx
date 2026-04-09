import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../store/authStore';
import { useLoanStore } from '../store/loanStore';

export default function BankruptcyPopup() {
  const { t } = useTranslation();
  const { showBankruptcyPopup, setShowBankruptcyPopup } = useLoanStore();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const handleClose = async () => {
    setShowBankruptcyPopup(false);
    // Refresh user data to show updated balance and items
    await checkAuth();
  };

  return (
    <AnimatePresence>
      {showBankruptcyPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-red-900 to-red-950 rounded-xl p-8 max-w-md w-full border-4 border-red-600 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated collectors emoji */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, -5, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="text-8xl text-center mb-4"
            >
              👮‍♂️👮‍♀️
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-4 text-center">
              {t('bankruptcy.title')}
            </h2>

            <div className="bg-black/30 rounded-lg p-4 mb-6 border border-red-700">
              <p className="text-red-300 text-center text-lg font-semibold mb-3">
                {t('bankruptcy.message')}
              </p>
              <div className="space-y-2 text-white">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💸</span>
                  <span>{t('bankruptcy.money_gone')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <span>{t('bankruptcy.debts_cleared')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏠</span>
                  <span>{t('bankruptcy.items_seized')}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-center mb-6">
              {t('bankruptcy.fresh_start')}
            </p>

            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-bold text-lg hover:from-red-500 hover:to-red-600 transition-all shadow-lg"
            >
              {t('bankruptcy.understand')}
            </button>

            <p className="text-red-400 text-xs text-center mt-4 italic">
              {t('bankruptcy.warning')}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
