import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { PermissionGate, usePermissions } from '../../config/PermissionGate';
import { Permission } from '../../utils/permissions';
import { carApi, Vehicle } from '../../services/CarApi';
import { VehicleCard } from '../../config/VehicleCard';
import { RootStackParamList } from '../../navigation/types';


type CarListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VehicleDetail'>;

const CarListScreen: React.FC = () => {
  const navigation = useNavigation<CarListScreenNavigationProp>();
  const { user, isAuthenticated } = useAuth();
  const canCreateCars = usePermissions([Permission.CREATE_CAR]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(false);

  const PAGE_SIZE = 20;

  const fetchVehicles = useCallback(async (page = 0, refresh = false) => {
    try {
      if (page === 0) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await carApi.getPublicVehicles(page, PAGE_SIZE, 'createdAt,desc');
      const mappedContent = (response.content || []).map((item: any) => ({
        ...item,
        images: item.images ?? (item.imageUrl ? [item.imageUrl] : []),
        location: item.location ?? item.city ?? '',
        status: item.status ?? 'Available',
        featured: item.featured ?? false,
        views: item.views ?? 0,
        inquiries: item.inquiries ?? 0,
      }));
      if (refresh || page === 0) {
        setVehicles(mappedContent);
      } else {
        setVehicles(prev => [...prev, ...mappedContent]);
      }

      setCurrentPage(response.number || page);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setHasMorePages((response.number || page) < response.totalPages - 1);

    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
      setError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMoreVehicles = useCallback(() => {
    if (!loadingMore && hasMorePages) {
      fetchVehicles(currentPage + 1, false);
    }
  }, [currentPage, hasMorePages, loadingMore, fetchVehicles]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVehicles(0, true);
  }, [fetchVehicles]);

  const handleVehiclePress = useCallback((vehicle: Vehicle) => {
    // Track view
    carApi.trackVehicleView(vehicle.id).catch(console.error);

    // Navigate to details
    navigation.navigate('VehicleDetail', { vehicleId: vehicle.id });
  }, [navigation]);

  const handleCreateVehicle = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please login to create vehicle listings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    navigation.navigate('SellCar');
  }, [isAuthenticated, navigation]);

  const handleEditVehicle = useCallback((vehicle: Vehicle) => {
    navigation.navigate('VehicleDetail', { vehicleId: vehicle.id });
  }, [navigation]);

  const handleDeleteVehicle = useCallback(async (vehicle: Vehicle) => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle listing? ',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await carApi.deleteVehicle(vehicle.id, false);
              // Refresh the list
              onRefresh();
              Alert.alert('Success', 'Vehicle deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete vehicle');
            }
          },
        },
      ]
    );
  }, [onRefresh]);

  const renderVehicleItem = useCallback(({ item }: { item: Vehicle }) => (
    <VehicleCard
      vehicle={item}
      onPress={() => handleVehiclePress(item)}
    />
  ), [handleVehiclePress]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  }, [loadingMore]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Vehicles Found</Text>
      <Text style={styles.emptyMessage}>
        {isAuthenticated
          ? "There are no vehicles listed yet. Be the first to list your car!"
          : "There are no vehicles listed yet."
        }
      </Text>
      <PermissionGate permission={Permission.CREATE_CAR}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateVehicle}>
          <Text style={styles.createButtonText}>List Your Car</Text>
        </TouchableOpacity>
      </PermissionGate>
    </View>
  ), [isAuthenticated, handleCreateVehicle]);

  const retryFetch = useCallback(() => {
    setError(null);
    fetchVehicles(0, true);
  }, [fetchVehicles]);

  useEffect(() => {
    fetchVehicles(0, false);
  }, [fetchVehicles]);

  if (loading && vehicles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading vehicles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vehicles</Text>
        <PermissionGate permission={Permission.CREATE_CAR}>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateVehicle}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </PermissionGate>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to load vehicles</Text>
          <Text style={styles.errorMessage}>
            {error.message || 'Something went wrong. Please try again.'}
          </Text>
          <TouchableOpacity style={styles.errorRetryButton} onPress={retryFetch}>
            <Text style={styles.errorRetryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Vehicle List */}
      <FlatList
        data={vehicles}
        renderItem={renderVehicleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMoreVehicles}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmpty : null}
        showsVerticalScrollIndicator={false}
      />

      {/* Statistics */}
      {vehicles.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Showing {vehicles.length} of {totalElements} vehicles
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666666',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB3B3',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B00020',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: '#B00020',
    marginBottom: 8,
  },
  errorRetryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#B00020',
    borderRadius: 4,
  },
  errorRetryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default CarListScreen;
