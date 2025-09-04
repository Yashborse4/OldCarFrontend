import React, { useState, useEffect } from 'react';
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
} from 'react-native';

import { useTheme } from '../../theme';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const CarDetailsScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const { isDark, colors } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // In a real app, this would come from route.params and an API call
  const carId = route.params?.carId;
  
  // Simulating data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Mock data - in a real app, you'd fetch this based on carId
  const car = {
    id: carId || 1,
    title: 'Mercedes-Benz S-Class',
    year: 2019,
    price: '₹65,00,000',
    location: 'Mumbai, Maharashtra',
    km: '25,000',
    fuel: 'Petrol',
    owner: 'First Owner',
    transmission: 'Automatic',
    description: 'The Mercedes-Benz S-Class, formerly known as Sonderklasse, is a series of full-size luxury sedans and limousines produced by the German automaker Mercedes-Benz. The S-Class is the flagship vehicle for Mercedes-Benz.',
    features: ['360° Camera', 'Sunroof', 'Cruise Control', 'Leather Seats', 'Navigation System', 'Bluetooth', 'Parking Sensors', 'Keyless Entry'],
    images: [
      'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    seller: {
      name: 'Premium Motors',
      rating: 4.8,
      verified: true,
      phone: '+91 9876543210'
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  const handleCallSeller = () => {
    // In a real app, this would initiate a phone call
    console.log('Calling seller:', car.seller.phone);
  };

  const handleSendMessage = () => {
    // In a real app, this would open a chat interface
    console.log('Sending message to:', car.seller.name);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      {/* Header */}
      <Animatable.View 
        animation="fadeIn" 
        duration={500} 
        style={[styles.header, { borderBottomColor: colors.border }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{car.title}</Text>
        <TouchableOpacity onPress={handleFavoriteToggle} style={styles.favoriteButton}>
          <Animatable.View animation={isFavorite ? 'pulse' : undefined}>
            <AntDesign name={isFavorite ? 'heart' : 'hearto'} size={24} color={isFavorite ? '#FF3B30' : colors.text} />
          </Animatable.View>
        </TouchableOpacity>
      </Animatable.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Car Images */}
        <Animatable.View 
          animation="fadeIn" 
          duration={600} 
          style={styles.imageContainer}
        >
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
                style={styles.mainImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          <View style={styles.imageDots}>
            {car.images.map((_, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setActiveImageIndex(index)}
                style={[styles.dot, activeImageIndex === index && { backgroundColor: colors.primary, width: 24 }]}
              />
            ))}
          </View>
        </Animatable.View>

        {/* Car Info */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={700} 
          style={[styles.infoContainer, { backgroundColor: colors.surface }]}
        >
          <View style={styles.titleRow}>
            <View>
              <Text style={[styles.carTitle, { color: colors.text }]}>{car.title}</Text>
              <Text style={[styles.carYear, { color: colors.textSecondary }]}>{car.year}</Text>
            </View>
            <Text style={[styles.carPrice, { color: colors.accent }]}>{car.price}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Quick Info */}
          <View style={styles.quickInfoContainer}>
            <View style={styles.quickInfoItem}>
              <MaterialIcons name="location-on" size={20} color={colors.primary} />
              <Text style={[styles.quickInfoText, { color: colors.textSecondary }]}>{car.location}</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <MaterialIcons name="speed" size={20} color={colors.primary} />
              <Text style={[styles.quickInfoText, { color: colors.textSecondary }]}>{car.km} km</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <MaterialIcons name="local-gas-station" size={20} color={colors.primary} />
              <Text style={[styles.quickInfoText, { color: colors.textSecondary }]}>{car.fuel}</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <MaterialIcons name="person" size={20} color={colors.primary} />
              <Text style={[styles.quickInfoText, { color: colors.textSecondary }]}>{car.owner}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Description */}
          <Animatable.View 
            animation="fadeIn" 
            delay={300}
            style={styles.sectionContainer}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>{car.description}</Text>
          </Animatable.View>

          {/* Features */}
          <Animatable.View 
            animation="fadeIn" 
            delay={400}
            style={styles.sectionContainer}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
            <View style={styles.featuresContainer}>
              {car.features.map((feature, index) => (
                <Animatable.View 
                  key={index} 
                  animation="fadeInRight" 
                  delay={500 + (index * 50)}
                  style={[styles.featureItem, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' }]}
                >
                  <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
                </Animatable.View>
              ))}
            </View>
          </Animatable.View>

          {/* Seller Info */}
          <Animatable.View 
            animation="fadeIn" 
            delay={500}
            style={styles.sectionContainer}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Seller Information</Text>
            <View style={[styles.sellerCard, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' }]}>
              <View style={styles.sellerInfo}>
                <View style={styles.sellerNameContainer}>
                  <Text style={[styles.sellerName, { color: colors.text }]}>{car.seller.name}</Text>
                  {car.seller.verified && (
                    <MaterialIcons name="verified" size={18} color={colors.primary} style={{ marginLeft: 5 }} />
                  )}
                </View>
                <View style={styles.ratingContainer}>
                  <AntDesign name="star" size={16} color={colors.primary} />
                  <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{car.seller.rating}</Text>
                </View>
              </View>
            </View>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>

      {/* Contact Buttons */}
      <Animatable.View 
        animation="fadeInUp" 
        duration={500}
        style={[styles.contactContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
      >
        <TouchableOpacity 
          style={[styles.messageButton, { borderColor: colors.primary }]}
          onPress={handleSendMessage}
        >
          <Text style={[styles.messageButtonText, { color: colors.primary }]}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={handleCallSeller}
        >
          <LinearGradient
            colors={['#FFD700', '#E6C200', '#D4AF37']} // Gold gradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.callButtonGradient}
          >
            <FontAwesome name="phone" size={18} color="#111827" style={{ marginRight: 8 }} />
            <Text style={styles.callButtonText}>Call Seller</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: width * 0.7,
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: '100%',
  },
  imageDots: {
    position: 'absolute',
    bottom: 16,
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  infoContainer: {
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  carTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  carYear: {
    fontSize: 16,
    marginTop: 4,
  },
  carPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  quickInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  quickInfoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
  },
  sellerCard: {
    padding: 16,
    borderRadius: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  contactContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  messageButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  callButton: {
    flex: 2,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
  },
  callButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});

export default CarDetailsScreen;