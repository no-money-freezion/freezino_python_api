import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';

interface MenuItem {
  path: string;
  labelKey: string;
  icon: string;
  descriptionKey?: string;
}

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuthStore();

  const menuItems: MenuItem[] = [
    { path: '/dashboard', labelKey: 'sidebar.games', icon: '🎮', descriptionKey: 'sidebar.games_desc' },
    { path: '/shop', labelKey: 'sidebar.shop', icon: '🛍️', descriptionKey: 'sidebar.shop_desc' },
    { path: '/credit', labelKey: 'sidebar.credit', icon: '💳', descriptionKey: 'sidebar.credit_desc' },
    { path: '/profile', labelKey: 'sidebar.profile', icon: '👤', descriptionKey: 'sidebar.profile_desc' },
    { path: '/work', labelKey: 'sidebar.work', icon: '⏰', descriptionKey: 'sidebar.work_desc' },
    { path: '/casino-stats', labelKey: 'sidebar.stats', icon: '🎰', descriptionKey: 'sidebar.stats_desc' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 bg-gray-800 p-2 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
        aria-label="Toggle menu"
      >
        <span className="text-2xl">{isOpen ? '✕' : '☰'}</span>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-4rem)]
          bg-gray-800 border-r border-gray-700
          w-64 z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full pointer-events-auto">
          {/* Sidebar Header - visible on mobile */}
          <div className="lg:hidden p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-primary">FREEZINO</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto pointer-events-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg
                      transition-all duration-200 group
                      ${
                        isActive(item.path)
                          ? 'bg-primary text-white shadow-lg shadow-primary/50'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:translate-x-1'
                      }
                    `}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{t(item.labelKey)}</span>
                      {item.descriptionKey && (
                        <span className={`text-xs ${isActive(item.path) ? 'text-gray-200' : 'text-gray-400'}`}>
                          {t(item.descriptionKey)}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Logout Button */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">{t('common.logout')}</span>
              </button>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-400 text-center">
                {t('sidebar.playResponsibly')}
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                {t('sidebar.virtualCurrency')}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
