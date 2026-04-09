import { motion } from 'framer-motion';

import ContactForm from '../components/ContactForm';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
            📧 Свяжитесь с нами
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            У вас есть вопросы или предложения? Мы будем рады услышать от вас!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Email */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl">📬</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Email</h3>
                  <p className="text-gray-400">Напишите нам напрямую</p>
                </div>
              </div>
              <a
                href="mailto:support@freezino.com"
                className="text-secondary hover:text-primary transition-colors font-semibold"
              >
                support@freezino.com
              </a>
            </div>

            {/* Response Time */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl">⏱️</div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Время ответа
                  </h3>
                  <p className="text-gray-400">Обычно отвечаем в течение</p>
                </div>
              </div>
              <p className="text-white font-semibold">24-48 часов</p>
            </div>

            {/* FAQ Note */}
            <div className="bg-primary/10 border border-primary/50 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="text-white font-bold mb-2">Совет</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Прежде чем отправить вопрос, проверьте раздел{' '}
                    <a
                      href="/about"
                      className="text-secondary hover:text-primary transition-colors underline"
                    >
                      О проекте
                    </a>
                    {' '}— возможно, там уже есть ответ на ваш вопрос.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ContactForm />
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center"
        >
          <h3 className="text-white font-bold text-lg mb-3">
            📢 О проекте Freezino
          </h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            Freezino — это образовательный проект, созданный для борьбы с
            игровой зависимостью. Мы используем симуляцию казино, чтобы показать
            реальные риски азартных игр в безопасной среде.
          </p>
          <a
            href="/about"
            className="inline-block bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
          >
            Узнать больше о проекте →
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
