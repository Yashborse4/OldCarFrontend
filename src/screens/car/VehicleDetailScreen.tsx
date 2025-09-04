import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
  Linking,
  Share,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
  route?: any;
}

interface Theme {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    shadow: string;
  };
}

// Mock theme hook for standalone implementation
const useTheme = (): Theme => {
  const [isDark, setIsDark] = useState(false);
  
  const colors = {
    background: isDark ? '#0A0A0A' : '#FFFFFF',
    surface: isDark ? '#1A1A1A' : '#FAFAFA',
    text: isDark ? '#FFFFFF' : '#333333',
    textSecondary: isDark ? '#BBBBBB' : '#666666',
    primary: '#FFD700',
    border: isDark ? '#333333' : '#E0E0E0',
    shadow: isDark ? '#000000' : '#888888',
  };
  
  return { isDark, colors };
};

const VEHICLE_DATA = {
  title: 'Tesla Model S Plaid',
  price: 'â‚¹75,00,000',
  originalPrice: 'â‚¹85,00,000',
  location: 'Mumbai, India',
  dealer: 'Premium Auto Cars',
  phone: '+91 9876543210',
  images: [
    'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  ],
  specs: [
    { icon: 'calendar-range', label: 'Year', value: '2023' },
    { icon: 'road-variant', label: 'KM Driven', value: '1,200' },
    { icon: 'gas-station', label: 'Fuel Type', value: 'Electric' },
    { icon: 'car-shift-pattern', label: 'Transmission', value: 'Automatic' },
    { icon: 'account-group', label: 'Owners', value: '1st Owner' },
    { icon: 'car-door', label: 'Doors', value: '4 Doors' },
  ],
  overview: 'The Tesla Model S Plaid is the quickest accelerating car in production today. It features a tri-motor all-wheel-drive platform with torque vectoring, achieving 0-60 mph in just 1.99 seconds. With a range of over 390 miles, it combines performance, safety, and efficiency.',
  features: [
    'ABS with EBD',
    '6 Airbags',
    'GPS Navigation',
    'Bluetooth Connectivity',
    'Climate Control',
    'Parking Sensors',
    'Reverse Camera',
    'Keyless Entry',
    'Power Steering',
    'Electric Windows',
    'Leather Seats',
    'Sunroof',
  ],
};

const VehicleDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { isDark, colors } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const handleContactSeller = () => {
    Alert.alert(
      'Contact Seller',
      'Choose an option to contact the seller',
      [
        {
          text: 'Call Now',
          onPress: () => Linking.openURL(`tel:${VEHICLE_DATA.phone}`),
        },
        {
          text: 'Send Message',
          onPress: () => Alert.alert('Feature Coming Soon', 'Messaging feature will be available soon.'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? 'Removed from Wishlist' : 'Added to Wishlist',
      isBookmarked ? 'Vehicle removed from your wishlist' : 'Vehicle added to your wishlist'
    );
  };

  const handleShare = () => {
    Alert.alert('Share Vehicle', 'Sharing feature will be available soon.');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      paddingBottom: 120, // Space for the footer
    },
    carouselWrapper: {
      height: width * 0.75,
      position: 'relative',
    },
    carouselContainer: {
      height: width * 0.75,
    },
    imageWrapper: {
      width: width,
      height: width * 0.75,
      position: 'relative',
    },
    carouselImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imageGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '30%',
    },
    imageIndicators: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
      backgroundColor: colors.primary,
      opacity: 0.5,
    },
    indicatorActive: {
      opacity: 1,
      backgroundColor: colors.primary,
    },
    imageCounter: {
      position: 'absolute',
      top: 20,
      right: 20,
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    imageCounterText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    contentContainer: {
      padding: 16,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 15,
      padding: 20,
      marginTop: 15,
      shadowColor: isDark ? '#000' : '#888',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    titleCard: {
      backgroundColor: colors.surface,
      borderRadius: 15,
      padding: 20,
      marginTop: 15,
      shadowColor: isDark ? '#000' : '#888',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
      marginRight: 12,
    },
    bookmarkButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    price: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.primary,
    },
    originalPrice: {
      fontSize: 16,
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
      marginLeft: 8,
    },
    savings: {
      fontSize: 14,
      color: '#30D158',
      backgroundColor: isDark ? 'rgba(48, 209, 88, 0.1)' : 'rgba(48, 209, 88, 0.1)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginLeft: 8,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    location: {
      fontSize: 16,
      marginLeft: 4,
      color: colors.textSecondary,
    },
    dealerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    dealerText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      color: colors.text,
    },
    specsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    specItem: {
      alignItems: 'center',
      width: '48%',
      marginBottom: 16,
      padding: 12,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    },
    specLabel: {
      fontSize: 14,
      marginTop: 5,
      color: colors.textSecondary,
    },
    specValue: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 2,
      color: colors.text,
    },
    overview: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
    },
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '50%',
      marginBottom: 8,
    },
    featureText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
      borderTopWidth: 1,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
    },
    footerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerPriceSection: {
      flex: 1,
    },
    footerPrice: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
    },
    footerLocation: {
      fontSize: 12,
      marginTop: 2,
      color: colors.textSecondary,
    },
    footerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    shareButton: {
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginRight: 12,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      borderWidth: 1,
      borderColor: colors.border,
    },
    ctaButton: {
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      backgroundColor: colors.primary,
    },
    ctaButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? '#111827' : '#FFFFFF',
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      borderRadius: 20,
      padding: 10,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
    },
    actionButtons: {
      position: 'absolute',
      top: 50,
      right: 20,
      flexDirection: 'row',
    },
    actionButton: {
      borderRadius: 20,
      padding: 10,
      marginLeft: 8,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Image Carousel with Gradient Overlay */}
        <View style={styles.carouselWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.carouselContainer}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {VEHICLE_DATA.images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.carouselImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.3)']}
                  style={styles.imageGradient}
                />
              </View>
            ))}
          </ScrollView>
          
          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1} / {VEHICLE_DATA.images.length}
            </Text>
          </View>
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {VEHICLE_DATA.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Vehicle Title Card */}
          <View style={styles.titleCard}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{VEHICLE_DATA.title}</Text>
              <TouchableOpacity style={styles.bookmarkButton} onPress={handleBookmark}>
                <MaterialCommunityIcons
                  name={isBookmarked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isBookmarked ? '#FF3B30' : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.price}>{VEHICLE_DATA.price}</Text>
              <Text style={styles.originalPrice}>{VEHICLE_DATA.originalPrice}</Text>
              <Text style={styles.savings}>Save â‚¹10L</Text>
            </View>
            
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={18} color={colors.textSecondary} />
              <Text style={styles.location}>{VEHICLE_DATA.location}</Text>
            </View>
            
            <View style={styles.dealerInfo}>
              <MaterialCommunityIcons name="store" size={16} color={colors.textSecondary} />
              <Text style={styles.dealerText}>Sold by {VEHICLE_DATA.dealer}</Text>
            </View>
          </View>

          {/* Key Specs Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Key Specifications</Text>
            <View style={styles.specsContainer}>
              {VEHICLE_DATA.specs.map((spec, index) => (
                <View key={index} style={styles.specItem}>
                  <MaterialCommunityIcons name={spec.icon as any} size={28} color={colors.primary} />
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Overview Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Vehicle Overview</Text>
            <Text style={styles.overview}>{VEHICLE_DATA.overview}</Text>
          </View>

          {/* Features Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Features & Safety</Text>
            <View style={styles.featuresGrid}>
              {VEHICLE_DATA.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Footer */}
      <LinearGradient
        colors={isDark ? ['rgba(0,0,0,0.9)', colors.surface] : ['rgba(255,255,255,0.95)', colors.surface]}
        style={styles.footer}
      >
        <View style={styles.footerContent}>
          <View style={styles.footerPriceSection}>
            <Text style={styles.footerPrice}>{VEHICLE_DATA.price}</Text>
            <Text style={styles.footerLocation}>Best Price in {VEHICLE_DATA.location}</Text>
          </View>
          
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <MaterialCommunityIcons name="share-variant" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.ctaButton} onPress={handleContactSeller}>
              <MaterialCommunityIcons
                name="phone"
                size={20}
                color={isDark ? '#111827' : '#FFFFFF'}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.ctaButtonText}>Contact Seller</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#333333'} />
      </TouchableOpacity>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <MaterialCommunityIcons name="share-variant" size={20} color={isDark ? '#FFFFFF' : '#333333'} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default VehicleDetailScreen;

