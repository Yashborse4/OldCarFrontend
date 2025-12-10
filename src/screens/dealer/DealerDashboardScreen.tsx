import React, { useState, useEffect, useCallback } from 'react';
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
  Platform,
} from 'react-native';
import AntDesign from '@react-native-vector-icons/ant-design';
import MaterialIcons from '@react-native-vector-icons/material-icons';


// Import our custom components
import StatisticsCard, { StatisticData } from '../../components/dashboard/StatisticsCard';
import FilterSystem, { FilterOptions } from '../../components/dashboard/FilterSystem';
import CarListingsGrid, { CarListing } from '../../components/dashboard/CarListingsGrid';
import SimpleChart, { ChartDataPoint } from '../../components/dashboard/SimpleChart';
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

const DealerDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
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

  const loadDashboardData = useCallback(async () => {
    // Mock API calls - replace with real implementation
    try {
      // await fetchStatistics();
      // await fetchCarListings();
      // await fetchAnalytics();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, []);

  useEffect(() => {
    // Load initial data
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
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
    console.log('Delete car:', car.id);
  };

  const handleFeatureCar = (car: CarListing) => {
    console.log('Feature car:', car.id);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View>
        <Text style={[styles.greeting, { color: colors.text }]}>Dealer Dashboard</Text>
        <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>Manage your inventory & performance</Text>
      </View>
      <TouchableOpacity 
        style={[styles.profileButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.surface }]}
        onPress={() => navigation.navigate('Profile')}
      >
        <AntDesign name="user" size={scaleSize(20)} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderCharts = () => (
    <View style={styles.chartsContainer}>
      <View style={styles.chartRow}>
        <SimpleChart
          title="Sales Trend"
          data={salesTrendData}
          type="line"
          height={scaleSize(200)}
          width={wp(90)}
          showLegend
        />
      </View>
      
      <View style={styles.chartRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <SimpleChart
            title="Top Brands"
            data={topBrandsData}
            type="pie"
            height={scaleSize(200)}
            width={scaleSize(280)}
            showLegend
            style={{ marginRight: getResponsiveSpacing('md') }}
          />
          <SimpleChart
            title="Monthly Revenue (Lakhs)"
            data={monthlyRevenueData}
            type="bar"
            height={scaleSize(200)}
            width={scaleSize(280)}
          />
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {renderHeader()}
        
        <View style={styles.statsGrid}>
          {statisticsData.map((stat, index) => (
            <StatisticsCard
              key={index}
              data={stat}
              index={index}
              variant="gradient"
            />
          ))}
        </View>

        {renderCharts()}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Inventory Management</Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.viewOption,
                viewMode === 'grid' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setViewMode('grid')}
            >
              <MaterialIcons 
                name="grid-view" 
                size={scaleSize(20)} 
                color={viewMode === 'grid' ? '#FFFFFF' : colors.textSecondary} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewOption,
                viewMode === 'list' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setViewMode('list')}
            >
              <MaterialIcons 
                name="view-list" 
                size={scaleSize(20)} 
                color={viewMode === 'list' ? '#FFFFFF' : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <FilterSystem
          filters={filters}
          onFilterChange={handleFiltersChange}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />

        <CarListingsGrid
          listings={carListings}
          viewMode={viewMode}
          onPress={handleCarPress}
          onEdit={handleEditCar}
          onDelete={handleDeleteCar}
          onFeature={handleFeatureCar}
          isLoading={refreshing}
        />
      </ScrollView>
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddCar')}
      >
        <AntDesign name="plus" size={scaleSize(24)} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(10),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingTop: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  greeting: {
    fontSize: getResponsiveTypography('2xl'),
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: getResponsiveTypography('sm'),
    marginTop: scaleSize(4),
  },
  profileButton: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: getResponsiveBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',

  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
    justifyContent: 'space-between', // Changed to handle 2 columns properly
  },
  chartsContainer: {
    marginBottom: getResponsiveSpacing('xl'),
  },
  chartRow: {
    marginBottom: getResponsiveSpacing('lg'),
    paddingHorizontal: getResponsiveSpacing('lg'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  sectionTitle: {
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '700',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: getResponsiveBorderRadius('lg'),
    padding: scaleSize(4),
  },
  viewOption: {
    padding: scaleSize(8),
    borderRadius: getResponsiveBorderRadius('md'),
  },
  fab: {
    position: 'absolute',
    bottom: getResponsiveSpacing('xl'),
    right: getResponsiveSpacing('xl'),
    width: scaleSize(56),
    height: scaleSize(56),
    borderRadius: getResponsiveBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
 
  },
});

export default DealerDashboardScreen;
