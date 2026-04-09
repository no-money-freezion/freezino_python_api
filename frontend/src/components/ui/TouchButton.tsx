import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const TouchButton = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  type,
}: TouchButtonProps) => {
  const baseClasses = 'touch-manipulation rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-primary text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-secondary to-yellow-500 hover:from-yellow-500 hover:to-secondary text-gray-900 shadow-lg hover:shadow-xl',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-600 text-white shadow-lg hover:shadow-xl',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px] md:min-h-[40px]',
    md: 'px-4 md:px-6 py-3 md:py-3.5 text-base min-h-[44px] md:min-h-[48px]',
    lg: 'px-6 md:px-8 py-4 md:py-5 text-lg min-h-[52px] md:min-h-[56px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </motion.button>
  );
};

export default TouchButton;
