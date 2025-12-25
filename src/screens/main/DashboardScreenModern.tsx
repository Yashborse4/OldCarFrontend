import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  TextInput,
  useWindowDimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Animated,
  Platform,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BottomNavigation } from '../../components/ui/BottomNavigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
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

interface Props {
  navigation: any;
}

// Mock data with modern approach
const QUICK_ACTIONS = [
  {
    id: 'sell',
    icon: 'pricetag',
    label: 'Sell Car',
    route: 'SellCar',
    color: '#10B981',
    gradient: ['#10B981', '#059669']
  },
  {
    id: 'buy',
    icon: 'car',
    label: 'Buy Used',
    route: 'SearchResults',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB']
  },
  {
    id: 'value',
    icon: 'stats-chart',
    label: 'Valuation',
    route: null,
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED']
  },
  {
    id: 'finance',
    icon: 'wallet',
    label: 'Finance',
    route: null,
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706']
  },
];

const CAR_LISTINGS = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=400',
    title: 'Mercedes-Benz C-Class',
    certified: true,
    verified: true,
    price: '₹28,50,000',
    originalPrice: '₹32,00,000',
    location: 'Mumbai',
    year: 2020,
    km: '25,000',
    fuel: 'Petrol',
    rating: 4.8,
    discount: '₹3.5L off',
    savings: 11,
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/170782/pexels-photo-170782.jpeg?auto=compress&w=400',
    title: 'BMW 3 Series',
    certified: false,
    verified: true,
    price: '₹35,80,000',
    originalPrice: '₹38,50,000',
    location: 'Delhi',
    year: 2019,
    km: '32,000',
    fuel: 'Diesel',
    rating: 4.6,
    discount: '₹2.7L off',
    savings: 7,
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=400',
    title: 'Audi A4',
    certified: true,
    verified: false,
    price: '₹42,20,000',
    originalPrice: '₹45,00,000',
    location: 'Bangalore',
    year: 2021,
    km: '18,000',
    fuel: 'Petrol',
    rating: 4.9,
    discount: '₹2.8L off',
    savings: 6,
  },
];

const BOTTOM_NAV_ITEMS = [
  { id: 'home', icon: 'home', label: 'Home', route: 'home' },
  { id: 'sell', icon: 'pricetag', label: 'Sell', route: 'sell' },
  { id: 'chat', icon: 'chatbubble-ellipses', label: 'Chat', route: 'chat' },
  { id: 'profile', icon: 'person', label: 'Profile', route: 'profile' },
];

const RECENTLY_VIEWED_KEY = '@carworld_recently_viewed';

const DashboardScreenModern: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { width: windowWidth } = useWindowDimensions();
  const { isAuthenticated } = useAuth();
  const { getUnreadCount } = useChat();
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('home');
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current; // Properly dispose of animated value
  const flatListRef = useRef<FlatList>(null);

  // Enhanced refresh with error handling
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      // Add any actual refresh logic here
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleBottomNavPress = useCallback((route: string, item: any) => {
    setCurrentRoute(route);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      
      const loadRecentlyViewed = async () => {
        try {
          const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
          if (!isActive) {
            return;
          }
          if (!raw) {
            setRecentlyViewedIds([]);
            setIsLoading(false);
            return;
          }
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setRecentlyViewedIds(parsed.map(x => String(x)));
          } else {
            setRecentlyViewedIds([]);
          }
        } catch (error) {
          if (__DEV__) {
            console.error('Failed to load recently viewed cars:', error);
          }
          setRecentlyViewedIds([]);
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };
      
      loadRecentlyViewed();
      
      return () => {
        isActive = false;
      };
    }, [])
  );

  // Memoized styles for performance
  const recentlyViewedCars = useMemo(
    () => CAR_LISTINGS.filter(item => recentlyViewedIds.includes(String(item.id))),
    [recentlyViewedIds]
  );

  const unreadCount = getUnreadCount();

  const bottomNavItems = useMemo(
    () =>
      BOTTOM_NAV_ITEMS.map(item =>
        item.id === 'chat'
          ? {
              ...item,
              badge: unreadCount > 0 ? unreadCount : undefined,
            }
          : item
      ),
    [unreadCount]
  );

  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background
    },
    headerContainer: {
      paddingHorizontal: getResponsiveSpacing('lg'),
      paddingTop: getResponsiveSpacing('md'),
      paddingBottom: getResponsiveSpacing('sm'),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: getResponsiveSpacing('sm'),
    },
    greeting: {
      fontSize: getResponsiveTypography('xl'),
      fontWeight: 'bold',
      color: colors.text,
      letterSpacing: -0.5,
    },
    subGreeting: {
      fontSize: getResponsiveTypography('sm'),
      color: colors.textSecondary,
      marginTop: scaleSize(2),
    },
    citySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.surface : '#F3F4F6',
      paddingHorizontal: getResponsiveSpacing('md'),
      paddingVertical: getResponsiveSpacing('xs'),
      borderRadius: getResponsiveBorderRadius('full'),
    },
    cityText: {
      fontSize: getResponsiveTypography('xs'),
      fontWeight: '600',
      color: colors.text,
      marginLeft: scaleSize(4),
      marginRight: scaleSize(4),
    },
    searchContainer: {
      marginHorizontal: getResponsiveSpacing('lg'),
      marginBottom: getResponsiveSpacing('lg'),
    },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.surface : '#FFFFFF',
      borderRadius: getResponsiveBorderRadius('xl'),
      paddingHorizontal: getResponsiveSpacing('lg'),
      paddingVertical: Platform.OS === 'ios' ? getResponsiveSpacing('md') : scaleSize(4),
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E5E7EB',

    },
    searchInput: {
      flex: 1,
      fontSize: getResponsiveTypography('md'),
      color: colors.text,
      marginLeft: getResponsiveSpacing('sm'),
      height: scaleSize(44),
    },
    scrollContent: {
      paddingBottom: hp(12), // Space for bottom navigation
    },
    sectionContainer: {
      marginBottom: getResponsiveSpacing('xxl'),
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: getResponsiveSpacing('lg'),
      marginBottom: getResponsiveSpacing('md'),
    },
    sectionTitle: {
      fontSize: getResponsiveTypography('lg'),
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewAllText: {
      fontSize: getResponsiveTypography('sm'),
      fontWeight: '600',
      color: colors.primary,
      marginRight: scaleSize(2),
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: getResponsiveSpacing('md'),
      justifyContent: 'space-between',
    },
    quickActionItem: {
      width: (wp(100) - getResponsiveSpacing('md') * 2 - getResponsiveSpacing('md') * 3) / 4,
      alignItems: 'center',
      marginBottom: getResponsiveSpacing('md'),
    },
    quickActionIcon: {
      width: scaleSize(56),
      height: scaleSize(56),
      borderRadius: getResponsiveBorderRadius('xxl'),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: getResponsiveSpacing('xs'),
    },
    quickActionLabel: {
      fontSize: getResponsiveTypography('xs'),
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    carCard: {
      width: scaleSize(280),
      marginLeft: getResponsiveSpacing('lg'),
      backgroundColor: isDark ? colors.surface : '#FFFFFF',
      borderRadius: getResponsiveBorderRadius('xxl'),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E5E7EB',
    },
    carImage: {
      width: '100%',
      height: scaleSize(160),
      backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
    },
    carContent: {
      padding: getResponsiveSpacing('md'),
    },
    carTitle: {
      fontSize: getResponsiveTypography('md'),
      fontWeight: '700',
      color: colors.text,
      marginBottom: scaleSize(4),
    },
    carPrice: {
      fontSize: getResponsiveTypography('lg'),
      fontWeight: '800',
      color: colors.primary,
      marginBottom: scaleSize(8),
    },
    carDetailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    carDetailBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6',
      paddingHorizontal: scaleSize(8),
      paddingVertical: scaleSize(4),
      borderRadius: getResponsiveBorderRadius('sm'),
      marginRight: scaleSize(8),
      marginBottom: scaleSize(4),
    },
    carDetailText: {
      fontSize: getResponsiveTypography('xs'),
      color: colors.textSecondary,
      marginLeft: scaleSize(4),
      fontWeight: '500',
    },
    bannerContainer: {
      marginHorizontal: getResponsiveSpacing('lg'),
      borderRadius: getResponsiveBorderRadius('xxl'),
      overflow: 'hidden',
      height: scaleSize(160),
      marginBottom: getResponsiveSpacing('xxl'),
    },
    bannerGradient: {
      flex: 1,
      padding: getResponsiveSpacing('xl'),
      justifyContent: 'center',
    },
    bannerTitle: {
      fontSize: getResponsiveTypography('xl'),
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: scaleSize(8),
      maxWidth: '70%',
    },
    bannerSubtitle: {
      fontSize: getResponsiveTypography('sm'),
      color: 'rgba(255,255,255,0.9)',
      marginBottom: scaleSize(16),
      maxWidth: '70%',
    },
    bannerButton: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: getResponsiveSpacing('lg'),
      paddingVertical: scaleSize(8),
      borderRadius: getResponsiveBorderRadius('lg'),
      alignSelf: 'flex-start',
    },
    bannerButtonText: {
      fontSize: getResponsiveTypography('xs'),
      fontWeight: '700',
      color: colors.primary,
    },
    sellToolsRow: {
      flexDirection: 'row',
      paddingHorizontal: getResponsiveSpacing('lg'),
      gap: getResponsiveSpacing('md'),
    },
    sellToolCard: {
      flex: 1,
      backgroundColor: isDark ? colors.surface : '#FFFFFF',
      borderRadius: getResponsiveBorderRadius('xl'),
      padding: getResponsiveSpacing('md'),
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E5E7EB',
    },
    sellToolTitle: {
      fontSize: getResponsiveTypography('sm'),
      fontWeight: '700',
      color: colors.text,
      marginBottom: scaleSize(4),
    },
    sellToolSubtitle: {
      fontSize: getResponsiveTypography('xs'),
      color: colors.textSecondary,
    },
    searchChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: getResponsiveSpacing('lg'),
      gap: getResponsiveSpacing('sm'),
    },
    searchChip: {
      paddingHorizontal: getResponsiveSpacing('md'),
      paddingVertical: scaleSize(6),
      borderRadius: getResponsiveBorderRadius('full'),
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
    },
    searchChipText: {
      fontSize: getResponsiveTypography('xs'),
      color: colors.textSecondary,
      fontWeight: '500',
    },
    chatPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: getResponsiveSpacing('md'),
      paddingVertical: scaleSize(8),
      borderRadius: getResponsiveBorderRadius('full'),
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
      marginRight: getResponsiveSpacing('sm'),
    },
    chatPillText: {
      marginLeft: scaleSize(6),
      fontSize: getResponsiveTypography('xs'),
      color: colors.text,
      fontWeight: '500',
    },
  }), [colors, isDark]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting} accessibilityLabel="Good Morning, Alex">Good Morning, Alex 👋</Text>
          <Text style={styles.subGreeting} accessibilityLabel="Let's find your dream car">Let's find your dream car</Text>
        </View>
        <TouchableOpacity style={styles.citySelector} accessibilityRole="button" accessibilityLabel={`Selected city: ${selectedCity}`}>
          <Ionicons name="location" size={scaleSize(16)} color={colors.primary} />
          <Text style={styles.cityText}>{selectedCity}</Text>
          <Ionicons name="chevron-down" size={scaleSize(16)} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TouchableOpacity
        style={styles.searchWrapper}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('SearchResults')}
        accessibilityRole="button"
        accessibilityLabel="Search for cars"
      >
        <Ionicons name="search" size={scaleSize(24)} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cars, brands, or budget..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          editable={false} // Make it act as a button to navigate
          accessibilityLabel="Search input field"
        />
        <View style={{
          backgroundColor: isDark ? '#3A3A3C' : '#F3F4F6',
          padding: scaleSize(6),
          borderRadius: scaleSize(8)
        }}
        accessibilityLabel="Search options"
        >
          <Ionicons name="options" size={scaleSize(20)} color={colors.text} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionItem}
            onPress={() => action.route && navigation.navigate(action.route)}
            disabled={!action.route}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Gradient
              colors={action.gradient}
              style={styles.quickActionIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={action.icon} size={scaleSize(24)} color="#FFFFFF" />
            </Gradient>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCarCard = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        style={styles.carCard}
        onPress={() => navigation.navigate('CarDetails', { carId: item.id })}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${item.title}`}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.carImage}
          resizeMode="cover"
          onError={(error) => console.warn('Image load error:', error)}
          accessibilityLabel={`${item.title} image`}
        />
        <Gradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={{
            position: 'absolute',
            top: scaleSize(100),
            left: 0,
            right: 0,
            height: scaleSize(60),
          }}
        />
        <View style={{ position: 'absolute', top: scaleSize(12), right: scaleSize(12) }}>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              padding: scaleSize(6),
              borderRadius: scaleSize(20)
            }}
            accessibilityRole="button"
            accessibilityLabel="Add to favorites"
          >
            <Ionicons name="heart-outline" size={scaleSize(20)} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.carContent}>
          <Text style={styles.carTitle} numberOfLines={1} accessibilityLabel={`Car title: ${item.title}`}>{item.title}</Text>
          <Text style={styles.carPrice} accessibilityLabel={`Price: ${item.price}`}>{item.price}</Text>

          <View style={styles.carDetailsRow}>
            <View style={styles.carDetailBadge} accessibilityRole="text">
              <Ionicons name="speedometer" size={scaleSize(12)} color={colors.textSecondary} />
              <Text style={styles.carDetailText} accessibilityLabel={`Kilometers: ${item.km}`}>{item.km}</Text>
            </View>
            <View style={styles.carDetailBadge} accessibilityRole="text">
              <Ionicons name="gas-station" size={scaleSize(12)} color={colors.textSecondary} />
              <Text style={styles.carDetailText} accessibilityLabel={`Fuel type: ${item.fuel}`}>{item.fuel}</Text>
            </View>
            <View style={styles.carDetailBadge} accessibilityRole="text">
              <Ionicons name="calendar-outline" size={scaleSize(12)} color={colors.textSecondary} />
              <Text style={styles.carDetailText} accessibilityLabel={`Year: ${item.year}`}>{item.year}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [navigation, styles, colors],
  );

  const renderFeaturedCars = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle} accessibilityLabel="Featured Cars">Featured Cars</Text>
        <TouchableOpacity style={styles.viewAllButton} accessibilityRole="button" accessibilityLabel="View all featured cars">
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={scaleSize(16)} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={CAR_LISTINGS}
        renderItem={renderCarCard}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: getResponsiveSpacing('lg') }}
        snapToInterval={scaleSize(280) + getResponsiveSpacing('lg')}
        decelerationRate="fast"
        accessibilityLabel="Featured cars list"
      />
    </View>
  );

  const renderPromoBanner = () => (
    <TouchableOpacity style={styles.bannerContainer} activeOpacity={0.95} accessibilityRole="button" accessibilityLabel="Sell your car in 29 minutes">
      <Gradient
        colors={[colors.primary, colors.secondary || '#FF6B00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerGradient}
      >
        <Text style={styles.bannerTitle} accessibilityLabel="Sell Your Car in 29 Minutes">Sell Your Car in 29 Minutes</Text>
        <Text style={styles.bannerSubtitle} accessibilityLabel="Get the best price and instant payment. Free home inspection.">Get the best price and instant payment. Free home inspection.</Text>
        <View style={styles.bannerButton} accessibilityRole="button" accessibilityLabel="Get estimate">
          <Text style={styles.bannerButtonText}>Get Estimate</Text>
        </View>

        <Image
          source={{ uri: 'https://pngimg.com/uploads/car/car_PNG14423.png' }}
          style={{
            position: 'absolute',
            right: scaleSize(-20),
            bottom: scaleSize(10),
            width: scaleSize(180),
            height: scaleSize(100),
            opacity: 0.9
          }}
          resizeMode="contain"
          onError={(error) => console.warn('Banner image load error:', error)}
          accessibilityLabel="Car illustration"
        />
      </Gradient>
    </TouchableOpacity>
  );

  const renderSellTop = () => (
    <>
      {renderPromoBanner()}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sell smarter</Text>
        </View>
        <View style={styles.sellToolsRow}>
          <View style={styles.sellToolCard}>
            <Text style={styles.sellToolTitle}>Instant valuation</Text>
            <Text style={styles.sellToolSubtitle}>Get AI-powered price suggestions for your car.</Text>
          </View>
          <View style={styles.sellToolCard}>
            <Text style={styles.sellToolTitle}>Boost visibility</Text>
            <Text style={styles.sellToolSubtitle}>Highlight your listing to reach more buyers.</Text>
          </View>
        </View>
      </View>
    </>
  );

  const renderSearchTop = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick filters</Text>
      </View>
      <View style={styles.searchChipsRow}>
        <View style={styles.searchChip}>
          <Text style={styles.searchChipText}>Under ₹20L</Text>
        </View>
        <View style={styles.searchChip}>
          <Text style={styles.searchChipText}>SUVs</Text>
        </View>
        <View style={styles.searchChip}>
          <Text style={styles.searchChipText}>Low mileage</Text>
        </View>
        <View style={styles.searchChip}>
          <Text style={styles.searchChipText}>Certified cars</Text>
        </View>
      </View>
    </View>
  );

  const renderChatTop = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent chats</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('ChatList')}
        >
          <Text style={styles.viewAllText}>Open inbox</Text>
          <Ionicons name="arrow-forward" size={scaleSize(16)} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: getResponsiveSpacing('lg') }}
      >
        <View style={styles.chatPill}>
          <Ionicons name="person-circle" size={scaleSize(20)} color={colors.primary} />
          <Text style={styles.chatPillText}>New buyers near you</Text>
        </View>
        <View style={styles.chatPill}>
          <Ionicons name="flash" size={scaleSize(18)} color={colors.primary} />
          <Text style={styles.chatPillText}>Hot leads</Text>
        </View>
        <View style={styles.chatPill}>
          <Ionicons name="notifications" size={scaleSize(18)} color={colors.primary} />
          <Text style={styles.chatPillText}>Unread messages</Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderProfileTop = () => {
    const isGuest = !isAuthenticated;
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your profile</Text>
        </View>
        <View style={styles.sellToolsRow}>
          <View style={styles.sellToolCard}>
            <Text style={styles.sellToolTitle}>{isGuest ? 'Guest mode' : 'Account'}</Text>
            <Text style={styles.sellToolSubtitle}>
              {isGuest
                ? 'You are browsing without signing in.'
                : 'Manage your details, preferences, and theme.'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.sellToolCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate(isGuest ? 'Login' : 'Profile')}
          >
            <Text style={styles.sellToolTitle}>{isGuest ? 'Sign in' : 'Open full profile'}</Text>
            <Text style={styles.sellToolSubtitle}>
              {isGuest
                ? 'Login to manage profile, chats, and saved cars.'
                : 'View listings, saved cars, and more.'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          accessibilityLabel="Dashboard content"
        >
          {renderHeader()}
          {currentRoute === 'home' && (
            <>
              {renderSearchBar()}
              {renderSearchTop()}
              {renderQuickActions()}
              {renderPromoBanner()}
            </>
          )}
          {currentRoute === 'sell' && renderSellTop()}
          {currentRoute === 'chat' && renderChatTop()}
          {currentRoute === 'profile' && renderProfileTop()}
          {renderFeaturedCars()}

          {recentlyViewedCars.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle} accessibilityLabel="Recently viewed cars">Recently Viewed</Text>
                <TouchableOpacity style={styles.viewAllButton} accessibilityRole="button" accessibilityLabel="View all recently viewed cars">
                  <Text style={styles.viewAllText}>View All</Text>
                  <Ionicons name="arrow-forward" size={scaleSize(16)} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={recentlyViewedCars}
                renderItem={renderCarCard}
                keyExtractor={item => `recent-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: getResponsiveSpacing('lg') }}
                snapToInterval={scaleSize(280) + getResponsiveSpacing('lg')}
                decelerationRate="fast"
                accessibilityLabel="Recently viewed cars list"
              />
            </View>
          )}
        </ScrollView>
      )}

      <BottomNavigation
        items={bottomNavItems}
        activeRoute={currentRoute}
        onPress={handleBottomNavPress}
        accessibilityLabel="Navigation menu"
      />
    </SafeAreaView>
  );
};

export default DashboardScreenModern;
