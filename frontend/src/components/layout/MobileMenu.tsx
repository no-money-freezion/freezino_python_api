import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout } = useAuthStore();

  const menuItems = [
    { path: '/', label: t('nav.home'), icon: '🏠' },
    { path: '/games', label: t('nav.games'), icon: '🎮' },
    { path: '/work', label: t('nav.work'), icon: '⏰' },
    { path: '/shop', label: t('nav.shop'), icon: '🛍️' },
    { path: '/profile', label: t('nav.profile'), icon: '👤' },
    { path: '/stats', label: t('nav.stats'), icon: '📊' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gray-800 border-r border-gray-700 z-50 lg:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <Link to="/" onClick={onClose} className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary">🎰 FREEZINO</span>
              </Link>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center space-x-3 px-4 py-4 rounded-lg transition-colors touch-manipulation ${
                        isActive(item.path)
                          ? 'bg-primary text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white active:bg-gray-600'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-medium text-lg">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Logout Button - prominent placement */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-4 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors touch-manipulation"
                >
                  <span className="text-2xl">🚪</span>
                  <span className="font-medium text-lg">{t('common.logout')}</span>
                </button>
              </div>
            </nav>

            {/* Footer Links */}
            <div className="p-4 border-t border-gray-700 mt-auto">
              <div className="space-y-2">
                <Link
                  to="/about"
                  onClick={onClose}
                  className="block text-gray-400 hover:text-white py-2 px-4 text-sm transition-colors"
                >
                  {t('nav.about')}
                </Link>
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="block text-gray-400 hover:text-white py-2 px-4 text-sm transition-colors"
                >
                  {t('nav.contact')}
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
