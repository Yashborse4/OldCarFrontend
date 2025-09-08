import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { ThemeContext } from '../../theme/ThemeContext';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '../../theme';
interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  type: 'buyer' | 'dealer';
  isOnline: boolean;
  showroomName?: string;
  location?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  type: 'text' | 'image' | 'car_share' | 'location';
  isRead: boolean;
}

interface ChatConversation {
  id: string;
  participant: ChatParticipant;
  lastMessage: ChatMessage;
  unreadCount: number;
  isPinned: boolean;
  relatedCarId?: string;
  relatedCarTitle?: string;
  conversationType: 'buyer_inquiry' | 'dealer_network' | 'general';
}

const ChatListScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ChatConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'buyers' | 'dealers'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - Replace with actual API calls
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
      lastMessage: {
        id: 'msg1',
        text: 'Is the Honda City still available? I\'m interested in a test drive.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        senderId: 'buyer1',
        type: 'text',
        isRead: false
      },
      unreadCount: 3,
      isPinned: true,
      relatedCarId: 'car1',
      relatedCarTitle: '2020 Honda City VX CVT',
      conversationType: 'buyer_inquiry'
    },
    {
      id: '2',
      participant: {
        id: 'dealer1',
        name: 'Amit Motors',
        avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&h=100&fit=crop',
        type: 'dealer',
        isOnline: false,
        showroomName: 'Amit Premium Cars',
        location: 'Delhi, India'
      },
      lastMessage: {
        id: 'msg2',
        text: 'I have a bulk order of 5 Maruti Swift. Interested in B2B deal?',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        senderId: 'dealer1',
        type: 'text',
        isRead: true
      },
      unreadCount: 0,
      isPinned: false,
      conversationType: 'dealer_network'
    },
    {
      id: '3',
      participant: {
        id: 'buyer2',
        name: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        type: 'buyer',
        isOnline: true,
        location: 'Bangalore, Karnataka'
      },
      lastMessage: {
        id: 'msg3',
        text: 'Thank you for the detailed information about the BMW X1.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        senderId: 'buyer2',
        type: 'text',
        isRead: true
      },
      unreadCount: 0,
      isPinned: false,
      relatedCarId: 'car2',
      relatedCarTitle: '2019 BMW X1 sDrive20d',
      conversationType: 'buyer_inquiry'
    },
    {
      id: '4',
      participant: {
        id: 'dealer2',
        name: 'Luxury Car Hub',
        avatar: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&h=100&fit=crop',
        type: 'dealer',
        isOnline: true,
        showroomName: 'Luxury Car Hub',
        location: 'Pune, Maharashtra'
      },
      lastMessage: {
        id: 'msg4',
        text: 'Can you help with financing options for luxury cars?',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        senderId: 'dealer2',
        type: 'text',
        isRead: true
      },
      unreadCount: 0,
      isPinned: false,
      conversationType: 'dealer_network'
    }
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchQuery, selectedFilter]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      setConversations(mockConversations);
    } catch (error) {
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const filterConversations = () => {
    let filtered = conversations;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(conv => 
        selectedFilter === 'buyers' ? conv.participant.type === 'buyer' : conv.participant.type === 'dealer'
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(conv => 
        conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.relatedCarTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredConversations(filtered);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 60 * 1000) return 'Now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d`;
    
    return timestamp.toLocaleDateString();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const openChat = (conversation: ChatConversation) => {
    navigation.navigate('ChatConversation', {
      conversation,
      participantId: conversation.participant.id,
      participantName: conversation.participant.name,
      participantType: conversation.participant.type,
      relatedCarId: conversation.relatedCarId,
      relatedCarTitle: conversation.relatedCarTitle
    });
  };

  const renderFilterButton = (filter: 'all' | 'buyers' | 'dealers', label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: selectedFilter === filter ? theme.primary : theme.cardBackground,
          borderColor: selectedFilter === filter ? theme.primary : theme.border
        }
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={16}
        color={selectedFilter === filter ? '#FFFFFF' : theme.text}
      />
      <Text style={[
        styles.filterButtonText,
        { color: selectedFilter === filter ? '#FFFFFF' : theme.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderConversationItem = ({ item }: { item: ChatConversation }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { backgroundColor: theme.cardBackground }]}
      onPress={() => openChat(item)}
    >
      <View style={styles.avatarContainer}>
        {item.participant.avatar ? (
          <Image
            source={{ uri: item.participant.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
            <MaterialCommunityIcons
              name={item.participant.type === 'dealer' ? 'store' : 'account'}
              size={24}
              color="#FFFFFF"
            />
          </View>
        )}
        
        {item.participant.isOnline && <View style={styles.onlineIndicator} />}
        
        {item.isPinned && (
          <View style={styles.pinnedIndicator}>
            <MaterialCommunityIcons name="pin" size={12} color={theme.primary} />
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <View style={styles.nameContainer}>
            <Text style={[styles.participantName, { color: theme.text }]}>
              {item.participant.name}
            </Text>
            
            <View style={[
              styles.typeIndicator,
              { backgroundColor: item.participant.type === 'dealer' ? '#4CAF50' : '#2196F3' }
            ]}>
              <MaterialCommunityIcons
                name={item.participant.type === 'dealer' ? 'store' : 'account'}
                size={10}
                color="#FFFFFF"
              />
            </View>
          </View>
          
          <View style={styles.timestampContainer}>
            <Text style={[styles.timestamp, { color: theme.secondaryText }]}>
              {formatTimestamp(item.lastMessage.timestamp)}
            </Text>
            
            {item.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {item.participant.showroomName && (
          <Text style={[styles.showroomName, { color: theme.secondaryText }]}>
            {item.participant.showroomName}
          </Text>
        )}

        {item.relatedCarTitle && (
          <View style={styles.relatedCarContainer}>
            <MaterialCommunityIcons name="car" size={12} color={theme.primary} />
            <Text style={[styles.relatedCarTitle, { color: theme.primary }]}>
              {item.relatedCarTitle}
            </Text>
          </View>
        )}

        <Text
          style={[
            styles.lastMessage,
            {
              color: item.unreadCount > 0 ? theme.text : theme.secondaryText,
              fontWeight: item.unreadCount > 0 ? '600' : '400'
            }
          ]}
          numberOfLines={1}
        >
          {item.lastMessage.senderId === user?.id ? 'You: ' : ''}{item.lastMessage.text}
        </Text>
      </View>

      <View style={styles.conversationActions}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={theme.secondaryText}
        />
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 16,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 40,
      color: theme.text,
      fontSize: 16,
    },
    filtersContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      gap: 4,
    },
    filterButtonText: {
      fontSize: 12,
      fontWeight: '500',
    },
    conversationsList: {
      flex: 1,
    },
    conversationItem: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      alignItems: 'center',
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    avatarPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#4CAF50',
      borderWidth: 2,
      borderColor: theme.cardBackground,
    },
    pinnedIndicator: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: theme.cardBackground,
      borderRadius: 8,
      padding: 2,
    },
    conversationContent: {
      flex: 1,
    },
    conversationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    participantName: {
      fontSize: 16,
      fontWeight: '600',
      marginRight: 6,
    },
    typeIndicator: {
      borderRadius: 8,
      padding: 2,
    },
    timestampContainer: {
      alignItems: 'flex-end',
    },
    timestamp: {
      fontSize: 12,
      marginBottom: 2,
    },
    unreadBadge: {
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      minWidth: 20,
      alignItems: 'center',
    },
    unreadCount: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
    },
    showroomName: {
      fontSize: 12,
      marginBottom: 2,
    },
    relatedCarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 4,
    },
    relatedCarTitle: {
      fontSize: 12,
      fontWeight: '500',
    },
    lastMessage: {
      fontSize: 14,
      lineHeight: 18,
    },
    conversationActions: {
      marginLeft: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: 14,
      color: theme.secondaryText,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialCommunityIcons name="loading" size={40} color={theme.primary} />
        <Text style={[styles.emptyTitle, { marginTop: 16 }]}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={theme.secondaryText}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={theme.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filtersContainer}>
          {renderFilterButton('all', 'All', 'forum')}
          {renderFilterButton('buyers', 'Buyers', 'account-group')}
          {renderFilterButton('dealers', 'Dealers', 'store')}
        </View>
      </View>

      {filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="message-outline"
            size={60}
            color={theme.secondaryText}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </Text>
          <Text style={styles.emptyMessage}>
            {searchQuery 
              ? 'Try adjusting your search or filters'
              : 'Start connecting with buyers and dealers to see your conversations here.'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.conversationsList}
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ChatListScreen;


