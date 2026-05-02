// GameCard.jsx — hover-scaling game tile
function GameCard({ title, icon, description, minBet = 10, isComingSoon = false, onClick }) {
  const [hover, setHover] = React.useState(false);
  const clickable = !isComingSoon;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={clickable ? onClick : undefined}
      className="relative overflow-hidden rounded-xl p-6 border-2 transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, #1F2937, #111827)',
        borderColor: clickable && hover ? '#DC2626' : '#374151',
        boxShadow: clickable && hover ? '0 10px 24px rgba(220,38,38,0.3)' : 'none',
        cursor: clickable ? 'pointer' : 'not-allowed',
        opacity: clickable ? 1 : 0.6,
        transform: clickable && hover ? 'translateY(-5px) scale(1.03)' : 'none',
      }}
    >
      {isComingSoon && (
        <div className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full z-10"
             style={{ background: '#FBBF24', color: '#1F2937' }}>
          COMING SOON
        </div>
      )}
      <div className="flex justify-center mb-3">
        <div className="text-6xl p-4 rounded-full"
             style={{ background: 'linear-gradient(135deg, #374151, #1F2937)' }}>
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white text-center mb-1">{title}</h3>
      <p className="text-gray-400 text-sm text-center mb-4" style={{ minHeight: 40 }}>{description}</p>
      {!isComingSoon && (
        <div className="flex items-center justify-center gap-2 rounded-lg py-2"
             style={{ background: '#374151' }}>
          <span className="text-gray-400 text-sm">Min bet</span>
          <span style={{ color: '#FBBF24' }} className="font-bold">${minBet}</span>
        </div>
      )}
    </div>
  );
}
window.GameCard = GameCard;
