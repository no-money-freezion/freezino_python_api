import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Item, ItemRarity } from '../../types';

interface ItemCardProps {
  item: Item;
  onBuy: (item: Item) => void;
  owned?: boolean;
}

const rarityColors: Record<ItemRarity, { bg: string; border: string; text: string; glow: string }> = {
  common: {
    bg: 'bg-gray-700',
    border: 'border-gray-500',
    text: 'text-gray-300',
    glow: 'shadow-gray-500/50'
  },
  rare: {
    bg: 'bg-blue-700',
    border: 'border-blue-500',
    text: 'text-blue-300',
    glow: 'shadow-blue-500/50'
  },
  epic: {
    bg: 'bg-purple-700',
    border: 'border-purple-500',
    text: 'text-purple-300',
    glow: 'shadow-purple-500/50'
  },
  legendary: {
    bg: 'bg-yellow-600',
    border: 'border-yellow-500',
    text: 'text-yellow-300',
    glow: 'shadow-yellow-500/50'
  },
};

const typeEmojis: Record<string, string> = {
  clothing: '👔',
  car: '🚗',
  house: '🏠',
  accessories: '💎',
};

export default function ItemCard({ item, onBuy, owned = false }: ItemCardProps) {
  const { t } = useTranslation();
  const rarity = rarityColors[item.rarity] || rarityColors.common;
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      role="article"
      aria-labelledby={`item-name-${item.id}`}
      aria-describedby={`item-desc-${item.id}`}
      className={`relative bg-gray-800 rounded-lg overflow-hidden border-2 ${rarity.border} ${rarity.glow} shadow-lg transition-all cursor-pointer`}
      data-testid={`shop-item-${item.id}`}
    >
      {/* Rarity Badge */}
      <div className={`absolute top-2 right-2 ${rarity.bg} ${rarity.text} px-3 py-1 rounded-full text-xs font-bold uppercase z-10`}>
        {item.rarity ? t(`shop.${item.rarity}`) : t('shop.common')}
      </div>

      {/* Owned Badge */}
      {owned && (
        <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
          {t('shop.owned')}
        </div>
      )}

      {/* Item Image/Emoji */}
      <div className="h-48 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        {item.image_url && !imageError ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-8xl">
            {typeEmojis[item.type] || '📦'}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-70"></div>
      </div>

      {/* Item Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl" aria-hidden="true">{typeEmojis[item.type]}</span>
          <h3 id={`item-name-${item.id}`} className="text-lg font-bold text-white truncate flex-1">{item.name}</h3>
        </div>

        <p id={`item-desc-${item.id}`} className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">{t('shop.price')}</span>
            <span className="text-yellow-400 text-2xl font-bold">
              ${item.price.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => onBuy(item)}
            disabled={owned}
            aria-label={owned ? `${item.name} - ${t('shop.owned')}` : `${t('shop.buy')} ${item.name} ${t('shop.for')} $${item.price}`}
            className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${
              owned
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 shadow-lg hover:shadow-yellow-500/50'
            }`}
            data-testid={`buy-button-${item.id}`}
          >
            {owned ? t('shop.owned') : t('shop.buy')}
          </button>
        </div>
      </div>

      {/* Animated border glow for legendary items */}
      {item.rarity === 'legendary' && (
        <motion.div
          className="absolute inset-0 border-2 border-yellow-400 rounded-lg pointer-events-none"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}
