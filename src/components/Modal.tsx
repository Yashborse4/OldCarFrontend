/**
 * Advanced Modal and Dialog Components
 * Provides comprehensive modal solutions with animations and accessibility
 */

import React, { useRef, useEffect, useState, useCallback, memo, ReactNode } from 'react';
import {
  View,
  Modal,
  Animated,
  StyleSheet,
  BackHandler,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ViewStyle,
  TextStyle,
  Text,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
import { Skeleton } from './Loading';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  
  // Animation
  animationType?: 'slide' | 'fade' | 'scale' | 'slideFromBottom' | 'slideFromTop' | 'slideFromLeft' | 'slideFromRight';
  animationDuration?: number;
  
  // Behavior
  dismissible?: boolean;
  closeOnBackdropPress?: boolean;
  closeOnBackButton?: boolean;
  
  // Styling
  overlayStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  
  // Backdrop
  showBackdrop?: boolean;
  backdropOpacity?: number;
  backdropColor?: string;
  
  // Positioning
  position?: 'center' | 'top' | 'bottom' | 'fullScreen';
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityRole?: string;
  
  // Callbacks
  onShow?: () => void;
  onDismiss?: () => void;
  onBackButtonPress?: () => boolean;
  onBackdropPress?: () => void;
}

const BaseModalComponent: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  children,
  animationType = 'fade',
  animationDuration = 300,
  dismissible = true,
  closeOnBackdropPress = true,
  closeOnBackButton = true,
  overlayStyle,
  containerStyle,
  contentStyle,
  showBackdrop = true,
  backdropOpacity = 0.5,
  backdropColor,
  position = 'center',
  accessibilityLabel,
  accessibilityRole = 'dialog',
  onShow,
  onDismiss,
  onBackButtonPress,
  onBackdropPress,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { deviceInfo } = useResponsive();
  
  const [modalVisible, setModalVisible] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const translateXAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  // Handle animation based on type
  const getAnimationConfig = useCallback(() => {
    switch (animationType) {
      case 'scale':
        return {
          show: [
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: animationDuration,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ],
          hide: [
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: animationDuration,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.3,
              duration: animationDuration,
              useNativeDriver: true,
            }),
          ],
        };
      
      case 'slideFromBottom':
        return {
          show: [
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: animationDuration,
              useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ],
          hide: [
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: animationDuration,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: SCREEN_HEIGHT,
              duration: animationDuration,
              useNativeDriver: true,
            }),
          ],
        };
      
      case 'slideFromTop':
        return {
          show: [
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: animationDuration,
              useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ],
          hide: [
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: animationDuration,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: -SCREEN_HEIGHT,
              duration: animationDuration,
              useNativeDriver: true,
            }),
          ],
        };
      
      case 'slideFromLeft':
      case 'slideFromRight':
        const initialValue = animationType === 'slideFromLeft' ? -SCREEN_WIDTH : SCREEN_WIDTH;
        return {
          show: [
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: animationDuration,
              useNativeDriver: true,
            }),
            Animated.spring(translateXAnim, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ],
          hide: [
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: animationDuration,
              useNativeDriver: true,
            }),
            Animated.timing(translateXAnim, {
              toValue: initialValue,
              duration: animationDuration,
              useNativeDriver: true,
            }),
          ],
        };
      
      default: // fade
        return {
          show: [
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: animationDuration,
              useNativeDriver: true,
            }),
          ],
          hide: [
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: animationDuration,
              useNativeDriver: true,
            }),
          ],
        };
    }
  }, [animationType, animationDuration, fadeAnim, scaleAnim, slideAnim, translateXAnim]);

  // Show modal animation
  const showModal = useCallback(() => {
    setModalVisible(true);
    const animationConfig = getAnimationConfig();
    
    // Reset animation values
    fadeAnim.setValue(0);
    if (animationType === 'scale') scaleAnim.setValue(0.3);
    if (animationType.includes('slide')) {
      if (animationType === 'slideFromBottom') slideAnim.setValue(SCREEN_HEIGHT);
      if (animationType === 'slideFromTop') slideAnim.setValue(-SCREEN_HEIGHT);
      if (animationType === 'slideFromLeft') translateXAnim.setValue(-SCREEN_WIDTH);
      if (animationType === 'slideFromRight') translateXAnim.setValue(SCREEN_WIDTH);
    }
    
    Animated.parallel(animationConfig.show).start(() => {
      onShow?.();
    });
  }, [getAnimationConfig, fadeAnim, scaleAnim, slideAnim, translateXAnim, animationType, onShow]);

  // Hide modal animation
  const hideModal = useCallback(() => {
    const animationConfig = getAnimationConfig();
    
    Animated.parallel(animationConfig.hide).start(() => {
      setModalVisible(false);
      onDismiss?.();
    });
  }, [getAnimationConfig, onDismiss]);

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      showModal();
    } else {
      hideModal();
    }
  }, [visible, showModal, hideModal]);

  // Handle back button
  useEffect(() => {
    if (!modalVisible || !closeOnBackButton) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (onBackButtonPress) {
        return onBackButtonPress();
      }
      
      if (dismissible) {
        onClose();
        return true;
      }
      
      return false;
    });

    return () => backHandler.remove();
  }, [modalVisible, closeOnBackButton, dismissible, onClose, onBackButtonPress]);

  // Handle backdrop press
  const handleBackdropPress = useCallback(() => {
    onBackdropPress?.();
    
    if (closeOnBackdropPress && dismissible) {
      onClose();
    }
  }, [closeOnBackdropPress, dismissible, onClose, onBackdropPress]);

  // Get container transform style based on animation type
  const getContainerTransform = useCallback(() => {
    const transforms: any[] = [];
    
    switch (animationType) {
      case 'scale':
        transforms.push({ scale: scaleAnim });
        break;
      case 'slideFromBottom':
      case 'slideFromTop':
        transforms.push({ translateY: slideAnim });
        break;
      case 'slideFromLeft':
      case 'slideFromRight':
        transforms.push({ translateX: translateXAnim });
        break;
    }
    
    return transforms;
  }, [animationType, scaleAnim, slideAnim, translateXAnim]);

  // Get position styles
  const getPositionStyles = useCallback(() => {
    switch (position) {
      case 'top':
        return {
          justifyContent: 'flex-start',
          paddingTop: insets.top + SPACING.lg,
        };
      case 'bottom':
        return {
          justifyContent: 'flex-end',
          paddingBottom: insets.bottom + SPACING.lg,
        };
      case 'fullScreen':
        return {
          margin: 0,
          flex: 1,
        };
      default: // center
        return {
          justifyContent: 'center',
        };
    }
  }, [position, insets]);

  if (!modalVisible) return null;

  const positionStyles = getPositionStyles();
  const containerTransform = getContainerTransform();

  return (
    <Modal
      transparent
      visible={modalVisible}
      statusBarTranslucent
      onRequestClose={dismissible ? onClose : undefined}
      hardwareAccelerated
    >
      <StatusBar
        backgroundColor={themeColors.overlay}
        barStyle="light-content"
        translucent
      />
      
      <View style={[styles.overlay, overlayStyle]}>
        {/* Backdrop */}
        {showBackdrop && (
          <Pressable
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: backdropColor || themeColors.overlay,
                opacity: backdropOpacity,
              },
            ]}
            onPress={handleBackdropPress}
            accessible={false}
          />
        )}
        
        {/* Content Container */}
        <Animated.View
          style={[
            styles.container,
            positionStyles as ViewStyle,
            {
              opacity: fadeAnim,
              transform: containerTransform,
            },
            containerStyle,
          ]}
          accessible={true}
          accessibilityRole={accessibilityRole as any}
          accessibilityLabel={accessibilityLabel}
          accessibilityModal={true}
        >
          <View style={[styles.content, contentStyle]}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Dialog Component
interface DialogProps extends Omit<BaseModalProps, 'children'> {
  title?: string;
  message?: string;
  icon?: string;
  iconColor?: string;
  actions?: DialogAction[];
  content?: ReactNode;
  
  // Styling
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
  actionsStyle?: ViewStyle;
  
  // Behavior
  scrollable?: boolean;
  maxHeight?: number;
}

interface DialogAction {
  text: string;
  onPress: () => void;
  style?: 'default' | 'primary' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
}

const DialogComponent: React.FC<DialogProps> = ({
  title,
  message,
  icon,
  iconColor,
  actions = [],
  content,
  titleStyle,
  messageStyle,
  actionsStyle,
  scrollable = false,
  maxHeight,
  ...modalProps
}) => {
  const { colors } = useTheme();

  const renderActions = () => {
    if (actions.length === 0) return null;

    return (
      <View style={[styles.dialogActions, actionsStyle]}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dialogAction,
              action.style === 'primary' && { backgroundColor: themeColors.primary },
              action.style === 'destructive' && { backgroundColor: themeColors.error },
              action.disabled && { opacity: 0.5 },
            ]}
            onPress={action.onPress}
            disabled={action.disabled || action.loading}
          >
            <Text
              style={[
                styles.dialogActionText,
                {
                  color: action.style === 'primary' || action.style === 'destructive'
                    ? themeColors.onPrimary
                    : themeColors.primary,
                },
              ]}
            >
              {action.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const dialogContent = (
    <View style={styles.dialogContainer}>
      {/* Header */}
      <View style={styles.dialogHeader}>
        {icon && (
          <MaterialIcons
            name={icon}
            size={scale(24)}
            color={iconColor || themeColors.primary}
            style={styles.dialogIcon}
          />
        )}
        
        {title && (
          <Text style={[styles.dialogTitle, { color: themeColors.text }, titleStyle]}>
            {title}
          </Text>
        )}
      </View>
      
      {/* Content */}
      <View
        style={[
          styles.dialogContent,
          maxHeight && ({ maxHeight } as ViewStyle),
        ]}
      >
        {scrollable ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {message && (
              <Text style={[styles.dialogMessage, { color: themeColors.textSecondary }, messageStyle]}>
                {message}
              </Text>
            )}
            {content}
          </ScrollView>
        ) : (
          <>
            {message && (
              <Text style={[styles.dialogMessage, { color: themeColors.textSecondary }, messageStyle]}>
                {message}
              </Text>
            )}
            {content}
          </>
        )}
      </View>
      
      {/* Actions */}
      {renderActions()}
    </View>
  );

  return (
    <BaseModal
      {...modalProps}
      animationType="scale"
      position="center"
      contentStyle={[styles.dialogWrapper, { backgroundColor: themeColors.surface }] as ViewStyle}
    >
      {dialogContent}
    </BaseModal>
  );
};

// Bottom Sheet Component
interface BottomSheetProps extends Omit<BaseModalProps, 'position' | 'animationType'> {
  title?: string;
  subtitle?: string;
  showHandle?: boolean;
  snapPoints?: string[];
  initialSnapPoint?: number;
  expandable?: boolean;
  
  // Header
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  showCloseButton?: boolean;
  
  // Styling
  headerStyle?: ViewStyle;
  handleStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

const BottomSheetComponent: React.FC<BottomSheetProps> = ({
  title,
  subtitle,
  showHandle = true,
  showCloseButton = true,
  headerLeft,
  headerRight,
  headerStyle,
  handleStyle,
  titleStyle,
  subtitleStyle,
  children,
  ...modalProps
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <BaseModal
      {...modalProps}
      animationType="slideFromBottom"
      position="bottom"
      contentStyle={[
        styles.bottomSheetWrapper,
        {
          backgroundColor: themeColors.surface,
          paddingBottom: insets.bottom,
        },
      ] as ViewStyle}
    >
      {/* Handle */}
      {showHandle && (
        <View style={styles.bottomSheetHandle}>
          <View style={[styles.handle, { backgroundColor: themeColors.border }, handleStyle]} />
        </View>
      )}
      
      {/* Header */}
      {(title || subtitle || headerLeft || headerRight || showCloseButton) && (
        <View style={[styles.bottomSheetHeader, headerStyle]}>
          <View style={styles.headerLeft}>
            {headerLeft}
          </View>
          
          <View style={styles.headerCenter}>
            {title && (
              <Text style={[styles.bottomSheetTitle, { color: themeColors.text }, titleStyle]}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.bottomSheetSubtitle, { color: themeColors.textSecondary }, subtitleStyle]}>
                {subtitle}
              </Text>
            )}
          </View>
          
          <View style={styles.headerRight}>
            {headerRight}
            {showCloseButton && (
              <TouchableOpacity
                onPress={modalProps.onClose}
                style={styles.closeButton}
              >
                <MaterialIcons
                  name="close"
                  size={scale(24)}
                  color={themeColors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      
      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.bottomSheetContent}
      >
        {children}
      </KeyboardAvoidingView>
    </BaseModal>
  );
};

// Loading Dialog Component
interface LoadingDialogProps extends Omit<BaseModalProps, 'children'> {
  message?: string;
  progress?: number;
  showProgress?: boolean;
}

const LoadingDialogComponent: React.FC<LoadingDialogProps> = ({
  message = 'Loading...',
  progress,
  showProgress = false,
  ...modalProps
}) => {
  const { colors } = useTheme();

  return (
    <BaseModal
      {...modalProps}
      animationType="fade"
      position="center"
      dismissible={false}
      closeOnBackdropPress={false}
      closeOnBackButton={false}
      contentStyle={[styles.loadingDialogWrapper, { backgroundColor: themeColors.surface }] as ViewStyle}
    >
      <View style={styles.loadingDialogContent}>
        <Skeleton
          width={scale(40)}
          height={scale(40)}
          borderRadius={scale(20)}
          animated={true}
        />
        
        <Text style={[styles.loadingMessage, { color: themeColors.text }]}>
          {message}
        </Text>
        
        {showProgress && typeof progress === 'number' && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: themeColors.surfaceVariant }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: themeColors.primary,
                    width: `${Math.max(0, Math.min(100, progress))}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
              {Math.round(progress)}%
            </Text>
          </View>
        )}
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    maxWidth: '90%',
    minWidth: '80%',
    maxHeight: '90%',
  },
  content: {
    flex: 1,
  },
  
  // Dialog styles
  dialogWrapper: {
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.large,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dialogContainer: {
    padding: SPACING.lg,
    minWidth: scale(280),
    maxWidth: scale(400),
  },
  dialogHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dialogIcon: {
    marginBottom: SPACING.sm,
  },
  dialogTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  dialogContent: {
    marginBottom: SPACING.md,
  },
  dialogMessage: {
    fontSize: FONT_SIZES.md,
    lineHeight: scale(20),
    textAlign: 'center',
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  dialogAction: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.small,
    minWidth: scale(64),
    alignItems: 'center',
  },
  dialogActionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  
  // Bottom Sheet styles
  bottomSheetWrapper: {
    borderTopLeftRadius: RESPONSIVE_DIMENSIONS.borderRadius.large,
    borderTopRightRadius: RESPONSIVE_DIMENSIONS.borderRadius.large,
    maxHeight: '90%',
    minHeight: '20%',
  },
  bottomSheetHandle: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  handle: {
    width: scale(40),
    height: scale(4),
    borderRadius: scale(2),
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bottomSheetTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  bottomSheetSubtitle: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  
  // Loading Dialog styles
  loadingDialogWrapper: {
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.medium,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingDialogContent: {
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: scale(200),
  },
  loadingMessage: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: SPACING.md,
    width: '100%',
  },
  progressBar: {
    height: scale(4),
    borderRadius: scale(2),
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: scale(2),
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
});

// Memoized exports
export const BaseModal = memo(withPerformanceTracking(BaseModalComponent, 'BaseModal'));
export const Dialog = memo(withPerformanceTracking(DialogComponent, 'Dialog'));
export const BottomSheet = memo(withPerformanceTracking(BottomSheetComponent, 'BottomSheet'));
export const LoadingDialog = memo(withPerformanceTracking(LoadingDialogComponent, 'LoadingDialog'));

// Display names
BaseModal.displayName = 'BaseModal';
Dialog.displayName = 'Dialog';
BottomSheet.displayName = 'BottomSheet';
LoadingDialog.displayName = 'LoadingDialog';

export default BaseModal;
export type { DialogAction };


