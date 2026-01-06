import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Image,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BottomNavigation } from '../../components/ui/BottomNavigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Gradient } from '../../components/ui/Gradient';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { carApi, Vehicle } from '../../services/CarApi';
import { AnimatedPressable, useStaggerAnimation, Skeleton, hapticFeedback } from '../../components/ui/MicroInteractionsModern';
import {
  scaleSize,
  getResponsiveSpacing,
  getResponsiveTypography,
  getResponsiveBorderRadius,
  hp
} from '../../utils/responsiveEnhanced';

interface Props {
  navigation: any;
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'suv', label: 'SUV', icon: 'car-sport' },
  { id: 'sedan', label: 'Sedan', icon: 'car' },
  { id: 'hatchback', label: 'Hatch', icon: 'car-outline' },
  { id: 'luxury', label: 'Luxury', icon: 'diamond' },
];

const BOTTOM_NAV_ITEMS = [
  { id: 'home', icon: 'home', label: 'Home', route: 'home' },
  { id: 'search', icon: 'search', label: 'Search', route: 'search' },
  { id: 'sell', icon: 'add-circle', label: 'Sell', route: 'sell' },
  { id: 'chat', icon: 'chatbubble-ellipses', label: 'Chat', route: 'chat' },
  { id: 'profile', icon: 'person', label: 'Profile', route: 'profile' },
];

const RECENTLY_VIEWED_KEY = '@carworld_recently_viewed';

const DashboardScreenModern: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { isAuthenticated, user } = useAuth();
  const { getUnreadCount, state: chatState } = useChat();

  const [refreshing, setRefreshing] = useState(false);
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [featuredCars, setFeaturedCars] = useState<Vehicle[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  // Animations
  const contentAnims = useStaggerAnimation(new Array(5).fill(0), 100);
  // 0: Header, 1: Categories, 2: Promo, 3: Featured, 4: Recent

  const unreadCount = getUnreadCount();

  useEffect(() => {
    if (isAuthenticated && user && user.emailVerified === false) {
      navigation.replace('EmailVerificationScreen');
    }
  }, [isAuthenticated, user, navigation]);

  const fetchFeaturedCars = useCallback(async () => {
    try {
      setLoadingCars(true);
      const response = await carApi.searchVehicles({ featured: true, size: 10, page: 0 });
      setFeaturedCars(response.content);
    } catch (error) {
      console.error('Error fetching featured cars:', error);
      setFeaturedCars([]);
    } finally {
      setLoadingCars(false);
    }
  }, []);

  useEffect(() => { fetchFeaturedCars(); }, [fetchFeaturedCars]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadRecentlyViewed = async () => {
        try {
          const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
          if (!isActive) return;
          if (raw) setRecentlyViewedIds(JSON.parse(raw).map((x: any) => String(x)));
        } catch (error) { console.error(error); }
      };
      // Simulate initial loading time for smooth entry
      setTimeout(() => { if (isActive) setIsLoading(false); }, 500);
      loadRecentlyViewed();
      return () => { isActive = false; };
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    hapticFeedback.light();
    await fetchFeaturedCars();
    setRefreshing(false);
  }, [fetchFeaturedCars]);

  const handleNavPress = useCallback((route: string) => {
    hapticFeedback.light();
    if (route === 'sell') { navigation.navigate('SellCar'); return; }
    if (route === 'search') { navigation.navigate('SearchResults', { filters: {} }); return; }
    setCurrentTab(route);
  }, [navigation]);

  const navItems = useMemo(() => BOTTOM_NAV_ITEMS.map(item =>
    item.id === 'chat' ? { ...item, badge: unreadCount > 0 ? unreadCount : undefined } : item
  ), [unreadCount]);

  const recentlyViewedCars = useMemo(() => featuredCars.filter(item => recentlyViewedIds.includes(String(item.id))), [recentlyViewedIds, featuredCars]);

  // Styles
  const styles = useMemo(() => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: hp(12) },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerContainer: { paddingHorizontal: getResponsiveSpacing('lg'), paddingTop: getResponsiveSpacing('md') },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    greeting: { fontSize: getResponsiveTypography('xl'), fontWeight: '700', letterSpacing: -0.5, color: colors.text },
    subGreeting: { fontSize: getResponsiveTypography('sm'), color: colors.textSecondary },
    iconBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? colors.surface : '#F3F4F6' },

    searchBar: {
      flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16,
      backgroundColor: isDark ? colors.surface : '#F3F4F6', gap: 12
    },

    categoriesContainer: { marginTop: 24 },
    categoryChip: {
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
      borderRadius: 100, marginRight: 8, gap: 6
    },

    promoBanner: { marginHorizontal: 20, marginTop: 24, borderRadius: 24, overflow: 'hidden', height: scaleSize(150), elevation: 5 },
    promoGradient: { flex: 1, padding: 20, flexDirection: 'row' },
    promoContent: { flex: 1, zIndex: 1 },
    promoTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 4 },
    promoSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginBottom: 16 },
    promoBtn: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', alignItems: 'center', gap: 4 },
    promoImg: { position: 'absolute', right: -20, bottom: 0, width: 180, height: 110, resizeMode: 'contain' },

    section: { marginTop: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16, alignItems: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    carCard: { width: scaleSize(220), borderRadius: 20, overflow: 'hidden', marginRight: 16, backgroundColor: isDark ? colors.surface : '#FFF', elevation: 2 },
    carImg: { width: '100%', height: 140, backgroundColor: colors.border },
    carInfo: { padding: 12 },
    carPrice: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 4 },

    // Skeleton
    skeletonCard: { width: scaleSize(220), height: 230, borderRadius: 20, marginRight: 16 },

    // Tabs
    tabContent: { flex: 1, paddingTop: 20 },
    profileHeader: { padding: 20, alignItems: 'center' },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: isDark ? colors.surface : '#FFF', marginHorizontal: 20, marginBottom: 12, borderRadius: 16 },
  }), [colors, isDark]);

  const fadeUp = (index: number) => ({
    opacity: contentAnims[index],
    transform: [{ translateY: contentAnims[index].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
  });

  const renderCarCard = ({ item }: { item: Vehicle }) => (
    <AnimatedPressable
      animationType="scale"
      onPress={() => navigation.navigate('CarDetails', { carId: item.id })}
      style={styles.carCard}
    >
      <View>
        <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300' }} style={styles.carImg} />
        <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 6 }}>
          <Ionicons name="heart-outline" size={18} color="#FF453A" />
        </View>
        {item.featured && (
          <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#10B981', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>FEATURED</Text>
          </View>
        )}
      </View>
      <View style={styles.carInfo}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }} numberOfLines={1}>{item.make} {item.model}</Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>{item.year} • {item.mileage?.toLocaleString()} km</Text>
        <Text style={styles.carPrice}>₹{item.price?.toLocaleString()}</Text>
      </View>
    </AnimatedPressable>
  );

  const renderHomeContent = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Header */}
      <Animated.View style={[styles.headerContainer, fadeUp(0)]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{isAuthenticated ? `Hi, ${user?.username}` : 'Welcome'} 👋</Text>
            <Text style={styles.subGreeting}>Find your dream car today</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {unreadCount > 0 && <View style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF453A' }} />}
          </TouchableOpacity>
        </View>

        <AnimatedPressable animationType="bounce" onPress={() => navigation.navigate('SearchResults', { filters: {} })}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, flex: 1 }}>Search cars, brands...</Text>
            <View style={{ backgroundColor: colors.primary, padding: 6, borderRadius: 8 }}>
              <Ionicons name="options-outline" size={16} color="#FFF" />
            </View>
          </View>
        </AnimatedPressable>
      </Animated.View>

      {/* Categories */}
      <Animated.View style={[styles.categoriesContainer, fadeUp(1)]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, { backgroundColor: selectedCategory === cat.id ? colors.primary : (isDark ? colors.surface : '#F3F4F6') }]}
              onPress={() => { setSelectedCategory(cat.id); hapticFeedback.light(); }}
            >
              <Ionicons name={cat.icon as any} size={18} color={selectedCategory === cat.id ? '#FFF' : colors.text} />
              <Text style={{ color: selectedCategory === cat.id ? '#FFF' : colors.text, fontWeight: '600' }}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Promo */}
      <Animated.View style={[styles.promoBanner, fadeUp(2)]}>
        <AnimatedPressable onPress={() => navigation.navigate('SellCar')} style={{ flex: 1 }}>
          <Gradient preset="cool" style={styles.promoGradient}>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Sell Your Car</Text>
              <Text style={styles.promoSubtitle}>Get instant valuation in minutes</Text>
              <View style={styles.promoBtn}>
                <Text style={{ color: '#3B82F6', fontWeight: '700', fontSize: 12 }}>Check Value</Text>
                <Ionicons name="arrow-forward" size={14} color="#3B82F6" />
              </View>
            </View>
            <Image source={{ uri: 'https://pngimg.com/uploads/car/car_PNG14423.png' }} style={styles.promoImg} />
          </Gradient>
        </AnimatedPressable>
      </Animated.View>

      {/* Featured */}
      <Animated.View style={[styles.section, fadeUp(3)]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Cars</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SearchResults', { filters: { featured: true } })}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>See All</Text>
          </TouchableOpacity>
        </View>

        {loadingCars ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} style={styles.skeletonCard} />)}
          </ScrollView>
        ) : (
          <FlatList
            data={featuredCars}
            renderItem={renderCarCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        )}
      </Animated.View>

      {/* Recent */}
      {recentlyViewedCars.length > 0 && (
        <Animated.View style={[styles.section, fadeUp(4)]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Viewed</Text>
          </View>
          <FlatList
            data={recentlyViewedCars}
            renderItem={renderCarCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </Animated.View>
      )}
    </ScrollView>
  );

  // Simplified Chat/Profile tabs for brevity - can be expanded if needed
  const renderProfileTab = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}><Text style={{ color: '#FFF', fontSize: 32, fontWeight: '700' }}>{user?.username?.[0] || 'G'}</Text></View>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>{user?.username || 'Guest'}</Text>
      </View>
      {[
        { icon: 'heart-outline', label: 'Saved Cars', route: 'SavedCars' },
        { icon: 'car-outline', label: 'My Listings', route: 'MyGarage' },
        { icon: 'settings-outline', label: 'Settings', route: 'Settings' }
      ].map((item, i) => (
        <TouchableOpacity key={i} style={styles.menuItem} onPress={() => navigation.navigate(item.route)}>
          <Ionicons name={item.icon as any} size={24} color={colors.primary} />
          <Text style={{ flex: 1, marginLeft: 16, fontSize: 16, color: colors.text, fontWeight: '500' }}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (isLoading) return <View style={[styles.safeArea, styles.loadingContainer]}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {currentTab === 'home' && renderHomeContent()}
      {currentTab === 'chat' && <View style={styles.tabContent}><Text style={{ textAlign: 'center', color: colors.text }}>Chat Module Placeholder</Text></View>}
      {currentTab === 'profile' && renderProfileTab()}

      <BottomNavigation items={navItems} activeRoute={currentTab} onPress={handleNavPress} />
    </SafeAreaView>
  );
};

export default DashboardScreenModern;
