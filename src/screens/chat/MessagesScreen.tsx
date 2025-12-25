import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '../../components/ui/Card';

// Temporary interface until proper types are available
interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'vehicle' | 'quote' | 'image';
}

interface Conversation {
  id: string;
  dealerId: string;
  dealerName: string;
  dealership: string;
  lastMessage: ChatMessage;
  unreadCount: number;
  isOnline: boolean;
}

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colors = {
    background: '#FAFBFC',
    surface: '#FFFFFF',
    text: '#1A202C',
    textSecondary: '#4A5568',
    primary: '#FFD700',
    border: '#E2E8F0',
    success: '#48BB78',
  };
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API calls later
  const mockConversations = React.useMemo<Conversation[]>(() => [
    {
      id: '1',
      dealerId: 'dealer2',
      dealerName: 'Sarah Johnson',
      dealership: 'Elite Cars',
      lastMessage: {
        id: 'msg1',
        senderId: 'dealer2',
        receiverId: 'current-user',
        message: 'I have a customer interested in your BMW X5. Can we discuss pricing? ',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        status: 'delivered',
        type: 'text',
      },
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: '2',
      dealerId: 'dealer3',
      dealerName: 'Mike Wilson',
      dealership: 'Luxury Auto Group',
      lastMessage: {
        id: 'msg2',
        senderId: 'current-user',
        receiverId: 'dealer3',
        message: 'Thanks for the vehicle details. Let me review and get back to you.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        status: 'read',
        type: 'text',
      },
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: '3',
      dealerId: 'dealer4',
      dealerName: 'Lisa Garcia',
      dealership: 'Speed Motors',
      lastMessage: {
        id: 'msg3',
        senderId: 'dealer4',
        receiverId: 'current-user',
        message: 'Shared vehicle: 2023 Porsche 911 - $125,000',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        status: 'delivered',
        type: 'vehicle',
      },
      unreadCount: 1,
      isOnline: true,
    },
    {
      id: '4',
      dealerId: 'dealer5',
      dealerName: 'Tom Anderson',
      dealership: 'Performance Plus',
      lastMessage: {
        id: 'msg4',
        senderId: 'current-user',
        receiverId: 'dealer5',
        message: 'Perfect! When can we schedule the vehicle inspection? ',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        status: 'read',
        type: 'text',
      },
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: '5',
      dealerId: 'dealer6',
      dealerName: 'Chris Lee',
      dealership: 'Turbo Cars',
      lastMessage: {
        id: 'msg5',
        senderId: 'dealer6',
        receiverId: 'current-user',
        message: 'Quote updated: $89,500 (Final offer)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        status: 'delivered',
        type: 'quote',
      },
      unreadCount: 1,
      isOnline: false,
    },
  ], []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    filterConversations();
  }, [filterConversations]);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setConversations(mockConversations);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoading(false);
    }
  }, [mockConversations]);

  const filterConversations = useCallback(() => {
    if (!searchText.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(conv =>
      conv.dealerName.toLowerCase().includes(searchText.toLowerCase()) ||
      conv.dealership.toLowerCase().includes(searchText.toLowerCase()) ||
      conv.lastMessage.message.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [searchText, conversations]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversation: Conversation) => {
    (navigation as any).navigate('ChatScreen', {
      dealerId: conversation.dealerId,
      dealerName: conversation.dealerName,
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 7 * 24 * 60) return `${Math.floor(diffInMinutes / (24 * 60))}d`;
    
    return messageTime.toLocaleDateString();
  };

  const getMessagePreview = (message: ChatMessage) => {
    switch (message.type) {
      case 'image':
        return '📷 Image';
      case 'vehicle':
        return '🚗 ' + message.message;
      case 'quote':
        return '💰 ' + message.message;
      default:
        return message.message;
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <Card style={styles.conversationCard}>
      <TouchableOpacity
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.8}
        style={styles.conversationContent}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, item.isOnline && styles.onlineAvatar]}>
            <Text style={styles.avatarText}>
              {item.dealerName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.dealerName} numberOfLines={1}>
              {item.dealerName}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.lastMessage.timestamp)}
            </Text>
          </View>
          
          <Text style={styles.dealership} numberOfLines={1}>
            {item.dealership}
          </Text>
          
          <View style={styles.lastMessageContainer}>
            <Text style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.unreadMessage
            ]} numberOfLines={1}>
              {item.lastMessage.senderId === 'current-user' && '✓ '}
              {getMessagePreview(item.lastMessage)}
            </Text>
            
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 9 ? '9+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chat-bubble-outline" size={80} color={colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Messages Yet</Text>
      <Text style={styles.emptyStateText}>
        Start networking with other dealers and your conversations will appear here
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search conversations..."
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={filteredConversations.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A202C',
    backgroundColor: '#FAFBFC',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  conversationCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineAvatar: {
    borderWidth: 2,
    borderColor: '#48BB78',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#48BB78',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dealerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A202C',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#4A5568',
  },
  dealership: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 6,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    marginRight: 8,
  },
  unreadMessage: {
    color: '#1A202C',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default MessagesScreen;


