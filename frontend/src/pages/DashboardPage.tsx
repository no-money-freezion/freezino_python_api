import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { PageTransition, GameCardSkeleton } from '../components/animations';
import GameCard from '../components/GameCard';

interface Game {
  id: string;
  title: string;
  icon: string;
  description: string;
  minBet: number;
  isComingSoon: boolean;
}

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch games
    const fetchGames = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const gamesData: Game[] = [
          {
            id: '1',
            title: t('games.roulette.title'),
            icon: '🎡',
            description: t('games.roulette.description'),
            minBet: 10,
            isComingSoon: false,
          },
          {
            id: '2',
            title: t('games.slots.title'),
            icon: '🎰',
            description: t('games.slots.description'),
            minBet: 5,
            isComingSoon: false,
          },
          {
            id: '3',
            title: t('games.blackjack.title'),
            icon: '🃏',
            description: t('games.blackjack.description'),
            minBet: 20,
            isComingSoon: true,
          },
          {
            id: '4',
            title: t('games.craps.title'),
            icon: '🎲',
            description: t('games.craps.description'),
            minBet: 15,
            isComingSoon: true,
          },
          {
            id: '5',
            title: t('games.crash.title'),
            icon: '📈',
            description: t('games.crash.description'),
            minBet: 10,
            isComingSoon: true,
          },
          {
            id: '6',
            title: t('games.hilo.title'),
            icon: '🔼',
            description: t('games.hilo.description'),
            minBet: 5,
            isComingSoon: true,
          },
          {
            id: '7',
            title: t('games.wheel.title'),
            icon: '🎪',
            description: t('games.wheel.description'),
            minBet: 10,
            isComingSoon: true,
          },
          {
            id: '8',
            title: t('games.poker.title'),
            icon: '♠️',
            description: t('games.poker.description'),
            minBet: 25,
            isComingSoon: true,
          },
        ];

        setGames(gamesData);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [t]);

  const handleGameClick = (gameId: string) => {
    // Map game IDs to routes
    const gameRoutes: { [key: string]: string } = {
      '1': '/games/roulette',
      '2': '/games/slots',
    };

    const route = gameRoutes[gameId];
    if (route) {
      navigate(route);
    } else {
      console.log('Game not yet implemented:', gameId);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          {t('dashboard.welcome').split('<1>')[0]}
          <span className="text-primary">Freezino</span>
          {t('dashboard.welcome').split('</1>')[1]}
        </h1>
        <p className="text-gray-400">
          {t('dashboard.subtitle')}
        </p>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">🎮</span>
            <div>
              <p className="text-gray-400 text-sm">{t('dashboard.availableGames')}</p>
              <p className="text-2xl font-bold text-white">
                {loading ? '...' : games.filter(g => !g.isComingSoon).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">⏰</span>
            <div>
              <p className="text-gray-400 text-sm">{t('dashboard.timePlayed')}</p>
              <p className="text-2xl font-bold text-white">{t('work.hours', { count: 0 })}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">🏆</span>
            <div>
              <p className="text-gray-400 text-sm">{t('dashboard.totalWon')}</p>
              <p className="text-2xl font-bold text-secondary">{t('common.currency', { amount: 0 })}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Games Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">{t('dashboard.casinoGames')}</h2>

        {loading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <GameCardSkeleton count={8} />
          </div>
        ) : (
          // Games Grid
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <GameCard
                  title={game.title}
                  icon={game.icon}
                  description={game.description}
                  minBet={game.minBet}
                  isComingSoon={game.isComingSoon}
                  onClick={() => handleGameClick(game.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-xl p-6 text-center"
      >
        <p className="text-white font-semibold mb-2">
          {t('dashboard.educationalBanner.title')}
        </p>
        <p className="text-gray-300 text-sm">
          {t('dashboard.educationalBanner.description')}
        </p>
      </motion.div>
      </div>
    </PageTransition>
  );
};

export default DashboardPage;
