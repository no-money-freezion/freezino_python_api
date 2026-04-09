import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type CookiePreference = 'all' | 'essential' | 'none';

const COOKIE_CONSENT_KEY = 'freezino-cookie-consent';

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const CookieSettings = ({ isOpen, onClose }: CookieSettingsProps) => {
  const { t } = useTranslation();
  const [, setPreference] = useState<CookiePreference>('essential');
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    // Load current preference
    const currentConsent = localStorage.getItem(COOKIE_CONSENT_KEY) as CookiePreference | null;
    if (currentConsent) {
      setPreference(currentConsent);
      setAnalyticsEnabled(currentConsent === 'all');
    }
  }, [isOpen]);

  const handleSave = () => {
    // Determine preference based on checkboxes
    let newPreference: CookiePreference;
    if (analyticsEnabled) {
      newPreference = 'all';
    } else {
      newPreference = 'essential';
    }

    // Save to localStorage
    localStorage.setItem(COOKIE_CONSENT_KEY, newPreference);
    localStorage.setItem('freezino-analytics-enabled', analyticsEnabled ? 'true' : 'false');

    // Trigger event if analytics enabled
    if (analyticsEnabled) {
      window.dispatchEvent(new CustomEvent('cookieConsentGranted'));
    }

    onClose();
  };

  const handleToggleAnalytics = () => {
    setAnalyticsEnabled(!analyticsEnabled);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 animate-fade-in">
      <div className="bg-gray-900 border-2 border-primary rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🍪</span>
            <h2 className="text-2xl font-bold text-white">{t('cookies.settings.title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          <p className="text-gray-300 leading-relaxed">
            {t('cookies.settings.description')}{' '}
            <Link
              to="/cookies"
              className="text-secondary hover:text-primary underline transition-colors"
              onClick={onClose}
            >
              {t('cookies.settings.learnMore')}
            </Link>
          </p>

          {/* Cookie Categories */}
          <div className="space-y-4">
            {/* Essential Cookies */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🔒</span>
                    <h3 className="text-lg font-semibold text-white">{t('cookies.settings.essential.title')}</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {t('cookies.settings.essential.description')}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>{t('cookies.settings.essential.items.jwt')}</p>
                    <p>{t('cookies.settings.essential.items.language')}</p>
                    <p>{t('cookies.settings.essential.items.settings')}</p>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="flex items-center justify-center w-12 h-6 bg-green-600 rounded-full cursor-not-allowed">
                    <div className="w-4 h-4 bg-white rounded-full transform translate-x-3"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">{t('cookies.settings.always')}</p>
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">📊</span>
                    <h3 className="text-lg font-semibold text-white">{t('cookies.settings.analytics.title')}</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {t('cookies.settings.analytics.description')}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>{t('cookies.settings.analytics.items.pageViews')}</p>
                    <p>{t('cookies.settings.analytics.items.gamePopularity')}</p>
                    <p>{t('cookies.settings.analytics.items.errorTracking')}</p>
                  </div>
                </div>
                <div className="ml-4">
                  <button
                    onClick={handleToggleAnalytics}
                    className={`flex items-center justify-center w-12 h-6 rounded-full transition-colors ${
                      analyticsEnabled ? 'bg-primary' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                        analyticsEnabled ? 'translate-x-3' : '-translate-x-3'
                      }`}
                    ></div>
                  </button>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {analyticsEnabled ? t('cookies.settings.enabled') : t('cookies.settings.disabled')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Preference */}
          <div className="bg-gray-800 rounded-lg p-4 border border-secondary">
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-secondary">{t('cookies.settings.currentSetting')}</span>{' '}
              {analyticsEnabled
                ? t('cookies.settings.allAllowed')
                : t('cookies.settings.onlyEssential')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            {t('cookies.settings.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary hover:bg-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            {t('cookies.settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieSettings;
