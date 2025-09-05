/**
 * Advanced Notification and Toast System
 * Provides comprehensive notification solutions with animations and queue management
 */

import React, { useRef, useEffect, useState, useCallback, memo, createContext, useContext, ReactNode } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  Pressable,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { 
  scale, 
  SPACING, 
  FONT_SIZES, 
  DIMENSIONS as RESPONSIVE_DIMENSIONS,
  useResponsive 
} from '../utils/responsive';
import { withPerformanceTracking } from '../utils/performance';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'default';
export type NotificationPosition = 'top' | 'bottom' | 'center';
export type NotificationVariant = 'filled' | 'outlined' | 'minimal';

export interface NotificationConfig {
  id?: string;
  type?: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  position?: NotificationPosition;
  variant?: NotificationVariant;
  icon?: string;
  action?: NotificationAction;
  onPress?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
  persistent?: boolean;
  vibrate?: boolean;
  sound?: boolean;
}

export interface NotificationAction {
  label: string;
  onPress: () => void;
  style?: 'primary' | 'secondary';
}

// Notification context
interface NotificationContextType {
  show: (config: NotificationConfig) => string;
  hide: (id: string) => void;
  hideAll: () => void;
  update: (id: string, config: Partial<NotificationConfig>) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

// Notification queue manager
class NotificationQueue {
  private queue: (NotificationConfig & { id: string })[] = [];
  private activeNotifications: Map<string, NotificationConfig & { id: string }> = new Map();
  private maxVisible = 3;

  add(notification: NotificationConfig & { id: string }): void {
    this.queue.push(notification);
    this.processQueue();
  }

  remove(id: string): void {
    // Remove from active notifications
    this.activeNotifications.delete(id);
    
    // Remove from queue if not yet shown
    this.queue = this.queue.filter(n => n.id !== id);
    
    // Process queue to show next notifications
    this.processQueue();
  }

  update(id: string, updates: Partial<NotificationConfig>): void {
    const notification = this.activeNotifications.get(id);
    if (notification) {
      const updated = { ...notification, ...updates };
      this.activeNotifications.set(id, updated);
    }
  }

  clear(): void {
    this.queue = [];
    this.activeNotifications.clear();
  }

  getActive(): (NotificationConfig & { id: string })[] {
    return Array.from(this.activeNotifications.values());
  }

  private processQueue(): void {
    while (this.queue.length > 0 && this.activeNotifications.size < this.maxVisible) {
      const notification = this.queue.shift()!;
      this.activeNotifications.set(notification.id, notification);
    }
  }
}

// Single notification component
interface NotificationItemProps {
  notification: NotificationConfig & { id: string };
  onDismiss: (id: string) => void;
  position: NotificationPosition;
  index: number;
}

const NotificationItemComponent: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss,
  position,
  index,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { deviceInfo } = useResponsive();
  
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  
  const [isVisible, setIsVisible] = useState(true);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Get notification theme colors
  const getNotificationColors = useCallback(() => {
    const { type = 'default', variant = 'filled' } = notification;
    
    const colorMap = {
      success: {
        primary: colors.success,
        background: isDark ? '#1B5E20' : '#E8F5E8',
        border: colors.success,
        text: variant === 'filled' ? colors.onSuccess : colors.success,
        icon: variant === 'filled' ? colors.onSuccess : colors.success,
      },
      error: {
        primary: colors.error,
        background: isDark ? '#C62828' : '#FFEBEE',
        border: colors.error,
        text: variant === 'filled' ? colors.onError : colors.error,
        icon: variant === 'filled' ? colors.onError : colors.error,
      },
      warning: {
        primary: colors.warning,
        background: isDark ? '#F57C00' : '#FFF3E0',
        border: colors.warning,
        text: variant === 'filled' ? colors.onWarning : colors.warning,
        icon: variant === 'filled' ? colors.onWarning : colors.warning,
      },
      info: {
        primary: colors.info,
        background: isDark ? '#1976D2' : '#E3F2FD',
        border: colors.info,
        text: variant === 'filled' ? colors.onInfo : colors.info,
        icon: variant === 'filled' ? colors.onInfo : colors.info,
      },
      default: {
        primary: colors.primary,
        background: colors.surface,
        border: colors.border,
        text: colors.text,
        icon: colors.textSecondary,
      },
    };
    
    return colorMap[type];
  }, [notification.type, notification.variant, colors, isDark]);

  // Get default icon for notification type
  const getDefaultIcon = useCallback(() => {
    const iconMap = {
      success: 'check-circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
      default: 'notifications',
    };
    
    return iconMap[notification.type || 'default'];
  }, [notification.type]);

  // Show animation
  const showNotification = useCallback(() => {
    const animations = [];
    
    if (position === 'center') {
      animations.push(
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      );
    } else {
      animations.push(
        Animated.spring(position === 'top' ? translateY : translateX, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      );
    }
    
    Animated.parallel(animations).start();
  }, [position, scale, opacity, translateY, translateX]);

  // Hide animation
  const hideNotification = useCallback(() => {
    const animations = [];
    
    if (position === 'center') {
      animations.push(
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      );
    } else {
      animations.push(
        Animated.timing(position === 'top' ? translateY : translateX, {
          toValue: position === 'top' ? -100 : SCREEN_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      );
    }
    
    Animated.parallel(animations).start(() => {
      setIsVisible(false);
      notification.onDismiss?.(notification.id);
      onDismiss(notification.id);
    });
  }, [position, scale, opacity, translateY, translateX, notification, onDismiss]);

  // Auto dismiss
  useEffect(() => {
    if (!notification.persistent && notification.duration !== 0) {
      const duration = notification.duration || 4000;
      const id = setTimeout(() => {
        hideNotification();
      }, duration);
      setTimeoutId(id);
      
      return () => {
        if (id) clearTimeout(id);
      };
    }
  }, [notification.persistent, notification.duration, hideNotification]);

  // Show notification on mount
  useEffect(() => {
    showNotification();
  }, [showNotification]);

  // Handle press
  const handlePress = useCallback(() => {
    if (notification.onPress) {
      notification.onPress();
      if (!notification.persistent) {
        hideNotification();
      }
    }
  }, [notification, hideNotification]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    hideNotification();
  }, [timeoutId, hideNotification]);

  // Handle action press
  const handleActionPress = useCallback(() => {
    if (notification.action) {
      notification.action.onPress();
      if (!notification.persistent) {
        hideNotification();
      }
    }
  }, [notification.action, hideNotification]);

  if (!isVisible) return null;

  const notificationColors = getNotificationColors();
  const icon = notification.icon || getDefaultIcon();

  // Get container styles based on variant
  const getContainerStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      minHeight: scale(60),
      marginHorizontal: SPACING.md,
      marginVertical: SPACING.xs,
      borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.medium,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    };

    switch (notification.variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: notificationColors.primary,
        };
      
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: notificationColors.background,
          borderWidth: 1,
          borderColor: notificationColors.border,
        };
      
      case 'minimal':
        return {
          ...baseStyle,
          backgroundColor: notificationColors.background,
          elevation: 0,
          shadowOpacity: 0,
        };
      
      default:
        return {
          ...baseStyle,
          backgroundColor: notificationColors.background,
        };
    }
  };

  // Get position-based transform
  const getTransform = () => {
    const transforms: any[] = [];
    
    switch (position) {
      case 'center':
        transforms.push({ scale });
        break;
      case 'top':
        transforms.push({ translateY });
        break;
      case 'bottom':
        transforms.push({ translateX });
        break;
    }
    
    return transforms;
  };

  const containerStyles = getContainerStyles();
  const transform = getTransform();

  return (
    <Animated.View
      style={[
        containerStyles,
        {
          opacity,
          transform,
          zIndex: 1000 + index,
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={styles.notificationContent}
        disabled={!notification.onPress}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Icon
            name={icon}
            size={scale(24)}
            color={notificationColors.icon}
          />
        </View>
        
        {/* Content */}
        <View style={styles.textContainer}>
          {notification.title && (
            <Text
              style={[
                styles.title,
                { color: notificationColors.text },
              ]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
          )}
          
          <Text
            style={[
              styles.message,
              { color: notificationColors.text },
              !notification.title && styles.messageOnly,
            ]}
            numberOfLines={notification.title ? 2 : 3}
          >
            {notification.message}
          </Text>
        </View>
        
        {/* Action */}
        {notification.action && (
          <TouchableOpacity
            onPress={handleActionPress}
            style={[
              styles.actionButton,
              {
                backgroundColor: notification.action.style === 'primary'
                  ? notificationColors.text
                  : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.actionText,
                {
                  color: notification.action.style === 'primary'
                    ? notificationColors.background
                    : notificationColors.text,
                },
              ]}
            >
              {notification.action.label}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Dismiss button */}
        {notification.dismissible !== false && (
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.dismissButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name="close"
              size={scale(18)}
              color={notificationColors.icon}
            />
          </TouchableOpacity>
        )}
      </Pressable>
    </Animated.View>
  );
};

// Notification container component
interface NotificationContainerProps {
  notifications: (NotificationConfig & { id: string })[];
  onDismiss: (id: string) => void;
  position: NotificationPosition;
}

const NotificationContainerComponent: React.FC<NotificationContainerProps> = ({
  notifications,
  onDismiss,
  position,
}) => {
  const insets = useSafeAreaInsets();
  
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 1000,
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          top: insets.top + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
        };
      
      case 'bottom':
        return {
          ...baseStyle,
          bottom: insets.bottom,
        };
      
      case 'center':
        return {
          ...baseStyle,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        };
      
      default:
        return baseStyle;
    }
  };

  return (
    <View style={getContainerStyle()} pointerEvents="box-none">
      {notifications.map((notification, index) => (
        <NotificationItemComponent
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
          position={position}
          index={index}
        />
      ))}
    </View>
  );
};

// Notification provider component
interface NotificationProviderProps {
  children: ReactNode;
  maxVisible?: number;
  defaultPosition?: NotificationPosition;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxVisible = 3,
  defaultPosition = 'top',
}) => {
  const [notifications, setNotifications] = useState<(NotificationConfig & { id: string })[]>([]);
  const queueRef = useRef(new NotificationQueue());
  
  // Generate unique ID
  const generateId = useCallback(() => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Show notification
  const show = useCallback((config: NotificationConfig): string => {
    const id = config.id || generateId();
    const notification = {
      ...config,
      id,
      position: config.position || defaultPosition,
    };
    
    queueRef.current.add(notification);
    setNotifications(queueRef.current.getActive());
    
    return id;
  }, [generateId, defaultPosition]);

  // Hide notification
  const hide = useCallback((id: string) => {
    queueRef.current.remove(id);
    setNotifications(queueRef.current.getActive());
  }, []);

  // Hide all notifications
  const hideAll = useCallback(() => {
    queueRef.current.clear();
    setNotifications([]);
  }, []);

  // Update notification
  const update = useCallback((id: string, config: Partial<NotificationConfig>) => {
    queueRef.current.update(id, config);
    setNotifications(queueRef.current.getActive());
  }, []);

  // Handle notification dismiss
  const handleDismiss = useCallback((id: string) => {
    hide(id);
  }, [hide]);

  // Group notifications by position
  const notificationsByPosition = notifications.reduce((acc, notification) => {
    const position = notification.position || 'top';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(notification);
    return acc;
  }, {} as Record<NotificationPosition, (NotificationConfig & { id: string })[]>);

  const contextValue: NotificationContextType = {
    show,
    hide,
    hideAll,
    update,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Render notification containers for each position */}
      {Object.entries(notificationsByPosition).map(([position, positionNotifications]) => (
        <NotificationContainerComponent
          key={position}
          notifications={positionNotifications}
          onDismiss={handleDismiss}
          position={position as NotificationPosition}
        />
      ))}
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  message: {
    fontSize: FONT_SIZES.sm,
    lineHeight: scale(18),
  },
  messageOnly: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  actionButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.small,
    marginRight: SPACING.sm,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  dismissButton: {
    padding: SPACING.xs,
  },
});

// Memoized exports
const NotificationItem = memo(withPerformanceTracking(NotificationItemComponent, 'NotificationItem'));
const NotificationContainer = memo(withPerformanceTracking(NotificationContainerComponent, 'NotificationContainer'));

// Display names
NotificationItem.displayName = 'NotificationItem';
NotificationContainer.displayName = 'NotificationContainer';
NotificationProvider.displayName = 'NotificationProvider';

export default NotificationProvider;

// Utility functions for common notifications
export const createNotification = {
  success: (message: string, options?: Partial<NotificationConfig>) => ({
    type: 'success' as NotificationType,
    message,
    ...options,
  }),
  
  error: (message: string, options?: Partial<NotificationConfig>) => ({
    type: 'error' as NotificationType,
    message,
    duration: 6000, // Longer duration for errors
    ...options,
  }),
  
  warning: (message: string, options?: Partial<NotificationConfig>) => ({
    type: 'warning' as NotificationType,
    message,
    ...options,
  }),
  
  info: (message: string, options?: Partial<NotificationConfig>) => ({
    type: 'info' as NotificationType,
    message,
    ...options,
  }),
};
