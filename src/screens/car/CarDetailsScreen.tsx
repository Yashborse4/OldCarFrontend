import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ActivityIndicator,
  Animated,
} from 'react-native';

import { useNotifications } from '../../components/ui/ToastManager';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import { BlurView } from '@react-native-community/blur';
import { borderRadius, spacing, typography } from '../../config';


const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: any;
}

const CarDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const isDark = false;
  const colors = {
    background: '#FAFBFC',
    text: '#1A202C',
    textSecondary: '#4A5568',
    primary: '#FFD700',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    success: '#48BB78',
    error: '#E53E3E',
  };
  const { notifyCarSaved, notifyCarRemoved, notifyMessageSent } = useNotifications();

  // State
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const favoriteScale = useRef(new Animated.Value(1)).current;
  const buttonSlideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const carId = route.params?.carId;

  // Mock data with enhanced information
  const car = {
    id: carId || 1,
    title: 'Mercedes-Benz S-Class 2021',
    subtitle: 'S 350d 4MATIC AMG Line',
    year: 2021,
    price: '₹85,50,000',
    originalPrice: '₹95,00,000',
    savings: '₹9,50,000',
    location: 'Mumbai, Maharashtra',
    km: '15,000',
    fuel: 'Diesel',
    owner: 'First Owner',
    transmission: 'Automatic',
    engine: '3.0L V6 Turbo',
    power: '286 HP',
    torque: '600 Nm',
    topSpeed: '250 km/h',
    acceleration: '6.0 sec (0-100)',
    mileage: '13.5 kmpl',
    description: 'Experience luxury redefined with this stunning Mercedes-Benz S-Class. This flagship sedan combines cutting-edge technology, unparalleled comfort, and sophisticated styling. Every journey becomes extraordinary with features designed to pamper and protect.',
    features: [
      'Panoramic Sunroof', 'Premium Leather Seats', 'Navigation System',
      '360° Camera', 'Adaptive Cruise Control', 'Air Suspension',
      'Wireless Charging', 'Ambient Lighting', 'Heated & Cooled Seats',
      'Bang & Olufsen Sound', 'Lane Keep Assist', 'Parking Assist'
    ],
    images: [
      'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/909907/pexels-photo-909907.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    seller: {
      name: 'Premium Motors',
      rating: 4.8,
      reviews: 156,
      verified: true,
      phone: '+91 9876543210',
      memberSince: '2020'
    },
    specifications: [
      { label: 'Body Type', value: 'Sedan' },
      { label: 'Seating Capacity', value: '5 Seater' },
      { label: 'Drivetrain', value: '4MATIC AWD' },
      { label: 'Safety Rating', value: '5 Star NCAP' },
      { label: 'Warranty', value: '2 Years Remaining' },
      { label: 'Service Records', value: 'Complete' },
    ]
  };

  // Simulated loading with enhanced animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      Animated.stagger(100, [
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlideAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);
    return () => clearTimeout(timer);
  }, [fadeAnim, buttonSlideAnim]);

  // Favorite animation with enhanced feedback
  const handleFavoriteToggle = useCallback(() => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    // Bounce animation
    Animated.sequence([
      Animated.timing(favoriteScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(favoriteScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    if (newFavoriteState) {
      notifyCarSaved(car.title);
    } else {
      notifyCarRemoved(car.title);
    }
  }, [isFavorite, car.title, favoriteScale, notifyCarSaved, notifyCarRemoved]);

  const handleCallSeller = useCallback(() => {
    console.log('Calling seller:', car.seller.phone);
  }, [car.seller.phone]);

  const handleSendMessage = useCallback(() => {
    console.log('Sending message to:', car.seller.name);
    notifyMessageSent();
  }, [car.seller.name, notifyMessageSent]);

  // Header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageParallax = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  // Styles defined inside component to access 
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: typography.fontSizes.lg,
      color: colors.text,
      fontWeight: typography.fontWeights.medium,
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      paddingTop: StatusBar.currentHeight || 0,
    },
    headerBackground: {
      ...StyleSheet.absoluteFillObject,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      height: 60,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.lg,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    favoriteButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.lg,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: typography.fontSizes.lg,
      fontWeight: typography.fontWeights.bold,
      color: '#FFFFFF',
      marginHorizontal: spacing.md,
    },
    imageContainer: {
      height: height * 0.5,
      position: 'relative',
    },
    carImage: {
      width: width,
      height: '100%',
    },
    imageGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: height * 0.2,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    imageDots: {
      position: 'absolute',
      bottom: spacing.xl,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: colors.primary,
      width: 24,
    },
    contentContainer: {
      flex: 1,
      marginTop: -spacing['2xl'],
      borderTopLeftRadius: borderRadius['2xl'],
      borderTopRightRadius: borderRadius['2xl'],
      backgroundColor: colors.background,
      paddingTop: spacing.xl,
    },
    titleSection: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    carTitle: {
      fontSize: typography.fontSizes['3xl'],
      fontWeight: typography.fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    carSubtitle: {
      fontSize: typography.fontSizes.lg,
      color: colors.textSecondary,
      fontWeight: typography.fontWeights.medium,
      marginBottom: spacing.md,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    priceSection: {
      flex: 1,
    },
    currentPrice: {
      fontSize: typography.fontSizes['3xl'],
      fontWeight: typography.fontWeights.bold,
      color: colors.primary
    },
    originalPrice: {
      fontSize: typography.fontSizes.lg,
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
      marginTop: spacing.xs,
    },
    savingsCard: {
      backgroundColor: colors.success + '20',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
    },
    savingsText: {
      fontSize: typography.fontSizes.xl,
      fontWeight: typography.fontWeights.bold,
      color: colors.primary
    },
    savingsLabel: {
      fontSize: typography.fontSizes.sm,
      color: colors.primary,
      marginTop: spacing.xs,
    },
    quickInfoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    quickInfoItem: {
      width: '50%',
      paddingHorizontal: spacing.xs,
      marginBottom: spacing.md,
    },
    quickInfoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.lg,

    },
    quickInfoIcon: {
      marginRight: spacing.sm,
    },
    quickInfoText: {
      flex: 1,
    },
    quickInfoLabel: {
      fontSize: typography.fontSizes.xs,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    quickInfoValue: {
      fontSize: typography.fontSizes.sm,
      fontWeight: typography.fontWeights.semibold,
      color: colors.text
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.fontSizes.xl,
      fontWeight: typography.fontWeights.bold,
      color: colors.text,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    },
    descriptionContainer: {
      paddingHorizontal: spacing.lg,
    },
    descriptionText: {
      fontSize: typography.fontSizes.base,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    readMoreButton: {
      marginTop: spacing.sm,
    },
    readMoreText: {
      fontSize: typography.fontSizes.base,
      color: colors.primary,
      fontWeight: typography.fontWeights.semibold,
    },
    featuresContainer: {
      paddingHorizontal: spacing.lg,
    },
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -spacing.xs,
    },
    featureChip: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      margin: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border
    },
    featureText: {
      fontSize: typography.fontSizes.sm,
      color: colors.text,
      fontWeight: typography.fontWeights.medium,
    },
    specificationsContainer: {
      paddingHorizontal: spacing.lg,
    },
    specificationItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    specLabel: {
      fontSize: typography.fontSizes.base,
      color: colors.textSecondary,
      flex: 1,
    },
    specValue: {
      fontSize: typography.fontSizes.base,
      color: colors.text,
      fontWeight: typography.fontWeights.semibold,
      flex: 1,
      textAlign: 'right',
    },
    sellerSection: {
      paddingHorizontal: spacing.lg,
    },
    sellerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: borderRadius.xl,

    },
    sellerAvatar: {
      width: 60,
      height: 60,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.lg,
    },
    sellerInfo: {
      flex: 1,
    },
    sellerName: {
      fontSize: typography.fontSizes.lg,
      fontWeight: typography.fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    sellerStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.lg,
    },
    ratingText: {
      fontSize: typography.fontSizes.sm,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    memberSince: {
      fontSize: typography.fontSizes.sm,
      color: colors.textSecondary
    },
    contactButtons: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      paddingBottom: spacing['2xl'],
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border
    },
    messageButton: {
      flex: 1,
      marginRight: spacing.md,
    },
    callButton: {
      flex: 2,
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} translucent={false} hidden={false} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading car details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} translucent={false} hidden={false} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView
          style={styles.headerBackground}
          blurType={isDark ? 'dark' : 'light'}
          blurAmount={10}
          reducedTransparencyFallbackColor={colors.surface}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity }]}>
            {car.title}
          </Animated.Text>
          <Animated.View style={{ transform: [{ scale: favoriteScale }] }}>
            <TouchableOpacity onPress={handleFavoriteToggle} style={styles.favoriteButton}>
              <MaterialIcons
                name={isFavorite ? 'favorite' : 'favorite-border'}
                size={24}
                color={isFavorite ? colors.error : '#FFFFFF'}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Car Images */}
        <Animated.View style={[styles.imageContainer, { transform: [{ translateY: imageParallax }] }]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(newIndex);
            }}
          >
            {car.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.carImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          <View style={styles.imageGradient} />

          <View style={styles.imageDots}>
            {car.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeImageIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          {/* Title and Price Section */}
          <View style={styles.titleSection}>
            <Text style={styles.carTitle}>{car.title}</Text>
            <Text style={styles.carSubtitle}>{car.subtitle}</Text>

            <View style={styles.priceContainer}>
              <View style={styles.priceSection}>
                <Text style={styles.currentPrice}>{car.price}</Text>
                <Text style={styles.originalPrice}>{car.originalPrice}</Text>
              </View>

              <View style={styles.savingsCard}>
                <Text style={styles.savingsText}>{car.savings}</Text>
                <Text style={styles.savingsLabel}>You Save</Text>
              </View>
            </View>
          </View>

          {/* Quick Info Grid */}
          <View style={styles.quickInfoGrid}>
            {[
              { icon: 'location-on', label: 'Location', value: car.location },
              { icon: 'speed', label: 'Driven', value: `${car.km} km` },
              { icon: 'local-gas-station', label: 'Fuel Type', value: car.fuel },
              { icon: 'settings', label: 'Transmission', value: car.transmission },
            ].map((item, index) => (
              <View
                key={index}
                style={styles.quickInfoItem}
              >
                <View style={styles.quickInfoCard}>
                  <MaterialIcons
                    name={item.icon as any}
                    size={24}
                    color={colors.primary}
                    style={styles.quickInfoIcon}
                  />
                  <View style={styles.quickInfoText}>
                    <Text style={styles.quickInfoLabel}>{item.label}</Text>
                    <Text style={styles.quickInfoValue}>{item.value}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>
                {showFullDescription ? car.description : `${car.description.substring(0, 150)}...`}
              </Text>
              <TouchableOpacity
                onPress={() => setShowFullDescription(!showFullDescription)}
                style={styles.readMoreButton}
              >
                <Text style={styles.readMoreText}>
                  {showFullDescription ? 'Read Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresContainer}>
              <View style={styles.featuresGrid}>
                {car.features.map((feature, index) => (
                  <View
                    key={index}
                    style={styles.featureChip}
                  >
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specificationsContainer}>
              {car.specifications.map((spec, index) => (
                <View key={index} style={styles.specificationItem}>
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Seller Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller Information</Text>
            <View style={styles.sellerSection}>
              <Card variant="elevated" padding="none" style={styles.sellerCard}>
                <View style={styles.sellerAvatar}>
                  <MaterialIcons name="store" size={30} color="#FFFFFF" />
                </View>
                <View style={styles.sellerInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.sellerName}>{car.seller.name}</Text>
                    {car.seller.verified && (
                      <MaterialIcons name="verified" size={18} color={colors.primary} style={{ marginLeft: 4 }} />
                    )}
                  </View>
                  <View style={styles.sellerStats}>
                    <View style={styles.ratingContainer}>
                      <MaterialIcons name="star" size={16} color={colors.primary} />
                      <Text style={styles.ratingText}>
                        {car.seller.rating} ({car.seller.reviews} reviews)
                      </Text>
                    </View>
                    <Text style={styles.memberSince}>Since {car.seller.memberSince}</Text>
                  </View>
                </View>
              </Card>
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Contact Buttons */}
      <Animated.View
        style={[
          styles.contactButtons,
          {
            transform: [
              {
                translateY: buttonSlideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Button
          title="Message"
          onPress={handleSendMessage}
          variant="outline"
          size="lg"
          icon="chat"
          style={styles.messageButton}
        />
        <Button
          title="Call Seller"
          onPress={handleCallSeller}
          size="lg"
          icon="call"
          style={styles.callButton}
        />
      </Animated.View>
    </View>
  );
};

export default CarDetailsScreen;

