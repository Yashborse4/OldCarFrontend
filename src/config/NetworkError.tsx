import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useNetwork } from '../context/NetworkContext';


const { width, height } = Dimensions.get('window');

interface NetworkErrorProps {
  visible?: boolean;
  onRetry?: () => void;
  mode?: 'overlay' | 'inline' | 'banner';
  title?: string;
  message?: string;
  showRetryButton?: boolean;
  style?: any;
}

import { useTheme } from '../theme/ThemeContext';

export const NetworkError: React.FC<NetworkErrorProps> = ({
  visible = true,
  onRetry,
  mode = 'overlay',
  title = 'No Internet Connection',
  message = 'Please check your internet connection and try again.',
  showRetryButton = true,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const { retryConnection, checkConnection } = useNetwork();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);

    try {
      // Check connection first
      const isConnected = await checkConnection();

      if (isConnected) {
        // Call custom retry function if provided
        if (onRetry) {
          await onRetry();
        }
      } else {
        // Use default retry mechanism
        await retryConnection();
      }
    } catch (error) {
      console.error('Error during retry:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const styles = StyleSheet.create({
    // Overlay mode styles
    overlayContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    overlayContent: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 32,
      margin: 24,
      alignItems: 'center',
      elevation: 10,

      maxWidth: width * 0.85,
    },

    // Inline mode styles
    inlineContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      margin: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border
    },

    // Banner mode styles
    bannerContainer: {
      backgroundColor: isDark ? colors.error : colors.error + '20',
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.error : colors.error + '40',
    },
    bannerContent: {
      flex: 1,
      marginLeft: 12,
    },
    bannerTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#C62828',
      marginBottom: 2,
    },
    bannerMessage: {
      fontSize: 12,
      color: isDark ? '#FFCDD2' : '#D32F2F',
    },
    bannerRetryButton: {
      backgroundColor: isDark ? '#B71C1C' : '#FFFFFF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginLeft: 12,
    },
    bannerRetryText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#C62828',
    },

    // Common styles
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? 'rgba(211, 47, 47, 0.2)' : 'rgba(211, 47, 47, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 3,

    },
    retryButtonDisabled: {
      backgroundColor: colors.textSecondary,
      opacity: 0.7,
    },
    retryText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#111827',
      marginLeft: 8,
    },
    retryTextDisabled: {
      color: colors.surface
    },
    // Status indicator styles (small version)
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(211, 47, 47, 0.9)' : 'rgba(211, 47, 47, 0.8)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 1000,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 4,
    },
  });

  if (!visible) return null;

  // Banner mode - compact horizontal layout
  if (mode === 'banner') {
    return (
      <View style={styles.bannerContainer}>
        <MaterialIcons
          name="wifi-off"
          size={20}
          color={isDark ? '#FFFFFF' : '#C62828'}
        />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{title}</Text>
          <Text style={styles.bannerMessage}>{message}</Text>
        </View>
        {showRetryButton && (
          <TouchableOpacity
            style={styles.bannerRetryButton}
            onPress={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#C62828'} />
            ) : (
              <Text style={styles.bannerRetryText}>Retry</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Inline mode - card-like layout
  if (mode === 'inline') {
    return (
      <View style={[styles.inlineContainer, style]}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name="wifi-off"
            size={40}
            color={isDark ? '#FF6B6B' : '#D32F2F'}
          />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {showRetryButton && (
          <TouchableOpacity
            style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
            onPress={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="#111827" />
            ) : (
              <MaterialIcons name="refresh" size={20} color="#111827" />
            )}
            <Text style={[styles.retryText, isRetrying && styles.retryTextDisabled]}>
              {isRetrying ? 'Checking...' : 'Retry Connection'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Overlay mode - full screen modal
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlayContainer}>
        <View style={styles.overlayContent}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="wifi-off"
              size={48}
              color={isDark ? '#FF6B6B' : '#D32F2F'}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {showRetryButton && (
            <TouchableOpacity
              style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
              onPress={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <ActivityIndicator size="small" color="#111827" />
              ) : (
                <MaterialIcons name="refresh" size={20} color="#111827" />
              )}
              <Text style={[styles.retryText, isRetrying && styles.retryTextDisabled]}>
                {isRetrying ? 'Checking Connection...' : 'Retry Connection'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Small network status indicator component
export const NetworkStatusIndicator: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  const isDark = false;

  const styles = StyleSheet.create({
    indicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(211, 47, 47, 0.9)' : 'rgba(211, 47, 47, 0.8)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    text: {
      fontSize: 10,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 4,
    },
  });

  if (!visible) return null;

  return (
    <View style={styles.indicator}>
      <MaterialIcons name="wifi-off" size={12} color="#FFFFFF" />
      <Text style={styles.text}>Offline</Text>
    </View>
  );
};

export default NetworkError;


