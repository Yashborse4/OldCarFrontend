import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { useTheme } from '../../theme';

interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  senderName: string;
  type: 'text' | 'image' | 'car_share' | 'location' | 'system';
  imageUrl?: string;
  carData?: {
    id: string;
    title: string;
    price: string;
    image: string;
    make: string;
    model: string;
    year: number;
  };
  locationData?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  isRead: boolean;
  deliveryStatus: 'sending' | 'sent' | 'delivered' | 'read';
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  senderAvatar?: string;
  onImagePress?: (imageUrl: string) => void;
  onCarPress?: (carId: string) => void;
  onLocationPress?: (latitude: number, longitude: number) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  senderAvatar,
  onImagePress,
  onCarPress,
  onLocationPress,
}) => {
  const { colors: theme } = useTheme();

  const formatMessageTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const openLocation = () => {
    if (message.locationData) {
      const { latitude, longitude } = message.locationData;
      if (onLocationPress) {
        onLocationPress(latitude, longitude);
      } else {
        // Default to opening in maps
        const url = `https://maps.google.com/?q=${latitude},${longitude}`;
        Linking.openURL(url);
      }
    }
  };

  const openCarDetails = () => {
    if (message.carData && onCarPress) {
      onCarPress(message.carData.id);
    }
  };

  const styles = StyleSheet.create({
    systemMessageContainer: {
      alignItems: 'center',
      marginVertical: 8,
    },
    systemMessage: {
      fontSize: 12,
      fontStyle: 'italic',
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    messageContainer: {
      flexDirection: 'row',
      marginVertical: 4,
      paddingHorizontal: 16,
    },
    ownMessageContainer: {
      justifyContent: 'flex-end',
    },
    otherMessageContainer: {
      justifyContent: 'flex-start',
    },
    messageAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
      marginTop: 4,
    },
    avatarPlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
      marginTop: 4,
    },
    messageBubble: {
      maxWidth: '75%',
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: isOwnMessage ? theme.primary : theme.card,
      borderColor: theme.border,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 20,
      color: isOwnMessage ? '#FFFFFF' : theme.text,
    },
    messageImage: {
      width: 200,
      height: 150,
      borderRadius: 8,
      marginBottom: 4,
    },
    carShareContainer: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 8,
      overflow: 'hidden',
    },
    carShareImage: {
      width: 80,
      height: 60,
    },
    carShareDetails: {
      flex: 1,
      padding: 8,
    },
    carShareTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
      color: isOwnMessage ? '#FFFFFF' : theme.text,
    },
    carSharePrice: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 2,
      color: isOwnMessage ? '#FFFFFF' : theme.primary,
    },
    carShareSubtitle: {
      fontSize: 12,
      color: isOwnMessage ? '#FFFFFF' : theme.textSecondary,
    },
    carShareActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    carShareButton: {
      backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.2)' : theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    carShareButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: isOwnMessage ? '#FFFFFF' : '#FFFFFF',
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 4,
    },
    locationText: {
      fontSize: 14,
      flex: 1,
      color: isOwnMessage ? '#FFFFFF' : theme.text,
    },
    locationButton: {
      backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.2)' : theme.primary,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    locationButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    messageFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 4,
      gap: 4,
    },
    messageTime: {
      fontSize: 10,
      color: isOwnMessage ? '#FFFFFF' : theme.textSecondary,
    },
    deliveryIcon: {
      marginLeft: 2,
    },
  });

  if (message.type === 'system') {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={[styles.systemMessage, { color: theme.textSecondary }]}>
          {message.text}
        </Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.messageContainer,
      isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      {!isOwnMessage && (
        senderAvatar ? (
          <Image source={{ uri: senderAvatar }} style={styles.messageAvatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={{color: '#FFFFFF', fontSize: 12, fontWeight: 'bold'}}>
              {message.senderName?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )
      )}
      
      <View style={styles.messageBubble}>
        {message.type === 'text' && (
          <Text style={styles.messageText}>
            {message.text}
          </Text>
        )}
        
        {message.type === 'image' && (
          <TouchableOpacity onPress={() => onImagePress?.(message.imageUrl || '')}>
            <Image
              source={{ uri: message.imageUrl }}
              style={styles.messageImage}
            />
            {message.text && (
              <Text style={[styles.messageText, { marginTop: 8 }]}>
                {message.text}
              </Text>
            )}
          </TouchableOpacity>
        )}
        
        {message.type === 'car_share' && message.carData && (
          <TouchableOpacity style={styles.carShareContainer} onPress={openCarDetails}>
            <Image
              source={{ uri: message.carData.image }}
              style={styles.carShareImage}
            />
            <View style={styles.carShareDetails}>
              <Text style={styles.carShareTitle}>
                {message.carData.title}
              </Text>
              <Text style={styles.carSharePrice}>
                {message.carData.price}
              </Text>
              <Text style={styles.carShareSubtitle}>
                {message.carData.year} • {message.carData.make} {message.carData.model}
              </Text>
              <View style={styles.carShareActions}>
                <TouchableOpacity style={styles.carShareButton} onPress={openCarDetails}>
                  <Text style={styles.carShareButtonText}>🚗 View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        
        {message.type === 'location' && message.locationData && (
          <View>
            <View style={styles.locationContainer}>
              <Text style={{fontSize: 20, marginRight: 4}}>📍</Text>
              <Text style={styles.locationText}>
                {message.locationData.address}
              </Text>
            </View>
            <TouchableOpacity style={styles.locationButton} onPress={openLocation}>
              <Text style={styles.locationButtonText}>🗺️ Open in Maps</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>
            {formatMessageTime(message.timestamp)}
          </Text>
          
          {isOwnMessage && (
            <Text style={[styles.deliveryIcon, {
              fontSize: 12,
              color: message.deliveryStatus === 'read' ? '#4CAF50' : '#FFFFFF'
            }]}>
              {message.deliveryStatus === 'read' ? '✓✓' :
               message.deliveryStatus === 'delivered' ? '✓✓' :
               message.deliveryStatus === 'sent' ? '✓' : '🕒'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default MessageBubble;


