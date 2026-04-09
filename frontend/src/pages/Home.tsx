import { useTranslation } from 'react-i18next';

import WorkTimer from '../components/WorkTimer';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

const Home = () => {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();

  const handleWorkComplete = async (earned: number) => {
    try {
      // Refetch user data to get updated balance
      const response = await api.get<{ user: User }>('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to update user balance:', error);
      // Fallback: update balance optimistically
      if (user) {
        setUser({
          ...user,
          balance: user.balance + earned,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-white mb-2">
        {t('home.title')}
      </h1>
      <p className="text-gray-400 text-lg">
        {t('home.subtitle')}
      </p>

      {/* Work Timer Component */}
      <WorkTimer
        onWorkComplete={handleWorkComplete}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="text-4xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold text-white mb-2">{t('home.features.play.title')}</h3>
          <p className="text-gray-400">
            {t('home.features.play.description')}
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="text-4xl mb-4">⏰</div>
          <h3 className="text-xl font-semibold text-white mb-2">{t('home.features.work.title')}</h3>
          <p className="text-gray-400">
            {t('home.features.work.description')}
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-white mb-2">{t('home.features.analyze.title')}</h3>
          <p className="text-gray-400">
            {t('home.features.analyze.description')}
          </p>
        </div>
      </div>

      <div className="bg-primary bg-opacity-20 border border-primary p-6 rounded-lg mt-8">
        <h3 className="text-xl font-semibold text-white mb-2">{t('home.important.title')}</h3>
        <ul className="text-gray-300 space-y-2">
          <li>{t('home.important.noRealMoney')}</li>
          <li>{t('home.important.onlyVirtual')}</li>
          <li>{t('home.important.educational')}</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
