import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
  RefreshControl,
  Image,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import AntDesign from '@react-native-vector-icons/ant-design';


const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
  route?: any;
}

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: string;
  originalPrice?: string;
  images: string[];
  location: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  owners: number;
  features: string[];
  description: string;
  status: 'active' | 'inactive' | 'sold' | 'draft';
  views: number;
  inquiries: number;
  createdAt: string;
  updatedAt: string;
  isPromoted: boolean;
  isFeatured: boolean;
}

// Mock data
const MOCK_USER_CARS: Car[] = [
  {
    id: '1',
    title: 'Maruti Swift VXI',
    brand: 'Maruti',
    model: 'Swift',
    year: 2020,
    price: '₹6,50,000',
    originalPrice: '₹7,20,000',
    images: [
      'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=400',
      'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&w=400',
    ],
    location: 'Mumbai, Maharashtra',
    mileage: '45,000 km',
    fuelType: 'Petrol',
    transmission: 'Manual',
    bodyType: 'Hatchback',
    color: 'White',
    owners: 1,
    features: ['ABS', 'Airbags', 'Power Steering', 'AC'],
    description: 'Well maintained car with full service history.',
    status: 'active',
    views: 245,
    inquiries: 12,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    isPromoted: true,
    isFeatured: false,
  },
  {
    id: '2',
    title: 'Honda City ZX',
    brand: 'Honda',
    model: 'City',
    year: 2019,
    price: '₹9,80,000',
    images: [
      'https://images.pexels.com/photos/170782/pexels-photo-170782.jpeg?auto=compress&w=400',
    ],
    location: 'Pune, Maharashtra',
    mileage: '32,000 km',
    fuelType: 'Petrol',
    transmission: 'CVT',
    bodyType: 'Sedan',
    color: 'Silver',
    owners: 1,
    features: ['ABS', 'Airbags', 'Sunroof', 'Alloy Wheels'],
    description: 'Excellent condition with premium features.',
    status: 'inactive',
    views: 189,
    inquiries: 8,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    isPromoted: false,
    isFeatured: true,
  },
  {
    id: '3',
    title: 'Hyundai Creta SX',
    brand: 'Hyundai',
    model: 'Creta',
    year: 2021,
    price: '₹14,50,000',
    images: [
      'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&w=400',
    ],
    location: 'Delhi, NCR',
    mileage: '18,000 km',
    fuelType: 'Diesel',
    transmission: 'Manual',
    bodyType: 'SUV',
    color: 'Red',
    owners: 1,
    features: ['ABS', 'Airbags', 'Sunroof', 'Touchscreen'],
    description: 'Like new condition with warranty remaining.',
    status: 'sold',
    views: 356,
    inquiries: 28,
    createdAt: '2023-12-01',
    updatedAt: '2024-01-25',
    isPromoted: false,
    isFeatured: false,
  },
];

// Mock API functions
const fetchUserCars = async (): Promise<Car[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_USER_CARS), 1000);
  });
};

const updateCarStatus = async (carId: string, status: Car['status']) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 800);
  });
};

const deleteCar = async (carId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 600);
  });
};

import { useTheme } from '../../theme/ThemeContext';

const MyGarageScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'sold' | 'draft'>('all');
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'views' | 'inquiries'>('date');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const loadCars = useCallback(async () => {
    try {
      const userCars = await fetchUserCars();
      setCars(userCars);
    } catch (error) {
      Alert.alert('Error', 'Failed to load cars');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCars();
    setRefreshing(false);
  };

  const handleCarAction = (car: Car, action: string) => {
    switch (action) {
      case 'edit':
        navigation.navigate('EditCar', { carId: car.id });
        break;
      case 'view':
        navigation.navigate('VehicleDetail', { carId: car.id });
        break;
      case 'manage':
        navigation.navigate('ManageCar', { car });
        break;
      case 'promote':
        Alert.alert('Promote Car', 'Would you like to promote this car for better visibility?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Promote', onPress: () => handlePromoteCar(car.id) },
        ]);
        break;
      case 'duplicate':
        Alert.alert('Duplicate Listing', 'Create a copy of this listing?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Duplicate', onPress: () => handleDuplicateCar(car.id) },
        ]);
        break;
      default:
        break;
    }
  };

  const handleStatusChange = async (carId: string, newStatus: Car['status']) => {
    try {
      await updateCarStatus(carId, newStatus);
      setCars(prev => prev.map(car => 
        car.id === carId ? { ...car, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : car
      ));
      Alert.alert('Success', `Car status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update car status');
    }
  };

  const handleDeleteCar = (carId: string) => {
    Alert.alert(
      'Delete Car',
      'Are you sure you want to delete this car listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCar(carId);
              setCars(prev => prev.filter(car => car.id !== carId));
              Alert.alert('Success', 'Car deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete car');
            }
          },
        },
      ]
    );
  };

  const handlePromoteCar = async (carId: string) => {
    // Mock promote functionality
    setCars(prev => prev.map(car => 
      car.id === carId ? { ...car, isPromoted: true } : car
    ));
    Alert.alert('Success', 'Your car has been promoted for better visibility!');
  };

  const handleDuplicateCar = async (carId: string) => {
    const carToDuplicate = cars.find(car => car.id === carId);
    if (carToDuplicate) {
      const duplicatedCar: Car = {
        ...carToDuplicate,
        id: Date.now().toString(),
        title: `${carToDuplicate.title} (Copy)`,
        status: 'draft',
        views: 0,
        inquiries: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        isPromoted: false,
        isFeatured: false,
      };
      setCars(prev => [duplicatedCar, ...prev]);
      Alert.alert('Success', 'Car listing duplicated successfully');
    }
  };

  const getFilteredAndSortedCars = () => {
    let filtered = cars;

    // Apply filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(car => car.status === selectedFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(car => 
        car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'price':
          return parseInt(b.price.replace(/[₹,]/g, '')) - parseInt(a.price.replace(/[₹,]/g, ''));
        case 'views':
          return b.views - a.views;
        case 'inquiries':
          return b.inquiries - a.inquiries;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getStatusColor = (status: Car['status']) => {
    switch (status) {
      case 'active': return colors.success;
      case 'inactive': return colors.warning;
      case 'sold': return colors.error;
      case 'draft': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: Car['status']) => {
    switch (status) {
      case 'active': return 'check-circle';
      case 'inactive': return 'pause-circle';
      case 'sold': return 'check-circle-outline';
      case 'draft': return 'edit';
      default: return 'help';
    }
  };

  const filteredCars = getFilteredAndSortedCars();
  const totalStats = {
    total: cars.length,
    active: cars.filter(c => c.status === 'active').length,
    inactive: cars.filter(c => c.status === 'inactive').length,
    sold: cars.filter(c => c.status === 'sold').length,
    totalViews: cars.reduce((sum, car) => sum + car.views, 0),
    totalInquiries: cars.reduce((sum, car) => sum + car.inquiries, 0),
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerButton: {
      marginLeft: 12,
      padding: 8,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    statsContainer: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      padding: 16,
      elevation: 2,

    },
    statsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
      width: '48%',
      marginBottom: 12,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    filtersContainer: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 12,
      padding: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 8,
      paddingLeft: 8,
      color: colors.text,
      fontSize: 14,
    },
    filtersRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    filterButtons: {
      flexDirection: 'row',
      flex: 1,
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    filterButtonActive: {
      backgroundColor: colors.primary
    },
    filterButtonText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    filterButtonTextActive: {
      color: '#111827',
      fontWeight: '700',
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    sortButtonText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginRight: 4,
    },
    carsList: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    carCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginBottom: 12,
      elevation: 3,

      overflow: 'hidden',
    },
    carImageContainer: {
      position: 'relative',
      height: 180,
    },
    carImage: {
      width: '100%',
      height: '100%',
    },
    statusBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
      textTransform: 'capitalize',
    },
    promotedBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.primary
    },
    promotedText: {
      color: '#111827',
      fontSize: 10,
      fontWeight: '700',
    },
    carContent: {
      padding: 16,
    },
    carHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    carTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: 12,
    },
    carPrice: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary
    },
    carDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    carDetailText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginRight: 12,
    },
    carStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    carStat: {
      alignItems: 'center',
    },
    carStatValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text
    },
    carStatLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    carActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginHorizontal: 2,
    },
    ActionButton: {
      backgroundColor: colors.primary
    },
    secondaryActionButton: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      borderWidth: 1,
      borderColor: colors.border
    },
    dangerActionButton: {
      backgroundColor: colors.error
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    ActionText: {
      color: '#111827',
    },
    secondaryActionText: {
      color: colors.textSecondary
    },
    dangerActionText: {
      color: '#FFFFFF',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    addCarButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
    },
    addCarButtonText: {
      color: '#111827',
      fontSize: 14,
      fontWeight: '700',
      marginLeft: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      width: width * 0.8,
      maxHeight: height * 0.6,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      marginBottom: 8,
    },
    modalOptionActive: {
      backgroundColor: colors.primary
    },
    modalOptionText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
      flex: 1,
    },
    modalOptionTextActive: {
      color: '#111827',
      fontWeight: '600',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    modalButtonPrimary: {
      backgroundColor: colors.primary
    },
    modalButtonSecondary: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      borderWidth: 1,
      borderColor: colors.border
    },
    modalButtonText: {
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '600',
    },
    modalButtonTextPrimary: {
      color: '#111827',
    },
    modalButtonTextSecondary: {
      color: colors.textSecondary
    },
  });

  // Sort Modal Component
  const SortModal = () => (
    <Modal visible={showSortModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animatable.View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sort by</Text>
          {[
            { key: 'date', label: 'Last Updated', icon: 'access-time' },
            { key: 'price', label: 'Price', icon: 'attach-money' },
            { key: 'views', label: 'Views', icon: 'visibility' },
            { key: 'inquiries', label: 'Inquiries', icon: 'message' },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.modalOption,
                sortBy === option.key && styles.modalOptionActive,
              ]}
              onPress={() => setSortBy(option.key as any)}
            >
              <MaterialIcons
                name={option.icon as any}
                size={20}
                color={sortBy === option.key ? '#111827' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.modalOptionText,
                  sortBy === option.key && styles.modalOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
              {sortBy === option.key && (
                <MaterialIcons name="check" size={20} color="#111827" />
              )}
            </TouchableOpacity>
          ))}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setShowSortModal(false)}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={() => setShowSortModal(false)}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialIcons name="refresh" size={48} color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Loading your cars...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <SortModal />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Garage</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('SellCar')}
          >
            <AntDesign name="plus" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Your Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalStats.total}</Text>
              <Text style={styles.statLabel}>Total Cars</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalStats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalStats.totalViews}</Text>
              <Text style={styles.statLabel}>Total Views</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalStats.totalInquiries}</Text>
              <Text style={styles.statLabel}>Inquiries</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <AntDesign name="search" size={16} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your cars..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.filtersRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtons}>
              {[
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'inactive', label: 'Inactive' },
                { key: 'sold', label: 'Sold' },
                { key: 'draft', label: 'Draft' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter.key && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedFilter(filter.key as any)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedFilter === filter.key && styles.filterButtonTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
              <Text style={styles.sortButtonText}>Sort</Text>
              <AntDesign name="filter" size={12} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cars List */}
        {filteredCars.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons 
              name="directions-car" 
              size={64} 
              color={colors.textSecondary} 
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? 'No cars found' : 'No cars yet'}
            </Text>
            <Text style={styles.emptyMessage}>
              {searchQuery.trim() 
                ? `No cars match "${searchQuery}". Try adjusting your search.`
                : 'Start by adding your first car to get more visibility and potential buyers.'
              }
            </Text>
            {!searchQuery.trim() && (
              <TouchableOpacity 
                style={styles.addCarButton}
                onPress={() => navigation.navigate('SellCar')}
              >
                <AntDesign name="plus" size={16} color="#111827" />
                <Text style={styles.addCarButtonText}>Add Your First Car</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.carsList}>
            {filteredCars.map((car) => (
              <Animatable.View 
                key={car.id} 
                
               
                style={styles.carCard}
              >
                <View style={styles.carImageContainer}>
                  <Image source={{ uri: car.images[0] }} style={styles.carImage} />
                  
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(car.status) + '20' }]}>
                    <MaterialIcons 
                      name={getStatusIcon(car.status) as any} 
                      size={12} 
                      color={getStatusColor(car.status)} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(car.status) }]}>
                      {car.status}
                    </Text>
                  </View>
                  
                  {car.isPromoted && (
                    <View style={styles.promotedBadge}>
                      <Text style={styles.promotedText}>PROMOTED</Text>
                    </View>
                  )}
                </View>

                <View style={styles.carContent}>
                  <View style={styles.carHeader}>
                    <Text style={styles.carTitle}>{car.title}</Text>
                    <Text style={styles.carPrice}>{car.price}</Text>
                  </View>

                  <View style={styles.carDetails}>
                    <Text style={styles.carDetailText}>{car.year}</Text>
                    <Text style={styles.carDetailText}>{car.mileage}</Text>
                    <Text style={styles.carDetailText}>{car.fuelType}</Text>
                    <Text style={styles.carDetailText}>{car.location}</Text>
                  </View>

                  <View style={styles.carStats}>
                    <View style={styles.carStat}>
                      <Text style={styles.carStatValue}>{car.views}</Text>
                      <Text style={styles.carStatLabel}>Views</Text>
                    </View>
                    <View style={styles.carStat}>
                      <Text style={styles.carStatValue}>{car.inquiries}</Text>
                      <Text style={styles.carStatLabel}>Inquiries</Text>
                    </View>
                    <View style={styles.carStat}>
                      <Text style={styles.carStatValue}>{car.updatedAt}</Text>
                      <Text style={styles.carStatLabel}>Updated</Text>
                    </View>
                  </View>

                  <View style={styles.carActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.ActionButton]}
                      onPress={() => handleCarAction(car, 'manage')}
                    >
                      <MaterialIcons name="settings" size={14} color="#111827" />
                      <Text style={[styles.actionButtonText, styles.ActionText]}>
                        Manage
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.secondaryActionButton]}
                      onPress={() => handleCarAction(car, 'edit')}
                    >
                      <MaterialIcons name="edit" size={14} color={colors.textSecondary} />
                      <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.secondaryActionButton]}
                      onPress={() => handleCarAction(car, 'view')}
                    >
                      <MaterialIcons name="visibility" size={14} color={colors.textSecondary} />
                      <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
                        View
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animatable.View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyGarageScreen;


