import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
// Note: These imports have been commented out as they need proper setup
// import LinearGradient from 'react-native-linear-gradient';
// import * as Animatable from 'react-native-animatable';
// import { useTheme } from '../../hooks/useTheme';
// import { Button } from '../../components/UI/Button';
// import { Card } from '../../components/UI/Card';
// import { ChatScreenRouteProp, ChatMessage, Vehicle } from '../../navigation/types';
// import { carApi } from '../../services/CarApi';

// Temporary interfaces until proper types are available
interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'vehicle' | 'quote';
  attachments?: any[];
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  location: string;
  condition: string;
  images: string[];
  specifications: any;
  dealerId: string;
  dealerName: string;
  isCoListed: boolean;
  coListedIn: string[];
  views: number;
  inquiries: number;
  shares: number;
}

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { dealerId, dealerName } = route.params as { dealerId: string; dealerName: string };
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // Mock data - replace with API calls later
  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      senderId: dealerId,
      receiverId: 'current-user',
      message: 'Hi! I saw your BMW X5 listing. Very impressive vehicle!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      status: 'read',
      type: 'text',
    },
    {
      id: '2',
      senderId: 'current-user',
      receiverId: dealerId,
      message: 'Thank you! It\'s in excellent condition. Are you interested for your inventory?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.8).toISOString(),
      status: 'read',
      type: 'text',
    },
    {
      id: '3',
      senderId: dealerId,
      receiverId: 'current-user',
      message: 'Yes, definitely. Could you share more details about the maintenance history?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
      status: 'read',
      type: 'text',
    },
    {
      id: '4',
      senderId: 'current-user',
      receiverId: dealerId,
      message: 'Of course! Let me send you the complete vehicle details.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.3).toISOString(),
      status: 'delivered',
      type: 'text',
    },
    {
      id: '5',
      senderId: 'current-user',
      receiverId: dealerId,
      message: '2023 BMW X5 - $75,000',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.2).toISOString(),
      status: 'delivered',
      type: 'vehicle',
      attachments: [{
        vehicleId: 'vehicle-1',
        make: 'BMW',
        model: 'X5',
        year: 2023,
        price: 75000,
        image: 'https://example.com/bmw-x5.jpg'
      }],
    },
    {
      id: '6',
      senderId: dealerId,
      receiverId: 'current-user',
      message: 'Perfect! What\'s your best price for a dealer-to-dealer transaction?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      status: 'read',
      type: 'text',
    },
    {
      id: '7',
      senderId: 'current-user',
      receiverId: dealerId,
      message: 'Dealer price: $68,500 (Final offer)',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      status: 'delivered',
      type: 'quote',
      attachments: [{
        originalPrice: 75000,
        dealerPrice: 68500,
        savings: 6500,
        validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
      }],
    },
    {
      id: '8',
      senderId: dealerId,
      receiverId: 'current-user',
      message: 'I have a customer interested in your BMW X5. Can we discuss pricing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      status: 'delivered',
      type: 'text',
    },
  ];

  const mockUserVehicles: Vehicle[] = [
    {
      id: 'v1',
      make: 'BMW',
      model: 'X5',
      year: 2023,
      price: 75000,
      mileage: 15000,
      location: 'New York',
      condition: 'Excellent',
      images: ['https://example.com/bmw1.jpg'],
      specifications: {},
      dealerId: 'current-user',
      dealerName: 'Your Dealership',
      isCoListed: false,
      coListedIn: [],
      views: 234,
      inquiries: 12,
      shares: 8,
    },
    {
      id: 'v2',
      make: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2024,
      price: 55000,
      mileage: 5000,
      location: 'New York',
      condition: 'Like New',
      images: ['https://example.com/merc1.jpg'],
      specifications: {},
      dealerId: 'current-user',
      dealerName: 'Your Dealership',
      isCoListed: false,
      coListedIn: [],
      views: 156,
      inquiries: 8,
      shares: 4,
    },
  ];

  useEffect(() => {
    loadMessages();
    loadUserVehicles();
  }, [dealerId]);

  const loadMessages = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setMessages(mockMessages.reverse()); // Show latest at bottom
        scrollToBottom();
      }, 1000);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadUserVehicles = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setUserVehicles(mockUserVehicles);
      }, 500);
    } catch (error) {
      console.error('Error loading user vehicles:', error);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const sendMessage = async (messageType: 'text' | 'vehicle' | 'quote' = 'text', attachments?: any) => {
    if (messageType === 'text' && !messageText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current-user',
      receiverId: dealerId,
      message: messageType === 'text' ? messageText.trim() : 
               messageType === 'vehicle' ? `${attachments.year} ${attachments.make} ${attachments.model} - $${attachments.price.toLocaleString()}` :
               `Quote: $${attachments.dealerPrice.toLocaleString()} (${attachments.savings > 0 ? 'Save $' + attachments.savings.toLocaleString() : 'Final offer'})`,
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: messageType,
      attachments: attachments ? [attachments] : undefined,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    setShowVehicleModal(false);
    scrollToBottom();

    // TODO: Send to backend
    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);
  };

  const handleSendVehicle = (vehicle: Vehicle) => {
    const vehicleAttachment = {
      vehicleId: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      image: vehicle.images[0] || null,
    };
    sendMessage('vehicle', vehicleAttachment);
  };

  const handleSendQuote = () => {
    // This would typically open a quote creation modal
    Alert.prompt(
      'Send Quote',
      'Enter your dealer price:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: (priceText: any) => {
            if (priceText) {
              const price = parseInt(priceText.replace(/[^\d]/g, ''));
              if (price > 0) {
                const quoteAttachment = {
                  originalPrice: 75000, // This would come from context
                  dealerPrice: price,
                  savings: Math.max(0, 75000 - price),
                  validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days
                };
                sendMessage('quote', quoteAttachment);
              }
            }
          },
        },
      ],
      'plain-text',
      '$75,000'
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const messageTime = new Date(timestamp);
    return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sent':
        return <MaterialIcons name="done" size={12} color="#666" />;
      case 'delivered':
        return <MaterialIcons name="done-all" size={12} color="#666" />;
      case 'read':
        return <MaterialIcons name="done-all" size={12} color="#4ECDC4" />;
      default:
        return null;
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwnMessage = item.senderId === 'current-user';
    const showTimestamp = index === 0 || 
      new Date(item.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 300000; // 5 minutes

    return (
      <View style={styles.messageContainer}>
        {showTimestamp && (
          <Text style={styles.timestampText}>
            {formatTimestamp(item.timestamp)}
          </Text>
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage
        ]}>
          {item.type === 'vehicle' && item.attachments?.[0] && (
            <TouchableOpacity 
              style={styles.vehicleAttachment}
              onPress={() => (navigation as any).navigate('VehicleDetailScreen', {
                vehicleId: item.attachments?.[0]?.vehicleId
              })}
            >
              <View style={styles.vehicleImageContainer}>
                {item.attachments[0].image ? (
                  <Image source={{ uri: item.attachments[0].image }} style={styles.vehicleImage} />
                ) : (
                  <View style={styles.placeholderVehicleImage}>
                    <MaterialIcons name="directions-car" size={30} color="#ccc" />
                  </View>
                )}
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleTitle}>
                  {item.attachments[0].year} {item.attachments[0].make} {item.attachments[0].model}
                </Text>
                <Text style={styles.vehiclePrice}>
                  ${item.attachments[0].price.toLocaleString()}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          )}
          
          {item.type === 'quote' && item.attachments?.[0] && (
            <View style={styles.quoteAttachment}>
              <View style={styles.quoteHeader}>
                <MaterialIcons name="local-offer" size={20} color="#4ECDC4" />
                <Text style={styles.quoteTitle}>Dealer Quote</Text>
              </View>
              <Text style={styles.quotePrice}>
                ${item.attachments[0].dealerPrice.toLocaleString()}
              </Text>
              {item.attachments[0].savings > 0 && (
                <Text style={styles.quoteSavings}>
                  Save ${item.attachments[0].savings.toLocaleString()}
                </Text>
              )}
              <Text style={styles.quoteValid}>
                Valid until {new Date(item.attachments[0].validUntil).toLocaleDateString()}
              </Text>
            </View>
          )}
          
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.message}
          </Text>
          
          {isOwnMessage && (
            <View style={styles.messageStatus}>
              {getStatusIcon(item.status)}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      style={styles.vehicleSelectCard}
      onPress={() => handleSendVehicle(item)}
      activeOpacity={0.8}
    >
      <View style={styles.vehicleSelectImageContainer}>
        {item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.vehicleSelectImage} />
        ) : (
          <View style={styles.placeholderSelectImage}>
            <MaterialIcons name="directions-car" size={30} color="#ccc" />
          </View>
        )}
      </View>
      
      <View style={styles.vehicleSelectInfo}>
        <Text style={styles.vehicleSelectTitle}>
          {item.year} {item.make} {item.model}
        </Text>
        <Text style={styles.vehicleSelectPrice}>
          ${item.price.toLocaleString()}
        </Text>
        <Text style={styles.vehicleSelectDetails}>
          {item.mileage.toLocaleString()} miles • {item.condition}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.dealerName}>{dealerName}</Text>
          <Text style={styles.onlineStatus}>Online now</Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton}>
          <MaterialIcons name="phone" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowAttachmentModal(true)}
          >
            <MaterialIcons name="add" size={24} color="#666" />
          </TouchableOpacity>
          
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            multiline
            style={styles.messageInput}
            onSubmitEditing={() => sendMessage('text')}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, messageText.trim() && styles.sendButtonActive]}
            onPress={() => sendMessage('text')}
          >
            <MaterialIcons 
              name="send" 
              size={20} 
              color={messageText.trim() ? '#fff' : '#666'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Options Modal */}
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
                setShowVehicleModal(true);
              }}
            >
              <MaterialIcons name="directions-car" size={24} color="#4ECDC4" />
              <Text style={styles.attachmentOptionText}>Share Vehicle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => {
                setShowAttachmentModal(false);
                // Handle image attachment
                Alert.alert('Image', 'Image sharing will be implemented with camera/gallery access');
              }}
            >
              <MaterialIcons name="image" size={24} color="#4ECDC4" />
              <Text style={styles.attachmentOptionText}>Share Image</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => {
                setShowAttachmentModal(false);
                handleSendQuote();
              }}
            >
              <MaterialIcons name="local-offer" size={24} color="#4ECDC4" />
              <Text style={styles.attachmentOptionText}>Send Quote</Text>
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

      {/* Vehicle Selection Modal */}
      <Modal
        visible={showVehicleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVehicleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.vehicleModal}>
            <View style={styles.vehicleModalHeader}>
              <Text style={styles.vehicleModalTitle}>Select Vehicle to Share</Text>
              <TouchableOpacity onPress={() => setShowVehicleModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={userVehicles}
              renderItem={renderVehicleItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  dealerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  headerButton: {
    padding: 4,
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
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    position: 'relative',
  },
  ownMessage: {
    backgroundColor: '#4ECDC4',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageStatus: {
    position: 'absolute',
    bottom: 4,
    right: 8,
  },
  vehicleAttachment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  vehicleImageContainer: {
    width: 50,
    height: 40,
    marginRight: 12,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  placeholderVehicleImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  vehiclePrice: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  quoteAttachment: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quoteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  quotePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  quoteSavings: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  quoteValid: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sendButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  attachmentModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
  },
  attachmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  attachmentOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  cancelOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  cancelOptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  vehicleModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingVertical: 20,
  },
  vehicleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  vehicleModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  vehicleSelectCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    margin: 10,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  vehicleSelectImageContainer: {
    width: 60,
    height: 45,
    marginRight: 12,
  },
  vehicleSelectImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  placeholderSelectImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleSelectInfo: {
    flex: 1,
  },
  vehicleSelectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  vehicleSelectPrice: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
    marginVertical: 2,
  },
  vehicleSelectDetails: {
    fontSize: 12,
    color: '#666',
  },
});

export default ChatScreen;

