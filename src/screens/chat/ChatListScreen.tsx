import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { chatApi, ChatRoomDto } from '../../services/ChatApi';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const ChatListScreen: React.FC = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const colors = {
    text: '#1A202C',
    textSecondary: '#4A5568',
    primary: '#FFD700',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    background: '#FAFBFC',
    success: '#48BB78'
  };

  const [conversations, setConversations] = useState<ChatRoomDto[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ChatRoomDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'groups' | 'inquiries'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadConversations = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(0);
      } // else setLoading(true); // Don't show full loader for pagination

      const currentPage = refresh ? 0 : page;
      const response = await chatApi.getMyChats(currentPage, 20);

      const newRooms = response.content;

      if (refresh) {
        setConversations(newRooms);
        setFilteredConversations(newRooms);
      } else {
        setConversations(prev => [...prev, ...newRooms]);
        setFilteredConversations(prev => [...prev, ...newRooms]);
      }

      setHasMore(currentPage < response.totalPages - 1);
      if (!refresh) setPage(currentPage + 1);

    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useFocusEffect(
    useCallback(() => {
      loadConversations(true);
    }, [])
  );

  const filterConversations = useCallback(() => {
    let filtered = conversations;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(conv => {
        if (selectedFilter === 'groups') return conv.type === 'GROUP';
        if (selectedFilter === 'inquiries') return conv.type === 'CAR_INQUIRY';
        return true;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(conv =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.lastMessage?.content && conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredConversations(filtered);
  }, [conversations, searchQuery, selectedFilter]);

  useEffect(() => {
    filterConversations();
  }, [filterConversations]);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      try {
        const response = await chatApi.searchChats(text);
        // setFilteredConversations(response); // If global search is desired
      } catch (error) {
        console.error(error);
      }
    }
  };

  const formatTimestamp = (timestampString?: string) => {
    if (!timestampString) return '';
    const timestamp = new Date(timestampString);
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();

    if (diff < 60 * 1000) return 'Now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d`;

    return timestamp.toLocaleDateString();
  };

  const openChat = (room: ChatRoomDto) => {
    navigation.navigate('ChatScreen', {
      chatId: room.id,
      name: room.name,
      type: room.type,
      carId: room.carId
    });
  };

  const getDisplayName = (item: ChatRoomDto) => {
    if (item.type === 'PRIVATE') {
      return item.name.replace('Chat: ', '').replace(user?.username || '', '').replace('&', '').trim() || item.name;
    }
    return item.name;
  };

  const renderFilterButton = (filter: 'all' | 'groups' | 'inquiries', label: string, icon: string) => (
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
      <Text style={{ fontSize: 16, color: selectedFilter === filter ? colors.surface : colors.text }}>
        {icon === 'forum' ? '💬' : icon === 'account-group' ? '👥' : '🚗'}
      </Text>
      <Text style={[
        styles.filterButtonText,
        { color: selectedFilter === filter ? colors.surface : colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderConversationItem = ({ item }: { item: ChatRoomDto }) => {
    const displayName = getDisplayName(item);

    return (
      <Card style={styles.conversationCard}>
        <TouchableOpacity
          style={styles.conversationItem}
          onPress={() => openChat(item)}
        >
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={{ fontSize: 24, color: colors.surface }}>
                {item.type === 'GROUP' ? '👥' : item.type === 'CAR_INQUIRY' ? '🚗' : '👤'}
              </Text>
            </View>
          </View>

          <View style={styles.conversationContent}>
            <View style={styles.conversationHeader}>
              <View style={styles.nameContainer}>
                <Text style={[styles.participantName, { color: colors.text }]} numberOfLines={1}>
                  {displayName}
                </Text>

                <View style={[
                  styles.typeIndicator,
                  { backgroundColor: item.type === 'GROUP' ? colors.success : colors.primary }
                ]}>
                  <Text style={{ fontSize: 10, color: colors.surface }}>
                    {item.type === 'GROUP' ? 'GRP' : item.type === 'CAR_INQUIRY' ? 'CAR' : 'PVT'}
                  </Text>
                </View>
              </View>

              <View style={styles.timestampContainer}>
                <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                  {formatTimestamp(item.lastMessage?.createdAt || item.updatedAt)}
                </Text>

                {(item.unreadCount || 0) > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.unreadCount}>
                      {(item.unreadCount || 0) > 99 ? '99+' : item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Text
              style={[
                styles.lastMessage,
                {
                  color: (item.unreadCount || 0) > 0 ? colors.text : colors.textSecondary,
                  fontWeight: (item.unreadCount || 0) > 0 ? '600' : '400'
                }
              ]}
              numberOfLines={1}
            >
              {item.lastMessage ? (
                <>
                  {item.lastMessage.sender?.id === user?.id ? 'You: ' : ''}
                  {item.lastMessage.messageType === 'IMAGE' ? '📷 Image' : item.lastMessage.content}
                </>
              ) : (
                'No messages yet'
              )}
            </Text>
          </View>

          <View style={styles.conversationActions}>
            <Text style={{ fontSize: 20, color: colors.textSecondary }}>›</Text>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

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
    avatarPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
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
      marginRight: 8,
    },
    participantName: {
      fontSize: 16,
      fontWeight: '600',
      marginRight: 6,
      flex: 1,
    },
    typeIndicator: {
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    timestampContainer: {
      alignItems: 'flex-end',
      minWidth: 50,
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

  if (loading && !refreshing && conversations.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.emptyTitle, { marginTop: 16 }]}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>

        <View style={styles.searchContainer}>
          <Text style={{ fontSize: 20, color: colors.textSecondary, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <View style={styles.filtersContainer}>
          {renderFilterButton('all', 'All', 'forum')}
          {renderFilterButton('groups', 'Groups', 'account-group')}
          {renderFilterButton('inquiries', 'Inquiries', 'store')}
        </View>
      </View>

      {filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 60, color: colors.textSecondary, marginBottom: 16 }}>💬</Text>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </Text>
          <Text style={styles.emptyMessage}>
            {searchQuery
              ? 'Try adjusting your search or filters' : 'Start connecting with others to see your conversations here.'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.conversationsList}
          data={filteredConversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderConversationItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadConversations(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasMore && !loading) {
              loadConversations(false);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

export default ChatListScreen;
