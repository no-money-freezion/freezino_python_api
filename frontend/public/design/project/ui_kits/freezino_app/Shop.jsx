// Shop.jsx
const SHOP_ITEMS = [
  { id: '1', name: 'Ferrari F8',     description: 'Tributo V8 · top-tier flex',           price: 280000, rarity: 'legendary', type: 'car',         image_url: '../../assets/shop/cars/ferrari-f8.jpg' },
  { id: '2', name: 'Tesla Model S',  description: 'Electric luxury sedan',                price:  95000, rarity: 'epic',      type: 'car',         image_url: '../../assets/shop/cars/tesla-model-s.jpg' },
  { id: '3', name: 'Luxury Watch',   description: 'Swiss movement, steel case',           price:  12500, rarity: 'rare',      type: 'accessories', image_url: '../../assets/shop/accessories/luxury-watch.jpg' },
  { id: '4', name: 'Diamond Ring',   description: 'Single-stone brilliant cut',           price:   8400, rarity: 'rare',      type: 'accessories', image_url: '../../assets/shop/accessories/diamond-ring.jpg' },
  { id: '5', name: 'Business Suit',  description: 'Wool two-piece, slim fit',             price:   1200, rarity: 'common',    type: 'clothing',    image_url: '../../assets/shop/clothing/business-suit.jpg' },
  { id: '6', name: 'Designer Dress', description: 'Silk evening wear',                    price:   3200, rarity: 'epic',      type: 'clothing',    image_url: '../../assets/shop/clothing/designer-dress.jpg' },
  { id: '7', name: 'Hoodie',         description: 'Everyday cotton hoodie',               price:     80, rarity: 'common',    type: 'clothing' },
  { id: '8', name: 'Country Villa',  description: 'Seaside estate, 6 bedrooms',           price: 890000, rarity: 'legendary', type: 'house' },
];

function Shop({ balance, onBalanceChange }) {
  const [owned, setOwned] = React.useState(new Set(['3']));
  const [filter, setFilter] = React.useState('all');
  const [rarity, setRarity] = React.useState('all');

  const items = SHOP_ITEMS.filter(i =>
    (filter === 'all' || i.type === filter) &&
    (rarity === 'all' || i.rarity === rarity)
  );

  const buy = (item) => {
    if (owned.has(item.id) || balance < item.price) return;
    onBalanceChange(balance - item.price);
    setOwned(new Set([...owned, item.id]));
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'car', label: '🚗 Cars' },
    { id: 'clothing', label: '👔 Clothing' },
    { id: 'accessories', label: '💎 Accessories' },
    { id: 'house', label: '🏠 Houses' },
  ];
  const rarities = ['all', 'common', 'rare', 'epic', 'legendary'];

  return (
    <div className="p-4 md:p-8"
         style={{ background: 'linear-gradient(135deg, #111827, #1F2937, #111827)', minHeight: '100vh' }}>
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
            <span>🛍️</span> Shop
          </h1>
          <p className="text-lg" style={{ color: '#9CA3AF' }}>Spend your virtual dollars on exclusive items</p>
          <div className="mt-4 inline-block rounded-lg px-6 py-3 shadow-lg"
               style={{ background: 'linear-gradient(90deg, #D97706, #FBBF24)' }}>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">Your Balance:</span>
              <span className="text-white text-2xl font-bold tabular-nums">${balance.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      background: filter === f.id ? '#DC2626' : '#374151',
                      color: '#fff',
                    }}>
              {f.label}
            </button>
          ))}
          <div className="w-px mx-2" style={{ background: '#374151' }}/>
          {rarities.map(r => (
            <button key={r} onClick={() => setRarity(r)}
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                    style={{
                      background: rarity === r ? (
                        r === 'legendary' ? '#F59E0B' :
                        r === 'epic' ? '#A855F7' :
                        r === 'rare' ? '#3B82F6' :
                        r === 'common' ? '#6B7280' : '#DC2626'
                      ) : '#1F2937',
                      color: '#fff',
                      border: '1px solid #374151',
                    }}>
              {r}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <p style={{ color: '#9CA3AF' }}>
            Showing <span className="text-white font-semibold">{items.length}</span> items
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <ItemCard key={item.id} item={item} owned={owned.has(item.id)} onBuy={buy}/>
          ))}
        </div>
      </div>
    </div>
  );
}
window.Shop = Shop;
