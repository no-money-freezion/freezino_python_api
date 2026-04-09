import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import api from '../services/api';

interface PlayerStats {
  user_id: number;
  username: string;
  total_bet: number;
  total_won: number;
  net_profit: number;
  games_played: number;
}

interface GameTypeStats {
  game_type: string;
  games_played: number;
  total_bet: number;
  total_won: number;
  net_profit: number;
}

interface CasinoStats {
  total_players: number;
  total_games_played: number;
  total_bet: number;
  total_won: number;
  house_profit: number;
  house_edge_percent: number;
  players_in_profit: number;
  players_in_loss: number;
  players_break_even: number;
  profitable_percent: number;
  average_bet_per_game: number;
  average_win_per_game: number;
  game_breakdown: GameTypeStats[];
  top_winners: PlayerStats[];
  top_losers: PlayerStats[];
}

const CasinoStatsPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<CasinoStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCasinoStats();
  }, []);

  const fetchCasinoStats = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: CasinoStats }>('/casino/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch casino stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto"></div>
          <p className="text-gray-400 mt-4">{t('casinoStats.loading')}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">{t('casinoStats.noData')}</p>
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
          <span className="text-5xl">🎰</span>
          {t('casinoStats.title')}
        </h1>
        <p className="text-gray-400">{t('casinoStats.subtitle')}</p>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {/* Total Players */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">👥</span>
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
              {t('casinoStats.players')}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">{t('casinoStats.totalPlayers')}</p>
          <p className="text-2xl font-bold text-white">{stats.total_players}</p>
        </div>

        {/* Total Games Played */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">🎮</span>
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
              {t('casinoStats.games')}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">{t('casinoStats.totalGames')}</p>
          <p className="text-2xl font-bold text-white">{stats.total_games_played}</p>
        </div>

        {/* Total Bet */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">💰</span>
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
              {t('casinoStats.bets')}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">{t('casinoStats.totalBet')}</p>
          <p className="text-2xl font-bold text-secondary">{formatCurrency(stats.total_bet)}</p>
        </div>

        {/* House Profit */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">🏦</span>
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
              {t('casinoStats.casino')}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">{t('casinoStats.houseProfit')}</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.house_profit)}</p>
        </div>
      </motion.div>

      {/* House Edge & Player Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* House Edge Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span>
            {t('casinoStats.casinoStats')}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">{t('casinoStats.totalBetAmount')}</span>
              <span className="text-white font-semibold">{formatCurrency(stats.total_bet)}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">{t('casinoStats.totalWon')}</span>
              <span className="text-red-400 font-semibold">{formatCurrency(stats.total_won)}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">{t('casinoStats.houseEdge')}</span>
              <span className="text-green-400 font-semibold text-xl">
                {formatPercent(stats.house_edge_percent)}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">{t('casinoStats.averageBet')}</span>
              <span className="text-white font-semibold">
                {formatCurrency(stats.average_bet_per_game)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Player Profitability Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>👥</span>
            {t('casinoStats.playerProfitability')}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">{t('casinoStats.playersInProfit')}</span>
              <span className="text-green-400 font-semibold">
                {stats.players_in_profit} ({formatPercent(stats.profitable_percent)})
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">{t('casinoStats.playersInLoss')}</span>
              <span className="text-red-400 font-semibold">{stats.players_in_loss}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">{t('casinoStats.playersBreakEven')}</span>
              <span className="text-gray-300 font-semibold">{stats.players_break_even}</span>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
              <p className="text-yellow-300 text-sm font-semibold">
                {t('casinoStats.profitWarning', {
                  percent: formatPercent(100 - stats.profitable_percent),
                })}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Game Breakdown */}
      {stats.game_breakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎲</span>
            {t('casinoStats.gameBreakdown')}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 py-3 px-2">{t('casinoStats.game')}</th>
                  <th className="text-right text-gray-400 py-3 px-2">
                    {t('casinoStats.gamesPlayed')}
                  </th>
                  <th className="text-right text-gray-400 py-3 px-2">{t('casinoStats.totalBet')}</th>
                  <th className="text-right text-gray-400 py-3 px-2">{t('casinoStats.totalWon')}</th>
                  <th className="text-right text-gray-400 py-3 px-2">
                    {t('casinoStats.houseProfit')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.game_breakdown.map((game, index) => (
                  <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-2 text-white font-semibold capitalize">
                      {game.game_type}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-300">{game.games_played}</td>
                    <td className="py-3 px-2 text-right text-gray-300">
                      {formatCurrency(game.total_bet)}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-300">
                      {formatCurrency(game.total_won)}
                    </td>
                    <td
                      className={`py-3 px-2 text-right font-semibold ${
                        -game.net_profit > 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {formatCurrency(-game.net_profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Top Winners & Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Winners */}
        {stats.top_winners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🏆</span>
              {t('casinoStats.topWinners')}
            </h2>

            <div className="space-y-3">
              {stats.top_winners.map((player, index) => (
                <div
                  key={player.user_id}
                  className="flex items-center justify-between py-3 px-4 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                    <div>
                      <p className="text-white font-semibold">{player.username}</p>
                      <p className="text-xs text-gray-400">
                        {player.games_played} {t('casinoStats.games').toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{formatCurrency(player.net_profit)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Top Losers */}
        {stats.top_losers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📉</span>
              {t('casinoStats.topLosers')}
            </h2>

            <div className="space-y-3">
              {stats.top_losers.map((player, index) => (
                <div
                  key={player.user_id}
                  className="flex items-center justify-between py-3 px-4 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                    <div>
                      <p className="text-white font-semibold">{player.username}</p>
                      <p className="text-xs text-gray-400">
                        {player.games_played} {t('casinoStats.games').toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold">{formatCurrency(player.net_profit)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Educational Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <span>⚠️</span>
          {t('casinoStats.educationalTitle')}
        </h3>
        <p className="text-gray-300">{t('casinoStats.educationalMessage')}</p>
      </motion.div>
    </div>
  );
};

export default CasinoStatsPage;
