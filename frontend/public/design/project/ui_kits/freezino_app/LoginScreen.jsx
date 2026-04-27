// LoginScreen.jsx
function LoginScreen({ onLogin }) {
  const [mode, setMode] = React.useState('login');
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#1F2937' }}>
      <div className="p-8 rounded-lg border w-full" style={{ background: '#1F2937', borderColor: '#374151', maxWidth: 440 }}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#DC2626' }}>🎰 FREEZINO</h1>
          <p style={{ color: '#9CA3AF' }}>Казино-симулятор против игровой зависимости</p>
        </div>
        <div className="flex mb-6 rounded-lg p-1" style={{ background: '#111827' }}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => setMode(m)}
                    className="flex-1 py-2 px-4 rounded-md transition-colors font-medium"
                    style={{ background: mode === m ? '#DC2626' : 'transparent', color: mode === m ? '#fff' : '#9CA3AF' }}>
              {m === 'login' ? 'Вход' : 'Регистрация'}
            </button>
          ))}
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm mb-2" style={{ color: '#9CA3AF' }}>Логин</label>
            <input defaultValue="igrok_1985"
                   className="w-full rounded-lg px-4 py-2 text-white outline-none"
                   style={{ background: '#111827', border: '1px solid #374151' }}/>
          </div>
          {mode === 'register' && (
            <div>
              <label className="block text-sm mb-2" style={{ color: '#9CA3AF' }}>Email</label>
              <input defaultValue="player@example.com"
                     className="w-full rounded-lg px-4 py-2 text-white outline-none"
                     style={{ background: '#111827', border: '1px solid #374151' }}/>
            </div>
          )}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#9CA3AF' }}>Пароль</label>
            <input type="password" defaultValue="secret123"
                   className="w-full rounded-lg px-4 py-2 text-white outline-none"
                   style={{ background: '#111827', border: '1px solid #DC2626' }}/>
          </div>
          <button onClick={onLogin}
                  className="w-full font-semibold py-3 px-6 rounded-lg text-white transition-colors"
                  style={{ background: '#DC2626' }}>
            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </div>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: '#374151' }}/></div>
          <div className="relative flex justify-center text-sm"><span className="px-2" style={{ background: '#1F2937', color: '#9CA3AF' }}>или</span></div>
        </div>
        <button onClick={onLogin}
                className="w-full font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-3"
                style={{ background: '#fff', color: '#1F2937' }}>
          <svg width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          <span>Войти через Google</span>
        </button>
        <div className="mt-6 text-center text-sm" style={{ color: '#9CA3AF' }}>
          <p>Входя, вы соглашаетесь:</p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>❌ Это не настоящее казино</li>
            <li>✅ Используются только виртуальные деньги</li>
            <li>🎓 Цель — образовательная</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
window.LoginScreen = LoginScreen;
