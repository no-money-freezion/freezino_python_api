import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { formatCurrency } from '../utils/formatters';

interface GameCardProps {
  title: string;
  icon: string;
  description: string;
  minBet?: number;
  isComingSoon?: boolean;
  onClick?: () => void;
}

const GameCard = ({
  title,
  icon,
  description,
  minBet = 10,
  isComingSoon = false,
  onClick,
}: GameCardProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      whileHover={{ scale: isComingSoon ? 1 : 1.05, y: isComingSoon ? 0 : -5 }}
      whileTap={{ scale: isComingSoon ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
      className={`
        relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900
        border-2 transition-all duration-300
        ${
          isComingSoon
            ? 'border-gray-700 opacity-60 cursor-not-allowed'
            : 'border-gray-700 hover:border-primary hover:shadow-lg hover:shadow-primary/30 cursor-pointer'
        }
      `}
      onClick={!isComingSoon ? onClick : undefined}
    >
      {/* Coming Soon Badge */}
      {isComingSoon && (
        <div className="absolute top-2 right-2 bg-secondary text-gray-900 text-xs font-bold px-2 py-1 rounded-full z-10">
          {t('games.comingSoon')}
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className={`
            text-6xl p-4 rounded-full bg-gradient-to-br
            ${isComingSoon ? 'from-gray-700 to-gray-800' : 'from-gray-700 to-gray-800 group-hover:from-primary group-hover:to-secondary'}
            transition-all duration-300
          `}>
            {icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white text-center mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm text-center mb-4 min-h-[40px]">
          {description}
        </p>

        {/* Min Bet */}
        {!isComingSoon && (
          <div className="flex items-center justify-center space-x-2 bg-gray-700 rounded-lg py-2">
            <span className="text-gray-400 text-sm">{t('games.minBet')}</span>
            <span className="text-secondary font-bold">{formatCurrency(minBet)}</span>
          </div>
        )}
      </div>

      {/* Hover Effect Gradient */}
      {!isComingSoon && (
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </motion.div>
  );
};

export default GameCard;
