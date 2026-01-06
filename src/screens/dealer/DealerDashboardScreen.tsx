import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { BottomNavigation } from '../../components/ui/BottomNavigation';
import { Gradient } from '../../components/ui/Gradient';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import {
  scaleSize,
  getResponsiveSpacing,
  getResponsiveTypography,
  getResponsiveBorderRadius,
  wp,
  hp
} from '../../utils/responsiveEnhanced';
import { carApi, DealerDashboardResponse, Vehicle } from '../../services/CarApi';

interface Props {
  navigation: any;
}

interface StatItem {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  color: string;
  gradient: string[];
}

const DEALER_NAV_ITEMS = [
  { id: 'home', icon: 'home', label: 'Home', route: 'home' },
  { id: 'inventory', icon: 'car-sport', label: 'Inventory', route: 'inventory' },
  { id: 'add', icon: 'add-circle', label: 'Add Car', route: 'add' },
  { id: 'chat', icon: 'chatbubble-ellipses', label: 'Chat', route: 'chat' },
  { id: 'profile', icon: 'person', label: 'Profile', route: 'profile' },
];

const DealerDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { user, isLoading: authLoading, hasAnyRole } = useAuth();
  const { getUnreadCount, state: chatState } = useChat();

  const isDealerOrAdmin = hasAnyRole(['DEALER', 'ADMIN']);

  const [currentTab, setCurrentTab] = useState('home');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dashboard data
  const [stats, setStats] = useState<StatItem[]>([
    { id: 'total', title: 'Total Cars', value: 0, icon: 'car', color: '#667eea', gradient: ['#667eea', '#764ba2'] },
    { id: 'active', title: 'Active', value: 0, icon: 'checkmark-circle', color: '#10B981', gradient: ['#10B981', '#059669'] },
    { id: 'views', title: 'Total Views', value: 0, icon: 'eye', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] },
    { id: 'inquiries', title: 'Inquiries', value: 0, icon: 'chatbubble', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
  ]);
  const [carListings, setCarListings] = useState<Vehicle[]>([]);

  const unreadCount = getUnreadCount();

  const navItems = useMemo(() =>
    DEALER_NAV_ITEMS.map(item =>
      item.id === 'chat' ? { ...item, badge: unreadCount > 0 ? unreadCount : undefined } : item
    ),
    [unreadCount]
  );

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [dashboard, myCars] = await Promise.all([
        carApi.getDealerDashboard(),
        carApi.getMyCarListings(0, 20),
      ]);

      setStats([
        { id: 'total', title: 'Total Cars', value: dashboard.totalCarsAdded, icon: 'car', color: '#667eea', gradient: ['#667eea', '#764ba2'] },
        { id: 'active', title: 'Active', value: dashboard.activeCars, icon: 'checkmark-circle', color: '#10B981', gradient: ['#10B981', '#059669'] },
        { id: 'views', title: 'Total Views', value: dashboard.totalViews.toLocaleString(), icon: 'eye', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] },
        { id: 'inquiries', title: 'Inquiries', value: dashboard.contactRequestsReceived, icon: 'chatbubble', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
      ]);
      setCarListings(myCars.content);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard. Pull to refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleNavPress = useCallback((route: string, item: any) => {
    if (route === 'add') {
      navigation.navigate('DealerAddCar');
      return;
    }
    setCurrentTab(route);
  }, [navigation]);

  const handleCarPress = (car: Vehicle) => {
    navigation.navigate('CarDetails', { carId: car.id });
  };

  // ============= RENDER FUNCTIONS =============

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View>
        <Text style={[styles.greeting, { color: colors.text }]}>
          Hello, {user?.username || 'Dealer'} 👋
        </Text>
        <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
          Manage your inventory
        </Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={scaleSize(22)} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={scaleSize(22)} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVerificationBanner = () => {
    if (!user || !isDealerOrAdmin) return null;

    // Already verified
    if (user.verifiedDealer) {
      return (
        <View style={[styles.verificationBanner, styles.verifiedBanner]}>
          <Ionicons name="shield-checkmark" size={scaleSize(20)} color="#10B981" />
          <Text style={[styles.verificationText, { color: '#10B981' }]}>Verified Dealer</Text>
        </View>
      );
    }

    // Check dealerStatus for different states
    // @ts-ignore - dealerStatus may not be in type yet
    const dealerStatus = user.dealerStatus;

    if (dealerStatus === 'UNVERIFIED' || !dealerStatus) {
      // Show "Get Verified" CTA
      return (
        <TouchableOpacity
          style={[styles.verificationBanner, styles.unverifiedBanner]}
          onPress={() => navigation.navigate('DealerVerification')}
          activeOpacity={0.8}
        >
          <Ionicons name="shield-outline" size={scaleSize(24)} color="#3B82F6" />
          <View style={styles.verificationContent}>
            <Text style={[styles.verificationText, { color: '#3B82F6' }]}>Get Verified</Text>
            <Text style={[styles.verificationSubtext, { color: colors.textSecondary }]}>
              Increase your visibility and trust
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={scaleSize(20)} color="#3B82F6" />
        </TouchableOpacity>
      );
    }

    // Pending verification
    return (
      <TouchableOpacity
        style={[styles.verificationBanner, styles.pendingBanner]}
        onPress={() => navigation.navigate('DealerVerification')}
        activeOpacity={0.8}
      >
        <Ionicons name="time-outline" size={scaleSize(20)} color="#F59E0B" />
        <View style={styles.verificationContent}>
          <Text style={[styles.verificationText, { color: '#F59E0B' }]}>Verification Pending</Text>
          <Text style={[styles.verificationSubtext, { color: colors.textSecondary }]}>
            Your listings are hidden until verified
          </Text>
        </View>
        <Text style={[styles.viewStatusLink, { color: '#F59E0B' }]}>View Status</Text>
      </TouchableOpacity>
    );
  };

  const renderStatCard = (stat: StatItem, index: number) => (
    <TouchableOpacity
      key={stat.id}
      style={[styles.statCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
      activeOpacity={0.8}
    >
      <Gradient
        colors={stat.gradient}
        style={styles.statIconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={stat.icon as any} size={scaleSize(20)} color="#FFFFFF" />
      </Gradient>
      <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{stat.title}</Text>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('DealerAddCar')}
        >
          <Ionicons name="add-circle-outline" size={scaleSize(24)} color="#FFFFFF" />
          <Text style={styles.quickActionText}>Add Car</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#10B981' }]}
          onPress={() => navigation.navigate('DealerInquiries')}
        >
          <Ionicons name="chatbubbles-outline" size={scaleSize(24)} color="#FFFFFF" />
          <Text style={styles.quickActionText}>Inquiries</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#8B5CF6' }]}
          onPress={() => navigation.navigate('VehicleAnalytics')}
        >
          <Ionicons name="analytics-outline" size={scaleSize(24)} color="#FFFFFF" />
          <Text style={styles.quickActionText}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentListings = () => (
    <View style={styles.recentListingsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Listings</Text>
        <TouchableOpacity onPress={() => setCurrentTab('inventory')}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      {carListings.slice(0, 3).map((car) => (
        <TouchableOpacity
          key={car.id}
          style={[styles.recentCarItem, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
          onPress={() => handleCarPress(car)}
        >
          <Image
            source={{ uri: car.images?.[0] || 'https://via.placeholder.com/80x60.png?text=No+Image' }}
            style={styles.recentCarImage}
          />
          <View style={styles.recentCarInfo}>
            <Text style={[styles.recentCarTitle, { color: colors.text }]} numberOfLines={1}>
              {car.make} {car.model}
            </Text>
            <Text style={[styles.recentCarPrice, { color: colors.primary }]}>
              ₹{car.price?.toLocaleString() || 'N/A'}
            </Text>
            <View style={styles.recentCarStats}>
              <View style={styles.statBadge}>
                <Ionicons name="eye-outline" size={12} color={colors.textSecondary} />
                <Text style={[styles.statBadgeText, { color: colors.textSecondary }]}>
                  {car.views || 0}
                </Text>
              </View>
              <View style={styles.statBadge}>
                <Ionicons name="chatbubble-outline" size={12} color={colors.textSecondary} />
                <Text style={[styles.statBadgeText, { color: colors.textSecondary }]}>
                  {car.inquiries || 0}
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={scaleSize(20)} color={colors.textSecondary} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHomeTab = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      {renderHeader()}
      {renderVerificationBanner()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading dashboard...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={scaleSize(48)} color={colors.error || '#FF6B6B'} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => renderStatCard(stat, index))}
          </View>
          {renderQuickActions()}
          {carListings.length > 0 && renderRecentListings()}
        </>
      )}
    </ScrollView>
  );

  const renderInventoryTab = () => {
    const filteredCars = carListings.filter(car =>
      `${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <View style={styles.inventoryContainer}>
        <View style={styles.inventoryHeader}>
          <Text style={[styles.inventoryTitle, { color: colors.text }]}>My Inventory</Text>
          <Text style={[styles.inventoryCount, { color: colors.textSecondary }]}>
            {carListings.length} vehicles
          </Text>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.surface : '#F3F4F6' }]}>
          <Ionicons name="search-outline" size={scaleSize(20)} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search your cars..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredCars}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.inventoryCarCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
              onPress={() => handleCarPress(item)}
            >
              <Image
                source={{ uri: item.images?.[0] || 'https://via.placeholder.com/120x90.png?text=No+Image' }}
                style={styles.inventoryCarImage}
              />
              <View style={styles.inventoryCarInfo}>
                <Text style={[styles.inventoryCarTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.make} {item.model} ({item.year})
                </Text>
                <Text style={[styles.inventoryCarPrice, { color: colors.primary }]}>
                  ₹{item.price?.toLocaleString() || 'N/A'}
                </Text>
                <View style={styles.inventoryCarMeta}>
                  <View style={[styles.statusBadge, { backgroundColor: item.status === 'Available' ? '#D1FAE5' : '#FEE2E2' }]}>
                    <Text style={[styles.statusBadgeText, { color: item.status === 'Available' ? '#059669' : '#DC2626' }]}>
                      {item.status || 'Active'}
                    </Text>
                  </View>
                  <Text style={[styles.inventoryCarViews, { color: colors.textSecondary }]}>
                    {item.views || 0} views
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditCar', { carId: item.id })}
              >
                <Ionicons name="create-outline" size={scaleSize(20)} color={colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.inventoryList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={scaleSize(60)} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No cars found</Text>
            </View>
          }
        />
      </View>
    );
  };

  const renderChatTab = () => {
    const conversations = chatState.conversations;

    return (
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatTitle, { color: colors.text }]}>Messages</Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {conversations.length === 0 ? (
          <View style={styles.emptyChatContainer}>
            <Ionicons name="chatbubbles-outline" size={scaleSize(60)} color={colors.textSecondary} />
            <Text style={[styles.emptyChatText, { color: colors.textSecondary }]}>No messages yet</Text>
            <Text style={[styles.emptyChatSubtext, { color: colors.textSecondary }]}>
              When buyers inquire about your cars, you'll see messages here
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.chatItem, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
                onPress={() => navigation.navigate('ChatConversation', { conversationId: item.id })}
              >
                <View style={styles.chatAvatar}>
                  <Ionicons name="person-circle" size={scaleSize(48)} color={colors.primary} />
                </View>
                <View style={styles.chatContent}>
                  <Text style={[styles.chatName, { color: colors.text }]}>{item.participant.name}</Text>
                  <Text style={[styles.chatLastMessage, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.lastMessage?.text || 'Start a conversation'}
                  </Text>
                </View>
                {item.unreadCount > 0 && (
                  <View style={[styles.chatUnreadBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.chatUnreadText}>{item.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.chatList}
          />
        )}
      </View>
    );
  };

  const renderProfileTab = () => (
    <ScrollView contentContainerStyle={styles.profileContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.profileAvatarText}>
            {user?.username?.[0]?.toUpperCase() || 'D'}
          </Text>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>
          {user?.username || 'Dealer'}
        </Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
        {user?.verifiedDealer && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.verifiedBadgeText}>Verified Dealer</Text>
          </View>
        )}
      </View>

      <View style={styles.profileMenuSection}>
        {[
          { icon: 'person-outline', label: 'Edit Profile', route: 'Profile' },
          { icon: 'business-outline', label: 'Dealer Profile', route: 'DealerProfile' },
          { icon: 'analytics-outline', label: 'Analytics', route: 'VehicleAnalytics' },
          { icon: 'notifications-outline', label: 'Notifications', route: 'Notifications' },
          { icon: 'settings-outline', label: 'Settings', route: 'Settings' },
        ].map((item, index) => (
          <TouchableOpacity
            key={item.route}
            style={[styles.profileMenuItem, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
            onPress={() => navigation.navigate(item.route)}
          >
            <Ionicons name={item.icon as any} size={scaleSize(24)} color={colors.primary} />
            <Text style={[styles.profileMenuText, { color: colors.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={scaleSize(20)} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // ============= LOADING & ACCESS STATES =============

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading account...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isDealerOrAdmin) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed-outline" size={scaleSize(48)} color={colors.error || '#FF6B6B'} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            You do not have access to the dealer dashboard.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============= MAIN RENDER =============

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {currentTab === 'home' && renderHomeTab()}
      {currentTab === 'inventory' && renderInventoryTab()}
      {currentTab === 'chat' && renderChatTab()}
      {currentTab === 'profile' && renderProfileTab()}

      <BottomNavigation
        items={navItems}
        activeRoute={currentTab}
        onPress={handleNavPress}
        accessibilityLabel="Dealer navigation"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(12),
  },

  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingTop: getResponsiveSpacing('md'),
    paddingBottom: getResponsiveSpacing('md'),
  },
  greeting: {
    fontSize: getResponsiveTypography('xl'),
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: getResponsiveTypography('sm'),
    marginTop: scaleSize(2),
  },
  headerActions: {
    flexDirection: 'row',
    gap: scaleSize(8),
  },
  headerButton: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: getResponsiveBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Verification Banner
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: getResponsiveBorderRadius('lg'),
  },
  verifiedBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pendingBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  unverifiedBanner: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  verificationContent: {
    marginLeft: getResponsiveSpacing('sm'),
    flex: 1,
  },
  verificationText: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '600',
    marginLeft: getResponsiveSpacing('xs'),
  },
  verificationSubtext: {
    fontSize: getResponsiveTypography('xs'),
    marginTop: scaleSize(2),
  },
  viewStatusLink: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '600',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: getResponsiveSpacing('md'),
    gap: getResponsiveSpacing('sm'),
  },
  statCard: {
    width: (wp(100) - getResponsiveSpacing('md') * 2 - getResponsiveSpacing('sm')) / 2,
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('xl'),
    alignItems: 'center',
  },
  statIconContainer: {
    width: scaleSize(44),
    height: scaleSize(44),
    borderRadius: getResponsiveBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  statValue: {
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '700',
  },
  statTitle: {
    fontSize: getResponsiveTypography('xs'),
    marginTop: scaleSize(2),
  },

  // Quick Actions
  quickActionsContainer: {
    marginTop: getResponsiveSpacing('lg'),
    paddingHorizontal: getResponsiveSpacing('lg'),
  },
  sectionTitle: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '700',
    marginBottom: getResponsiveSpacing('md'),
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: getResponsiveSpacing('sm'),
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('lg'),
    gap: scaleSize(6),
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '600',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  viewAllText: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '600',
  },

  // Recent Listings
  recentListingsContainer: {
    marginTop: getResponsiveSpacing('xl'),
    paddingHorizontal: getResponsiveSpacing('lg'),
  },
  recentCarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing('sm'),
    borderRadius: getResponsiveBorderRadius('lg'),
    marginBottom: getResponsiveSpacing('sm'),
  },
  recentCarImage: {
    width: scaleSize(80),
    height: scaleSize(60),
    borderRadius: getResponsiveBorderRadius('md'),
  },
  recentCarInfo: {
    flex: 1,
    marginLeft: getResponsiveSpacing('md'),
  },
  recentCarTitle: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '600',
  },
  recentCarPrice: {
    fontSize: getResponsiveTypography('md'),
    fontWeight: '700',
    marginTop: scaleSize(2),
  },
  recentCarStats: {
    flexDirection: 'row',
    marginTop: scaleSize(4),
    gap: getResponsiveSpacing('sm'),
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
  },
  statBadgeText: {
    fontSize: getResponsiveTypography('xs'),
  },

  // Inventory Tab
  inventoryContainer: {
    flex: 1,
    paddingTop: getResponsiveSpacing('md'),
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  inventoryTitle: {
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '700',
  },
  inventoryCount: {
    fontSize: getResponsiveTypography('sm'),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: getResponsiveSpacing('lg'),
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: getResponsiveBorderRadius('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  searchInput: {
    flex: 1,
    marginLeft: getResponsiveSpacing('sm'),
    fontSize: getResponsiveTypography('md'),
  },
  inventoryList: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingBottom: hp(12),
  },
  inventoryCarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing('sm'),
    borderRadius: getResponsiveBorderRadius('lg'),
    marginBottom: getResponsiveSpacing('sm'),
  },
  inventoryCarImage: {
    width: scaleSize(100),
    height: scaleSize(75),
    borderRadius: getResponsiveBorderRadius('md'),
  },
  inventoryCarInfo: {
    flex: 1,
    marginLeft: getResponsiveSpacing('md'),
  },
  inventoryCarTitle: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '600',
  },
  inventoryCarPrice: {
    fontSize: getResponsiveTypography('md'),
    fontWeight: '700',
    marginTop: scaleSize(2),
  },
  inventoryCarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaleSize(6),
    gap: getResponsiveSpacing('sm'),
  },
  statusBadge: {
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(2),
    borderRadius: getResponsiveBorderRadius('sm'),
  },
  statusBadgeText: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '600',
  },
  inventoryCarViews: {
    fontSize: getResponsiveTypography('xs'),
  },
  editButton: {
    padding: getResponsiveSpacing('sm'),
  },

  // Chat Tab
  chatContainer: {
    flex: 1,
    paddingTop: getResponsiveSpacing('md'),
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  chatTitle: {
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '700',
  },
  unreadBadge: {
    marginLeft: getResponsiveSpacing('sm'),
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(2),
    borderRadius: getResponsiveBorderRadius('full'),
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '700',
  },
  chatList: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingBottom: hp(12),
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('lg'),
    marginBottom: getResponsiveSpacing('sm'),
  },
  chatAvatar: {
    marginRight: getResponsiveSpacing('md'),
  },
  chatContent: {
    flex: 1,
  },
  chatName: {
    fontSize: getResponsiveTypography('md'),
    fontWeight: '600',
  },
  chatLastMessage: {
    fontSize: getResponsiveTypography('sm'),
    marginTop: scaleSize(2),
  },
  chatUnreadBadge: {
    width: scaleSize(24),
    height: scaleSize(24),
    borderRadius: getResponsiveBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatUnreadText: {
    color: '#FFFFFF',
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '700',
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('xl'),
  },
  emptyChatText: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '600',
    marginTop: getResponsiveSpacing('md'),
  },
  emptyChatSubtext: {
    fontSize: getResponsiveTypography('sm'),
    textAlign: 'center',
    marginTop: getResponsiveSpacing('xs'),
  },

  // Profile Tab
  profileContainer: {
    paddingBottom: hp(12),
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing('xl'),
  },
  profileAvatar: {
    width: scaleSize(80),
    height: scaleSize(80),
    borderRadius: getResponsiveBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: getResponsiveTypography('xxl'),
    fontWeight: '700',
  },
  profileName: {
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: getResponsiveTypography('sm'),
    marginTop: scaleSize(4),
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getResponsiveSpacing('sm'),
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: scaleSize(4),
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: getResponsiveBorderRadius('full'),
  },
  verifiedBadgeText: {
    color: '#10B981',
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '600',
    marginLeft: scaleSize(4),
  },
  profileMenuSection: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('sm'),
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('lg'),
  },
  profileMenuText: {
    flex: 1,
    fontSize: getResponsiveTypography('md'),
    fontWeight: '500',
    marginLeft: getResponsiveSpacing('md'),
  },

  // Common States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  loadingText: {
    marginTop: getResponsiveSpacing('md'),
    fontSize: getResponsiveTypography('sm'),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('xl'),
  },
  errorText: {
    marginTop: getResponsiveSpacing('md'),
    fontSize: getResponsiveTypography('sm'),
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  emptyText: {
    marginTop: getResponsiveSpacing('md'),
    fontSize: getResponsiveTypography('md'),
  },
});

export default DealerDashboardScreen;
