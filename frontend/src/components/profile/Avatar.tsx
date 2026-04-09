import { motion } from 'framer-motion';

import type { UserItem, Item } from '../../types';

interface AvatarProps {
  equippedItems: UserItem[];
  className?: string;
}

const Avatar = ({ equippedItems, className = '' }: AvatarProps) => {
  // Group items by type for easy access
  const itemsByType = equippedItems.reduce((acc, userItem) => {
    if (userItem.is_equipped && userItem.item) {
      acc[userItem.item.type] = userItem.item;
    }
    return acc;
  }, {} as Record<string, Item>);

  const house = itemsByType['house'];
  const clothing = itemsByType['clothing'];
  const car = itemsByType['car'];
  const accessories = itemsByType['accessories'];

  return (
    <div className={`relative w-full ${className}`}>
      {/* Avatar Container */}
      <div className="relative w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-700 shadow-2xl">

        {/* Background Layer - House */}
        <div className="absolute inset-0 z-0">
          {house ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-900/20 to-purple-900/20"
            >
              {house.image_url ? (
                <img
                  src={house.image_url}
                  alt={house.name}
                  className="w-full h-full object-cover opacity-60"
                />
              ) : (
                <div className="text-8xl opacity-30">🏠</div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                {house.name}
              </div>
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-700 to-gray-800">
              <div className="text-8xl opacity-20">🏚️</div>
            </div>
          )}
        </div>

        {/* Character Layer - Clothing */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            {clothing ? (
              <>
                {clothing.image_url ? (
                  <img
                    src={clothing.image_url}
                    alt={clothing.name}
                    className="w-48 h-48 object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="text-9xl drop-shadow-2xl">👤</div>
                )}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                  {clothing.name}
                </div>
              </>
            ) : (
              <div className="text-9xl opacity-50 drop-shadow-2xl">🧍</div>
            )}

            {/* Accessories Layer */}
            {accessories && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -top-4 -right-4"
              >
                {accessories.image_url ? (
                  <img
                    src={accessories.image_url}
                    alt={accessories.name}
                    className="w-16 h-16 object-contain drop-shadow-xl"
                  />
                ) : (
                  <div className="text-4xl drop-shadow-xl">💎</div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Car Layer - Bottom */}
        {car && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute bottom-0 left-0 right-0 z-20"
          >
            <div className="flex items-end justify-center pb-4">
              {car.image_url ? (
                <img
                  src={car.image_url}
                  alt={car.name}
                  className="w-32 h-auto object-contain drop-shadow-2xl"
                />
              ) : (
                <div className="text-6xl drop-shadow-2xl">🚗</div>
              )}
            </div>
            <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
              {car.name}
            </div>
          </motion.div>
        )}

        {/* Empty State Message */}
        {!house && !clothing && !car && !accessories && (
          <div className="absolute inset-0 z-30 flex items-center justify-center">
            <div className="text-center text-gray-400 px-8">
              <div className="text-6xl mb-4 opacity-30">🛍️</div>
              <p className="text-lg font-semibold">No Items Equipped</p>
              <p className="text-sm mt-2">Visit the shop to buy and equip items!</p>
            </div>
          </div>
        )}
      </div>

      {/* Items Legend */}
      {(house || clothing || car || accessories) && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { type: 'house', icon: '🏠', item: house, label: 'Home' },
            { type: 'clothing', icon: '👕', item: clothing, label: 'Outfit' },
            { type: 'car', icon: '🚗', item: car, label: 'Vehicle' },
            { type: 'accessories', icon: '💎', item: accessories, label: 'Accessory' },
          ].map(({ type, icon, item, label }) => (
            <div
              key={type}
              className={`p-2 rounded-lg border ${
                item
                  ? 'bg-gray-800 border-secondary/50'
                  : 'bg-gray-900 border-gray-700 opacity-50'
              }`}
            >
              <div className="text-2xl text-center mb-1">{icon}</div>
              <div className="text-xs text-center text-gray-400">
                {item ? item.name : `No ${label}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Avatar;
