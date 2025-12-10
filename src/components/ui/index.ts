// Modern UI Components Export
// All components follow the new design system with consistent theming and animations

// Core Components
export { Button } from './Button';
export { Card } from './Card';
export { Input, ModernInput } from './InputModern';
export { BottomNavigation } from './BottomNavigation';

// Toast System
export { default as Toast } from './Toast';
export { ToastProvider as ToastManager, useNotifications } from './ToastManager';

// Micro-interactions and Performance
export {
  AnimatedPressable,
  SwipeableCard,
  Skeleton,
  FloatingActionButton,
  usePulseAnimation,
  useStaggerAnimation,
  useParallaxScroll,
  hapticFeedback,
} from './MicroInteractionsModern';

// Legacy components (for backward compatibility during transition)
// These will be gradually phased out
// export { default as LegacyInput } from './Input';

// Export types
export type { ButtonProps } from './Button';
export type { CardProps } from './Card';
export type { ModernInputProps } from './InputModern';

// Re-export design tokens for easy access
export { 
  spacing, 
  borderRadius, 
  typography, 

   
} from '../../design-system/tokens';


