import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import StatsModal from '../components/StatsModal';
import api from '../services/api';
import type { UserStats, WorkSession, GameSession } from '../types';

const StatsPage = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatsModal, setShowStatsModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch user statistics
      const statsResponse = await api.get<UserStats>('/stats/me');
      setStats(statsResponse.data);

      // Fetch work sessions (last 10)
      await api.get<WorkSession[]>('/work/history?limit=10');

      // Fetch game sessions (last 10)
      await api.get<GameSession[]>('/games/sessions?limit=10');

    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Use mock data for demo purposes
      setStats({
        total_work_time: 3600, // 1 hour
        total_earned: 1500,
        total_bet: 5000,
        total_won: 3000,
        total_lost: 2000,
        games_played: 42,
        favorite_game: 'Рулетка',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} ч ${minutes} мин`;
    } else if (minutes > 0) {
      return `${minutes} мин`;
    } else {
      return `${seconds} сек`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto"></div>
          <p className="text-gray-400 mt-4">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-5xl">📊</span>
          Статистика
        </h1>
        <p className="text-gray-400">
          Подробная информация о вашей активности в Freezino
        </p>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {/* Total Work Time */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">⏰</span>
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
              Работа
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Всего отработано</p>
          <p className="text-2xl font-bold text-white">
            {stats ? formatTime(stats.total_work_time) : '0 ч'}
          </p>
        </div>

        {/* Total Earned */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">💰</span>
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
              Доход
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Заработано</p>
          <p className="text-2xl font-bold text-secondary">
            ${stats?.total_earned.toFixed(2) || '0.00'}
          </p>
        </div>

        {/* Games Played */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">🎮</span>
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
              Игры
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Игр сыграно</p>
          <p className="text-2xl font-bold text-white">
            {stats?.games_played || 0}
          </p>
        </div>

        {/* Win/Loss Ratio */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">📈</span>
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
              Баланс
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Чистая прибыль</p>
          <p className={`text-2xl font-bold ${
            (stats?.total_won || 0) - (stats?.total_lost || 0) >= 0
              ? 'text-green-400'
              : 'text-red-400'
          }`}>
            ${((stats?.total_won || 0) - (stats?.total_lost || 0)).toFixed(2)}
          </p>
        </div>
      </motion.div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Work Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>💼</span>
            Статистика работы
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Всего отработано</span>
              <span className="text-white font-semibold">
                {stats ? formatTime(stats.total_work_time) : '0 ч'}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Заработано денег</span>
              <span className="text-secondary font-semibold">
                ${stats?.total_earned.toFixed(2) || '0.00'}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Средняя зарплата/час</span>
              <span className="text-white font-semibold">
                $
                {stats && stats.total_work_time > 0
                  ? ((stats.total_earned / stats.total_work_time) * 3600).toFixed(2)
                  : '0.00'}
              </span>
            </div>

            <button
              onClick={() => setShowStatsModal(true)}
              className="w-full bg-primary/20 hover:bg-primary/30 border border-primary text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-4"
            >
              Сравнить с другими странами
            </button>
          </div>
        </motion.div>

        {/* Game Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎲</span>
            Игровая статистика
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Игр сыграно</span>
              <span className="text-white font-semibold">
                {stats?.games_played || 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Всего поставлено</span>
              <span className="text-white font-semibold">
                ${stats?.total_bet.toFixed(2) || '0.00'}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Выиграно</span>
              <span className="text-green-400 font-semibold">
                ${stats?.total_won.toFixed(2) || '0.00'}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Проиграно</span>
              <span className="text-red-400 font-semibold">
                ${stats?.total_lost.toFixed(2) || '0.00'}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Любимая игра</span>
              <span className="text-white font-semibold">
                {stats?.favorite_game || 'Нет данных'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Educational Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <span>💡</span>
          Помните о целях проекта
        </h3>
        <p className="text-gray-300">
          Freezino - это образовательный проект, созданный для демонстрации того, как быстро
          можно потерять деньги в азартных играх. Все валюты здесь виртуальные, но статистика
          показывает реальное соотношение времени работы и игры.
        </p>
      </motion.div>

      {/* Stats Modal */}
      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        earned={stats?.total_earned || 0}
        totalWorkTime={stats?.total_work_time || 0}
      />
    </div>
  );
};

export default StatsPage;
