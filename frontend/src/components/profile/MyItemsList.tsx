import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { UserItem } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import SellModal from '../shop/SellModal';

interface MyItemsListProps {
  items: UserItem[];
  onSellItem: (itemId: string) => Promise<void>;
  onEquipItem?: (itemId: string) => Promise<void>;
  isLoading?: boolean;
}

const MyItemsList = ({ items, onSellItem, onEquipItem, isLoading = false }: MyItemsListProps) => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<UserItem | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [processingItemId, setProcessingItemId] = useState<string | null>(null);

  const handleSellClick = (item: UserItem) => {
    setSelectedItem(item);
    setIsSellModalOpen(true);
  };

  const handleConfirmSell = async (itemId: string) => {
    setProcessingItemId(itemId);
    try {
      await onSellItem(itemId);
      setIsSellModalOpen(false);
      setSelectedItem(null);
    } finally {
      setProcessingItemId(null);
    }
  };

  const handleEquipClick = async (itemId: string) => {
    if (!onEquipItem) return;
    setProcessingItemId(itemId);
    try {
      await onEquipItem(itemId);
    } finally {
      setProcessingItemId(null);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    const type = item.item.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as Record<string, UserItem[]>);

  const getItemIcon = (type: string): string => {
    const icons: Record<string, string> = {
      clothing: '👔',
      car: '🚗',
      house: '🏠',
      accessories: '💎',
    };
    return icons[type] || '📦';
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      clothing: t('shop.clothing') || 'Clothing',
      car: t('shop.car') || 'Car',
      house: t('shop.house') || 'House',
      accessories: t('shop.accessories') || 'Accessories',
    };
    return labels[type] || type;
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          {t('profile.noItems') || 'No Items Yet'}
        </h3>
        <p className="text-gray-400">
          {t('profile.noItemsDescription') || 'Visit the shop to buy your first items!'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([type, typeItems]) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden"
          >
            {/* Category Header */}
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-gray-700 px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-2xl">{getItemIcon(type)}</span>
                {getTypeLabel(type)}
                <span className="text-sm text-gray-400 ml-2">({typeItems.length})</span>
              </h3>
            </div>

            {/* Items Grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeItems.map((userItem) => (
                <motion.div
                  key={userItem.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-gray-700 border ${
                    userItem.is_equipped ? 'border-secondary' : 'border-gray-600'
                  } rounded-lg p-4 hover:border-primary/50 transition-all ${
                    userItem.is_equipped ? 'ring-2 ring-secondary/30' : ''
                  }`}
                >
                  {/* Item Image */}
                  <div className="relative mb-3">
                    <div className="w-full h-32 bg-gray-800 rounded-lg flex items-center justify-center text-5xl overflow-hidden">
                      {userItem.item.image_url ? (
                        <img
                          src={userItem.item.image_url}
                          alt={userItem.item.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) (fallback as HTMLElement).style.display = 'block';
                          }}
                        />
                      ) : null}
                      <span style={{ display: userItem.item.image_url ? 'none' : 'block' }}>
                        {getItemIcon(userItem.item.type)}
                      </span>
                    </div>
                    {userItem.is_equipped && (
                      <div className="absolute top-2 right-2 bg-secondary text-gray-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <span>✓</span> {t('profile.equipped') || 'Equipped'}
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="space-y-2 mb-4">
                    <h4 className="text-white font-semibold truncate">
                      {userItem.item.name}
                    </h4>
                    {userItem.item.description && (
                      <p className="text-gray-400 text-xs line-clamp-2">
                        {userItem.item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {t('profile.purchased') || 'Purchased'}:
                      </span>
                      <span className="text-gray-400">
                        {userItem.purchased_at && new Date(userItem.purchased_at).getFullYear() > 1900
                          ? formatDate(userItem.purchased_at, { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {t('shop.originalPrice') || 'Price'}:
                      </span>
                      <span className="text-white font-semibold">
                        {formatCurrency(userItem.item.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {t('shop.sellPrice') || 'Sell for'}:
                      </span>
                      <span className="text-secondary font-semibold">
                        {formatCurrency(userItem.item.price * 0.5)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {onEquipItem && (
                      <button
                        onClick={() => handleEquipClick(userItem.id)}
                        disabled={userItem.is_equipped || processingItemId === userItem.id || isLoading}
                        className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                          userItem.is_equipped
                            ? 'bg-secondary/20 text-secondary cursor-default'
                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {processingItemId === userItem.id ? (
                          <span className="flex items-center justify-center gap-1">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          </span>
                        ) : userItem.is_equipped ? (
                          <span>{t('profile.equipped') || 'Equipped'}</span>
                        ) : (
                          <span>{t('profile.equip') || 'Equip'}</span>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleSellClick(userItem)}
                      disabled={processingItemId === userItem.id || isLoading}
                      className="flex-1 bg-primary hover:bg-primary/80 text-white py-2 px-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      💰 {t('shop.sell') || 'Sell'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sell Modal */}
      <SellModal
        isOpen={isSellModalOpen}
        onClose={() => {
          setIsSellModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onConfirm={handleConfirmSell}
        isLoading={processingItemId !== null}
      />
    </>
  );
};

export default MyItemsList;
