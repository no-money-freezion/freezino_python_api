import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SellModal from '../components/shop/SellModal';
import api from '../services/api';
import { useShopStore } from '../store/shopStore';
import type { UserItem } from '../types';

interface ProfileStats {
  user_id: number;
  total_work_time: number;
  total_earned: number;
  total_game_sessions: number;
  total_bet: number;
  total_won: number;
  total_lost: number;
  net_profit: number;
  favorite_game: string;
  biggest_win: number;
  biggest_loss: number;
}

interface UserProfile {
  id: number;
  username?: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
  created_at: string;
}

const ProfilePage = () => {
  const { t } = useTranslation();
  const { equipItem, sellItem } = useShopStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [equipLoading, setEquipLoading] = useState<string | null>(null);
  const [sellLoading, setSellLoading] = useState<string | null>(null);
  const [selectedItemToSell, setSelectedItemToSell] = useState<UserItem | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual user ID from auth
      const userId = 1;

      // Fetch profile, stats, and items in parallel
      const [profileRes, statsRes, itemsRes] = await Promise.all([
        api.get(`/user/profile?user_id=${userId}`),
        api.get(`/user/stats?user_id=${userId}`),
        api.get(`/user/items?user_id=${userId}`),
      ]);

      setProfile(profileRes.data.data);
      setStats(statsRes.data.data);
      setItems(itemsRes.data.data.items || []);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEquipItem = async (itemId: string) => {
    setEquipLoading(itemId);
    try {
      await equipItem(itemId);
      // Refresh items to show updated equipped state
      await fetchProfileData();
    } catch (err) {
      console.error('Error equipping item:', err);
      setError('Failed to equip item. Please try again.');
    } finally {
      setEquipLoading(null);
    }
  };

  const handleSellClick = (item: UserItem) => {
    setSelectedItemToSell(item);
    setIsSellModalOpen(true);
  };

  const handleConfirmSell = async (itemId: string) => {
    setSellLoading(itemId);
    try {
      await sellItem(itemId);
      // Refresh data to show updated balance and items
      await fetchProfileData();
      setIsSellModalOpen(false);
      setSelectedItemToSell(null);
    } catch (err) {
      console.error('Error selling item:', err);
      setError('Failed to sell item. Please try again.');
    } finally {
      setSellLoading(null);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-800 rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-2xl h-96"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-800 rounded-xl"></div>
                <div className="h-32 bg-gray-800 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-red-900/20 border border-red-500 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={fetchProfileData}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const equippedItems = items.filter(item => item.is_equipped);

  // Group equipped items by type
  const clothing = equippedItems.find(item => item.item.type === 'clothing');
  const car = equippedItems.find(item => item.item.type === 'car');
  const house = equippedItems.find(item => item.item.type === 'house');
  const accessories = equippedItems.filter(item => item.item.type === 'accessories');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('profile.title', { name: profile?.name || profile?.username || 'User' })}
          </h1>
          <p className="text-gray-400">
            {t('profile.memberSince', {
              date: profile ? new Date(profile.created_at).toLocaleDateString() : ''
            })}
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Equipment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2">👤</span> Your Equipment
              </h2>

              <div className="space-y-6">
                {/* Clothing */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👔</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">{t('profile.equipment.clothing')}:</p>
                    {clothing ? (
                      <p className="text-lg font-semibold text-white">
                        {clothing.item.name}
                      </p>
                    ) : (
                      <p className="text-base text-gray-500 italic">
                        {t('profile.equipment.noClothing')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Car */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🚗</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">{t('profile.equipment.vehicle')}:</p>
                    {car ? (
                      <p className="text-lg font-semibold text-white">
                        {car.item.name}
                      </p>
                    ) : (
                      <p className="text-base text-gray-500 italic">
                        {t('profile.equipment.noVehicle')}
                      </p>
                    )}
                  </div>
                </div>

                {/* House */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏠</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">{t('profile.equipment.home')}:</p>
                    {house ? (
                      <p className="text-lg font-semibold text-white">
                        {house.item.name}
                      </p>
                    ) : (
                      <p className="text-base text-gray-500 italic">
                        {t('profile.equipment.noHome')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Accessories */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💎</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">{t('profile.equipment.accessories')}:</p>
                    {accessories.length > 0 ? (
                      <ul className="space-y-1 mt-1">
                        {accessories.map((item) => (
                          <li key={item.id} className="text-base font-medium text-white">
                            • {item.item.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-base text-gray-500 italic">
                        {t('profile.equipment.noAccessories')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-secondary to-primary rounded-2xl p-6 border border-gray-700 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                <span className="mr-2">💰</span> Current Balance
              </h3>
              <p className="text-5xl font-bold text-white">
                {formatCurrency(profile?.balance || 0)}
              </p>
            </motion.div>

            {/* Work Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">⏱️</span> Work Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Total Time Worked</p>
                  <p className="text-2xl font-bold text-white">
                    {formatTime(stats?.total_work_time || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Earned</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(stats?.total_earned || 0)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Game Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">🎮</span> Gaming Statistics
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Games Played</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.total_game_sessions || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Favorite Game</p>
                    <p className="text-xl font-bold text-secondary capitalize">
                      {stats?.favorite_game || 'None'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Bet</p>
                    <p className="text-xl font-bold text-yellow-400">
                      {formatCurrency(stats?.total_bet || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Won</p>
                    <p className="text-xl font-bold text-green-400">
                      {formatCurrency(stats?.total_won || 0)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Biggest Win</p>
                    <p className="text-xl font-bold text-green-400">
                      {formatCurrency(stats?.biggest_win || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Net Profit</p>
                    <p className={`text-xl font-bold ${
                      (stats?.net_profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(stats?.net_profit || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Items Count */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">🛍️</span> Inventory
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Total Items</p>
                  <p className="text-2xl font-bold text-white">{items.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Equipped Items</p>
                  <p className="text-2xl font-bold text-secondary">
                    {equippedItems.length}
                  </p>
                </div>
              </div>
              <a
                href="/shop"
                className="mt-4 block w-full text-center py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors font-semibold"
              >
                Visit Shop
              </a>
            </motion.div>
          </div>
        </div>

        {/* All Items Section */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-gray-800 rounded-2xl p-6 border border-gray-700"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">📦</span> All Purchased Items
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((userItem) => (
                <div
                  key={userItem.id}
                  className={`p-4 rounded-xl border transition-all ${
                    userItem.is_equipped
                      ? 'bg-secondary/10 border-secondary shadow-lg shadow-secondary/20'
                      : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center mb-3 h-20">
                    {userItem.item.image_url ? (
                      <img
                        src={userItem.item.image_url}
                        alt={userItem.item.name}
                        className="max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-4xl">
                        {userItem.item.type === 'house' && '🏠'}
                        {userItem.item.type === 'clothing' && '👕'}
                        {userItem.item.type === 'car' && '🚗'}
                        {userItem.item.type === 'accessories' && '💎'}
                      </div>
                    )}
                  </div>
                  <h4 className="font-semibold text-white text-center mb-1">
                    {userItem.item.name}
                  </h4>
                  <p className="text-xs text-gray-400 text-center mb-2 capitalize">
                    {userItem.item.type}
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Purchased: {new Date(userItem.purchased_at).getFullYear() > 1900
                      ? new Date(userItem.purchased_at).toLocaleDateString()
                      : 'N/A'}
                  </p>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEquipItem(userItem.id.toString())}
                      disabled={userItem.is_equipped || equipLoading === userItem.id.toString() || sellLoading === userItem.id.toString()}
                      className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                        userItem.is_equipped
                          ? 'bg-secondary/20 text-secondary cursor-default'
                          : 'bg-secondary hover:bg-secondary/80 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {equipLoading === userItem.id.toString() ? (
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
                        '✓ Equipped'
                      ) : (
                        'Equip'
                      )}
                    </button>

                    <button
                      onClick={() => handleSellClick(userItem)}
                      disabled={equipLoading === userItem.id.toString() || sellLoading === userItem.id.toString()}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      💰 Sell
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Sell Modal */}
      <SellModal
        isOpen={isSellModalOpen}
        onClose={() => {
          setIsSellModalOpen(false);
          setSelectedItemToSell(null);
        }}
        item={selectedItemToSell}
        onConfirm={handleConfirmSell}
        isLoading={sellLoading !== null}
      />
    </div>
  );
};

export default ProfilePage;
