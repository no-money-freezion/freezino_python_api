import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

import { buttonHoverVariants } from './variants';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

/**
 * AnimatedButton component
 * Button with smooth hover and tap animations
 * Usage: <AnimatedButton variant="primary" onClick={handleClick}>Click me</AnimatedButton>
 */
const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: AnimatedButtonProps) => {
  const getVariantClasses = () => {
    const baseClasses = 'font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-primary text-white hover:bg-primary/90 active:bg-primary/80`;
      case 'secondary':
        return `${baseClasses} bg-secondary text-gray-900 hover:bg-secondary/90 active:bg-secondary/80`;
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 active:bg-red-800`;
      case 'ghost':
        return `${baseClasses} bg-transparent text-white border border-gray-600 hover:bg-gray-800 active:bg-gray-700`;
      default:
        return baseClasses;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-8 py-4 text-lg';
      case 'md':
      default:
        return 'px-6 py-3 text-base';
    }
  };

  return (
    <motion.button
      variants={buttonHoverVariants}
      initial="rest"
      whileHover={!disabled && !isLoading ? 'hover' : 'rest'}
      whileTap={!disabled && !isLoading ? 'tap' : 'rest'}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center space-x-2">
          <motion.span
            className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

/**
 * AnimatedIconButton component
 * Button with icon and ripple effect
 */
export const AnimatedIconButton = ({
  children,
  className = '',
  disabled,
  ...props
}: Omit<AnimatedButtonProps, 'variant' | 'size' | 'fullWidth'>) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      className={`
        p-2 rounded-full bg-gray-800 text-white
        hover:bg-gray-700 active:bg-gray-600
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

/**
 * AnimatedPulseButton component
 * Button with continuous pulse animation (for important CTAs)
 */
export const AnimatedPulseButton = ({
  children,
  className = '',
  ...props
}: Omit<AnimatedButtonProps, 'variant' | 'size'>) => {
  return (
    <motion.button
      animate={{
        boxShadow: [
          '0 0 0 0 rgba(220, 38, 38, 0.7)',
          '0 0 0 10px rgba(220, 38, 38, 0)',
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        px-6 py-3 rounded-lg font-semibold
        bg-primary text-white
        hover:bg-primary/90 active:bg-primary/80
        transition-colors duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
