import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AuthContext from './AuthContext';

// Types
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

interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  type: 'buyer' | 'dealer';
  isOnline: boolean;
  lastSeen?: Date;
  showroomName?: string;
  location?: string;
}

interface ChatConversation {
  id: string;
  participant: ChatParticipant;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isPinned: boolean;
  relatedCarId?: string;
  relatedCarTitle?: string;
  conversationType: 'buyer_inquiry' | 'dealer_network' | 'general';
  isTyping: boolean;
}

interface ChatNotification {
  id: string;
  conversationId: string;
  message: ChatMessage;
  timestamp: Date;
  isRead: boolean;
}

interface ChatState {
  conversations: ChatConversation[];
  activeConversation: string | null;
  notifications: ChatNotification[];
  isConnected: boolean;
  typingUsers: { [conversationId: string]: string[] };
  unreadCount: number;
}

// Actions
type ChatAction =
  | { type: 'SET_CONVERSATIONS'; payload: ChatConversation[] }
  | { type: 'ADD_CONVERSATION'; payload: ChatConversation }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: string; updates: Partial<ChatConversation> } }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: ChatMessage } }
  | { type: 'UPDATE_MESSAGE'; payload: { conversationId: string; messageId: string; updates: Partial<ChatMessage> } }
  | { type: 'MARK_MESSAGES_READ'; payload: { conversationId: string; messageIds: string[] } }
  | { type: 'SET_TYPING'; payload: { conversationId: string; userId: string; isTyping: boolean } }
  | { type: 'ADD_NOTIFICATION'; payload: ChatNotification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'UPDATE_PARTICIPANT_STATUS'; payload: { participantId: string; isOnline: boolean; lastSeen?: Date } };

// Initial state
const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  notifications: [],
  isConnected: false,
  typingUsers: {},
  unreadCount: 0,
};

// Reducer
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload,
        unreadCount: action.payload.reduce((total, conv) => total + conv.unreadCount, 0),
      };

    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        unreadCount: state.unreadCount + action.payload.unreadCount,
      };

    case 'UPDATE_CONVERSATION': {
      const conversations = state.conversations.map(conv =>
        conv.id === action.payload.id
          ? { ...conv, ...action.payload.updates }
          : conv
      );
      return {
        ...state,
        conversations,
        unreadCount: conversations.reduce((total, conv) => total + conv.unreadCount, 0),
      };
    }

    case 'SET_ACTIVE_CONVERSATION':
      return {
        ...state,
        activeConversation: action.payload,
      };

    case 'ADD_MESSAGE': {
      const { conversationId, message } = action.payload;
      const conversations = state.conversations.map(conv => {
        if (conv.id === conversationId) {
          const newMessages = [...conv.messages, message];
          const unreadCount = message.senderId !== conv.participant.id 
            ? conv.unreadCount 
            : state.activeConversation === conversationId 
              ? 0 
              : conv.unreadCount + 1;
          
          return {
            ...conv,
            messages: newMessages,
            lastMessage: message,
            unreadCount,
          };
        }
        return conv;
      });

      return {
        ...state,
        conversations,
        unreadCount: conversations.reduce((total, conv) => total + conv.unreadCount, 0),
      };
    }

    case 'UPDATE_MESSAGE': {
      const { conversationId, messageId, updates } = action.payload;
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === messageId ? { ...msg, ...updates } : msg
                ),
              }
            : conv
        ),
      };
    }

    case 'MARK_MESSAGES_READ': {
      const { conversationId, messageIds } = action.payload;
      const conversations = state.conversations.map(conv => {
        if (conv.id === conversationId) {
          const messages = conv.messages.map(msg =>
            messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
          );
          return {
            ...conv,
            messages,
            unreadCount: 0,
          };
        }
        return conv;
      });

      return {
        ...state,
        conversations,
        unreadCount: conversations.reduce((total, conv) => total + conv.unreadCount, 0),
      };
    }

    case 'SET_TYPING': {
      const { conversationId, userId, isTyping } = action.payload;
      const currentTypers = state.typingUsers[conversationId] || [];
      
      let newTypers: string[];
      if (isTyping) {
        newTypers = currentTypers.includes(userId) ? currentTypers : [...currentTypers, userId];
      } else {
        newTypers = currentTypers.filter(id => id !== userId);
      }

      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: newTypers,
        },
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, isTyping: newTypers.length > 0 }
            : conv
        ),
      };
    }

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 49)], // Keep last 50 notifications
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, isRead: true } : notif
        ),
      };

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.payload,
      };

    case 'UPDATE_PARTICIPANT_STATUS': {
      const { participantId, isOnline, lastSeen } = action.payload;
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.participant.id === participantId
            ? {
                ...conv,
                participant: {
                  ...conv.participant,
                  isOnline,
                  lastSeen: lastSeen || conv.participant.lastSeen,
                },
              }
            : conv
        ),
      };
    }

    default:
      return state;
  }
};

// Context
interface ChatContextType {
  state: ChatState;
  // Conversation management
  loadConversations: () => Promise<void>;
  createConversation: (participant: ChatParticipant) => Promise<string>;
  setActiveConversation: (conversationId: string | null) => void;
  pinConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  
  // Message management
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  sendImage: (conversationId: string, imageUri: string) => Promise<void>;
  sendLocation: (conversationId: string, latitude: number, longitude: number, address: string) => Promise<void>;
  sendCarShare: (conversationId: string, carId: string) => Promise<void>;
  markMessagesAsRead: (conversationId: string, messageIds: string[]) => void;
  
  // Typing indicators
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  
  // Real-time updates
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  
  // Notifications
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
  
  // Utilities
  getConversation: (conversationId: string) => ChatConversation | undefined;
  searchMessages: (query: string) => ChatMessage[];
  getUnreadCount: () => number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider
interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  
  // WebSocket connection for real-time messaging
  let websocket: WebSocket | null = null;

  // Load conversations from API
  const loadConversations = async () => {
    try {
      // TODO: Replace with actual API call
      const mockConversations: ChatConversation[] = [
        {
          id: '1',
          participant: {
            id: 'buyer1',
            name: 'Rajesh Kumar',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            type: 'buyer',
            isOnline: true,
            location: 'Mumbai, Maharashtra'
          },
          messages: [],
          unreadCount: 3,
          isPinned: true,
          relatedCarId: 'car1',
          relatedCarTitle: '2020 Honda City VX CVT',
          conversationType: 'buyer_inquiry',
          isTyping: false
        }
      ];
      
      dispatch({ type: 'SET_CONVERSATIONS', payload: mockConversations });
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  // Create new conversation
  const createConversation = async (participant: ChatParticipant): Promise<string> => {
    try {
      const newConversation: ChatConversation = {
        id: Date.now().toString(),
        participant,
        messages: [],
        unreadCount: 0,
        isPinned: false,
        conversationType: participant.type === 'dealer' ? 'dealer_network' : 'buyer_inquiry',
        isTyping: false
      };
      
      // TODO: API call to create conversation
      dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
      return newConversation.id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  };

  // Set active conversation
  const setActiveConversation = (conversationId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId });
    
    if (conversationId) {
      // Mark messages as read when opening conversation
      const conversation = state.conversations.find(conv => conv.id === conversationId);
      if (conversation && conversation.unreadCount > 0) {
        const unreadMessageIds = conversation.messages
          .filter(msg => !msg.isRead && msg.senderId !== user?.id)
          .map(msg => msg.id);
        
        if (unreadMessageIds.length > 0) {
          markMessagesAsRead(conversationId, unreadMessageIds);
        }
      }
    }
  };

  // Pin conversation
  const pinConversation = (conversationId: string) => {
    dispatch({
      type: 'UPDATE_CONVERSATION',
      payload: {
        id: conversationId,
        updates: { isPinned: true }
      }
    });
  };

  // Delete conversation
  const deleteConversation = (conversationId: string) => {
    // TODO: API call to delete conversation
    const updatedConversations = state.conversations.filter(conv => conv.id !== conversationId);
    dispatch({ type: 'SET_CONVERSATIONS', payload: updatedConversations });
  };

  // Send text message
  const sendMessage = async (conversationId: string, text: string) => {
    try {
      const message: ChatMessage = {
        id: Date.now().toString(),
        text,
        timestamp: new Date(),
        senderId: user?.id || 'current_user',
        senderName: user?.name || 'You',
        type: 'text',
        isRead: false,
        deliveryStatus: 'sending'
      };

      dispatch({ type: 'ADD_MESSAGE', payload: { conversationId, message } });
      
      // TODO: API call to send message
      // Simulate message delivery
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            conversationId,
            messageId: message.id,
            updates: { deliveryStatus: 'sent' }
          }
        });
      }, 1000);

      setTimeout(() => {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            conversationId,
            messageId: message.id,
            updates: { deliveryStatus: 'delivered' }
          }
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Send image message
  const sendImage = async (conversationId: string, imageUri: string) => {
    try {
      const message: ChatMessage = {
        id: Date.now().toString(),
        text: '',
        timestamp: new Date(),
        senderId: user?.id || 'current_user',
        senderName: user?.name || 'You',
        type: 'image',
        imageUrl: imageUri,
        isRead: false,
        deliveryStatus: 'sending'
      };

      dispatch({ type: 'ADD_MESSAGE', payload: { conversationId, message } });
      
      // TODO: Upload image and send message via API
    } catch (error) {
      console.error('Failed to send image:', error);
    }
  };

  // Send location message
  const sendLocation = async (conversationId: string, latitude: number, longitude: number, address: string) => {
    try {
      const message: ChatMessage = {
        id: Date.now().toString(),
        text: 'My Location',
        timestamp: new Date(),
        senderId: user?.id || 'current_user',
        senderName: user?.name || 'You',
        type: 'location',
        locationData: { latitude, longitude, address },
        isRead: false,
        deliveryStatus: 'sending'
      };

      dispatch({ type: 'ADD_MESSAGE', payload: { conversationId, message } });
      
      // TODO: API call to send location
    } catch (error) {
      console.error('Failed to send location:', error);
    }
  };

  // Send car share message
  const sendCarShare = async (conversationId: string, carId: string) => {
    try {
      // TODO: Fetch car details from API
      const carData = {
        id: carId,
        title: '2020 Honda City VX CVT',
        price: '₹12,50,000',
        image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=300&h=200&fit=crop',
        make: 'Honda',
        model: 'City',
        year: 2020
      };

      const message: ChatMessage = {
        id: Date.now().toString(),
        text: '',
        timestamp: new Date(),
        senderId: user?.id || 'current_user',
        senderName: user?.name || 'You',
        type: 'car_share',
        carData,
        isRead: false,
        deliveryStatus: 'sending'
      };

      dispatch({ type: 'ADD_MESSAGE', payload: { conversationId, message } });
      
      // TODO: API call to send car share
    } catch (error) {
      console.error('Failed to send car share:', error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = (conversationId: string, messageIds: string[]) => {
    dispatch({ type: 'MARK_MESSAGES_READ', payload: { conversationId, messageIds } });
    
    // TODO: API call to mark messages as read
  };

  // Typing indicators
  const startTyping = (conversationId: string) => {
    if (user?.id) {
      dispatch({
        type: 'SET_TYPING',
        payload: { conversationId, userId: user.id, isTyping: true }
      });
      
      // TODO: Send typing status via WebSocket
    }
  };

  const stopTyping = (conversationId: string) => {
    if (user?.id) {
      dispatch({
        type: 'SET_TYPING',
        payload: { conversationId, userId: user.id, isTyping: false }
      });
      
      // TODO: Send typing status via WebSocket
    }
  };

  // WebSocket connection for real-time updates
  const connectWebSocket = () => {
    try {
      // TODO: Replace with actual WebSocket URL
      // websocket = new WebSocket('ws://your-api-url/chat');
      
      // websocket.onopen = () => {
      //   dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      // };

      // websocket.onmessage = (event) => {
      //   const data = JSON.parse(event.data);
      //   handleWebSocketMessage(data);
      // };

      // websocket.onclose = () => {
      //   dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
      // };

      // websocket.onerror = (error) => {
      //   console.error('WebSocket error:', error);
      // };
      
      // Simulate connection for demo
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const disconnectWebSocket = () => {
    if (websocket) {
      websocket.close();
      websocket = null;
    }
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'new_message':
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { conversationId: data.conversationId, message: data.message }
        });
        
        // Add notification if not in active conversation
        if (state.activeConversation !== data.conversationId) {
          const notification: ChatNotification = {
            id: Date.now().toString(),
            conversationId: data.conversationId,
            message: data.message,
            timestamp: new Date(),
            isRead: false
          };
          dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
        }
        break;
        
      case 'typing_status':
        dispatch({
          type: 'SET_TYPING',
          payload: {
            conversationId: data.conversationId,
            userId: data.userId,
            isTyping: data.isTyping
          }
        });
        break;
        
      case 'user_status':
        dispatch({
          type: 'UPDATE_PARTICIPANT_STATUS',
          payload: {
            participantId: data.userId,
            isOnline: data.isOnline,
            lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined
          }
        });
        break;
    }
  };

  // Notification management
  const markNotificationAsRead = (notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  const clearAllNotifications = () => {
    dispatch({ type: 'SET_CONVERSATIONS', payload: state.conversations });
  };

  // Utility functions
  const getConversation = (conversationId: string): ChatConversation | undefined => {
    return state.conversations.find(conv => conv.id === conversationId);
  };

  const searchMessages = (query: string): ChatMessage[] => {
    const results: ChatMessage[] = [];
    const lowercaseQuery = query.toLowerCase();
    
    state.conversations.forEach(conversation => {
      conversation.messages.forEach(message => {
        if (message.text.toLowerCase().includes(lowercaseQuery)) {
          results.push(message);
        }
      });
    });
    
    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const getUnreadCount = (): number => {
    return state.unreadCount;
  };

  // Initialize chat when component mounts
  useEffect(() => {
    if (user) {
      loadConversations();
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const contextValue: ChatContextType = {
    state,
    loadConversations,
    createConversation,
    setActiveConversation,
    pinConversation,
    deleteConversation,
    sendMessage,
    sendImage,
    sendLocation,
    sendCarShare,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    connectWebSocket,
    disconnectWebSocket,
    markNotificationAsRead,
    clearAllNotifications,
    getConversation,
    searchMessages,
    getUnreadCount,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook to use chat context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};


