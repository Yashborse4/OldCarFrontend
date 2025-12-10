import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';


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

interface User {
  id: string;
  name: string;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  type: 'buyer' | 'dealer';
  isOnline: boolean;
  lastSeen?: Date;
  showroomName?: string;
}

const ChatConversationScreen: React.FC = ({ navigation, route }: any) => {
  const theme = {
    colors: {
      text: '#1A202C',
      textSecondary: '#4A5568',
      primary: '#FFD700',
      surface: '#FFFFFF',
      border: '#E2E8F0',
      background: '#FAFBFC',
      cardBackground: '#FFFFFF',
    }
  } as const;
  const user: User = { 
    id: 'current_user_123',
    name: 'Test User' 
  };
  
  const {
    participantId,
    participantName,
    participantType,
    relatedCarId,
    relatedCarTitle,
    conversation
  } = route.params;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [participantTyping, setParticipantTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  // Mock participant data
  const mockParticipant = React.useMemo<Participant>(() => ({
    id: participantId,
    name: participantName,
    type: participantType,
    isOnline: true,
    lastSeen: new Date(),
    showroomName: participantType === 'dealer' ? 'Premium Motors' : undefined,
    avatar: participantType === 'dealer' 
      ? 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&h=100&fit=crop' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  }), [participantId, participantName, participantType]);

  // Mock messages
  const mockMessages = React.useMemo<ChatMessage[]>(() => [
    {
      id: '1',
      text: 'Hello! I saw your listing for the Honda City. Is it still available? ',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      senderId: participantId,
      senderName: participantName,
      type: 'text',
      isRead: true,
      deliveryStatus: 'read'
    },
    {
      id: '2',
      text: 'Yes, it\'s still available! Would you like to schedule a test drive? ',
      timestamp: new Date(Date.now() - 50 * 60 * 1000),
      senderId: user?.id || 'current_user',
      senderName: user?.name || 'You',
      type: 'text',
      isRead: true,
      deliveryStatus: 'read'
    },
    {
      id: '3',
      text: 'That would be great! Can you share more details about the car? ',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      senderId: participantId,
      senderName: participantName,
      type: 'text',
      isRead: true,
      deliveryStatus: 'read'
    },
    {
      id: '4',
      text: '',
      timestamp: new Date(Date.now() - 40 * 60 * 1000),
      senderId: user?.id || 'current_user',
      senderName: user?.name || 'You',
      type: 'car_share',
      carData: {
        id: relatedCarId || 'car1',
        title: relatedCarTitle || '2020 Honda City VX CVT',
        price: '₹12,50,000',
        image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=300&h=200&fit=crop',
        make: 'Honda',
        model: 'City',
        year: 2020
      },
      isRead: true,
      deliveryStatus: 'read'
    },
    {
      id: '5',
      text: 'Perfect! When would be a good time for the test drive? ',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      senderId: participantId,
      senderName: participantName,
      type: 'text',
      isRead: true,
      deliveryStatus: 'read'
    }
  ], [participantId, participantName, relatedCarId, relatedCarTitle, user?.id, user?.name]);

  useEffect(() => {
    setParticipant(mockParticipant);
    setMessages(mockMessages);
    
    // Simulate typing indicator
    const typingTimeout = setTimeout(() => {
      setParticipantTyping(true);
      setTimeout(() => setParticipantTyping(false), 3000);
    }, 2000);

    return () => clearTimeout(typingTimeout);
  }, [mockParticipant, mockMessages]);

  useEffect(() => {
    if (participantTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [participantTyping, typingAnimation]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText.trim(),
      timestamp: new Date(),
      senderId: user?.id || 'current_user',
      senderName: user?.name || 'You',
      type: 'text',
      isRead: false,
      deliveryStatus: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    
    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, deliveryStatus: 'sent' }
            : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, deliveryStatus: 'delivered' }
            : msg
        )
      );
    }, 2000);
  };

  const pickImage = async () => {
    // ImagePicker functionality commented out - needs expo setup
    Alert.alert('Feature', 'Image sharing will be implemented with proper expo setup');
    // const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    // if (status !== 'granted') {
    //   Alert.alert('Permission needed', 'Please grant camera roll permission to share images.');
    //   return;
    // }

    // const result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   allowsEditing: true,
    //   aspect: [4, 3],
    //   quality: 0.8,
    // });

    // if (!result.canceled && result.assets[0]) {
    //   const imageMessage: ChatMessage = {
    //     id: Date.now().toString(),
    //     text: '',
    //     timestamp: new Date(),
    //     senderId: user?.id || 'current_user',
    //     senderName: user?.name || 'You',
    //     type: 'image',
    //     imageUrl: result.assets[0].uri,
    //     isRead: false,
    //     deliveryStatus: 'sending'
    //   };

    //   setMessages(prev => [...prev, imageMessage]);
    // }
  };

  const shareLocation = () => {
    const locationMessage: ChatMessage = {
      id: Date.now().toString(),
      text: 'My Location',
      timestamp: new Date(),
      senderId: user?.id || 'current_user',
      senderName: user?.name || 'You',
      type: 'location',
      locationData: {
        latitude: 19.0760,
        longitude: 72.8777,
        address: 'Mumbai, Maharashtra, India'
      },
      isRead: false,
      deliveryStatus: 'sending'
    };

    setMessages(prev => [...prev, locationMessage]);
  };

  const makePhoneCall = () => {
    const phoneNumber = '+919876543210'; // Mock number
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openWhatsApp = () => {
    const phoneNumber = '919876543210'; // Mock number
    const message = `Hi ${participantName}, I'm interested in discussing the car listing.`;
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`);
  };

  const formatMessageTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageBubble = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === user?.id || item.senderId === 'current_user';
    
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={[styles.systemMessage, { color: theme.colors.textSecondary }]}>
            {item.text}
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
          <Image
            source={{ uri: participant?.avatar }}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isOwnMessage ? theme.colors.primary : theme.colors.surface,
            borderColor: theme.colors.border
          }
        ]}>
          {item.type === 'text' && (
            <Text style={[
              styles.messageText,
              { color: isOwnMessage ? '#FFFFFF' : theme.colors.text }
            ]}>
              {item.text}
            </Text>
          )}
          
          {item.type === 'image' && (
            <TouchableOpacity onPress={() => setSelectedImage(item.imageUrl || null)}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.messageImage}
              />
            </TouchableOpacity>
          )}
          
          {item.type === 'car_share' && item.carData && (
            <TouchableOpacity style={styles.carShareContainer}>
              <Image
                source={{ uri: item.carData.image }}
                style={styles.carShareImage}
              />
              <View style={styles.carShareDetails}>
                <Text style={[
                  styles.carShareTitle,
                  { color: isOwnMessage ? '#FFFFFF' : theme.colors.text }
                ]}>
                  {item.carData.title}
                </Text>
                <Text style={[
                  styles.carSharePrice,
                  { color: isOwnMessage ? '#FFFFFF' : theme.colors.primary }
                ]}>
                  {item.carData.price}
                </Text>
                <Text style={[
                  styles.carShareSubtitle,
                  { color: isOwnMessage ? '#FFFFFF' : theme.colors.textSecondary }
                ]}>
                  {item.carData.year} • {item.carData.make} {item.carData.model}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          
          {item.type === 'location' && item.locationData && (
            <TouchableOpacity style={styles.locationContainer}>
              <Text style={{fontSize: 20, marginRight: 4}}>📍</Text>
              <Text style={[
                styles.locationText,
                { color: isOwnMessage ? '#FFFFFF' : theme.colors.text }
              ]}>
                {item.locationData.address}
              </Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              { color: isOwnMessage ? '#FFFFFF' : theme.colors.textSecondary }
            ]}>
              {formatMessageTime(item.timestamp)}
            </Text>
            
            {isOwnMessage && (
              <Text style={[styles.deliveryIcon, {
                fontSize: 12,
                color: item.deliveryStatus === 'read' ? '#4CAF50' : '#FFFFFF'
              }]}>
                {item.deliveryStatus === 'read' ? '✓✓' :
                 item.deliveryStatus === 'delivered' ? '✓✓' :
                 item.deliveryStatus === 'sent' ? '✓' : '🕒'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!participantTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.otherMessageContainer]}>
        <Image
          source={{ uri: participant?.avatar }}
          style={styles.messageAvatar}
        />
        <View style={[
          styles.messageBubble,
          { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }
        ]}>
          <View style={styles.typingContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.typingDot,
                  {
                    backgroundColor: theme.colors.textSecondary,
                    opacity: typingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                      extrapolate: 'clamp',
                    }),
                    transform: [{
                      scale: typingAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                        extrapolate: 'clamp',
                      }),
                    }],
                  }
                ]}
              />
            ))}
          </View>
          <Text style={[styles.typingText, { color: theme.colors.textSecondary }]}>
            {participant?.name} is typing...
          </Text>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      marginRight: 12,
    },
    headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    headerAvatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    headerInfo: {
      flex: 1,
    },
    headerName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    headerStatus: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 16,
    },
    actionButton: {
      padding: 8,
    },
    messagesList: {
      flex: 1,
      paddingVertical: 8,
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
    messageBubble: {
      maxWidth: '75%',
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 20,
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
    },
    carSharePrice: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 2,
    },
    carShareSubtitle: {
      fontSize: 12,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    locationText: {
      fontSize: 14,
      flex: 1,
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
    },
    deliveryIcon: {
      marginLeft: 2,
    },
    systemMessageContainer: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    systemMessage: {
      fontSize: 12,
      fontStyle: 'italic',
    },
    typingContainer: {
      flexDirection: 'row',
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
      fontStyle: 'italic',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: 16,
      backgroundColor: theme.colors.cardBackground,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    attachmentButton: {
      padding: 8,
      marginRight: 8,
    },
    textInputContainer: {
      flex: 1,
      maxHeight: 100,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.background,
    },
    textInput: {
      fontSize: 16,
      color: theme.colors.text,
      textAlignVertical: 'top',
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      padding: 8,
      marginLeft: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
      },
    attachmentMenu: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 8,
      marginBottom: 8,
      marginHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    attachmentOption: {
      alignItems: 'center',
      padding: 12,
    },
    attachmentOptionText: {
      fontSize: 12,
      color: theme.colors.text,
      marginTop: 4,
    },
    imageModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullScreenImage: {
      width: '90%',
      height: '70%',
      resizeMode: 'contain',
    },
    modalCloseButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 20,
      padding: 10,
    },
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={{fontSize: 24, color: theme.colors.text}}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          {participant?.avatar ? (
            <Image source={{ uri: participant.avatar }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
            <Text style={{fontSize: 20, color: '#FFFFFF'}}>
                {participant?.type === 'dealer' ? '🏪' : '👤'}
              </Text>
            </View>
          )}
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{participant?.name}</Text>
            <Text style={styles.headerStatus}>
              {participant?.isOnline ? 'Online' : 'Last seen recently'}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={makePhoneCall}>
            <Text style={{fontSize: 20, color: theme.colors.primary}}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={openWhatsApp}>
            <Text style={{fontSize: 20, color: '#25D366'}}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        style={styles.messagesList}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageBubble}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderTypingIndicator}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachmentButton}>
          <Text style={{fontSize: 24, color: theme.colors.primary}}>+</Text>
        </TouchableOpacity>
        
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
          />
        </View>
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            !messageText.trim() && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!messageText.trim()}
        >
          <Text style={{fontSize: 20, color: '#FFFFFF'}}>➤</Text>
        </TouchableOpacity>
      </View>

      {/* Image Preview Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.imageModal}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={{fontSize: 24, color: '#FFFFFF'}}>×</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChatConversationScreen;


