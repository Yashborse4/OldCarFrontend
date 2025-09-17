import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  TextInput,
  FlatList,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Animated,
} from 'react-native';
import { useTheme } from '../../theme';
import { spacing, borderRadius, typography, shadows } from '../../design-system/tokens';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BottomNavigation } from '../../components/ui/BottomNavigation';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

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
  const { colors: themeColors, isDark } = useTheme();
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [currentRoute, setCurrentRoute] = useState('Dashboard');

  // Enhanced refresh with haptic feedback
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
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
      backgroundColor: themeColors.background,
    },
    headerContainer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    greeting: {
      fontSize: typography.fontSizes['3xl'],
      fontWeight: typography.fontWeights.bold,
      color: themeColors.text,
      letterSpacing: typography.letterSpacing.tight,
    },
    subGreeting: {
      fontSize: typography.fontSizes.base,
      color: themeColors.textSecondary,
      marginTop: spacing.xs,
    },
    citySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    cityText: {
      fontSize: typography.fontSizes.sm,
      fontWeight: typography.fontWeights.semibold,
      color: themeColors.text,
      marginLeft: spacing.xs,
      marginRight: spacing.xs,
    },
    searchContainer: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      ...shadows.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: typography.fontSizes.base,
      color: themeColors.text,
      marginLeft: spacing.sm,
      paddingVertical: 0,
    },
    scrollContent: {
      paddingBottom: 100, // Space for bottom navigation
    },
    sectionContainer: {
      marginBottom: spacing['2xl'],
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.fontSizes.xl,
      fontWeight: typography.fontWeights.bold,
      color: themeColors.text,
    },
    viewAllButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    viewAllText: {
      fontSize: typography.fontSizes.sm,
      fontWeight: typography.fontWeights.semibold,
      color: themeColors.primary,
    },
    quickActionsGrid: {
      paddingHorizontal: spacing.lg,
    },
    quickActionCard: {
      alignItems: 'center',
      justifyContent: 'center',
      width: (width - spacing.lg * 2 - spacing.md * 3) / 4,
      aspectRatio: 1,
      borderRadius: borderRadius.xl,
      ...shadows.md,
      marginRight: spacing.md,
    },
    quickActionIcon: {
      marginBottom: spacing.sm,
    },
    quickActionLabel: {
      fontSize: typography.fontSizes.xs,
      fontWeight: typography.fontWeights.medium,
      color: themeColors.white,
      textAlign: 'center',
    },
    carCard: {
      width: width * 0.8,
      marginRight: spacing.lg,
      borderRadius: borderRadius['2xl'],
      backgroundColor: themeColors.surface,
      overflow: 'hidden',
      ...shadows.lg,
    },
    carImageContainer: {
      height: width * 0.5,
      position: 'relative',
    },
    carImage: {
      width: '100%',
      height: '100%',
      borderTopLeftRadius: borderRadius['2xl'],
      borderTopRightRadius: borderRadius['2xl'],
    },
    carBadgesContainer: {
      position: 'absolute',
      top: spacing.md,
      left: spacing.md,
      right: spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    badgeRow: {
      flexDirection: 'row',
    },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      marginRight: spacing.xs,
    },
    certifiedBadge: {
      backgroundColor: '#10B981',
    },
    verifiedBadge: {
      backgroundColor: themeColors.primary,
    },
    badgeText: {
      fontSize: typography.fontSizes.xs,
      fontWeight: typography.fontWeights.bold,
      color: themeColors.white,
    },
    discountBadge: {
      backgroundColor: '#EF4444',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    discountText: {
      fontSize: typography.fontSizes.xs,
      fontWeight: typography.fontWeights.bold,
      color: themeColors.white,
    },
    favoriteButton: {
      position: 'absolute',
      bottom: spacing.md,
      right: spacing.md,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: borderRadius.full,
      padding: spacing.sm,
    },
    carContent: {
      padding: spacing.lg,
    },
    carTitle: {
      fontSize: typography.fontSizes.lg,
      fontWeight: typography.fontWeights.bold,
      color: themeColors.text,
      marginBottom: spacing.xs,
    },
    carSpecs: {
      fontSize: typography.fontSizes.sm,
      color: themeColors.textSecondary,
      marginBottom: spacing.md,
    },
    carFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    priceSection: {
      flex: 1,
    },
    carPrice: {
      fontSize: typography.fontSizes.xl,
      fontWeight: typography.fontWeights.bold,
      color: themeColors.primary,
    },
    originalPrice: {
      fontSize: typography.fontSizes.sm,
      color: themeColors.textSecondary,
      textDecorationLine: 'line-through',
      marginTop: spacing.xs / 2,
    },
    savingsText: {
      fontSize: typography.fontSizes.sm,
      color: '#10B981',
      fontWeight: typography.fontWeights.semibold,
      marginTop: spacing.xs / 2,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    ratingText: {
      fontSize: typography.fontSizes.sm,
      color: themeColors.textSecondary,
      marginLeft: spacing.xs,
    },
  }), [colors, isDark]);

  // Animated header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const renderQuickAction = useCallback((item: typeof QUICK_ACTIONS[0], index: number) => (
    <Animatable.View
      key={item.id}
      animation="fadeInUp"
      delay={index * 100}
      style={styles.quickActionCard}
    >
      <TouchableOpacity
        onPress={() => {
          if (item.route) {
            navigation.navigate(item.route);
          } else {
            // Handle coming soon
            console.log('Coming soon:', item.label);
          }
        }}
        style={{ flex: 1, width: '100%' }}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialIcons 
            name={item.icon as any} 
            size={28} 
            color={themeColors.white} 
            style={styles.quickActionIcon}
          />
          <Text style={styles.quickActionLabel}>{item.label}</Text>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  ), [navigation, styles, colors]);

  const renderCarCard = useCallback(({ item, index }: { item: typeof CAR_LISTINGS[0], index: number }) => (
    <Animatable.View
      animation="fadeInRight"
      delay={index * 150}
      style={styles.carCard}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('CarDetails', { carId: item.id })}
        activeOpacity={0.95}
      >
        <View style={styles.carImageContainer}>
          <Animated.Image 
            source={{ uri: item.image }} 
            style={[styles.carImage]}
            resizeMode="cover"
          />
          
          <View style={styles.carBadgesContainer}>
            <View style={styles.badgeRow}>
              {item.certified && (
                <View style={[styles.badge, styles.certifiedBadge]}>
                  <Text style={styles.badgeText}>CERTIFIED</Text>
                </View>
              )}
              {item.verified && (
                <View style={[styles.badge, styles.verifiedBadge]}>
                  <Text style={styles.badgeText}>VERIFIED</Text>
                </View>
              )}
            </View>
            
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.favoriteButton}>
            <MaterialIcons name="favorite-border" size={20} color={themeColors.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.carContent}>
          <Text style={styles.carTitle}>{item.title}</Text>
          <Text style={styles.carSpecs}>
            {item.year} • {item.km} km • {item.fuel} • {item.location}
          </Text>
          
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating} rating</Text>
          </View>
          
          <View style={styles.carFooter}>
            <View style={styles.priceSection}>
              <Text style={styles.carPrice}>{item.price}</Text>
              <Text style={styles.originalPrice}>{item.originalPrice}</Text>
              <Text style={styles.savingsText}>{item.savings}% savings</Text>
            </View>
            
            <Button
              title="Details"
              variant="primary"
              size="sm"
              radius="md"
              onPress={() => navigation.navigate('CarDetails', { carId: item.id })}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  ), [navigation, styles, colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      
      {/* Header */}
      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.subGreeting}>Find your perfect car today</Text>
          </View>
          
          <TouchableOpacity style={styles.citySelector}>
            <MaterialIcons name="location-on" size={16} color={themeColors.primary} />
            <Text style={styles.cityText}>{selectedCity}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <MaterialIcons name="search" size={20} color={themeColors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for cars, brands, models..."
            placeholderTextColor={themeColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            horizontal
            data={QUICK_ACTIONS}
            renderItem={({ item, index }) => renderQuickAction(item, index)}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsGrid}
          />
        </View>

        {/* Featured Cars */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Cars</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            horizontal
            data={CAR_LISTINGS}
            renderItem={renderCarCard}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: spacing.lg }}
          />
        </View>
      </Animated.ScrollView>

      {/* Modern Bottom Navigation */}
      <BottomNavigation
        items={BOTTOM_NAV_ITEMS}
        activeRoute={currentRoute}
        onPress={handleBottomNavPress}
      />
    </SafeAreaView>
  );
};

export default DashboardScreenModern;


