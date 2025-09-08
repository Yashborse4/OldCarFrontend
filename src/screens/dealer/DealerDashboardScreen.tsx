import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../../theme';
import * as Animatable from 'react-native-animatable';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';

// Import our custom components
import StatisticsCard, { StatisticData } from '../../components/dashboard/StatisticsCard';
import FilterSystem, { FilterOptions } from '../../components/dashboard/FilterSystem';
import CarListingsGrid, { CarListing } from '../../components/dashboard/CarListingsGrid';
import SimpleChart, { ChartDataPoint } from '../../components/dashboard/SimpleChart';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const DealerDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, spacing, borderRadius, shadows, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');

  // Dashboard state
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    search: '',
    brand: 'All Brands',
    priceRange: { min: 0, max: 10000000 },
    year: { min: 2000, max: 2024 },
    fuelType: 'All',
    transmission: 'All',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Mock data - replace with real API calls
  const [statisticsData, setStatisticsData] = useState<StatisticData[]>([
    {
      title: 'Total Listings',
      value: 47,
      subtitle: 'Active listings',
      trend: { value: 12, isPositive: true, period: 'vs last month' },
      icon: 'car',
      gradient: ['#667eea', '#764ba2'],
    },
    {
      title: 'Cars Sold',
      value: 23,
      subtitle: 'This month',
      trend: { value: 8, isPositive: true, period: 'vs last month' },
      icon: 'heart',
      iconType: 'AntDesign',
      gradient: ['#f093fb', '#f5576c'],
    },
    {
      title: 'Total Revenue',
      value: '₹2.4Cr',
      subtitle: 'This month',
      trend: { value: 15, isPositive: true, period: 'vs last month' },
      icon: 'wallet',
      gradient: ['#4facfe', '#00f2fe'],
    },
    {
      title: 'Active Views',
      value: '1,247',
      subtitle: 'Total views',
      trend: { value: 22, isPositive: true, period: 'vs last month' },
      icon: 'eye',
      gradient: ['#43e97b', '#38f9d7'],
    },
    {
      title: 'Inquiries',
      value: 89,
      subtitle: 'Pending responses',
      trend: { value: 5, isPositive: false, period: 'vs last week' },
      icon: 'message1',
      gradient: ['#fa709a', '#fee140'],
    },
    {
      title: 'Avg. Price',
      value: '₹8.5L',
      subtitle: 'Per vehicle',
      trend: { value: 3, isPositive: true, period: 'vs last month' },
      icon: 'calculator',
      iconType: 'AntDesign',
      gradient: ['#a8edea', '#fed6e3'],
    },
  ]);

  const [carListings, setCarListings] = useState<CarListing[]>([
    {
      id: '1',
      title: 'Maruti Swift VXI',
      brand: 'Maruti Suzuki',
      model: 'Swift',
      year: 2020,
      price: 650000,
      originalPrice: 720000,
      currency: '₹',
      images: ['https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=400'],
      status: 'active',
      specifications: {
        fuelType: 'Petrol',
        transmission: 'Manual',
        kmDriven: 45000,
        owners: 1,
        location: 'Mumbai',
      },
      views: 234,
      likes: 12,
      inquiries: 8,
      dateAdded: '2024-01-15',
      featured: true,
      verified: true,
    },
    {
      id: '2',
      title: 'Honda City ZX',
      brand: 'Honda',
      model: 'City',
      year: 2019,
      price: 850000,
      originalPrice: 950000,
      currency: '₹',
      images: ['https://images.pexels.com/photos/170782/pexels-photo-170782.jpeg?auto=compress&w=400'],
      status: 'active',
      specifications: {
        fuelType: 'Petrol',
        transmission: 'Automatic',
        kmDriven: 32000,
        owners: 1,
        location: 'Pune',
      },
      views: 189,
      likes: 15,
      inquiries: 12,
      dateAdded: '2024-01-10',
      featured: false,
      verified: true,
    },
    {
      id: '3',
      title: 'Hyundai Creta SX',
      brand: 'Hyundai',
      model: 'Creta',
      year: 2018,
      price: 1200000,
      originalPrice: 1350000,
      currency: '₹',
      images: ['https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=400'],
      status: 'sold',
      specifications: {
        fuelType: 'Diesel',
        transmission: 'Manual',
        kmDriven: 68000,
        owners: 2,
        location: 'Delhi',
      },
      views: 456,
      likes: 28,
      inquiries: 25,
      dateAdded: '2024-01-05',
      featured: true,
      verified: false,
    },
    {
      id: '4',
      title: 'Toyota Innova Crysta',
      brand: 'Toyota',
      model: 'Innova',
      year: 2017,
      price: 1800000,
      currency: '₹',
      images: ['https://images.pexels.com/photos/170782/pexels-photo-170782.jpeg?auto=compress&w=400'],
      status: 'expired',
      specifications: {
        fuelType: 'Diesel',
        transmission: 'Manual',
        kmDriven: 89000,
        owners: 1,
        location: 'Bangalore',
      },
      views: 123,
      likes: 7,
      inquiries: 3,
      dateAdded: '2023-12-20',
      featured: false,
      verified: true,
    },
  ]);

  // Chart data
  const salesTrendData: ChartDataPoint[] = [
    { label: 'Jan', value: 15 },
    { label: 'Feb', value: 22 },
    { label: 'Mar', value: 18 },
    { label: 'Apr', value: 28 },
    { label: 'May', value: 25 },
    { label: 'Jun', value: 32 },
  ];

  const topBrandsData: ChartDataPoint[] = [
    { label: 'Maruti', value: 45, color: '#FF6B6B' },
    { label: 'Honda', value: 35, color: '#4ECDC4' },
    { label: 'Hyundai', value: 28, color: '#45B7D1' },
    { label: 'Toyota', value: 22, color: '#96CEB4' },
    { label: 'Others', value: 18, color: '#FFEAA7' },
  ];

  const monthlyRevenueData: ChartDataPoint[] = [
    { label: 'Jan', value: 185 },
    { label: 'Feb', value: 220 },
    { label: 'Mar', value: 198 },
    { label: 'Apr', value: 245 },
    { label: 'May', value: 267 },
    { label: 'Jun', value: 290 },
  ];

  useEffect(() => {
    // Load initial data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Mock API calls - replace with real implementation
    try {
      // await fetchStatistics();
      // await fetchCarListings();
      // await fetchAnalytics();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    // Apply filters to car listings
    // applyFiltersToListings(newFilters);
  };

  const handleApplyFilters = () => {
    // Apply current filters
    console.log('Applying filters:', filters);
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      brand: 'All Brands',
      priceRange: { min: 0, max: 10000000 },
      year: { min: 2000, max: 2024 },
      fuelType: 'All',
      transmission: 'All',
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  const handleCarPress = (car: CarListing) => {
    navigation.navigate('CarDetails', { carId: car.id });
  };

  const handleEditCar = (car: CarListing) => {
    navigation.navigate('EditCar', { carId: car.id });
  };

  const handleDeleteCar = (car: CarListing) => {
    // Remove car from listings
    setCarListings(prev => prev.filter(item => item.id !== car.id));
    Alert.alert('Success', 'Car listing deleted successfully');
  };

  const handleToggleStatus = (car: CarListing) => {
    // Toggle car status
    const newStatus = car.status === 'active' ? 'expired' : 'active';
    setCarListings(prev =>
      prev.map(item =>
        item.id === car.id ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleToggleFeatured = (car: CarListing) => {
    // Toggle featured status
    setCarListings(prev =>
      prev.map(item =>
        item.id === car.id ? { ...item, featured: !item.featured } : item
      )
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={isDark ? ['#1a1a1a', '#2d2d2d'] : ['#667eea', '#764ba2']}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.dealerName}>AutoDealer Pro</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialIcons name="notifications" size={20} color="#FFFFFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <MaterialIcons name="settings" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: themeColors.surface }, shadows.sm]}
          onPress={() => navigation.navigate('AddCar')}
        >
          <LinearGradient
            colors={['#4facfe', '0x00f2fe']}
            style={styles.quickActionIcon}
          >
            <AntDesign name="plus" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.quickActionText, { color: themeColors.text }]}>Add New Car</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: themeColors.surface }, shadows.sm]}
          onPress={() => navigation.navigate('ManageCars')}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.quickActionIcon}
          >
            <AntDesign name="edit" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.quickActionText, { color: themeColors.text }]}>Manage Cars</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: themeColors.surface }, shadows.sm]}
          onPress={() => navigation.navigate('Analytics')}
        >
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.quickActionIcon}
          >
            <MaterialIcons name="analytics" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.quickActionText, { color: themeColors.text }]}>View Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: themeColors.surface }, shadows.sm]}
          onPress={() => navigation.navigate('Inquiries')}
        >
          <LinearGradient
            colors={['#43e97b', '#38f9d7']}
            style={styles.quickActionIcon}
          >
            <AntDesign name="message" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.quickActionText, { color: themeColors.text }]}>Inquiries</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatistics = () => (
    <View style={styles.statisticsContainer}>
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Dashboard Overview</Text>
      <View style={styles.statisticsGrid}>
        {statisticsData.map((stat, index) => (
          <StatisticsCard
            key={index}
            data={stat}
            index={index}
            variant="gradient"
          />
        ))}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Performance Analytics</Text>
      
      <SimpleChart
        data={salesTrendData}
        type="line"
        title="Sales Trend"
        subtitle="Cars sold per month"
        height={180}
      />

      <SimpleChart
        data={topBrandsData}
        type="pie"
        title="Top Performing Brands"
        subtitle="Distribution of sales by brand"
        height={220}
      />

      <SimpleChart
        data={monthlyRevenueData}
        type="bar"
        title="Monthly Revenue"
        subtitle="Revenue in lakhs (₹)"
        height={180}
      />
    </View>
  );

  const renderListingsSection = () => (
    <View style={styles.listingsContainer}>
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Your Car Listings</Text>
      
      <FilterSystem
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        totalResults={carListings.length}
      />

      <CarListingsGrid
        listings={carListings}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCarPress={handleCarPress}
        onEditCar={handleEditCar}
        onDeleteCar={handleDeleteCar}
        onToggleStatus={handleToggleStatus}
        onToggleFeatured={handleToggleFeatured}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    headerGradient: {
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    welcomeText: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.8)',
      fontWeight: '500',
    },
    dealerName: {
      fontSize: 24,
      color: '#FFFFFF',
      fontWeight: '700',
      marginTop: 4,
    },
    headerActions: {
      flexDirection: 'row',
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 12,
      position: 'relative',
    },
    notificationBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: '#FF3B30',
      width: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
    },
    scrollContent: {
      paddingBottom: 100,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    quickActionsContainer: {
      marginTop: 20,
      marginBottom: 24,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
    quickActionCard: {
      width: (width - 48) / 2,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
    statisticsContainer: {
      marginBottom: 24,
    },
    statisticsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
    analyticsContainer: {
      marginBottom: 24,
      paddingHorizontal: 16,
    },
    listingsContainer: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'light-content'}
      />
      
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
          />
        }
      >
        {renderQuickActions()}
        {renderStatistics()}
        {renderAnalytics()}
        {renderListingsSection()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DealerDashboardScreen;



