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
  ActivityIndicator,
  Animated,
  Alert,
  Modal,
  Platform,
  Linking,
  Share,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Video from 'react-native-video';

import { useNotifications } from '../../components/ui/ToastManager';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import chatApi from '../../services/ChatApi';
import { carApi, Vehicle } from '../../services/CarApi';
import { useAuth } from '../../context/AuthContext';

import { BlurView } from '@react-native-community/blur';
import { borderRadius, spacing, typography } from '../../config';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width, height } = Dimensions.get('window');

const RECENTLY_VIEWED_KEY = '@carworld_recently_viewed';
const FAVORITES_KEY = '@carworld_favorites';

interface Props {
  navigation: any;
  route: any;
}

const CarDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const isDark = false;
  const colors = {
    background: '#F9FAFB', // Cool gray background
    text: '#111827',
    textSecondary: '#4B5563',
    primary: '#2563EB', // Brighter blue
    primaryDark: '#1D4ED8',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  };
  const { notifyCarSaved, notifyCarRemoved, notifyMessageSent } = useNotifications();
  const { user } = useAuth();

  // State
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [car, setCar] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sections Expansion State
  const [expandedSection, setExpandedSection] = useState<string | null>('specs');

  // Video State
  const [isVideoPaused, setIsVideoPaused] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [showVideoControls, setShowVideoControls] = useState(false);

  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const favoriteScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const carId = route.params?.carId;

  // Check if current user is the owner
  const isOwner = car && user && String(car.dealerId) === String(user.id);

  // --- DATA LOADING ---

  const checkFavoriteStatus = async () => {
    if (!carId) return;
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const favorites = JSON.parse(stored) as string[];
        setIsFavorite(favorites.includes(String(carId)));
      }
    } catch (e) {
      console.warn('Failed to load favorite status');
    }
  };

  const fetchCarData = async () => {
    if (!carId) {
      setError('No car ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const carData = await carApi.getVehicleById(String(carId));
      setCar(carData);

      // Track view
      await carApi.trackVehicleView(String(carId));

      // Animate in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

    } catch (err) {
      console.error('Error fetching car details:', err);
      setError('Failed to load car details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkFavoriteStatus();
      fetchCarData();
    }, [carId])
  );

  // --- ACTIONS ---

  const handleFavoriteToggle = async () => {
    if (!car) return;

    if (!user) {
      Alert.alert('Login Required', 'Please login to save favorites.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    // Bounce animation
    Animated.sequence([
      Animated.timing(favoriteScale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(favoriteScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    const carTitle = `${car.make} ${car.model}`;
    if (newFavoriteState) {
      notifyCarSaved(carTitle);
    } else {
      notifyCarRemoved(carTitle);
    }

    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      let favorites: string[] = stored ? JSON.parse(stored) : [];
      const id = String(car.id);

      if (newFavoriteState) {
        if (!favorites.includes(id)) favorites.push(id);
      } else {
        favorites = favorites.filter(fid => fid !== id);
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorite', e);
    }
  };

  const handleSendMessage = async () => {
    if (!car) return;
    if (!user) {
      Alert.alert('Login Required', 'Please login to message the seller.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    carApi.trackCarStat(String(car.id), 'contact_click');

    try {
      const numericCarId = Number(car.id);
      const initialMessage = `Hi, I'm interested in ${car.make} ${car.model}. Is it still available?`;
      const chatRoom = await chatApi.createCarInquiryChat(numericCarId, initialMessage);

      // notifyMessageSent(); // Using toast
      navigation.navigate('Chat', {
        chatId: chatRoom.id,
        name: car.dealerName,
        type: 'CAR_INQUIRY',
        carId: numericCarId
      });
    } catch (error) {
      console.error('Failed to start chat:', error);
      Alert.alert('Error', 'Could not start chat. Please try again.');
    }
  };

  const handleCallSeller = () => {
    if (!car) return;
    carApi.trackCarStat(String(car.id), 'contact_click');
    Alert.alert('Call Seller', 'Phone support integration pending. Please use chat.');
  };

  const handleShare = async () => {
    if (!car) return;
    try {
      await Share.share({
        message: `Check out this ${car.make} ${car.model} on CarWorld! Price: ₹${car.price}`,
        // url: `https://carworld.com/car/${car.id}` // Deep link if available
      });
      carApi.trackVehicleShare(String(car.id), 'native_share');
    } catch (error) {
      // ignore
    }
  };

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === section ? null : section);
  };

  // --- RENDER HELPERS ---

  // Media preparation
  const getMediaList = () => {
    if (!car) return [];
    const list: Array<{ type: 'image' | 'video', uri: string }> = [];

    // Video first if exists
    if (car.videoUrl) {
      list.push({ type: 'video', uri: car.videoUrl });
    }

    if (car.images && car.images.length > 0) {
      car.images.forEach(img => list.push({ type: 'image', uri: img }));
    } else if (car.imageUrl) {
      list.push({ type: 'image', uri: car.imageUrl });
    }

    return list;
  };

  const mediaList = getMediaList();

  const renderMediaItem = ({ item, index }: { item: { type: 'image' | 'video', uri: string }, index: number }) => {
    if (item.type === 'video') {
      // Auto-play when active, reset when not
      const isActive = index === activeMediaIndex;
      return (
        <View style={styles.mediaContainer}>
          <Video
            source={{ uri: item.uri }}
            style={styles.videoPlayer}
            resizeMode="contain" // Contain to show full video
            controls={isActive}
            paused={!isActive || isVideoPaused} // Auto-play if active and not paused by user logic? Actually let's restrict auto-play to minimize data
            muted={isVideoMuted}
            repeat
            onLoad={() => {
              // console.log("Video loaded");
            }}
            onError={(e) => console.log("Video error", e)}
          />
          {!isActive && (
            <View style={styles.videoOverlay}>
              <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.8)" />
            </View>
          )}
          {isActive && (
            <TouchableOpacity
              style={styles.muteButton}
              onPress={() => setIsVideoMuted(!isVideoMuted)}
            >
              <Ionicons name={isVideoMuted ? "volume-mute" : "volume-high"} size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: item.uri }}
          style={styles.mediaImage}
          resizeMode="cover"
        />
      </View>
    );
  };



  const renderSpecs = () => {
    if (!car) return null;
    const specs = [
      { label: 'Transmission', value: car.transmission || car.specifications?.transmission, icon: 'git-network-outline' },
      { label: 'Fuel Type', value: car.fuelType || car.specifications?.fuelType, icon: 'water-outline' },
      { label: 'KM Driven', value: `${car.mileage?.toLocaleString()} km`, icon: 'speedometer-outline' },
      { label: 'Owners', value: `${car.specifications?.numberOfOwners || 1}`, icon: 'people-outline' },
      { label: 'Color', value: car.specifications?.color || 'N/A', icon: 'color-palette-outline' },
      { label: 'Insurance', value: car.specifications?.insurance ? 'Valid' : 'Expired', icon: 'shield-checkmark-outline' },
    ];

    return (
      <View style={styles.specsGrid}>
        {specs.map((spec, i) => (
          <View key={i} style={styles.specItem}>
            <View style={styles.specIconContainer}>
              <Ionicons name={spec.icon as any} size={20} color={colors.primary} />
            </View>
            <Text style={styles.specLabel}>{spec.label}</Text>
            <Text style={styles.specValue} numberOfLines={1}>{spec.value || '-'}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderAccordionSection = (title: string, id: string, content: React.ReactNode) => {
    const isExpanded = expandedSection === id;
    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection(id)}>
          <Text style={styles.accordionTitle}>{title}</Text>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.accordionContent}>
            {content}
          </View>
        )}
      </View>
    );
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !car) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: colors.textSecondary }}>{error || 'Car not found'}</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle='dark-content' backgroundColor='transparent' translucent />

      {/* Floating Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity, backgroundColor: colors.surface }]}>
        <SafeAreaView edges={['top']} style={{ flexDirection: 'row', alignItems: 'center', height: 90 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{car.make} {car.model}</Text>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-social-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>

      {/* Static Header Buttons (Visible when transparent) */}
      <SafeAreaView edges={['top']} style={styles.staticHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.roundButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={handleShare} style={styles.roundButton}>
            <Ionicons name="share-social-outline" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFavoriteToggle} style={styles.roundButton}>
            <Animated.View style={{ transform: [{ scale: favoriteScale }] }}>
              <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? colors.error : "#FFF"} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Media Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.floor(e.nativeEvent.contentOffset.x / width);
              if (newIndex !== activeMediaIndex) {
                setActiveMediaIndex(newIndex);
                if (mediaList[newIndex].type === 'video') {
                  setIsVideoPaused(false); // Auto-play when swiped to
                  carApi.trackCarStat(String(car.id), 'video_play');
                } else {
                  setIsVideoPaused(true);
                  carApi.trackCarStat(String(car.id), 'image_swipe');
                }
              }
            }}
          >
            {mediaList.length > 0 ? (
              mediaList.map((item, index) => (
                <View key={index} style={{ width, height: 300 }}>
                  {item.type === 'video' ? (
                    <View style={styles.mediaContainer}>
                      <Video
                        source={{ uri: item.uri }}
                        style={styles.videoPlayer}
                        resizeMode="cover" // or contain
                        paused={activeMediaIndex !== index || isVideoPaused}
                        muted={isVideoMuted}
                        repeat
                      />
                      {/* Play Icon Overlay if paused */}
                      {(activeMediaIndex !== index || isVideoPaused) && (
                        <TouchableOpacity
                          style={styles.playOverlay}
                          onPress={() => {
                            if (activeMediaIndex === index) setIsVideoPaused(false);
                          }}
                        >
                          <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.8)" />
                        </TouchableOpacity>
                      )}
                      {/* Mute Control */}
                      {activeMediaIndex === index && (
                        <TouchableOpacity style={styles.muteButton} onPress={() => setIsVideoMuted(!isVideoMuted)}>
                          <Ionicons name={isVideoMuted ? "volume-mute" : "volume-high"} size={20} color="#FFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <Image source={{ uri: item.uri }} style={styles.mediaImage} resizeMode="cover" />
                  )}
                </View>
              ))
            ) : (
              <View style={[styles.mediaContainer, { width, backgroundColor: '#F3F4F6' }]}>
                {['PENDING', 'UPLOADING', 'UPLOADED', 'PROCESSING', 'MEDIA_PENDING'].includes(car.mediaStatus as string) ? (
                  <View style={{ alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: 12, color: colors.textSecondary, fontWeight: '500' }}>Processing Media...</Text>
                    <Text style={{ marginTop: 4, color: colors.textSecondary, fontSize: 12 }}>Check back shortly</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons name="image-outline" size={64} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, marginTop: 8 }}>No Media Available</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
          {/* Pagination Dots */}
          {mediaList.length > 1 && (
            <View style={styles.pagination}>
              {mediaList.map((_, i) => (
                <View key={i} style={[styles.dot, activeMediaIndex === i && styles.activeDot]} />
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.contentBody}>
          {/* Hero Header */}
          <View style={styles.section}>
            <Text style={styles.carName}>{car.make} {car.model}</Text>
            <Text style={styles.carVariant}>{car.variant} • {car.year}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(car.price)}</Text>
              {car.status === 'Sold' && <View style={styles.soldBadge}><Text style={styles.soldText}>SOLD</Text></View>}
            </View>
            <Text style={styles.location}><Ionicons name="location-sharp" size={14} /> {car.location || "Mumbai, India"}</Text>
          </View>

          {/* Key Highlights Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Highlights</Text>
            {renderSpecs()}
          </View>

          {/* Description Accordion */}
          {renderAccordionSection("Description", "desc", (
            <Text style={styles.descriptionText}>
              {car.specifications?.description || "No description provided by the seller."}
            </Text>
          ))}

          {/* Features Accordion (Mocked for now) */}
          {renderAccordionSection("Features & Safety", "features", (
            <View style={styles.featuresGrid}>
              {['ABS', 'Airbags', 'Power Steering', 'Power Windows', 'Bluetooth'].map((f, i) => (
                <View key={i} style={styles.featureBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Seller Card */}
          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Sold By</Text>
            <View style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerInitials}>{car.dealerName?.charAt(0) || 'D'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sellerName}>{car.dealerName || "Verified Dealer"}</Text>
                <Text style={styles.sellerType}>Premium Seller • 4.5 ★</Text>
              </View>
              {/* <Button title="View Profile" variant="outline" size="small" /> */}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Action Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerPrice}>{formatPrice(car.price)}</Text>
          <TouchableOpacity onPress={() => { /* Open EMI Calc */ }}>
            <Text style={styles.emiText}>EMI starts @ ₹{Math.floor(car.price / 60).toLocaleString()}/mo</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerActions}>
          <TouchableOpacity style={[styles.actionBtn, styles.chatBtn]} onPress={handleSendMessage}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
            <Text style={[styles.btnText, { color: colors.primary }]}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.callBtn]} onPress={handleCallSeller}>
            <Ionicons name="call" size={20} color="#FFF" />
            <Text style={[styles.btnText, { color: '#FFF' }]}>Call</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 50, elevation: 4,
    backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
  },
  staticHeader: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 40,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12
  },
  roundButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center'
  },
  headerButton: { padding: 12 },
  headerTitle: { fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },

  // Carousel
  carouselContainer: { height: 300, backgroundColor: '#000' },
  mediaContainer: { width: width, height: 300, justifyContent: 'center', alignItems: 'center' },
  mediaImage: { width: '100%', height: '100%' },
  videoPlayer: { width: '100%', height: '100%' },
  videoOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)' },
  muteButton: { position: 'absolute', bottom: 16, right: 16, padding: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20 },
  pagination: { flexDirection: 'row', position: 'absolute', bottom: 16, alignSelf: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#FFF', width: 24 },

  // Content
  contentBody: { padding: 16 },
  section: { marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  carName: { fontSize: 24, fontWeight: '800', color: '#111827' },
  carVariant: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  price: { fontSize: 28, fontWeight: '800', color: '#111827' },
  soldBadge: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginLeft: 12 },
  soldText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  location: { color: '#6B7280', marginTop: 8 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },

  // Specs Grid
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  specItem: { width: '50%', padding: 8, flexDirection: 'column' },
  specIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  specLabel: { fontSize: 12, color: '#6B7280' },
  specValue: { fontSize: 14, fontWeight: '600', color: '#111827' },

  // Accordion
  accordionContainer: { marginBottom: 16, backgroundColor: '#FFF', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  accordionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  accordionContent: { padding: 16, paddingTop: 0, borderTopWidth: 0 },
  descriptionText: { fontSize: 14, lineHeight: 22, color: '#4B5563' },

  // Features
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#D1FAE5' },
  featureText: { fontSize: 12, color: '#065F46', marginLeft: 4, fontWeight: '500' },

  // Seller
  sellerSection: { marginBottom: 20 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  sellerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#BFDBFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sellerInitials: { fontSize: 20, fontWeight: '700', color: '#1E40AF' },
  sellerName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  sellerType: { fontSize: 12, color: '#6B7280' },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    flexDirection: 'row', padding: 12, alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12
  },
  footerInfo: { flex: 1 },
  footerPrice: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emiText: { fontSize: 11, color: '#2563EB', fontWeight: '500' },
  footerActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  chatBtn: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#2563EB' },
  callBtn: { backgroundColor: '#2563EB' },
  btnText: { fontWeight: '600', marginLeft: 6 },
});

export default CarDetailsScreen;
