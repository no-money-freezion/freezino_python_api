type CookiePreference = 'all' | 'essential' | 'none';

const COOKIE_CONSENT_KEY = 'freezino-cookie-consent';

// Helper function to check if analytics are enabled
export const isAnalyticsEnabled = (): boolean => {
  return localStorage.getItem('freezino-analytics-enabled') === 'true';
};

// Helper function to get current consent preference
export const getCookieConsent = (): CookiePreference | null => {
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  return consent as CookiePreference | null;
};
