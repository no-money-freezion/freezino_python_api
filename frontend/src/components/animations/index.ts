/**
 * Animation components and utilities for Freezino
 * Provides consistent motion design across the application
 */

// Variants
export * from './variants';

// Components
export { default as PageTransition } from './PageTransition';
export { default as LoadingSkeleton, GameCardSkeleton, TableRowSkeleton, ProfileSkeleton } from './LoadingSkeleton';
export { default as WinConfetti, MiniWinConfetti } from './WinConfetti';
export { default as AnimatedButton, AnimatedIconButton, AnimatedPulseButton } from './AnimatedButton';
