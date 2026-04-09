import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface WinConfettiProps {
  active: boolean;
  duration?: number;
  onComplete?: () => void;
}

/**
 * WinConfetti component
 * Displays confetti animation when user wins
 * Usage: <WinConfetti active={isWinning} duration={5000} onComplete={handleComplete} />
 */
const WinConfetti = ({ active, duration = 5000, onComplete }: WinConfettiProps) => {
  const [isActive, setIsActive] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    if (active) {
      setIsActive(true);

      const timer = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, onComplete]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isActive) return null;

  return (
    <Confetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={200}
      recycle={false}
      colors={['#DC2626', '#FBBF24', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']}
      gravity={0.3}
    />
  );
};

/**
 * MiniWinConfetti component
 * Smaller confetti burst for smaller wins
 */
export const MiniWinConfetti = ({ active, duration = 3000 }: Pick<WinConfettiProps, 'active' | 'duration'>) => {
  const [isActive, setIsActive] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    if (active) {
      setIsActive(true);

      const timer = setTimeout(() => {
        setIsActive(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isActive) return null;

  return (
    <Confetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={100}
      recycle={false}
      colors={['#FBBF24', '#FCD34D']}
      gravity={0.4}
      initialVelocityY={20}
    />
  );
};

export default WinConfetti;
