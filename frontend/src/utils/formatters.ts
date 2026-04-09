import i18n from '../i18n/config';

/**
 * Format currency based on current locale
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | undefined | null): string => {
  // Handle undefined/null values
  const safeAmount = amount ?? 0;

  const currentLang = i18n.language;

  const currencyMap: Record<string, { symbol: string; position: 'before' | 'after' }> = {
    en: { symbol: '$', position: 'before' },
    es: { symbol: '$', position: 'before' },
    ru: { symbol: '₽', position: 'after' },
  };

  const currency = currencyMap[currentLang] || currencyMap.en;
  const formattedAmount = safeAmount.toLocaleString(currentLang);

  return currency.position === 'before'
    ? `${currency.symbol}${formattedAmount}`
    : `${formattedAmount}${currency.symbol}`;
};

/**
 * Format date based on current locale
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string => {
  const currentLang = i18n.language;
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat(currentLang, defaultOptions).format(dateObj);
};

/**
 * Format time based on current locale
 * @param date - The date to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date | string | number): string => {
  const currentLang = i18n.language;
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return new Intl.DateTimeFormat(currentLang, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Format date and time based on current locale
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string | number): string => {
  const currentLang = i18n.language;
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return new Intl.DateTimeFormat(currentLang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Format duration (seconds) to human-readable string
 * @param seconds - Duration in seconds
 * @param t - Translation function from useTranslation
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number, t: (key: string, options?: Record<string, unknown>) => string): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return t('work.hoursAndMinutes', { hours, minutes });
  }
  return t('work.minutes', { count: minutes });
};
