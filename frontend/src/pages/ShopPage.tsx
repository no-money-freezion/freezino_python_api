import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { PageTransition, rotateVariants } from '../components/animations';
import BuyModal from '../components/shop/BuyModal';
import ItemCard from '../components/shop/ItemCard';
import ShopFilters from '../components/shop/ShopFilters';
import { useAuthStore } from '../store/authStore';
import { useShopStore } from '../store/shopStore';
import type { Item } from '../types';

export default function ShopPage() {
  const { t } = useTranslation();
  const { items, myItems, isLoading, fetchItems, fetchMyItems, minPrice, maxPrice, filterType, filterRarity } = useShopStore();
  const user = useAuthStore((state) => state.user);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
    fetchMyItems();
  }, [fetchItems, fetchMyItems]);

  // Filter items by type, rarity, and price range
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter by type
      const matchesType = filterType === 'all' || item.type === filterType;

      // Filter by rarity
      const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;

      // Filter by price
      const matchesPrice = item.price >= minPrice && item.price <= maxPrice;

      return matchesType && matchesRarity && matchesPrice;
    });
  }, [items, minPrice, maxPrice, filterType, filterRarity]);

  // Check if item is owned
  const isItemOwned = (itemId: string) => {
    return myItems.some((userItem) => userItem.item_id === itemId);
  };

  const handleBuyClick = (item: Item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
            <span>🛍️</span>
            {t('shop.title')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('shop.subtitle')}
          </p>

          {/* Balance Display */}
          <div className="mt-4 inline-block bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg px-6 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{t('shop.yourBalance')}:</span>
              <span className="text-white text-2xl font-bold">${user?.balance?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ShopFilters />
        </motion.div>

        {/* Items Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <motion.div
                  className="inline-block rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mb-4"
                  variants={rotateVariants}
                  initial="initial"
                  animate="animate"
                />
                <p className="text-gray-400 text-lg">{t('shop.loadingItems')}</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-white mb-2">{t('shop.noItems')}</h3>
              <p className="text-gray-400">{t('shop.tryAdjustFilters')}</p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-4">
                <p className="text-gray-400">
                  {t('shop.showing')} <span className="text-white font-semibold">{filteredItems.length}</span> {t('shop.items')}
                </p>
              </div>

              {/* Items Grid or Empty State */}
              {filteredItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="text-8xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {t('shop.noItems')}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {t('shop.tryAdjustFilters')}
                  </p>
                  <button
                    onClick={() => {
                      useShopStore.setState({
                        filterType: 'all',
                        filterRarity: 'all',
                        minPrice: 0,
                        maxPrice: 1000000,
                      });
                    }}
                    className="px-6 py-3 bg-primary hover:bg-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
                  >
                    {t('shop.reset')}
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <ItemCard
                        item={item}
                        onBuy={handleBuyClick}
                        owned={isItemOwned(item.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Buy Modal */}
        <BuyModal item={selectedItem} isOpen={isModalOpen} onClose={handleCloseModal} />
      </div>
      </div>
    </PageTransition>
  );
}
