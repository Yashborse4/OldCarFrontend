import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { VehicleSearchNavigationProp, Vehicle } from '../../navigation/types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { VehicleCard } from '../../config/VehicleCard';
import { carApi } from '../../services/CarApi';

const { width } = Dimensions.get('window');

interface SearchFilters {
  searchText: string;
  make: string[];
  model: string[];
  yearMin: string;
  yearMax: string;
  priceMin: string;
  priceMax: string;
  mileageMax: string;
  location: string[];
  condition: string[];
  fuelType: string[];
  transmission: string[];
  sortBy: 'price-low' | 'price-high' | 'year-new' | 'year-old' | 'mileage-low' | 'mileage-high' | 'relevance';
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
  resultCount: number;
}

interface QuickFilter {
  id: string;
  label: string;
  filter: Partial<SearchFilters>;
  icon: string;
}

const VehicleSearchScreen: React.FC = () => {
  const navigation = useNavigation<VehicleSearchNavigationProp>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    searchText: '',
    make: [],
    model: [],
    yearMin: '',
    yearMax: '',
    priceMin: '',
    priceMax: '',
    mileageMax: '',
    location: [],
    condition: [],
    fuelType: [],
    transmission: [],
    sortBy: 'price-low',
  });
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(['BMW X5', 'Tesla Model 3', 'Mercedes S-Class']);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const colors = {
    background: '#FAFBFC',
    surface: '#FFFFFF',
    text: '#1A202C',
    textSecondary: '#4A5568',
    primary: '#FFD700',
    border: '#E2E8F0',
  };
  const spacing = { sm: 8, md: 16, lg: 24, xl: 32 };

  // Mock data - replace with API calls later
  const mockVehiclesMemo = React.useMemo<Vehicle[]>(() => [
    {
      id: '1',
      make: 'BMW',
      model: 'X5',
      year: 2023,
      price: 75000,
      mileage: 15000,
      location: 'New York',
      condition: 'Excellent',
      images: ['https://example.com/bmw1.jpg'],
      specifications: { engine: '3.0L Twin Turbo', transmission: 'Automatic', fuelType: 'Gasoline' },
      dealerId: 'dealer2',
      dealerName: 'Elite Cars',
      isCoListed: true,
      coListedIn: ['group1'],
      views: 234,
      inquiries: 12,
      shares: 8,
    },
    {
      id: '2',
      make: 'Mercedes-Benz',
      model: 'S-Class',
      year: 2024,
      price: 95000,
      mileage: 5000,
      location: 'Los Angeles',
      condition: 'Like New',
      images: ['https://example.com/merc1.jpg'],
      specifications: { engine: '4.0L V8 Biturbo', transmission: 'Automatic', fuelType: 'Gasoline' },
      dealerId: 'dealer3',
      dealerName: 'Luxury Auto Group',
      isCoListed: true,
      coListedIn: ['group1'],
      views: 456,
      inquiries: 23,
      shares: 15,
    },
    {
      id: '3',
      make: 'Audi',
      model: 'A4',
      year: 2022,
      price: 45000,
      mileage: 25000,
      location: 'Chicago',
      condition: 'Good',
      images: ['https://example.com/audi1.jpg'],
      specifications: { engine: '2.0L Turbo', transmission: 'Automatic', fuelType: 'Gasoline' },
      dealerId: 'dealer4',
      dealerName: 'Metro Motors',
      isCoListed: false,
      coListedIn: [],
      views: 189,
      inquiries: 7,
      shares: 3,
    },
    {
      id: '4',
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      price: 52000,
      mileage: 8000,
      location: 'San Francisco',
      condition: 'Excellent',
      images: ['https://example.com/tesla1.jpg'],
      specifications: { engine: 'Electric Motor', transmission: 'Single Speed', fuelType: 'Electric' },
      dealerId: 'dealer5',
      dealerName: 'Electric Dreams',
      isCoListed: true,
      coListedIn: ['group2'],
      views: 312,
      inquiries: 18,
      shares: 11,
    },
    {
      id: '5',
      make: 'Porsche',
      model: '911',
      year: 2023,
      price: 125000,
      mileage: 3000,
      location: 'Miami',
      condition: 'Like New',
      images: ['https://example.com/porsche1.jpg'],
      specifications: { engine: '3.0L Twin Turbo', transmission: 'Manual', fuelType: 'Gasoline' },
      dealerId: 'dealer6',
      dealerName: 'Speed Motors',
      isCoListed: false,
      coListedIn: [],
      views: 578,
      inquiries: 31,
      shares: 22,
    },
  ], []);

  const makeOptions = ['BMW', 'Mercedes-Benz', 'Audi', 'Tesla', 'Porsche', 'Lexus', 'Acura'];
  const modelOptions = ['X5', 'S-Class', 'A4', 'Model 3', '911', 'RX', 'MDX'];
  const locationOptions = ['New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami', 'Seattle', 'Dallas'];
  const conditionOptions = ['Like New', 'Excellent', 'Good', 'Fair'];
  const fuelTypeOptions = ['Gasoline', 'Electric', 'Hybrid', 'Diesel'];
  const transmissionOptions = ['Automatic', 'Manual', 'Single Speed'];

  // Quick filter presets
  const quickFilters: QuickFilter[] = [
    {
      id: 'luxury',
      label: 'Luxury Cars',
      filter: { make: ['BMW', 'Mercedes-Benz', 'Porsche'], priceMin: '50000' },
      icon: 'star',
    },
    {
      id: 'electric',
      label: 'Electric',
      filter: { fuelType: ['Electric'] },
      icon: 'electric-car',
    },
    {
      id: 'under50k',
      label: 'Under $50K',
      filter: { priceMax: '50000' },
      icon: 'attach-money',
    },
    {
      id: 'lowmiles',
      label: 'Low Mileage',
      filter: { mileageMax: '30000' },
      icon: 'speed',
    },
    {
      id: 'new',
      label: 'Recent Models',
      filter: { yearMin: '2022' },
      icon: 'new-releases',
    },
  ];

  // Sort options
  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'year-new', label: 'Year: Newest First' },
    { value: 'year-old', label: 'Year: Oldest First' },
    { value: 'mileage-low', label: 'Mileage: Low to High' },
    { value: 'mileage-high', label: 'Mileage: High to Low' },
  ];

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vehicles, filters]);

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setVehicles(mockVehiclesMemo);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setLoading(false);
    }
  }, [mockVehiclesMemo]);

  const applyFilters = useCallback(() => {
    let filtered = vehicles;

    // Text search
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(vehicle =>
        vehicle.make.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.dealerName.toLowerCase().includes(searchLower) ||
        vehicle.location.toLowerCase().includes(searchLower)
      );
    }

    // Make filter
    if (filters.make.length > 0) {
      filtered = filtered.filter(vehicle => filters.make.includes(vehicle.make));
    }

    // Model filter
    if (filters.model.length > 0) {
      filtered = filtered.filter(vehicle => filters.model.includes(vehicle.model));
    }

    // Year range
    if (filters.yearMin) {
      filtered = filtered.filter(vehicle => vehicle.year >= parseInt(filters.yearMin));
    }
    if (filters.yearMax) {
      filtered = filtered.filter(vehicle => vehicle.year <= parseInt(filters.yearMax));
    }

    // Price range
    if (filters.priceMin) {
      filtered = filtered.filter(vehicle => vehicle.price >= parseInt(filters.priceMin));
    }
    if (filters.priceMax) {
      filtered = filtered.filter(vehicle => vehicle.price <= parseInt(filters.priceMax));
    }

    // Mileage
    if (filters.mileageMax) {
      filtered = filtered.filter(vehicle => vehicle.mileage <= parseInt(filters.mileageMax));
    }

    // Location filter
    if (filters.location.length > 0) {
      filtered = filtered.filter(vehicle => filters.location.includes(vehicle.location));
    }

    // Condition filter
    if (filters.condition.length > 0) {
      filtered = filtered.filter(vehicle => filters.condition.includes(vehicle.condition));
    }

    // Fuel type filter
    if (filters.fuelType.length > 0) {
      filtered = filtered.filter(vehicle =>
        vehicle.specifications?.fuelType && filters.fuelType.includes(vehicle.specifications.fuelType)
      );
    }

    // Transmission filter
    if (filters.transmission.length > 0) {
      filtered = filtered.filter(vehicle =>
        vehicle.specifications?.transmission && filters.transmission.includes(vehicle.specifications.transmission)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'year-new':
          return b.year - a.year;
        case 'year-old':
          return a.year - b.year;
        case 'mileage-low':
          return a.mileage - b.mileage;
        case 'mileage-high':
          return b.mileage - a.mileage;
        default:
          return 0;
      }
    });

    setFilteredVehicles(filtered);
  }, [vehicles, filters]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'make' | 'model' | 'location' | 'condition' | 'fuelType' | 'transmission', value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  };

  const clearFilters = () => {
    setFilters({
      searchText: '',
      make: [],
      model: [],
      yearMin: '',
      yearMax: '',
      priceMin: '',
      priceMax: '',
      mileageMax: '',
      location: [],
      condition: [],
      fuelType: [],
      transmission: [],
      sortBy: 'price-low',
    });
  };

  const handleVehiclePress = (vehicle: Vehicle) => {
    navigation.navigate('VehicleDetail', {
      vehicleId: vehicle.id,
      enableCoListing: true
    });
  };

  const handleContactDealer = (vehicle: Vehicle) => {
    navigation.navigate('Chat', {
      dealerId: vehicle.dealerId,
      dealerName: vehicle.dealerName
    });
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      style={styles.vehicleCard}
      onPress={() => handleVehiclePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.vehicleImageContainer}>
        {item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.vehicleImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="directions-car" size={40} color="#ccc" />
          </View>
        )}
        {item.isCoListed && (
          <View style={styles.coListedBadge}>
            <Text style={styles.coListedText}>Co-listed</Text>
          </View>
        )}
      </View>

      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleTitle}>
          {item.year} {item.make} {item.model}
        </Text>
        <Text style={styles.vehiclePrice}>${item.price.toLocaleString()}</Text>
        <Text style={styles.vehicleDetails}>
          {item.mileage.toLocaleString()} miles • {item.condition}
        </Text>
        <Text style={styles.vehicleLocation}>{item.location}</Text>
        <Text style={styles.dealerName}>{item.dealerName}</Text>

        <View style={styles.vehicleStats}>
          <View style={styles.statItem}>
            <MaterialIcons name="visibility" size={16} color="#666" />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="message" size={16} color="#666" />
            <Text style={styles.statText}>{item.inquiries}</Text>
          </View>
        </View>
      </View>

      <View style={styles.vehicleActions}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContactDealer(item)}
        >
          <MaterialIcons name="chat" size={20} color="#4ECDC4" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.coListButton}
          onPress={() => navigation.navigate('CoListVehicle', { vehicleId: item.id })}
        >
          <MaterialIcons name="share" size={20} color="#4ECDC4" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterSection = (title: string, options: string[], selectedValues: string[], onToggle: (value: string) => void) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <View style={styles.filterOptions}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.filterOption, selectedValues.includes(option) && styles.selectedFilterOption]}
            onPress={() => onToggle(option)}
          >
            <Text style={[styles.filterOptionText, selectedValues.includes(option) && styles.selectedFilterOptionText]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Search</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFiltersModal(true)}
        >
          <MaterialIcons name="filter-list" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Input
          value={filters.searchText}
          onChangeText={(text) => updateFilter('searchText', text)}
          placeholder="Search by make, model, dealer, location..."
          containerStyle={styles.searchInput}
        />
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
        </Text>

        <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
          <Text style={styles.sortText}>
            Sort: {filters.sortBy === 'price-low' ? 'Price (Low to High)' :
              filters.sortBy === 'price-high' ? 'Price (High to Low)' :
                filters.sortBy === 'year-new' ? 'Year (Newest)' :
                  filters.sortBy === 'year-old' ? 'Year (Oldest)' :
                    filters.sortBy === 'mileage-low' ? 'Mileage (Low to High)' :
                      'Mileage (High to Low)'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredVehicles}
        renderItem={renderVehicleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.vehiclesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={60} color="#ddd" />
            <Text style={styles.emptyStateText}>
              No vehicles match your search criteria
            </Text>
          </View>
        }
      />

      {/* Filters Modal */}
      <Modal
        visible={showFiltersModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filtersModal}>
            <View style={styles.filtersHeader}>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
              <Text style={styles.filtersTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filtersContent} showsVerticalScrollIndicator={false}>
              {renderFilterSection('Make', makeOptions, filters.make, (value) => toggleArrayFilter('make', value))}
              {renderFilterSection('Model', modelOptions, filters.model, (value) => toggleArrayFilter('model', value))}

              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Year Range</Text>
                <View style={styles.rangeInputs}>
                  <Input
                    value={filters.yearMin}
                    onChangeText={(text) => updateFilter('yearMin', text)}
                    placeholder="Min Year"
                    keyboardType="numeric"
                    containerStyle={styles.rangeInput}
                  />
                  <Text style={styles.rangeSeparator}>to</Text>
                  <Input
                    value={filters.yearMax}
                    onChangeText={(text) => updateFilter('yearMax', text)}
                    placeholder="Max Year"
                    keyboardType="numeric"
                    containerStyle={styles.rangeInput}
                  />
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Price Range</Text>
                <View style={styles.rangeInputs}>
                  <Input
                    value={filters.priceMin}
                    onChangeText={(text) => updateFilter('priceMin', text)}
                    placeholder="Min Price"
                    keyboardType="numeric"
                    containerStyle={styles.rangeInput}
                  />
                  <Text style={styles.rangeSeparator}>to</Text>
                  <Input
                    value={filters.priceMax}
                    onChangeText={(text) => updateFilter('priceMax', text)}
                    placeholder="Max Price"
                    keyboardType="numeric"
                    containerStyle={styles.rangeInput}
                  />
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Maximum Mileage</Text>
                <Input
                  value={filters.mileageMax}
                  onChangeText={(text) => updateFilter('mileageMax', text)}
                  placeholder="Max Mileage"
                  keyboardType="numeric"
                  containerStyle={styles.singleInput}
                />
              </View>

              {renderFilterSection('Location', locationOptions, filters.location, (value) => toggleArrayFilter('location', value))}
              {renderFilterSection('Condition', conditionOptions, filters.condition, (value) => toggleArrayFilter('condition', value))}
              {renderFilterSection('Fuel Type', fuelTypeOptions, filters.fuelType, (value) => toggleArrayFilter('fuelType', value))}
              {renderFilterSection('Transmission', transmissionOptions, filters.transmission, (value) => toggleArrayFilter('transmission', value))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sortModal}>
            <View style={styles.sortHeader}>
              <Text style={styles.sortTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.sortContent}>
              {sortOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    filters.sortBy === option.value && styles.selectedSortOption
                  ]}
                  onPress={() => {
                    updateFilter('sortBy', option.value);
                    setShowSortModal(false);
                  }}
                >
                  <Text style={[
                    styles.sortOptionText,
                    filters.sortBy === option.value && styles.selectedSortOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {filters.sortBy === option.value && (
                    <MaterialIcons name="check" size={20} color="#4ECDC4" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    marginBottom: 0,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  vehiclesList: {
    padding: 20,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,

    elevation: 3,
  },
  vehicleImageContainer: {
    width: 100,
    height: 80,
    marginRight: 16,
    position: 'relative',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coListedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  coListedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vehiclePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  vehicleLocation: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  dealerName: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  vehicleStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  vehicleActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactButton: {
    padding: 8,
    marginBottom: 8,
  },
  coListButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filtersModal: {
    color: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    color: '#eee',
  },
  clearFiltersText: {
    fontSize: 16,
    color: '#FF6B6B',
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  doneText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterOption: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  selectedFilterOption: {
    backgroundColor: '#4ECDC4',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFilterOptionText: {
    color: '#fff',
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeInput: {
    flex: 1,
    marginBottom: 0,
  },
  rangeSeparator: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 12,
  },
  singleInput: {
    marginBottom: 0,
  },
  sortModal: {
    color: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 300,
  },
  sortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    color: '#eee',
  },
  sortTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sortContent: {
    paddingVertical: 8,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  selectedSortOption: {
    backgroundColor: '#f0f9f9',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedSortOptionText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
});

export default VehicleSearchScreen;



