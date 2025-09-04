import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { useTheme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Vehicle, VehicleSearchFilters, carApi } from '../../services/CarApi';
import { VehicleCard } from '../../components/VehicleCard';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type SearchResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SearchResults'>;
type SearchResultsScreenRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;

interface SearchResultsScreenProps {}

const SearchResultsScreen: React.FC<SearchResultsScreenProps> = () => {
  const navigation = useNavigation<SearchResultsScreenNavigationProp>();
  const route = useRoute<SearchResultsScreenRouteProp>();
  const { colors, spacing } = useTheme();
  const { filters: initialFilters } = route.params as { filters: VehicleSearchFilters };

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<VehicleSearchFilters>(initialFilters || {});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter state
  const [tempFilters, setTempFilters] = useState<VehicleSearchFilters>(filters);

  useEffect(() => {
    searchVehicles(true);
  }, [filters, sortBy]);

  const searchVehicles = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(0);
      } else {
        setLoadingMore(true);
      }

      const searchFilters = {
        ...filters,
        page: reset ? 0 : currentPage + 1,
        size: 10,
        sort: sortBy,
      };

      const response = await carApi.searchVehicles(searchFilters);
      
      if (reset) {
        setVehicles(response.content);
        setCurrentPage(0);
      } else {
        setVehicles(prev => [...prev, ...response.content]);
        setCurrentPage(prev => prev + 1);
      }
      
      setTotalResults(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      Alert.alert('Search Error', 'Failed to search vehicles. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    searchVehicles(true);
  }, [filters, sortBy]);

  const handleLoadMore = () => {
    if (!loadingMore && currentPage < totalPages - 1) {
      searchVehicles(false);
    }
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const clearedFilters = { page: 0, size: 10 };
    setTempFilters(clearedFilters);
    setFilters(clearedFilters);
    setShowFilters(false);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <VehicleCard
      vehicle={item}
      onPress={() => navigation.navigate('VehicleDetail', { vehicleId: item.id })}
      showCoListButton={true}
      onCoList={() => navigation.navigate('CoListVehicle', { vehicleId: item.id })}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Search Results</Text>
        <Text style={styles.resultCount}>
          {totalResults} vehicle{totalResults !== 1 ? 's' : ''} found
        </Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <MaterialIcons name="filter-list" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSortOptions = () => (
    <View style={styles.sortContainer}>
      <Text style={styles.sortLabel}>Sort by:</Text>
      <TouchableOpacity
        style={[styles.sortButton, sortBy === 'relevance' && styles.activeSortButton]}
        onPress={() => handleSortChange('relevance')}
      >
        <Text style={[styles.sortText, sortBy === 'relevance' && styles.activeSortText]}>
          Relevance
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.sortButton, sortBy === 'price' && styles.activeSortButton]}
        onPress={() => handleSortChange('price')}
      >
        <Text style={[styles.sortText, sortBy === 'price' && styles.activeSortText]}>
          Price: Low to High
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.sortButton, sortBy === 'year' && styles.activeSortButton]}
        onPress={() => handleSortChange('year')}
      >
        <Text style={[styles.sortText, sortBy === 'year' && styles.activeSortText]}>
          Year: New to Old
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={styles.filterModal}>
        <View style={styles.filterHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.filterTitle}>Filters</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContent}>
          {/* Price Range */}
          <Card style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.priceRow}>
              <Input
                placeholder="Min Price"
                value={tempFilters.minPrice?.toString() || ''}
                onChangeText={(text) => setTempFilters(prev => ({
                  ...prev,
                  minPrice: text ? parseInt(text) : undefined
                }))}
                keyboardType="numeric"
                style={styles.priceInput}
              />
              <Text style={styles.toText}>to</Text>
              <Input
                placeholder="Max Price"
                value={tempFilters.maxPrice?.toString() || ''}
                onChangeText={(text) => setTempFilters(prev => ({
                  ...prev,
                  maxPrice: text ? parseInt(text) : undefined
                }))}
                keyboardType="numeric"
                style={styles.priceInput}
              />
            </View>
          </Card>

          {/* Make & Model */}
          <Card style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Vehicle</Text>
            <Input
              placeholder="Make (e.g., Toyota, Honda)"
              value={tempFilters.make || ''}
              onChangeText={(text) => setTempFilters(prev => ({ ...prev, make: text }))}
            />
            <Input
              placeholder="Model (e.g., Camry, Civic)"
              value={tempFilters.model || ''}
              onChangeText={(text) => setTempFilters(prev => ({ ...prev, model: text }))}
            />
          </Card>

          {/* Year Range */}
          <Card style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Year Range</Text>
            <View style={styles.priceRow}>
              <Input
                placeholder="From Year"
                value={tempFilters.minYear?.toString() || ''}
                onChangeText={(text) => setTempFilters(prev => ({
                  ...prev,
                  minYear: text ? parseInt(text) : undefined
                }))}
                keyboardType="numeric"
                style={styles.priceInput}
              />
              <Text style={styles.toText}>to</Text>
              <Input
                placeholder="To Year"
                value={tempFilters.maxYear?.toString() || ''}
                onChangeText={(text) => setTempFilters(prev => ({
                  ...prev,
                  maxYear: text ? parseInt(text) : undefined
                }))}
                keyboardType="numeric"
                style={styles.priceInput}
              />
            </View>
          </Card>

          {/* Location & Condition */}
          <Card style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Location & Condition</Text>
            <Input
              placeholder="Location"
              value={tempFilters.location || ''}
              onChangeText={(text) => setTempFilters(prev => ({ ...prev, location: text }))}
            />
            <Input
              placeholder="Condition (e.g., Excellent, Good)"
              value={tempFilters.condition || ''}
              onChangeText={(text) => setTempFilters(prev => ({ ...prev, condition: text }))}
            />
          </Card>

          {/* Featured Toggle */}
          <Card style={styles.filterSection}>
            <View style={styles.toggleRow}>
              <Text style={styles.filterSectionTitle}>Featured Only</Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  tempFilters.featured && styles.toggleActive
                ]}
                onPress={() => setTempFilters(prev => ({
                  ...prev,
                  featured: !prev.featured
                }))}
              >
                <View style={[
                  styles.toggleInner,
                  tempFilters.featured && styles.toggleInnerActive
                ]} />
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        <View style={styles.filterFooter}>
          <Button
            title="Apply Filters"
            onPress={applyFilters}
            variant="primary"
            style={styles.applyButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="search-off" size={80} color={colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>No vehicles found</Text>
      <Text style={styles.emptyStateText}>
        Try adjusting your search filters or search terms
      </Text>
      <Button
        title="Clear Filters"
        onPress={clearFilters}
        variant="outline"
        style={styles.clearFiltersButton}
      />
    </View>
  );

  const renderLoadingFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading more vehicles...</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching vehicles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSortOptions()}
      
      <FlatList
        data={vehicles}
        renderItem={renderVehicleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoadingFooter}
        showsVerticalScrollIndicator={false}
      />

      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  activeSortButton: {
    backgroundColor: '#4ECDC4',
  },
  sortText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeSortText: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  clearFiltersButton: {
    minWidth: 120,
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  filterModal: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  clearText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInput: {
    flex: 1,
  },
  toText: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#666',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4ECDC4',
  },
  toggleInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleInnerActive: {
    alignSelf: 'flex-end',
  },
  filterFooter: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  applyButton: {
    width: '100%',
  },
});

export default SearchResultsScreen;

