import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  height?: string;
}

const LoadingSkeleton = ({
  className = '',
  count = 1,
  height = 'h-4',
}: LoadingSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`${height} bg-gray-700 rounded ${className}`}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
};

export default LoadingSkeleton;
