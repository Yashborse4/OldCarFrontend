import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '../../components/ui/Card';
import { chatApi, ChatMessageDto } from '../../services/ChatApi';
import { webSocketService, WSMessage } from '../../services/WebSocketService';
import { useAuth } from '../../context/AuthContext';
// import { carApi } from '../../services/CarApi'; // Uncomment when needed for vehicle selection

// Interface for Vehicle (can be imported from CarApi types later)
interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  images: string[];
  mileage: number;
  condition: string;
}

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const colors = {
    background: '#FAFBFC',
    surface: '#FFFFFF',
    text: '#1A202C',
    textSecondary: '#4A5568',
    primary: '#FFD700',
    border: '#E2E8F0',
    success: '#48BB78',
  };

  const { chatId, name, type, carId } = route.params as { chatId: number; name: string; type: string; carId?: number };

  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]); // To be populated from CarApi
  const flatListRef = useRef<FlatList>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load initial messages
  const loadMessages = useCallback(async (refresh = false) => {
    try {
      const currentPage = refresh ? 0 : page;
      const response = await chatApi.getMessages(chatId, currentPage, 50);

      if (refresh) {
        setMessages(response.content.reverse()); // Stack from bottom
      } else {
        setMessages(prev => [...response.content.reverse(), ...prev]);
      }

      setHasMore(currentPage < response.totalPages - 1);
      if (!refresh) setPage(currentPage + 1);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId, page]);

  useEffect(() => {
    loadMessages(true);

    // Initialize WebSocket connection if not connected
    if (!webSocketService.connected) {
      webSocketService.connect();
    }

    // Subscribe to this chat
    webSocketService.subscribeToChat(chatId);

    // Handle incoming messages
    const handleWebSocketMessage = (wsMessage: WSMessage) => {
      if (wsMessage.type === 'MESSAGE' && wsMessage.chatId === chatId) {
        setMessages(prev => [...prev, wsMessage.data]);
        scrollToBottom();
      }
    };

    webSocketService.onMessage(handleWebSocketMessage);

    return () => {
      // webSocketService.unsubscribeFromChat(chatId); // Optional: keep subscribed for notifications? Usually unsubscribe on unmount.
      webSocketService.removeMessageHandler(handleWebSocketMessage);
    };
  }, [chatId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const sendMessage = async (messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'CAR_REFERENCE' | 'USER_REFERENCE' = 'TEXT', contentOrAttachment?: any) => {
    if (messageType === 'TEXT' && !messageText.trim()) return;

    try {
      const content = messageType === 'TEXT' ? messageText : (typeof contentOrAttachment === 'string' ? contentOrAttachment : 'Attachment');

      // Optimistic update could go here, but we wait for WS echo or API response
      // Using API to send
      const request = {
        content: content,
        messageType: messageType,
        // fileUrl: ... if image
      };

      await chatApi.sendMessage(chatId, request);
      setMessageText('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleSendVehicle = (vehicle: Vehicle) => {
    // TODO: Implement proper CAR_REFERENCE message structure
    // For now sending as text with details or if backend supports 'CAR_REFERENCE' with metadata
    const content = `Check out this car: ${vehicle.year} ${vehicle.make} ${vehicle.model} - $${vehicle.price}`;
    sendMessage('TEXT', content);
    setShowVehicleModal(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const messageTime = new Date(timestamp);
    return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: ChatMessageDto['deliveryStatus']) => {
    switch (status) {
      case 'SENT': return <Ionicons name="done" size={12} color="#666" />;
      case 'DELIVERED': return <Ionicons name="done-all" size={12} color="#666" />;
      case 'READ': return <Ionicons name="done-all" size={12} color="#4ECDC4" />;
      default: return null;
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessageDto; index: number }) => {
    // Check sender.id vs user.id (need to ensure user object has id matched with backend)
    // Assuming user.id is available from AuthContext and matches
    const isOwnMessage = item.sender?.username === user?.username; // Safer to compare username if ID types differ (string vs number)

    // Formatting logic...
    return (
      <View style={[styles.messageContainer, { alignItems: isOwnMessage ? 'flex-end' : 'flex-start' }]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage
        ]}>
          {!isOwnMessage && item.sender && (
            <Text style={styles.senderName}>{item.sender.displayName}</Text>
          )}
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>

          <View style={styles.messageFooter}>
            <Text style={[styles.timestampText, isOwnMessage ? { color: 'rgba(255,255,255,0.7)' } : {}]}>
              {formatTimestamp(item.createdAt)}
            </Text>
            {isOwnMessage && getStatusIcon(item.deliveryStatus)}
          </View>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FAFBFC',
    },
    headerCard: {
      marginHorizontal: 0,
      borderRadius: 0,
      borderBottomWidth: 1,
      borderColor: '#E2E8F0',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    backButton: {
      padding: 4,
    },
    headerInfo: {
      flex: 1,
      alignItems: 'center',
    },
    chatName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1A202C',
    },
    chatStatus: {
      fontSize: 12,
      color: '#48BB78',
      marginTop: 2,
    },
    chatContainer: {
      flex: 1,
    },
    messagesList: {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    messageContainer: {
      marginBottom: 16,
      width: '100%',
    },
    messageBubble: {
      maxWidth: '80%',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      position: 'relative',
    },
    ownMessage: {
      backgroundColor: '#FFD700',
      borderBottomRightRadius: 4,
    },
    otherMessage: {
      backgroundColor: '#FFFFFF',
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    senderName: {
      fontSize: 12,
      color: '#A0AEC0',
      marginBottom: 4,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 20,
    },
    ownMessageText: {
      color: '#FFFFFF',
      fontWeight: '500',
    },
    otherMessageText: {
      color: '#1A202C',
    },
    messageFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 4,
      gap: 4
    },
    timestampText: {
      fontSize: 10,
      color: '#A0AEC0',
    },
    inputCard: {
      marginHorizontal: 0,
      borderRadius: 0,
      borderTopWidth: 1,
      borderColor: '#E2E8F0',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    attachButton: {
      padding: 8,
      marginRight: 8,
      marginBottom: 8,
    },
    messageInput: {
      flex: 1,
      maxHeight: 100,
      marginBottom: 0,
      marginRight: 8,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 16,
      color: '#1A202C',
      backgroundColor: '#FAFBFC',
      textAlignVertical: 'top',
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#E2E8F0',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    sendButtonActive: {
      backgroundColor: '#FFD700',
    },
    // Modal styles ...
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    attachmentModal: {
      backgroundColor: '#FFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    attachmentOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#EDF2F7',
    },
    attachmentOptionText: {
      marginLeft: 15,
      fontSize: 16,
      color: '#2D3748',
    },
    cancelOption: {
      marginTop: 15,
      alignItems: 'center',
      paddingVertical: 15,
    },
    cancelOptionText: {
      color: '#E53E3E',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Card style={styles.headerCard}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.chatName}>{name}</Text>
            {type === 'GROUP' && <Text style={styles.chatStatus}>Group</Text>}
          </View>

          <TouchableOpacity style={{ padding: 4 }}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </Card>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        <Card style={styles.inputCard}>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={() => setShowAttachmentModal(true)}
            >
              <Ionicons name="add" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              multiline
              style={styles.messageInput}
              onSubmitEditing={() => sendMessage('TEXT')}
            />

            <TouchableOpacity
              style={[styles.sendButton, messageText.trim() ? styles.sendButtonActive : null]}
              onPress={() => sendMessage('TEXT')}
            >
              <Ionicons
                name="send"
                size={20}
                color={messageText.trim() ? colors.surface : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </Card>
      </KeyboardAvoidingView>

      {/* Attachment Modal */}
      <Modal
        visible={showAttachmentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.attachmentModal}>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => {
                setShowAttachmentModal(false);
                // setShowVehicleModal(true); // TODO: Implement vehicle fetching
                Alert.alert('Coming Soon', 'Vehicle sharing will be enabled once Car API is integrated here.');
              }}
            >
              <Ionicons name="car" size={24} color="#4ECDC4" />
              <Text style={styles.attachmentOptionText}>Share Vehicle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelOption}
              onPress={() => setShowAttachmentModal(false)}
            >
              <Text style={styles.cancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ChatScreen;
