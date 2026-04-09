import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

/**
 * LoadingSkeleton component with shimmer effect
 * Usage: <LoadingSkeleton variant="card" count={3} />
 */
const LoadingSkeleton = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  count = 1,
}: LoadingSkeletonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full aspect-square';
      case 'card':
        return 'h-48 rounded-xl';
      case 'rectangular':
      default:
        return 'h-12 rounded-lg';
    }
  };

  const skeletonStyle = {
    width: width || '100%',
    height: height || undefined,
  };

  const shimmerKeyframes = {
    backgroundPosition: ['-200% 0', '200% 0'],
  };

  const skeletonElement = (
    <motion.div
      className={`
        relative overflow-hidden
        bg-gray-700
        ${getVariantClasses()}
        ${className}
      `}
      style={skeletonStyle}
      animate={shimmerKeyframes}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {/* Shimmer effect overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"
        style={{
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['-200% 0', '200% 0'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{skeletonElement}</div>
      ))}
    </div>
  );
};

/**
 * Game Card Skeleton
 * Specialized skeleton for game cards
 */
export const GameCardSkeleton = ({ count = 1 }: { count?: number }) => {
  const cardSkeleton = (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
      {/* Icon skeleton */}
      <div className="flex items-center justify-center">
        <LoadingSkeleton variant="circular" width={96} height={96} />
      </div>

      {/* Title skeleton */}
      <LoadingSkeleton variant="text" height={24} />

      {/* Description skeleton */}
      <LoadingSkeleton variant="text" height={16} count={2} />

      {/* Min bet skeleton */}
      <LoadingSkeleton variant="rectangular" height={32} />
    </div>
  );

  if (count === 1) {
    return cardSkeleton;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{cardSkeleton}</div>
      ))}
    </>
  );
};

/**
 * Table Row Skeleton
 * Specialized skeleton for table rows
 */
export const TableRowSkeleton = ({ columns = 4, count = 5 }: { columns?: number; count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-gray-700">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <LoadingSkeleton variant="text" height={16} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

/**
 * Profile Skeleton
 * Specialized skeleton for profile pages
 */
export const ProfileSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header with avatar and stats */}
      <div className="flex items-center space-x-6">
        <LoadingSkeleton variant="circular" width={120} height={120} />
        <div className="flex-1 space-y-3">
          <LoadingSkeleton variant="text" width="60%" height={32} />
          <LoadingSkeleton variant="text" width="40%" height={20} />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <LoadingSkeleton key={index} variant="card" height={100} />
        ))}
      </div>

      {/* Content area */}
      <LoadingSkeleton variant="card" height={300} />
    </div>
  );
};

export default LoadingSkeleton;
