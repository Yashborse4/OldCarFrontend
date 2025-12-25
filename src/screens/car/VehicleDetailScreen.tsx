import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';


const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
  route?: any;
}

const VEHICLE_DATA = {
  title: 'Tesla Model S Plaid',
  price: '?75,00,000',
  originalPrice: '?85,00,000',
  location: 'Mumbai, India',
  dealer: 'Premium Auto Cars',
  phone: '+91 9876543210',
  images: [
    'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  specs: [
    { icon: 'event', label: 'Year', value: '2023' },
    { icon: 'speed', label: 'Mileage', value: '1,200 km' },
    { icon: 'local-gas-station', label: 'Fuel', value: 'Electric' },
    { icon: 'settings', label: 'Transmission', value: 'Automatic' },
  ],
  overview: 'The Tesla Model S Plaid is the quickest accelerating car in production today. Perfect combination of performance, safety, and efficiency.',
  features: ['ABS with EBD', '6 Airbags', 'GPS Navigation', 'Climate Control', 'Parking Sensors', 'Reverse Camera'],
};

const VehicleDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const colors = {
    primary: '#FFD700',
    text: '#1A202C',
    color: '#4A5568',
    textSecondary: '#718096',
  };
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
          onPress: () => Alert.alert('Coming Soon', 'Messaging feature will be available soon.'),
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
      isBookmarked ? 'Removed from Saved' : 'Added to Saved',
      isBookmarked ? 'Vehicle removed from saved cars' : 'Vehicle saved successfully'
    );
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <Image source={{ uri: item }} style={styles.carouselImage} />
  );

  const renderSpecItem = ({ item }: { item: typeof VEHICLE_DATA.specs[0] }) => (
    <View style={styles.specItem}>
      <Ionicons name={item.icon as any} size={24} color={colors.primary} />
      <Text style={styles.specLabel}>{item.label}</Text>
      <Text style={styles.specValue}>{item.value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="default" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleBookmark}>
          <Ionicons 
            name={isBookmarked ? "favorite" : "favorite-border"} 
            size={24} 
            color={isBookmarked ? '#FF6B6B' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageSection}>
          <FlatList
            data={VEHICLE_DATA.images}
            renderItem={renderImageItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            style={styles.carousel}
          />
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

        {/* Vehicle Info */}
        <View style={styles.content}>
          <Card style={styles.mainCard}>
            <Text style={styles.title}>{VEHICLE_DATA.title}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{VEHICLE_DATA.price}</Text>
              <Text style={styles.originalPrice}>{VEHICLE_DATA.originalPrice}</Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text style={styles.location}>{VEHICLE_DATA.location}</Text>
            </View>
            <View style={styles.dealerRow}>
              <Ionicons name="storefront" size={16} color={colors.textSecondary} />
              <Text style={styles.dealer}>{VEHICLE_DATA.dealer}</Text>
            </View>
          </Card>

          {/* Specifications */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specsGrid}>
              {VEHICLE_DATA.specs.map((spec, index) => (
                <View key={index} style={styles.specItem}>
                  <Ionicons name={spec.icon as any} size={20} color={colors.primary} />
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Overview */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overview}>{VEHICLE_DATA.overview}</Text>
          </Card>

          {/* Features */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresGrid}>
              {VEHICLE_DATA.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title="Contact Seller"
          onPress={handleContactSeller}
          fullWidth
          icon="phone"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(250, 250, 250, 0.9)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    color: '#FFFFFF',
    elevation: 2,

  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    color: '#FFFFFF',
    elevation: 2,

  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    height: width * 0.7,
    position: 'relative',
  },
  carousel: {
    height: width * 0.7,
  },
  carouselImage: {
    width: width,
    height: width * 0.7,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  mainCard: {
    marginTop: -20,
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
  },
  originalPrice: {
    fontSize: 16,
    color: '#A0AEC0',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 4,
  },
  dealerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dealer: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 16,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specItem: {
    width: (width - 60) / 2 - 6,
    alignItems: 'center',
    padding: 16,
    color: '#F7FAFC',
    borderRadius: 12,
  },
  specLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginTop: 2,
  },
  overview: {
    fontSize: 14,
    lineHeight: 20,
    color: '#718096',
  },
  featuresGrid: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 8,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    color: '#FFFFFF',
    borderTopWidth: 1,
  },
});

export default VehicleDetailScreen;
