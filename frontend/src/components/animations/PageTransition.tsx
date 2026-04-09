import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { pageVariants } from './variants';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageTransition component
 * Wraps page content with fade-in animation
 * Usage: <PageTransition>Your page content</PageTransition>
 */
const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
