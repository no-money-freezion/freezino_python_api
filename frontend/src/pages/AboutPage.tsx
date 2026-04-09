import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
            {t('about.title')}
          </h1>
          <p className="text-gray-400 text-base md:text-lg lg:text-xl">
            {t('about.subtitle')}
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-gray-700 shadow-2xl mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-6xl">🎯</span>
            <div>
              <h2 className="text-3xl font-bold text-white">{t('about.mission.title')}</h2>
              <p className="text-gray-400">{t('about.mission.subtitle')}</p>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: t('about.mission.description') }} />
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-gray-700 shadow-2xl mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-6xl">⚙️</span>
            <div>
              <h2 className="text-3xl font-bold text-white">{t('about.howItWorks.title')}</h2>
              <p className="text-gray-400">{t('about.howItWorks.subtitle')}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start space-x-4">
              <div className="bg-primary text-white font-bold rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {t('about.howItWorks.step1.title')}
                </h3>
                <p className="text-gray-300" dangerouslySetInnerHTML={{ __html: t('about.howItWorks.step1.description') }} />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-4">
              <div className="bg-primary text-white font-bold rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {t('about.howItWorks.step2.title')}
                </h3>
                <p className="text-gray-300">
                  {t('about.howItWorks.step2.description')}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4">
              <div className="bg-primary text-white font-bold rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {t('about.howItWorks.step3.title')}
                </h3>
                <p className="text-gray-300">
                  {t('about.howItWorks.step3.description')}
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-4">
              <div className="bg-primary text-white font-bold rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {t('about.howItWorks.step4.title')}
                </h3>
                <p className="text-gray-300">
                  {t('about.howItWorks.step4.description')}
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start space-x-4">
              <div className="bg-primary text-white font-bold rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                5
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  Виртуальные покупки
                </h3>
                <p className="text-gray-300">
                  Покупайте виртуальное имущество (одежду, машины, дома), чтобы
                  почувствовать связь между деньгами и материальными ценностями.
                  При нехватке средств можно продать имущество.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Educational Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-gray-700 shadow-2xl mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-6xl">🎓</span>
            <div>
              <h2 className="text-3xl font-bold text-white">
                Образовательная миссия
              </h2>
              <p className="text-gray-400">Чему мы учим</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
              <div className="text-3xl mb-3">⚠️</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Риски азартных игр
              </h3>
              <p className="text-gray-300">
                Показываем, насколько легко и быстро можно потерять деньги,
                даже "играя умно".
              </p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Ценность труда
              </h3>
              <p className="text-gray-300">
                Демонстрируем, сколько времени нужно работать, чтобы заработать
                деньги, которые можно проиграть за минуты.
              </p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Реальная статистика
              </h3>
              <p className="text-gray-300">
                Сравниваем игровые результаты с реальными экономическими данными
                разных стран.
              </p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Финансовая грамотность
              </h3>
              <p className="text-gray-300">
                Учим принимать осознанные финансовые решения и понимать риски.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Key Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-primary/10 border border-primary/50 rounded-2xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            🔑 Ключевые принципы
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <p className="text-gray-300 flex-1">
                <strong className="text-white">100% виртуально:</strong> Только
                виртуальная валюта, никаких реальных денег.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <p className="text-gray-300 flex-1">
                <strong className="text-white">Образовательный подход:</strong>{' '}
                Каждый элемент игры учит чему-то важному.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <p className="text-gray-300 flex-1">
                <strong className="text-white">Безопасная среда:</strong> Учитесь
                на ошибках без реальных последствий.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <p className="text-gray-300 flex-1">
                <strong className="text-white">Социальная ответственность:</strong>{' '}
                Помогаем предотвратить игровую зависимость.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-gray-700 shadow-2xl mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-6xl">❓</span>
            <div>
              <h2 className="text-3xl font-bold text-white">FAQ</h2>
              <p className="text-gray-400">Часто задаваемые вопросы</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Можно ли вывести виртуальные деньги?
              </h3>
              <p className="text-gray-300">
                Нет. Все деньги в Freezino — виртуальные. Их нельзя вывести,
                обменять на реальные деньги или использовать вне платформы.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Нужно ли платить, чтобы играть?
              </h3>
              <p className="text-gray-300">
                Нет. Freezino полностью бесплатный. Мы НЕ принимаем реальные
                деньги и никогда не будем этого делать.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Кому подходит этот проект?
              </h3>
              <p className="text-gray-300">
                Freezino предназначен для людей старше 18 лет, которые хотят
                понять механику азартных игр в безопасной среде, или для тех,
                кто борется с игровой зависимостью.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Как игры обеспечивают честность?
              </h3>
              <p className="text-gray-300">
                Все игры используют криптографически безопасные генераторы
                случайных чисел и работают с реалистичными вероятностями,
                соответствующими настоящим казино.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-center"
        >
          <h2 className="text-white text-3xl font-bold mb-4">
            Остались вопросы?
          </h2>
          <p className="text-white/90 text-lg mb-6">
            Свяжитесь с нами — мы всегда рады помочь!
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-primary font-bold px-8 py-4 rounded-xl hover:shadow-2xl transition-all"
          >
            📧 Связаться с нами
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
