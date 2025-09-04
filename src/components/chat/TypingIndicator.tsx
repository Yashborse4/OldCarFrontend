import React, { useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { ThemeContext } from '../../theme/ThemeContext';

interface TypingIndicatorProps {
  isVisible: boolean;
  participantName?: string;
  participantAvatar?: string;
  participantType?: 'buyer' | 'dealer';
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible,
  participantName,
  participantAvatar,
  participantType = 'buyer',
}) => {
  const { theme } = useContext(ThemeContext);
  const animationValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Fade in the typing indicator
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Start the pulsing dots animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animationValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(animationValue, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Fade out the typing indicator
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      animationValue.setValue(0);
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const renderTypingDots = () => {
    return [0, 1, 2].map((index) => {
      const delay = index * 200;
      const dotOpacity = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
        extrapolate: 'clamp',
      });

      const dotScale = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.2],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.typingDot,
            {
              backgroundColor: theme.secondaryText,
              opacity: dotOpacity,
              transform: [{ scale: dotScale }],
            },
          ]}
        />
      );
    });
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginVertical: 4,
      paddingHorizontal: 16,
      opacity: fadeValue,
    },
    avatarContainer: {
      marginRight: 8,
      marginTop: 4,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    avatarPlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    typingBubble: {
      backgroundColor: theme.cardBackground,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      maxWidth: '75%',
    },
    typingDotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    typingText: {
      fontSize: 12,
      color: theme.secondaryText,
      fontStyle: 'italic',
    },
    participantName: {
      fontSize: 11,
      color: theme.secondaryText,
      marginBottom: 2,
    },
  });

  return (
    <Animated.View style={styles.container}>
      <View style={styles.avatarContainer}>
        {participantAvatar ? (
          <Image source={{ uri: participantAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <MaterialCommunityIcons
              name={participantType === 'dealer' ? 'store' : 'account'}
              size={16}
              color="#FFFFFF"
            />
          </View>
        )}
      </View>

      <View style={styles.typingBubble}>
        {participantName && (
          <Text style={styles.participantName}>{participantName}</Text>
        )}
        
        <View style={styles.typingDotsContainer}>
          {renderTypingDots()}
        </View>
        
        <Text style={styles.typingText}>
          {participantName ? `${participantName} is typing...` : 'Typing...'}
        </Text>
      </View>
    </Animated.View>
  );
};

export default TypingIndicator;
