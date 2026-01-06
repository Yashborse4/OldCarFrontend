import React, { useState, useEffect, useCallback } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
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
  const insets = useSafeAreaInsets();
  const colors = {
    text: '#1A202C',
    textSecondary: '#4A5568',
    primary: '#FFD700',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    background: '#FAFBFC',
    success: '#48BB78'
  };
  
  // Mock user for now
  const user = { id: 'current-user', name: 'Current User' };
  
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ChatConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'buyers' | 'dealers'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - Replace with actual API calls
  const mockConversations = React.useMemo<ChatConversation[]>(() => [
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
        text: 'I have a bulk order of 5 Maruti Swift. Interested in B2B deal? ',
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
        text: 'Can you help with financing options for luxury cars? ',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        senderId: 'dealer2',
        type: 'text',
        isRead: true
      },
      unreadCount: 0,
      isPinned: false,
      conversationType: 'dealer_network'
    }
  ], []);

  const loadConversations = useCallback(async () => {
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
  }, [mockConversations]);

  const filterConversations = useCallback(() => {
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
  }, [conversations, searchQuery, selectedFilter]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    filterConversations();
  }, [filterConversations]);

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
    navigation.navigate('ChatConversationScreen', {
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
          backgroundColor: selectedFilter === filter ? colors.primary : colors.surface,
          borderColor: selectedFilter === filter ? colors.primary : colors.border
        }
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={{fontSize: 16, color: selectedFilter === filter ? colors.surface : colors.text}}>
        {icon === 'forum' ? '💬' : icon === 'account-group' ? '👥' : '🏪'}
      </Text>
      <Text style={[
        styles.filterButtonText,
        { color: selectedFilter === filter ? colors.surface : colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderConversationItem = ({ item }: { item: ChatConversation }) => (
    <Card style={styles.conversationCard}>
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => openChat(item)}
      >
      <View style={styles.avatarContainer}>
        {item.participant.avatar ? (
          <Image
            source={{ uri: item.participant.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={{fontSize: 24, color: colors.surface}}>
              {item.participant.type === 'dealer' ? '🏪' : '👤'}
            </Text>
          </View>
        )}
        
        {item.participant.isOnline && <View style={styles.onlineIndicator} />}
        
        {item.isPinned && (
          <View style={styles.pinnedIndicator}>
            <Text style={{fontSize: 12, color: colors.primary}}>📌</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <View style={styles.nameContainer}>
            <Text style={[styles.participantName, { color: colors.text }]}>
              {item.participant.name}
            </Text>
            
            <View style={[
              styles.typeIndicator,
              { backgroundColor: item.participant.type === 'dealer' ? colors.success : colors.primary }
            ]}>
              <Text style={{fontSize: 10, color: colors.surface}}>
                {item.participant.type === 'dealer' ? '🏪' : '👤'}
              </Text>
            </View>
          </View>
          
          <View style={styles.timestampContainer}>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {formatTimestamp(item.lastMessage.timestamp)}
            </Text>
            
            {item.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {item.participant.showroomName && (
          <Text style={[styles.showroomName, { color: colors.textSecondary }]}>
            {item.participant.showroomName}
          </Text>
        )}

        {item.relatedCarTitle && (
          <View style={styles.relatedCarContainer}>
            <Text style={{fontSize: 12, color: colors.primary, marginRight: 4}}>🚗</Text>
            <Text style={[styles.relatedCarTitle, { color: colors.primary }]}>
              {item.relatedCarTitle}
            </Text>
          </View>
        )}

        <Text
          style={[
            styles.lastMessage,
            {
              color: item.unreadCount > 0 ? colors.text : colors.textSecondary,
              fontWeight: item.unreadCount > 0 ? '600' : '400'
            }
          ]}
          numberOfLines={1}
        >
          {item.lastMessage.senderId === user?.id ? 'You: ' : ''}{item.lastMessage.text}
        </Text>
      </View>

      <View style={styles.conversationActions}>
        <Text style={{fontSize: 20, color: colors.textSecondary}}>›</Text>
      </View>
      </TouchableOpacity>
    </Card>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    header: {
      padding: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 40,
      color: colors.text,
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
    conversationCard: {
      marginHorizontal: 16,
      marginBottom: 8,
    },
    conversationItem: {
      flexDirection: 'row',
      padding: 16,
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
      backgroundColor: colors.success,
      borderWidth: 2,
      borderColor: colors.surface
    },
    pinnedIndicator: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: colors.surface,
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
      color: colors.surface,
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
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingTop: insets.top }]}>
        <Text style={{fontSize: 40, color: colors.primary}}>⟳</Text>
        <Text style={[styles.emptyTitle, { marginTop: 16 }]}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        
        <View style={styles.searchContainer}>
          <Text style={{fontSize: 20, color: colors.textSecondary, marginRight: 8}}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textSecondary}
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
          <Text style={{fontSize: 60, color: colors.textSecondary, marginBottom: 16}}>💬</Text>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </Text>
          <Text style={styles.emptyMessage}>
            {searchQuery 
              ? 'Try adjusting your search or filters' : 'Start connecting with buyers and dealers to see your conversations here.'
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
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ChatListScreen;


