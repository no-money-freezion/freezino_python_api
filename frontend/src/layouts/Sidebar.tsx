import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();

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
    <aside className="bg-gray-800 border-r border-gray-700 w-64 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
