// Shell.jsx — Header + Sidebar + content slot
function Header({ balance, onLogout }) {
  return (
    <header className="sticky top-0 z-40 border-b"
            style={{ background: '#1F2937', borderColor: '#374151' }}>
      <div className="mx-auto px-4 py-3 flex items-center justify-between" style={{ maxWidth: 1280 }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold" style={{ color: '#DC2626' }}>🎰 FREEZINO</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors" title="Music">
            <span className="text-xl">🎵</span>
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors" title="SFX">
            <span className="text-xl">🔊</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
               style={{ background: '#374151' }}>
            <span style={{ color: '#FBBF24' }} className="text-xl font-bold">💰</span>
            <span className="text-white font-semibold tabular-nums">${balance.toLocaleString()}</span>
          </div>
          <a href="#" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
             style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid #B91C1C' }}
             title="Losing per second">
            <span className="text-xs font-semibold font-mono" style={{ color: '#FCA5A5' }}>-$0.0427/s</span>
          </a>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
            style={{ background: '#DC2626' }}
          >🚪 Logout</button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center border-2"
               style={{ background: 'linear-gradient(135deg, #DC2626, #FBBF24)', borderColor: '#4B5563' }}>
            <span className="text-xl">👤</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ active, onNav }) {
  const items = [
    { id: 'dashboard', label: 'Games', desc: 'Play and lose', icon: '🎮' },
    { id: 'shop',      label: 'Shop',  desc: 'Spend your winnings', icon: '🛍️' },
    { id: 'credit',    label: 'Credit',desc: 'Take a loan', icon: '💳' },
    { id: 'profile',   label: 'Profile', desc: 'Your stats', icon: '👤' },
    { id: 'work',      label: 'Work',   desc: 'Earn $500 / 3 min', icon: '⏰' },
    { id: 'stats',     label: 'Stats',  desc: 'House edge truth', icon: '🎰' },
  ];
  return (
    <aside className="sticky top-16 self-start border-r p-4"
           style={{ width: 260, background: '#1F2937', borderColor: '#374151', height: 'calc(100vh - 65px)' }}>
      <ul className="space-y-2">
        {items.map(it => {
          const on = active === it.id;
          return (
            <li key={it.id}>
              <button
                onClick={() => onNav(it.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all"
                style={{
                  background: on ? '#DC2626' : 'transparent',
                  boxShadow: on ? '0 8px 18px rgba(220,38,38,0.4)' : 'none',
                  color: on ? '#fff' : '#D1D5DB',
                }}
                onMouseEnter={e => { if (!on) { e.currentTarget.style.background = '#374151'; e.currentTarget.style.transform = 'translateX(2px)'; } }}
                onMouseLeave={e => { if (!on) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; } }}
              >
                <span className="text-xl">{it.icon}</span>
                <div>
                  <div className="font-medium">{it.label}</div>
                  <div className="text-xs" style={{ color: on ? '#fecaca' : '#9CA3AF' }}>{it.desc}</div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 pt-4 border-t" style={{ borderColor: '#374151' }}>
        <div className="rounded-lg p-3 text-center" style={{ background: '#374151' }}>
          <p className="text-xs text-gray-400">Play Responsibly</p>
          <p className="text-xs text-gray-500 mt-1">Virtual currency only</p>
        </div>
      </div>
    </aside>
  );
}
window.Header = Header;
window.Sidebar = Sidebar;
