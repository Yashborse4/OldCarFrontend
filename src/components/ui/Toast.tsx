import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'center' | 'bottom';

export interface ToastConfig {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  position?: ToastPosition;
  duration?: number;
  backdrop?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
  onDismiss?: () => void;
}

interface ToastItemProps extends ToastConfig {
  onRemove: (id: string) => void;
  index: number;
}

const ToastItem: React.FC<ToastItemProps> = ({
  id,
  type,
  title,
  message,
  position = 'top',
  duration = 3000,
  onPress,
  onDismiss,
  onRemove,
  index,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#1F2937';
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      left: 16,
      right: 16,
      top: position === 'top' ? 60 + (index * 70) : undefined,
      bottom: position === 'bottom' ? 100 + (index * 70) : undefined,
      alignSelf: position === 'center' ? 'center' : undefined,
      backgroundColor: getBackgroundColor(),
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 9999,
      elevation: 5,
    },
    title: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 16,
    },
    message: {
      color: '#FFF',
      fontSize: 14,
    },
    textContainer: {
      flex: 1,
      marginLeft: 12,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        onPress?.();
        if (!onPress) {
          onDismiss?.();
          onRemove(id);
        }
      }}
      activeOpacity={0.9}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default ToastItem;
