import { useTranslation } from 'react-i18next';

import { PageTransition } from '../components/animations';
import WorkTimer from '../components/WorkTimer';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

const WorkPage = () => {
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
    <PageTransition>
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            💼 {t('work.title', 'Work')}
          </h1>
          <p className="text-gray-400">
            {t('work.description', 'Earn virtual money by working for 3 minutes')}
          </p>
        </div>

        {/* Balance Display */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">{t('common.balance', 'Current Balance')}</p>
              <p className="text-3xl font-bold text-secondary">
                {t('common.currency', { amount: user?.balance || 0 })}
              </p>
            </div>
            <div className="text-6xl">💰</div>
          </div>
        </div>

        {/* Work Timer Component */}
        <WorkTimer
          onWorkComplete={handleWorkComplete}
        />

        {/* Info Section */}
        <div className="mt-8 space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              ℹ️ {t('work.howItWorks', 'How it works')}
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-primary mr-2">1.</span>
                {t('work.step1', 'Click the "Work" button when your balance is low')}
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">2.</span>
                {t('work.step2', 'Wait for 3 minutes while the timer counts down')}
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">3.</span>
                {t('work.step3', 'Receive $500 after completing the work session')}
              </li>
            </ul>
          </div>

          <div className="bg-primary/10 border border-primary/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">
              🎓 {t('work.educationalTitle', 'Educational Purpose')}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {t('work.educationalText', 'This work system demonstrates the value of time and money. In real life, earning money takes significant time and effort. The casino games show how quickly you can lose what you worked hard to earn.')}
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default WorkPage;
