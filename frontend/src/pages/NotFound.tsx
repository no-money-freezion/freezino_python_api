import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { PageTransition, AnimatedButton, bounceVariants, scaleFadeVariants } from '../components/animations';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <PageTransition>
        <div className="text-center">
          <motion.h1
            className="text-9xl font-bold text-primary mb-4"
            variants={bounceVariants}
            initial="initial"
            animate="animate"
          >
            404
          </motion.h1>
          <motion.h2
            className="text-3xl font-semibold text-white mb-4"
            variants={scaleFadeVariants}
            initial="initial"
            animate="animate"
          >
            Страница не найдена
          </motion.h2>
          <motion.p
            className="text-gray-400 mb-8"
            variants={scaleFadeVariants}
            initial="initial"
            animate="animate"
          >
            К сожалению, запрашиваемая страница не существует
          </motion.p>
          <Link to="/">
            <AnimatedButton variant="primary" size="lg">
              Вернуться на главную
            </AnimatedButton>
          </Link>
        </div>
      </PageTransition>
    </div>
  );
};

export default NotFound;
