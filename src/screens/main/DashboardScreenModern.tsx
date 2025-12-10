import React, { useState, useCallback, useMemo } from 'react';
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
} from 'react-native';

import { BottomNavigation } from '../../components/ui/BottomNavigation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Gradient } from '../../components/ui/Gradient';
import { useTheme } from '../../theme';
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
    icon: 'sell',
    label: 'Sell Car',
    route: 'SellCar',
    color: '#10B981',
    gradient: ['#10B981', '#059669']
  },
  {
    id: 'buy',
    icon: 'directions-car',
    label: 'Buy Used',
    route: 'SearchResults',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB']
  },
  {
    id: 'value',
    icon: 'assessment',
    label: 'Valuation',
    route: null,
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED']
  },
  {
    id: 'finance',
    icon: 'account-balance',
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

// Bottom navigation items
const BOTTOM_NAV_ITEMS = [
  { id: 'home', icon: 'home', label: 'Home', route: 'Dashboard' },
  { id: 'sell', icon: 'sell', label: 'Sell', route: 'SellCar' },
  { id: 'search', icon: 'search', label: 'Search', route: 'SearchResults' },
  { id: 'chat', icon: 'chat', label: 'Chat', route: 'ChatList', badge: 3 },
  { id: 'profile', icon: 'person', label: 'Profile', route: 'Profile' },
];

const DashboardScreenModern: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { width: windowWidth } = useWindowDimensions();
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [currentRoute, setCurrentRoute] = useState('Dashboard');

  // Enhanced refresh with haptic feedback
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const refreshData = async () => {
      try {
        // Simulate API call
        await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      } catch (error) {
        console.error('Refresh error:', error);
      } finally {
        setRefreshing(false);
      }
    };
    refreshData();
  }, []);

  const handleBottomNavPress = useCallback((route: string, item: any) => {
    setCurrentRoute(route);
    if (route !== 'Dashboard') {
      navigation.navigate(route);
    }
  }, [navigation]);

  // Memoized styles for performance
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
  }), [colors, isDark]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Good Morning, Alex 👋</Text>
          <Text style={styles.subGreeting}>Let's find your dream car</Text>
        </View>
        <TouchableOpacity style={styles.citySelector}>
          <MaterialIcons name="location-on" size={scaleSize(16)} color={colors.primary} />
          <Text style={styles.cityText}>{selectedCity}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={scaleSize(16)} color={colors.textSecondary} />
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
      >
        <MaterialIcons name="search" size={scaleSize(24)} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cars, brands, or budget..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          editable={false} // Make it act as a button to navigate
        />
        <View style={{
          backgroundColor: isDark ? '#3A3A3C' : '#F3F4F6',
          padding: scaleSize(6),
          borderRadius: scaleSize(8)
        }}>
          <MaterialIcons name="tune" size={scaleSize(20)} color={colors.text} />
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
          >
            <Gradient
              colors={action.gradient}
              style={styles.quickActionIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name={action.icon} size={scaleSize(24)} color="#FFFFFF" />
            </Gradient>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCarCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.carCard}
      onPress={() => navigation.navigate('CarDetails', { carId: item.id })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.carImage}
        resizeMode="cover"
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
        >
          <MaterialIcons name="favorite-border" size={scaleSize(20)} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.carContent}>
        <Text style={styles.carTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.carPrice}>{item.price}</Text>

        <View style={styles.carDetailsRow}>
          <View style={styles.carDetailBadge}>
            <MaterialIcons name="speed" size={scaleSize(12)} color={colors.textSecondary} />
            <Text style={styles.carDetailText}>{item.km}</Text>
          </View>
          <View style={styles.carDetailBadge}>
            <MaterialIcons name="local-gas-station" size={scaleSize(12)} color={colors.textSecondary} />
            <Text style={styles.carDetailText}>{item.fuel}</Text>
          </View>
          <View style={styles.carDetailBadge}>
            <MaterialIcons name="calendar-today" size={scaleSize(12)} color={colors.textSecondary} />
            <Text style={styles.carDetailText}>{item.year}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedCars = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Cars</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <MaterialIcons name="arrow-forward" size={scaleSize(16)} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={CAR_LISTINGS}
        renderItem={renderCarCard}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: getResponsiveSpacing('lg') }}
        snapToInterval={scaleSize(280) + getResponsiveSpacing('lg')}
        decelerationRate="fast"
      />
    </View>
  );

  const renderPromoBanner = () => (
    <TouchableOpacity style={styles.bannerContainer} activeOpacity={0.95}>
      <Gradient
        colors={[colors.primary, colors.secondary || '#FF6B00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerGradient}
      >
        <Text style={styles.bannerTitle}>Sell Your Car in 29 Minutes</Text>
        <Text style={styles.bannerSubtitle}>Get the best price and instant payment. Free home inspection.</Text>
        <View style={styles.bannerButton}>
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
        />
      </Gradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {renderHeader()}
        {renderSearchBar()}
        {renderQuickActions()}
        {renderPromoBanner()}
        {renderFeaturedCars()}

        {/* Recently Viewed Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Viewed</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <MaterialIcons name="arrow-forward" size={scaleSize(16)} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={[...CAR_LISTINGS].reverse()}
            renderItem={renderCarCard}
            keyExtractor={item => `recent-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: getResponsiveSpacing('lg') }}
            snapToInterval={scaleSize(280) + getResponsiveSpacing('lg')}
            decelerationRate="fast"
          />
        </View>
      </ScrollView>

      <BottomNavigation
        items={BOTTOM_NAV_ITEMS}
        activeRoute={currentRoute}
        onPress={handleBottomNavPress}
      />
    </SafeAreaView>
  );
};

export default DashboardScreenModern;
