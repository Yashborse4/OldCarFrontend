import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  FlatList,
  RefreshControl,
  Image,
  Linking,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import {
  scaleSize,
  getResponsiveSpacing,
  getResponsiveTypography,
  getResponsiveBorderRadius,
} from '../../utils/responsiveEnhanced';
import { chatApi, ChatRoomDto } from '../../services/ChatApi';
import Snackbar, { SnackbarType } from '../../components/common/Snackbar';
import { useNavigation } from '@react-navigation/native';
import { authService, User } from '../../services/auth';

// --- Type Definitions ---
interface DealerInquiriesScreenProps { }

interface State {
  inquiries: ChatRoomDto[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  page: number;
  searchQuery: string;
  selectedFilter: string;
  error: { visible: boolean; message: string; type: SnackbarType };
  modalVisible: boolean;
  selectedInquiry: ChatRoomDto | null;
  loadingInquiryDetails: boolean; // For fetching fresh details
  user: User | null;
  checkingAuth: boolean;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_LOADING_MORE'; payload: boolean }
  | { type: 'SET_INQUIRIES'; payload: { inquiries: ChatRoomDto[]; hasMore: boolean; page: number; isLoadMore: boolean } }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'SET_ERROR'; payload: { message: string; type: SnackbarType } }
  | { type: 'DISMISS_ERROR' }
  | { type: 'OPEN_MODAL_START' }
  | { type: 'OPEN_MODAL_SUCCESS'; payload: ChatRoomDto }
  | { type: 'CLOSE_MODAL' }
  | { type: 'UPDATE_INQUIRY'; payload: ChatRoomDto }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'AUTH_CHECK_COMPLETE' };

const initialState: State = {
  inquiries: [],
  loading: true,
  refreshing: false,
  loadingMore: false,
  hasMore: true,
  page: 0,
  searchQuery: '',
  selectedFilter: 'ALL',
  error: { visible: false, message: '', type: 'error' },
  modalVisible: false,
  selectedInquiry: null,
  loadingInquiryDetails: false,
  user: null,
  checkingAuth: true,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_REFRESHING':
      return { ...state, refreshing: action.payload };
    case 'SET_LOADING_MORE':
      return { ...state, loadingMore: action.payload };
    case 'SET_INQUIRIES':
      return {
        ...state,
        inquiries: action.payload.isLoadMore ? [...state.inquiries, ...action.payload.inquiries] : action.payload.inquiries,
        hasMore: action.payload.hasMore,
        page: action.payload.page,
        loading: false,
        refreshing: false,
        loadingMore: false,
      };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTER':
      return { ...state, selectedFilter: action.payload };
    case 'SET_ERROR':
      return { ...state, error: { visible: true, message: action.payload.message, type: action.payload.type } };
    case 'DISMISS_ERROR':
      return { ...state, error: { ...state.error, visible: false } };
    case 'OPEN_MODAL_START':
      return { ...state, modalVisible: true, loadingInquiryDetails: true, selectedInquiry: null };
    case 'OPEN_MODAL_SUCCESS':
      return { ...state, loadingInquiryDetails: false, selectedInquiry: action.payload };
    case 'CLOSE_MODAL':
      return { ...state, modalVisible: false, selectedInquiry: null };
    case 'UPDATE_INQUIRY':
      return {
        ...state,
        inquiries: state.inquiries.map(i => i.id === action.payload.id ? action.payload : i),
        selectedInquiry: action.payload,
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'AUTH_CHECK_COMPLETE':
      return { ...state, checkingAuth: false };
    default:
      return state;
  }
};

const FILTER_OPTIONS = [
  { key: 'ALL', label: 'All' },
  { key: 'NEW', label: 'New' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'INTERESTED', label: 'Interested' },
  { key: 'SOLD', label: 'Sold' },
];

const PAGE_SIZE = 50; // Use 50 as default per approved plan

// --- Sub-Components ---
const InquiryCard = React.memo(({ item, onPress, themeColors, isDark }: { item: ChatRoomDto; onPress: (item: ChatRoomDto) => void; themeColors: any; isDark: boolean }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'NEW': return themeColors.info || '#3B82F6';
      case 'CONTACTED': return themeColors.warning || '#F59E0B';
      case 'INTERESTED': return themeColors.success || '#10B981';
      case 'NOT_INTERESTED': return themeColors.error || '#EF4444';
      case 'SOLD': return themeColors.primary || '#8B5CF6';
      default: return themeColors.textSecondary;
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const statusColor = getStatusColor(item.status);

  return (
    <TouchableOpacity
      style={[styles.inquiryCard, { backgroundColor: isDark ? themeColors.surface : '#FFFFFF', borderColor: themeColors.border }]}
      onPress={() => onPress(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatarContainer, { backgroundColor: themeColors.primary }]}>
            <Text style={styles.avatarText}>{item.buyerName ? item.buyerName[0] : '?'}</Text>
          </View>
          <View>
            <Text style={[styles.buyerName, { color: themeColors.text }]}>{item.buyerName || 'Unknown Buyer'}</Text>
            <Text style={[styles.timestamp, { color: themeColors.textSecondary }]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status ? item.status.toUpperCase() : 'NEW'}
          </Text>
        </View>
      </View>

      <View style={[styles.carInfoContainer, { backgroundColor: isDark ? themeColors.background : '#F3F4F6' }]}>
        <Image
          source={{ uri: item.carInfo?.imageUrl || 'https://via.placeholder.com/150' }}
          style={styles.carThumbnail}
        />
        <View style={styles.carDetails}>
          <Text style={[styles.carTitle, { color: themeColors.text }]} numberOfLines={1}>{item.carInfo?.title || 'Unknown Car'}</Text>
          <Text style={[styles.carPrice, { color: themeColors.primary }]}>{item.carInfo?.price ? `₹${item.carInfo.price.toLocaleString()}` : 'N/A'}</Text>
        </View>
      </View>

      <Text style={[styles.messagePreview, { color: themeColors.textSecondary }]} numberOfLines={2}>
        "{item.lastMessage?.content || 'No messages yet'}"
      </Text>
    </TouchableOpacity>
  );
});

const DealerInquiriesScreen: React.FC<DealerInquiriesScreenProps> = () => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();

  const [state, dispatch] = useReducer(reducer, initialState);

  // --- Auth Check ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        dispatch({ type: 'SET_USER', payload: user });
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        dispatch({ type: 'AUTH_CHECK_COMPLETE' });
      }
    };
    checkAuth();
  }, []);

  // --- Search Debounce ---
  useEffect(() => {
    // Only fetch if authorized
    if (!state.checkingAuth && state.user?.role === 'dealer' && state.user?.verifiedDealer) {
      const timer = setTimeout(() => {
        // Map ALL to undefined/null for backend
        const filterParam = state.selectedFilter === 'ALL' ? undefined : state.selectedFilter;
        // Call api directly to avoid stale fetchData closure
        dispatch({ type: 'SET_LOADING', payload: true });
        chatApi.getDealerInquiries(filterParam, 0, PAGE_SIZE, state.searchQuery)
          .then(data => {
            const newInquiries = data?.content || [];
            dispatch({
              type: 'SET_INQUIRIES',
              payload: {
                inquiries: newInquiries,
                hasMore: newInquiries.length === PAGE_SIZE && !data?.last,
                page: 0,
                isLoadMore: false,
              }
            });
          })
          .catch(error => {
            dispatch({
              type: 'SET_ERROR',
              payload: { message: error?.message || 'Failed to search', type: 'error' }
            });
            dispatch({ type: 'SET_LOADING', payload: false });
          });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.searchQuery, state.selectedFilter, state.checkingAuth, state.user]);

  const fetchData = useCallback(async (pageNum: number, isRefresh: boolean, query: string) => {
    if (!isRefresh && (!state.hasMore || state.loadingMore)) return;

    try {
      if (isRefresh && pageNum === 0) {
        if (!state.refreshing && state.inquiries.length > 0) dispatch({ type: 'SET_REFRESHING', payload: true });
        else if (state.inquiries.length === 0) dispatch({ type: 'SET_LOADING', payload: true });
      } else {
        dispatch({ type: 'SET_LOADING_MORE', payload: true });
      }

      const filterParam = state.selectedFilter === 'ALL' ? undefined : state.selectedFilter;
      const data = await chatApi.getDealerInquiries(filterParam, pageNum, PAGE_SIZE, query);

      const newInquiries = data?.content || [];
      const hasMore = newInquiries.length === PAGE_SIZE && !data?.last;

      dispatch({
        type: 'SET_INQUIRIES',
        payload: {
          inquiries: newInquiries,
          hasMore,
          page: pageNum,
          isLoadMore: !isRefresh,
        }
      });

    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: { message: error?.message || 'Failed to load inquiries. Please check your connection.', type: 'error' }
      });
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_REFRESHING', payload: false });
      dispatch({ type: 'SET_LOADING_MORE', payload: false });
    }
  }, [state.selectedFilter, state.hasMore, state.loadingMore, state.refreshing, state.inquiries.length]);

  const handleRefresh = useCallback(() => {
    if (state.user?.role === 'dealer' && state.user?.verifiedDealer) {
      fetchData(0, true, state.searchQuery);
    }
  }, [fetchData, state.searchQuery, state.user]);

  const handleLoadMore = useCallback(() => {
    if (!state.loadingMore && !state.loading && state.hasMore && state.user?.role === 'dealer') {
      fetchData(state.page + 1, false, state.searchQuery);
    }
  }, [state.loadingMore, state.loading, state.hasMore, state.page, state.searchQuery, fetchData, state.user]);

  const handleUpdateStatus = async (status: string) => {
    if (!state.selectedInquiry) return;
    try {
      const updatedChat = await chatApi.updateInquiryStatus(state.selectedInquiry.id, status);
      dispatch({ type: 'UPDATE_INQUIRY', payload: updatedChat });
      dispatch({
        type: 'SET_ERROR',
        payload: { message: 'Status updated successfully', type: 'success' }
      });
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: { message: error?.message || 'Failed to update status', type: 'error' }
      });
    }
  };

  const handleCardPress = useCallback(async (item: ChatRoomDto) => {
    dispatch({ type: 'OPEN_MODAL_START' });
    try {
      const details = await chatApi.getChat(item.id);
      dispatch({ type: 'OPEN_MODAL_SUCCESS', payload: details });
    } catch (error) {
      dispatch({ type: 'CLOSE_MODAL' });
      dispatch({
        type: 'SET_ERROR',
        payload: { message: 'Failed to load details', type: 'error' }
      });
    }
  }, []);

  const handleCall = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone?: string) => {
    if (phone) Linking.openURL(`whatsapp://send?phone=${phone}`);
  };

  const renderItem: ListRenderItem<ChatRoomDto> = useCallback(({ item }) => (
    <InquiryCard
      item={item}
      onPress={handleCardPress}
      themeColors={colors}
      isDark={isDark}
    />
  ), [colors, isDark, handleCardPress]);

  const renderFooter = () => {
    if (!state.loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const getModalStatusColor = (status?: string) => {
    switch (status) {
      case 'NEW': return colors.info || '#3B82F6';
      case 'CONTACTED': return colors.warning || '#F59E0B';
      case 'INTERESTED': return colors.success || '#10B981';
      case 'NOT_INTERESTED': return colors.error || '#EF4444';
      case 'SOLD': return colors.primary || '#8B5CF6';
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'NEW': return 'flash-outline';
      case 'CONTACTED': return 'chatbubbles-outline';
      case 'INTERESTED': return 'heart-outline';
      case 'NOT_INTERESTED': return 'close-circle-outline';
      case 'SOLD': return 'checkmark-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  if (state.checkingAuth) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Role Guard
  if (!state.user || state.user.role !== 'dealer' || !state.user.verifiedDealer) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="lock-closed-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.accessDeniedText, { color: colors.text }]}>Access Restricted</Text>
        <Text style={[styles.accessDeniedSubText, { color: colors.textSecondary }]}>
          {!state.user ? "Please login to view inquiries" :
            state.user.role !== 'dealer' ? "This section is for dealers only" :
              "Your dealer account is pending verification"}
        </Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Lead Inquiries</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.searchSection, { backgroundColor: isDark ? colors.background : '#F9FAFB', borderBottomColor: colors.border }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search buyer or car"
            placeholderTextColor={colors.textSecondary}
            value={state.searchQuery}
            onChangeText={(text) => dispatch({ type: 'SET_SEARCH_QUERY', payload: text })}
            returnKeyType="search"
          />
        </View>

        <View style={styles.filterContainer}>
          <FlatList
            data={FILTER_OPTIONS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: state.selectedFilter === item.key ? colors.primary : (isDark ? colors.surface : '#FFFFFF'),
                    borderColor: state.selectedFilter === item.key ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => dispatch({ type: 'SET_FILTER', payload: item.key })}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: state.selectedFilter === item.key ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: state.selectedFilter === item.key ? '600' : '400',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      <FlatList
        data={state.inquiries}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={state.refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {state.error.visible ? 'Something went wrong' : 'No inquiries found'}
            </Text>
            {state.error.visible && (
              <TouchableOpacity
                style={[styles.actionButton, { marginTop: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8 }]}
                onPress={handleRefresh}
              >
                <Text style={[styles.actionText, { color: colors.text }]}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />

      <Snackbar
        visible={state.error.visible}
        message={state.error.message}
        type={state.error.type}
        onDismiss={() => dispatch({ type: 'DISMISS_ERROR' })}
      />

      {/* Detail Modal */}
      <Modal
        visible={state.modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => dispatch({ type: 'CLOSE_MODAL' })}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Inquiry Details</Text>
            <TouchableOpacity onPress={() => dispatch({ type: 'CLOSE_MODAL' })} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {state.loadingInquiryDetails || !state.selectedInquiry ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.modalContentWrapper}>

              {/* Status Section */}
              <View style={[styles.statusSection, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
                <View style={[styles.largeStatusBadge, { backgroundColor: getModalStatusColor(state.selectedInquiry.status) + '20' }]}>
                  <Ionicons name={getStatusIcon(state.selectedInquiry.status)} size={20} color={getModalStatusColor(state.selectedInquiry.status)} />
                  <Text style={[styles.largeStatusText, { color: getModalStatusColor(state.selectedInquiry.status) }]}>
                    {state.selectedInquiry.status ? state.selectedInquiry.status.toUpperCase() : 'NEW'}
                  </Text>
                </View>
                <Text style={[styles.leadScore, { color: colors.textSecondary }]}>
                  Lead Score: <Text style={{ color: (state.selectedInquiry.leadScore || 0) > 70 ? colors.success : colors.warning, fontWeight: '700' }}>{state.selectedInquiry.leadScore || 0}/100</Text>
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, paddingHorizontal: getResponsiveSpacing('lg') }}>
                {state.selectedInquiry.status !== 'CONTACTED' && (
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: colors.warning, flex: 1 }]}
                    onPress={() => handleUpdateStatus('CONTACTED')}
                  >
                    <Text style={styles.modalActionText}>Mark Contacted</Text>
                  </TouchableOpacity>
                )}
                {state.selectedInquiry.status !== 'SOLD' && (
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: colors.primary, flex: 1 }]}
                    onPress={() => handleUpdateStatus('SOLD')}
                  >
                    <Text style={styles.modalActionText}>Mark Sold</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', margin: getResponsiveSpacing('lg') }]}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Buyer Information</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                  <Text style={[styles.infoText, { color: colors.text }]}>{state.selectedInquiry.buyerName || 'Unknown'}</Text>
                </View>
                <TouchableOpacity onPress={() => handleCall(state.selectedInquiry?.buyerPhone)} style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
                  <Text style={[styles.infoText, { color: colors.primary }]}>{state.selectedInquiry.buyerPhone || 'No Phone'}</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Actions at bottom */}
              <View style={styles.modalBottomActions}>
                <TouchableOpacity
                  style={[styles.modalActionButton, { backgroundColor: colors.success, flex: 1 }]}
                  onPress={() => handleCall(state.selectedInquiry?.buyerPhone)}
                >
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                  <Text style={styles.modalActionText}>Call Buyer</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderBottomWidth: 1,
  },
  backButton: { padding: scaleSize(4) },
  headerTitle: { fontSize: getResponsiveTypography('lg'), fontWeight: '700' },
  headerSpacer: { width: scaleSize(24), height: scaleSize(24) },
  searchSection: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: scaleSize(6),
    borderRadius: getResponsiveBorderRadius('full'),
    borderWidth: 1,
    marginBottom: getResponsiveSpacing('md'),
  },
  searchInput: {
    flex: 1,
    marginLeft: getResponsiveSpacing('sm'),
    fontSize: getResponsiveTypography('sm'),
  },
  filterContainer: { paddingBottom: getResponsiveSpacing('xs') },
  filterContent: { gap: getResponsiveSpacing('sm') },
  filterChip: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: scaleSize(6),
    borderRadius: getResponsiveBorderRadius('full'),
    borderWidth: 1,
  },
  filterText: { fontSize: getResponsiveTypography('sm') },
  listContent: {
    padding: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('md'),
  },
  inquiryCard: {
    borderRadius: getResponsiveBorderRadius('xl'),
    padding: getResponsiveSpacing('md'),
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: getResponsiveSpacing('md'),
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarContainer: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: getResponsiveBorderRadius('full'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getResponsiveSpacing('sm'),
  },
  avatarText: { color: '#FFFFFF', fontSize: getResponsiveTypography('lg'), fontWeight: '700' },
  buyerName: { fontSize: getResponsiveTypography('md'), fontWeight: '600' },
  timestamp: { fontSize: getResponsiveTypography('xs'), marginTop: scaleSize(2) },
  statusBadge: {
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(4),
    borderRadius: getResponsiveBorderRadius('sm'),
  },
  statusText: { fontSize: getResponsiveTypography('xs'), fontWeight: '700' },
  carInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing('sm'),
    borderRadius: getResponsiveBorderRadius('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  carThumbnail: {
    width: scaleSize(48),
    height: scaleSize(36),
    borderRadius: getResponsiveBorderRadius('sm'),
    marginRight: getResponsiveSpacing('sm'),
  },
  carDetails: { flex: 1 },
  carTitle: { fontSize: getResponsiveTypography('sm'), fontWeight: '600' },
  carPrice: { fontSize: getResponsiveTypography('xs'), fontWeight: '700', marginTop: scaleSize(2) },
  messagePreview: { fontSize: getResponsiveTypography('sm'), fontStyle: 'italic' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: scaleSize(100),
  },
  emptyText: { marginTop: getResponsiveSpacing('md'), fontSize: getResponsiveTypography('md') },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
    padding: scaleSize(8),
  },
  actionText: { fontSize: getResponsiveTypography('sm'), fontWeight: '500' },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getResponsiveSpacing('md'),
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: getResponsiveTypography('lg'), fontWeight: '700' },
  closeButton: { padding: scaleSize(4) },
  modalContentWrapper: { paddingVertical: getResponsiveSpacing('lg') },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('lg'),
    marginHorizontal: getResponsiveSpacing('lg'),
  },
  largeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(8),
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: scaleSize(6),
    borderRadius: getResponsiveBorderRadius('full'),
  },
  largeStatusText: { fontSize: getResponsiveTypography('sm'), fontWeight: '700' },
  leadScore: { fontSize: getResponsiveTypography('sm'), fontWeight: '500' },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(8),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('lg'),
  },
  modalActionText: { color: '#FFFFFF', fontSize: getResponsiveTypography('md'), fontWeight: '600' },
  sectionCard: {
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('xl'),
  },
  sectionHeader: {
    fontSize: getResponsiveTypography('md'),
    fontWeight: '700',
    marginBottom: getResponsiveSpacing('md'),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
    marginBottom: getResponsiveSpacing('sm'),
  },
  infoText: { fontSize: getResponsiveTypography('md') },
  modalBottomActions: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginTop: getResponsiveSpacing('lg')
  },
  accessDeniedText: {
    marginTop: getResponsiveSpacing('md'),
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '700',
  },
  accessDeniedSubText: {
    marginVertical: getResponsiveSpacing('md'),
    fontSize: getResponsiveTypography('md'),
    textAlign: 'center',
    paddingHorizontal: getResponsiveSpacing('xl'),
  },
  button: {
    paddingHorizontal: getResponsiveSpacing('xl'),
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: getResponsiveBorderRadius('lg'),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: getResponsiveTypography('md'),
    fontWeight: '600',
  }
});

export default DealerInquiriesScreen;
