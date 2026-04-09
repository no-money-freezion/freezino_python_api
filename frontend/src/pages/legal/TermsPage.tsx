import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Import markdown files as raw strings
import termsEnContent from '../../content/legal/terms.en.md?raw';
import termsRuContent from '../../content/legal/terms.ru.md?raw';

const TermsPage = () => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Get language from localStorage or default to 'en'
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ru' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const content = language === 'en' ? termsEnContent : termsRuContent;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            to="/"
            className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-2"
          >
            <span>←</span> {language === 'en' ? 'Back to Home' : 'Вернуться на главную'}
          </Link>

          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            {language === 'en' ? '🇷🇺 Русский' : '🇬🇧 English'}
          </button>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-lg p-6 md:p-8 shadow-xl">
          <div className="prose prose-invert prose-sm md:prose-base max-w-none">
            <div
              className="markdown-content text-gray-100 leading-relaxed space-y-4"
              style={{ whiteSpace: 'pre-wrap', fontFamily: 'system-ui, sans-serif' }}
            >
              {content}
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-4 text-sm text-gray-400">
          <Link to="/privacy" className="hover:text-red-400 transition-colors">
            {language === 'en' ? 'Privacy Policy' : 'Политика конфиденциальности'}
          </Link>
          <span>•</span>
          <Link to="/cookies" className="hover:text-red-400 transition-colors">
            {language === 'en' ? 'Cookie Policy' : 'Политика Cookie'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
