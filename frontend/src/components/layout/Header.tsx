import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import { useLoanStore } from '../../store/loanStore';
import { useSoundStore } from '../../store/soundStore';
import { soundManager } from '../../utils/sounds';
import LanguageSwitcher from '../LanguageSwitcher';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { t } = useTranslation();
  const { user, isLoading, logout } = useAuthStore();
  const { summary, fetchSummary, checkBankruptcy } = useLoanStore();
  const { isMusicEnabled, isSfxEnabled, musicVolume, toggleMusic, toggleSfx } = useSoundStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Initialize sound manager
  useEffect(() => {
    soundManager.init();
  }, []);

  // Fetch loan summary and check bankruptcy periodically
  useEffect(() => {
    if (user) {
      fetchSummary();
      checkBankruptcy();

      // Update every 5 seconds
      const interval = setInterval(() => {
        fetchSummary();
        checkBankruptcy();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [user, fetchSummary, checkBankruptcy]);

  // Control background music
  useEffect(() => {
    if (isMusicEnabled) {
      soundManager.playMusic(musicVolume);
    } else {
      soundManager.stopMusic();
    }
  }, [isMusicEnabled, musicVolume]);

  const handleMusicToggle = () => {
    toggleMusic();
    if (isSfxEnabled) {
      soundManager.play('click', 0.3);
    }
  };

  const handleSfxToggle = () => {
    soundManager.play('click', 0.3);
    toggleSfx();
  };

  const handleLogout = () => {
    if (isSfxEnabled) {
      soundManager.play('click', 0.3);
    }
    logout();
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Hamburger button for mobile */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden text-gray-300 hover:text-white transition-colors p-2 -ml-2 touch-manipulation"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-xl md:text-2xl font-bold text-primary">🎰 FREEZINO</span>
            </Link>
          </div>

          {/* Right: Language + Balance + Avatar */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Language Switcher - hide on small screens */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Sound Controls - hide on small screens */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={handleMusicToggle}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title={isMusicEnabled ? t('sound.musicOn') || 'Music On' : t('sound.musicOff') || 'Music Off'}
              >
                <span className="text-xl">{isMusicEnabled ? '🎵' : '🔇'}</span>
              </button>
              <button
                onClick={handleSfxToggle}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title={isSfxEnabled ? t('sound.sfxOn') || 'Sound Effects On' : t('sound.sfxOff') || 'Sound Effects Off'}
              >
                <span className="text-xl">{isSfxEnabled ? '🔊' : '🔈'}</span>
              </button>
            </div>

            {/* Balance - responsive sizing */}
            <div className="flex flex-col md:flex-row items-end md:items-center space-y-1 md:space-y-0 md:space-x-2">
              <div className="flex items-center space-x-1 md:space-x-2 bg-gray-700 px-2 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-gray-600 transition-colors">
                <span className="text-secondary text-lg md:text-xl font-bold">💰</span>
                {isLoading ? (
                  <div className="w-12 md:w-16 h-4 md:h-5 bg-gray-600 animate-pulse rounded"></div>
                ) : (
                  <span className="text-white text-sm md:text-base font-semibold">
                    ${user?.balance?.toLocaleString() || '0'}
                  </span>
                )}
              </div>

              {/* Debt Info */}
              {summary && summary.interest_per_second > 0 && (
                <Link
                  to="/credit"
                  className="flex items-center space-x-1 bg-red-900/50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg hover:bg-red-900/70 transition-colors border border-red-700"
                  title={t('credit.losing_per_second', { defaultValue: 'Losing per second' })}
                >
                  <span className="text-red-400 text-xs md:text-sm font-semibold">
                    -${summary.interest_per_second.toFixed(4)}/s
                  </span>
                </Link>
              )}
            </div>

            {/* Logout Button - visible on desktop */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              title={t('common.logout')}
            >
              <span>🚪</span>
              <span className="font-medium">{t('common.logout')}</span>
            </button>

            {/* Avatar with Dropdown */}
            <div className="relative">
              {isLoading ? (
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-600 animate-pulse rounded-full"></div>
              ) : (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity touch-manipulation"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center border-2 border-gray-600 hover:border-secondary transition-colors">
                      <span className="text-lg md:text-xl">{user?.avatar || '👤'}</span>
                    </div>
                    <span className="hidden md:block text-white font-medium">{user?.name || 'Player'}</span>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-3 text-white hover:bg-gray-700 transition-colors border-b border-gray-700"
                        >
                          <span className="flex items-center space-x-2">
                            <span>👤</span>
                            <span>{t('nav.profile')}</span>
                          </span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-700 transition-colors rounded-b-lg"
                        >
                          <span className="flex items-center space-x-2">
                            <span>🚪</span>
                            <span>{t('common.logout')}</span>
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
