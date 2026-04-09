import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type CookiePreference = 'all' | 'essential' | 'none';

const COOKIE_CONSENT_KEY = 'freezino-cookie-consent';

const CookieConsent = () => {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (preference: CookiePreference) => {
    // Save preference to localStorage
    localStorage.setItem(COOKIE_CONSENT_KEY, preference);

    // Set analytics flag based on preference
    if (preference === 'all') {
      localStorage.setItem('freezino-analytics-enabled', 'true');
    } else {
      localStorage.setItem('freezino-analytics-enabled', 'false');
    }

    // Hide banner
    setShowBanner(false);

    // Trigger event for analytics initialization if accepted
    if (preference === 'all') {
      window.dispatchEvent(new CustomEvent('cookieConsentGranted'));
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-gray-900 border-t-2 border-primary shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🍪</span>
                <h3 className="text-lg font-bold text-white">
                  {t('cookies.consent.title')}
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {t('cookies.consent.description')}{' '}
                <Link
                  to="/cookies"
                  className="text-secondary hover:text-primary underline transition-colors"
                >
                  {t('cookies.consent.learnMore')}
                </Link>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={() => handleConsent('all')}
                className="px-6 py-3 bg-primary hover:bg-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
              >
                {t('cookies.consent.acceptAll')}
              </button>
              <button
                onClick={() => handleConsent('essential')}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
              >
                {t('cookies.consent.onlyEssential')}
              </button>
              <button
                onClick={() => handleConsent('none')}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg border border-gray-600 transition-all transform hover:scale-105 whitespace-nowrap"
              >
                {t('cookies.consent.rejectAll')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
