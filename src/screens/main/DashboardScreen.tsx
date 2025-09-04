import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity, 
  StatusBar,
  TextInput,
  FlatList,
  Modal,
  Dimensions,
  SafeAreaView,
  Image,
  ScrollView,
  Platform,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../theme';
import { Feather } from '@react-native-vector-icons/feather';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';
import { withOverlayNetworkHandling } from '../../components/withNetworkHandling';
import { NetworkStatusIndicator } from '../../components/NetworkError';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

// Mock auth hook
const useAuth = () => {
  return { authorized: true };
};

// Mock functions
const clearAuthData = async () => {
  console.log('Clearing auth data');
};

const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
  Alert.alert(title, message);
};

const CITIES = ['Mumbai', 'Nashik', 'Pune', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'];

const BANNERS = [
  {
    id: 1,
    title: 'Sell Your Car Instantly',
    desc: 'Get the best price, quick & easy!',
    btn: 'Sell Now',
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800',
    gradient: ['#FF6B6B', '#FF8E53'],
  },
  {
    id: 2,
    title: 'Find Your Dream Car',
    desc: 'Browse thousands of used cars',
    btn: 'Browse Cars',
    image: 'https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=800',
    gradient: ['#4ECDC4', '#44A08D'],
  },
  {
    id: 3,
    title: 'Car Valuation',
    desc: "Know your car's worth in seconds",
    btn: 'Check Value',
    image: 'https://images.pexels.com/photos/70912/pexels-photo-70912.jpeg?auto=compress&cs=tinysrgb&w=800',
    gradient: ['#667eea', '#764ba2'],
  },
];

const QUICK_CARDS = [
  { icon: 'car', label: 'Sell Car', route: 'SellCar', color: '#FF6B6B' },
  { icon: 'search1', label: 'Buy Used', route: 'Dashboard', color: '#4ECDC4' },
  { icon: 'calculator', label: 'Valuation', route: null, color: '#45B7D1' },
  { icon: 'creditcard', label: 'Finance', route: null, color: '#96CEB4' },
];

const CAR_LISTINGS = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=400',
    title: 'Maruti Swift VXI',
    certified: true,
    verified: true,
    price: 'â‚¹4,50,000',
    originalPrice: 'â‚¹5,20,000',
    location: 'Nashik',
    year: 2018,
    km: '45,000',
    fuel: 'Petrol',
    rating: 4.5,
    discount: 'â‚¹70K off',
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/170782/pexels-photo-170782.jpeg?auto=compress&w=400',
    title: 'Hyundai i20 Sportz',
    certified: false,
    verified: true,
    price: 'â‚¹5,80,000',
    originalPrice: 'â‚¹6,50,000',
    location: 'Mumbai',
    year: 2019,
    km: '32,000',
    fuel: 'Diesel',
    rating: 4.2,
    discount: 'â‚¹70K off',
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=400',
    title: 'Honda City ZX',
    certified: true,
    verified: false,
    price: 'â‚¹7,20,000',
    originalPrice: 'â‚¹8,00,000',
    location: 'Pune',
    year: 2017,
    km: '60,000',
    fuel: 'Petrol',
    rating: 4.7,
    discount: 'â‚¹80K off',
  },
];

const BOTTOM_TABS = [
  { icon: 'home', label: 'HOME', route: 'Dashboard' },
  { icon: 'pluscircleo', label: 'SELL', route: 'SellCar' },
  { icon: 'appstore-o', label: 'USED', route: null },
  { icon: 'message1', label: 'ASK AI', new: true, route: null },
  { icon: 'user', label: 'PROFILE', route: 'Settings' },
];

const DashboardScreenBase: React.FC<Props> = ({ navigation }) => {
  const { authorized } = useAuth();
  const { isDark, colors } = useTheme();
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [isCityModalVisible, setCityModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Nashik');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Auto-scroll banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearAuthData();
            navigation.replace('Login');
            showToast('success', 'Logged Out', 'You have been successfully logged out.');
          },
        },
      ]
    );
  };

  const handleComingSoon = () => {
    showToast('info', 'Coming Soon', 'This feature is under development.');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API call - replace with actual API calls
      await new Promise(resolve => setTimeout(() => resolve(null), 1500));
      // TODO: Add actual data refresh logic here
      // await loadDashboardData();
      showToast('success', 'Refreshed', 'Data has been updated.');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      showToast('error', 'Refresh Failed', 'Unable to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      backgroundColor: 'transparent',
    },
    headerButton: {
      padding: 8,
      borderRadius: 8,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.2,
    },
    headerCityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: colors.surface,
      elevation: 2,
      marginHorizontal: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    headerCityText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
      color: colors.text,
    },
    scrollViewContent: {
      flexGrow: 1,
      paddingTop: 8,
      backgroundColor: 'transparent',
      paddingHorizontal: 16,
      paddingBottom: 100,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: isDark ? 1 : 0,
      borderRadius: 25,
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginBottom: 16,
      borderColor: colors.border,
      backgroundColor: isDark ? colors.surface : '#F5F5F5',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 0,
      paddingHorizontal: 12,
      backgroundColor: 'transparent',
      color: colors.text,
    },
    bannerContainer: {
      height: height * 0.22,
      marginVertical: 12,
      borderRadius: 20,
      overflow: 'hidden',
    },
    bannerWrapper: {
      position: 'relative',
    },
    bannerImage: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
    bannerGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    bannerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    bannerDesc: {
      fontSize: 14,
      color: '#FFFFFF',
      opacity: 0.9,
    },
    bannerIndicators: {
      position: 'absolute',
      bottom: 12,
      right: 16,
      flexDirection: 'row',
    },
    bannerIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 4,
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    bannerIndicatorActive: {
      backgroundColor: '#FFFFFF',
    },
    sectionContainer: {
      marginVertical: 12,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 4,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: 0.1,
    },
    viewAllButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    viewAllText: {
      fontWeight: '600',
      color: colors.primary,
      fontSize: 14,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      marginTop: 8,
    },
    quickActionCard: {
      alignItems: 'center',
      justifyContent: 'center',
      width: width * 0.20,
      height: width * 0.20,
      backgroundColor: colors.surface,
      borderRadius: 16,
      elevation: 3,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 4,
      marginHorizontal: 2,
    },
    quickActionIcon: {
      marginBottom: 8,
    },
    quickActionLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    carCard: {
      width: width * 0.75,
      marginRight: 16,
      borderRadius: 20,
      backgroundColor: colors.surface,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    carImageContainer: {
      position: 'relative',
    },
    carImage: {
      width: '100%',
      height: width * 0.4,
    },
    discountBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: '#FF3B30',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    discountText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    favoriteButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      padding: 8,
    },
    carContent: {
      padding: 14,
    },
    carHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    carTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: 8,
    },
    carBadges: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    badge: {
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginLeft: 4,
    },
    badgeSuccess: {
      backgroundColor: '#30D158',
    },
    badgePrimary: {
      backgroundColor: colors.primary,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    badgePrimaryText: {
      color: '#111827',
    },
    carSpecs: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    carFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    priceSection: {
      flex: 1,
    },
    carPrice: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    originalPrice: {
      fontSize: 12,
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
      marginTop: 2,
    },
    detailsButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    detailsButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#111827',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    ratingText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    bottomTabs: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 10,
      paddingBottom: 18,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      elevation: 8,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    bottomTab: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      position: 'relative',
    },
    tabNewBadge: {
      position: 'absolute',
      top: 2,
      right: 16,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FF3B30',
      zIndex: 2,
    },
    tabIcon: {
      padding: 8,
      borderRadius: 12,
    },
    tabIconActive: {
      backgroundColor: `${colors.primary}20`,
    },
    tabLabel: {
      fontSize: 12,
      marginTop: 4,
      color: colors.textSecondary,
    },
    tabLabelActive: {
      fontWeight: '700',
      color: colors.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: 280,
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingVertical: 20,
      elevation: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      maxHeight: height * 0.6,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    cityItem: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cityText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
    },
    cityTextSelected: {
      color: colors.primary,
      fontWeight: '600',
    },
    drawer: {
      width: width * 0.75,
      height: '100%',
      backgroundColor: colors.surface,
      padding: 20,
      paddingTop: 50,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      position: 'absolute',
      right: 0,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
    },
    drawerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
    },
    logoutButton: {
      width: '100%',
      height: 48,
      backgroundColor: '#FF3B30',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      marginVertical: 20,
    },
    logoutButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
    },
    drawerOption: {
      marginTop: 15,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: isDark ? '#2c2c2c' : '#f0f0f0',
    },
    drawerOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    drawerOptionText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginLeft: 12,
    },
  });

  const Drawer = () => (
    <Modal visible={isDrawerVisible} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.modalOverlay} 
        onPress={() => setDrawerVisible(false)} 
        activeOpacity={1}
      >
        <Animatable.View 
          animation="slideInRight" 
          duration={300} 
          style={styles.drawer}
        >
          <Text style={styles.drawerTitle}>CarBazar</Text>
          {authorized && (
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          )}
          
          <View style={{ marginTop: 30 }}>
            <TouchableOpacity style={styles.drawerOption} onPress={handleComingSoon}>
              <View style={styles.drawerOptionContent}>
                <AntDesign name="car" size={20} color={colors.text} />
                <Text style={styles.drawerOptionText}>My Garage</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.drawerOption} onPress={handleComingSoon}>
              <View style={styles.drawerOptionContent}>
                <AntDesign name="heart" size={20} color={colors.text} />
                <Text style={styles.drawerOptionText}>Saved Cars</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.drawerOption} onPress={handleComingSoon}>
              <View style={styles.drawerOptionContent}>
                <MaterialIcons name="history" size={20} color={colors.text} />
                <Text style={styles.drawerOptionText}>View History</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.drawerOption} onPress={handleComingSoon}>
              <View style={styles.drawerOptionContent}>
                <MaterialIcons name="support-agent" size={20} color={colors.text} />
                <Text style={styles.drawerOptionText}>Support</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.drawerOption} onPress={handleComingSoon}>
              <View style={styles.drawerOptionContent}>
                <AntDesign name="infocircle" size={20} color={colors.text} />
                <Text style={styles.drawerOptionText}>About Us</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </TouchableOpacity>
    </Modal>
  );

  const CityModal = () => (
    <Modal visible={isCityModalVisible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animatable.View 
          animation="zoomIn" 
          duration={300} 
          style={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Select City</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                style={styles.cityItem}
                onPress={() => {
                  setSelectedCity(city);
                  setCityModalVisible(false);
                }}
              >
                <Text 
                  style={[
                    styles.cityText,
                    selectedCity === city && styles.cityTextSelected
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animatable.View>
      </View>
    </Modal>
  );

  const renderBanner = () => {
    const banner = BANNERS[currentBannerIndex];
    return (
      <View style={styles.bannerContainer}>
        <TouchableOpacity 
          style={styles.bannerWrapper}
          onPress={handleComingSoon}
        >
          <Image 
            source={{ uri: banner.image }} 
            style={styles.bannerImage} 
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.bannerGradient}
          >
            <Text style={styles.bannerTitle}>{banner.title}</Text>
            <Text style={styles.bannerDesc}>{banner.desc}</Text>
          </LinearGradient>
          
          <View style={styles.bannerIndicators}>
            {BANNERS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.bannerIndicator,
                  index === currentBannerIndex && styles.bannerIndicatorActive,
                ]}
              />
            ))}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuickAction = (item: typeof QUICK_CARDS[0], index: number) => (
    <TouchableOpacity 
      key={index}
      style={styles.quickActionCard} 
      onPress={() => {
        if (item.route) {
          navigation.navigate(item.route as any);
        } else {
          handleComingSoon();
        }
      }}
    >
      <Animatable.View 
        animation="fadeInUp" 
        delay={index * 100} 
        style={{ alignItems: 'center' }}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${item.color}20` }]}>
          <AntDesign name={item.icon as any} size={24} color={item.color} />
        </View>
        <Text style={styles.quickActionLabel}>{item.label}</Text>
      </Animatable.View>
    </TouchableOpacity>
  );

  const renderCarCard = ({ item, index }: { item: typeof CAR_LISTINGS[0], index: number }) => (
    <TouchableOpacity 
      style={styles.carCard} 
      onPress={() => navigation.navigate('CarDetails', { carId: item.id })}
    >
      <View style={styles.carImageContainer}>
        <Image source={{ uri: item.image }} style={styles.carImage} />
        
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
        
        <TouchableOpacity style={styles.favoriteButton}>
          <AntDesign name="hearto" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.carContent}>
        <View style={styles.carHeader}>
          <Text style={styles.carTitle}>{item.title}</Text>
          <View style={styles.carBadges}>
            {item.certified && (
              <View style={[styles.badge, styles.badgeSuccess]}>
                <Text style={styles.badgeText}>CERTIFIED</Text>
              </View>
            )}
            {item.verified && (
              <View style={[styles.badge, styles.badgePrimary]}>
                <Text style={[styles.badgeText, styles.badgePrimaryText]}>VERIFIED</Text>
              </View>
            )}
          </View>
        </View>
        
        <Text style={styles.carSpecs}>
          {item.year} â€¢ {item.km} â€¢ {item.fuel} â€¢ {item.location}
        </Text>
        
        <View style={styles.ratingContainer}>
          <AntDesign name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating} rating</Text>
        </View>
        
        <View style={styles.carFooter}>
          <View style={styles.priceSection}>
            <Text style={styles.carPrice}>{item.price}</Text>
            <Text style={styles.originalPrice}>{item.originalPrice}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => navigation.navigate('CarDetails', { carId: item.id })}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBottomTab = (tab: typeof BOTTOM_TABS[0], idx: number) => (
    <TouchableOpacity 
      key={idx} 
      style={styles.bottomTab} 
      onPress={() => {
        if (tab.route) {
          if (tab.label === 'SELL' && !authorized) {
            showToast('error', 'Unauthorized', 'Please sign in to sell a car.');
            navigation.replace('Login');
          } else {
            navigation.navigate(tab.route as any);
          }
        } else {
          handleComingSoon();
        }
      }}
    >
      {tab.new && (
        <View style={styles.tabNewBadge} />
      )}
      <View style={[styles.tabIcon, idx === 0 && styles.tabIconActive]}>
        <AntDesign 
          name={tab.icon as any} 
          size={20} 
          color={idx === 0 ? colors.primary : colors.textSecondary}
        />
      </View>
      <Text style={[styles.tabLabel, idx === 0 && styles.tabLabelActive]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      
      <Drawer />
      <CityModal />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CarBazar</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            style={styles.headerCityCard} 
            onPress={() => setCityModalVisible(true)}
          >
            <MaterialIcons name="location-pin" size={18} color={colors.text} />
            <Text style={styles.headerCityText}>{selectedCity}</Text>
            <AntDesign name="caretdown" size={12} color={colors.text} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setDrawerVisible(true)}>
            <AntDesign name="menuunfold" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
  
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <AntDesign name="search" size={20} color={colors.textSecondary} />
          <TextInput
            placeholder="Search for cars..."
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Banner */}
        {renderBanner()}
        
        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickActionsGrid}>
            {QUICK_CARDS.map((item, index) => renderQuickAction(item, index))}
          </View>
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
            contentContainerStyle={{ paddingLeft: 4 }}
          />
        </View>
      </ScrollView>
      
      {/* Bottom Tabs */}
      <View style={styles.bottomTabs}>
        {BOTTOM_TABS.map(renderBottomTab)}
      </View>
    </SafeAreaView>
  );
};

// Wrap the component with network handling HOC
const DashboardScreen = withOverlayNetworkHandling(DashboardScreenBase);

export default DashboardScreen;

