import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Modal,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

interface Props {
  navigation: any;
}

const QUICK_ACTIONS = [
  { icon: 'directions-car', label: 'Sell Car', route: 'SellCar' },
  { icon: 'search', label: 'Buy Used', route: 'BrowseCars' },
  { icon: 'calculate', label: 'Valuation', route: 'Valuation' },
  { icon: 'account-balance', label: 'Finance', route: 'Finance' },
];

const FEATURED_CARS = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=400',
    title: 'Maruti Swift VXI',
    price: 'â‚¹4,50,000',
    location: 'Nashik',
    year: 2018,
    km: '45,000',
    fuel: 'Petrol',
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/170782/pexels-photo-170782.jpeg?auto=compress&w=400',
    title: 'Hyundai i20 Sportz',
    price: 'â‚¹5,80,000',
    location: 'Mumbai',
    year: 2019,
    km: '32,000',
    fuel: 'Diesel',
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=400',
    title: 'Honda City ZX',
    price: 'â‚¹7,20,000',
    location: 'Pune',
    year: 2017,
    km: '60,000',
    fuel: 'Petrol',
  },
];

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors: themeColors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Nashik');

  const handleComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature is under development.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => navigation.replace('Login'),
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const renderQuickAction = (item: typeof QUICK_ACTIONS[0], index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.quickActionCard}
      onPress={() => {
        if (item.route) {
          navigation.navigate(item.route);
        } else {
          handleComingSoon();
        }
      }}
    >
      <MaterialIcons name={item.icon as any} size={24} color={themeColors.primary} />
      <Text style={styles.quickActionLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderCarCard = (item: typeof FEATURED_CARS[0]) => (
    <Card key={item.id} style={styles.carCard} onPress={() => navigation.navigate('VehicleDetail', { carId: item.id })}>
      <Image source={{ uri: item.image }} style={styles.carImage} />
      <View style={styles.carContent}>
        <Text style={styles.carTitle}>{item.title}</Text>
        <Text style={styles.carPrice}>{item.price}</Text>
        <View style={styles.carMeta}>
          <Text style={styles.carMetaText}>{item.year} â€¢ {item.km} km â€¢ {item.fuel}</Text>
          <Text style={styles.carLocation}>{item.location}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="default" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning! ðŸ‘‹</Text>
          <TouchableOpacity style={styles.locationButton}>
            <MaterialIcons name="location-on" size={16} color={themeColors.textSecondary} />
            <Text style={styles.locationText}>{selectedCity}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
          <MaterialIcons name="account-circle" size={32} color={themeColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <Input
            placeholder="Search cars, brands..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search"
            containerStyle={styles.searchInput}
          />
        </View>

        {/* Hero Banner */}
        <Card style={styles.heroCard}>
          <LinearGradient
            colors={['#FFD700', '#F7931E']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Find Your Dream Car</Text>
              <Text style={styles.heroSubtitle}>Browse thousands of verified cars</Text>
              <Button
                title="Browse Cars"
                variant="secondary"
                size="sm"
                onPress={() => navigation.navigate('BrowseCars')}
                style={styles.heroButton}
              />
            </View>
            <MaterialIcons name="directions-car" size={64} color="rgba(26, 32, 44, 0.2)" />
          </LinearGradient>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map(renderQuickAction)}
          </View>
        </View>

        {/* Featured Cars */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Cars</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BrowseCars')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carsList}>
            {FEATURED_CARS.map(renderCarCard)}
          </ScrollView>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          <Button
            title="Sell Your Car"
            onPress={() => navigation.navigate('SellCar')}
            fullWidth
            style={styles.sellButton}
          />
          <Button
            title="Settings"
            variant="outline"
            onPress={() => navigation.navigate('Settings')}
            fullWidth
            style={styles.settingsButton}
          />
          <Button
            title="Logout"
            variant="danger"
            onPress={handleLogout}
            fullWidth
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  profileButton: {
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    marginBottom: 0,
  },
  heroCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  heroGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 120,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#2D3748',
    marginBottom: 16,
  },
  heroButton: {
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4A5568',
    textAlign: 'center',
  },
  carsList: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  carCard: {
    width: 240,
    marginRight: 16,
    padding: 0,
  },
  carImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  carContent: {
    padding: 12,
  },
  carTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 8,
  },
  carMeta: {
    gap: 4,
  },
  carMetaText: {
    fontSize: 12,
    color: '#718096',
  },
  carLocation: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  bottomSection: {
    gap: 12,
    paddingBottom: 32,
  },
  sellButton: {
    marginBottom: 0,
  },
  settingsButton: {
    marginBottom: 0,
  },
  logoutButton: {
    marginBottom: 0,
  },
});

export default DashboardScreen;
