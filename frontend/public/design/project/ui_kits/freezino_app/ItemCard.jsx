// ItemCard.jsx — shop tile with rarity + owned badges
const RARITY = {
  common:    { border: '#6B7280', bg: '#374151', glow: 'rgba(107,114,128,0.3)' },
  rare:      { border: '#3B82F6', bg: '#1D4ED8', glow: 'rgba(59,130,246,0.35)' },
  epic:      { border: '#A855F7', bg: '#6D28D9', glow: 'rgba(168,85,247,0.4)' },
  legendary: { border: '#F59E0B', bg: '#D97706', glow: 'rgba(245,158,11,0.45)' },
};
const TYPE_EMOJI = { clothing: '👔', car: '🚗', house: '🏠', accessories: '💎' };

function ItemCard({ item, onBuy, owned = false }) {
  const [hover, setHover] = React.useState(false);
  const r = RARITY[item.rarity] || RARITY.common;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative rounded-xl overflow-hidden border-2 transition-all"
      style={{
        background: '#1F2937',
        borderColor: r.border,
        boxShadow: `0 10px 20px ${r.glow}`,
        transform: hover ? 'translateY(-5px) scale(1.03)' : 'none',
      }}
    >
      <div className="absolute top-2 right-2 text-xs font-bold uppercase px-3 py-1 rounded-full z-10"
           style={{ background: r.bg, color: '#fff', letterSpacing: '.05em' }}>
        {item.rarity}
      </div>
      {owned && (
        <div className="absolute top-2 left-2 text-xs font-bold px-3 py-1 rounded-full z-10"
             style={{ background: '#16A34A', color: '#fff' }}>
          Owned
        </div>
      )}
      <div className="h-44 flex items-center justify-center relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #111827, #1F2937)' }}>
        {item.image_url
          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          : <div className="text-7xl">{TYPE_EMOJI[item.type] || '📦'}</div>}
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(to top, rgba(17,24,39,.85), transparent 60%)' }}/>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{TYPE_EMOJI[item.type]}</span>
          <h3 className="text-base font-bold text-white truncate flex-1">{item.name}</h3>
        </div>
        <p className="text-gray-400 text-xs mb-3" style={{ minHeight: 32 }}>{item.description}</p>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-gray-500 text-xs">Price</div>
            <div style={{ color: '#FBBF24' }} className="text-xl font-bold">
              ${item.price.toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => !owned && onBuy(item)}
            disabled={owned}
            className="px-5 py-2 rounded-lg font-bold text-white transition-all text-sm"
            style={{
              background: owned
                ? '#4B5563'
                : 'linear-gradient(90deg, #D97706, #FBBF24)',
              cursor: owned ? 'not-allowed' : 'pointer',
              boxShadow: owned ? 'none' : '0 6px 14px rgba(245,158,11,0.35)',
            }}
          >
            {owned ? 'Owned' : 'Buy'}
          </button>
        </div>
      </div>
    </div>
  );
}
window.ItemCard = ItemCard;
window.RARITY = RARITY;
window.TYPE_EMOJI = TYPE_EMOJI;
