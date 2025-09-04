import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../theme';
import * as Animatable from 'react-native-animatable';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

const { width } = Dimensions.get('window');

export interface FilterOptions {
  status: 'all' | 'active' | 'sold' | 'expired';
  search: string;
  brand: string;
  priceRange: {
    min: number;
    max: number;
  };
  year: {
    min: number;
    max: number;
  };
  fuelType: string;
  transmission: string;
  sortBy: 'date' | 'price' | 'views' | 'name';
  sortOrder: 'asc' | 'desc';
}

interface FilterSystemProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  totalResults?: number;
}

const STATUS_OPTIONS = [
  { key: 'all', label: 'All Cars', icon: 'car', color: '#667EEA' },
  { key: 'active', label: 'Active', icon: 'checkcircle', color: '#48BB78' },
  { key: 'sold', label: 'Sold', icon: 'heart', color: '#ED8936' },
  { key: 'expired', label: 'Expired', icon: 'closecircle', color: '#F56565' },
];

const BRANDS = [
  'All Brands', 'Maruti Suzuki', 'Hyundai', 'Honda', 'Toyota', 'Mahindra',
  'Tata', 'Ford', 'Volkswagen', 'BMW', 'Mercedes', 'Audi'
];

const FUEL_TYPES = ['All', 'Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['All', 'Manual', 'Automatic', 'CVT'];

const SORT_OPTIONS = [
  { key: 'date', label: 'Date Added' },
  { key: 'price', label: 'Price' },
  { key: 'views', label: 'Most Viewed' },
  { key: 'name', label: 'Name' },
];

export const FilterSystem: React.FC<FilterSystemProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  totalResults = 0,
}) => {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const getActiveStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(option => option.key === status);
    return statusOption?.color || colors.primary;
  };

  const renderStatusFilters = () => (
    <View style={styles.statusContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {STATUS_OPTIONS.map((option) => {
          const isActive = filters.status === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.statusButton,
                {
                  backgroundColor: isActive ? option.color : colors.surface,
                  borderColor: isActive ? option.color : colors.border,
                },
                shadows.sm,
              ]}
              onPress={() => updateFilter('status', option.key as any)}
            >
              <AntDesign
                name={option.icon as any}
                size={16}
                color={isActive ? '#FFFFFF' : colors.text}
              />
              <Text
                style={[
                  styles.statusButtonText,
                  { color: isActive ? '#FFFFFF' : colors.text },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: colors.surface }, shadows.sm]}>
      <AntDesign name="search" size={20} color={colors.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder="Search cars by name, model, or brand..."
        placeholderTextColor={colors.textSecondary}
        value={filters.search}
        onChangeText={(text) => updateFilter('search', text)}
      />
      {filters.search.length > 0 && (
        <TouchableOpacity onPress={() => updateFilter('search', '')}>
          <AntDesign name="close" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={[
          styles.quickActionButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadows.sm,
        ]}
        onPress={() => setShowAdvancedFilters(true)}
      >
        <MaterialIcons name="tune" size={18} color={colors.text} />
        <Text style={[styles.quickActionText, { color: colors.text }]}>
          More Filters
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.quickActionButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadows.sm,
        ]}
        onPress={() => setShowSortModal(true)}
      >
        <MaterialIcons name="sort" size={18} color={colors.text} />
        <Text style={[styles.quickActionText, { color: colors.text }]}>
          Sort: {SORT_OPTIONS.find(opt => opt.key === filters.sortBy)?.label}
        </Text>
        <AntDesign 
          name={filters.sortOrder === 'asc' ? 'arrowup' : 'arrowdown'} 
          size={14} 
          color={colors.text} 
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.resetButton,
          { backgroundColor: colors.error },
          shadows.sm,
        ]}
        onPress={onResetFilters}
      >
        <MaterialIcons name="clear" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderResultsCount = () => (
    <View style={styles.resultsContainer}>
      <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
        {totalResults} {totalResults === 1 ? 'car' : 'cars'} found
      </Text>
    </View>
  );

  const renderAdvancedFiltersModal = () => (
    <Modal
      visible={showAdvancedFilters}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAdvancedFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View
          animation="slideInUp"
          duration={300}
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface },
            shadows.xl,
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Advanced Filters
            </Text>
            <TouchableOpacity onPress={() => setShowAdvancedFilters(false)}>
              <AntDesign name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Brand Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Brand</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterOptionsRow}>
                  {BRANDS.map((brand) => (
                    <TouchableOpacity
                      key={brand}
                      style={[
                        styles.filterOption,
                        {
                          backgroundColor: filters.brand === brand ? colors.primary : colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => updateFilter('brand', brand)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          { color: filters.brand === brand ? '#000' : colors.text },
                        ]}
                      >
                        {brand}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Fuel Type Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Fuel Type</Text>
              <View style={styles.filterOptionsGrid}>
                {FUEL_TYPES.map((fuel) => (
                  <TouchableOpacity
                    key={fuel}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: filters.fuelType === fuel ? colors.primary : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => updateFilter('fuelType', fuel)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        { color: filters.fuelType === fuel ? '#000' : colors.text },
                      ]}
                    >
                      {fuel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Transmission Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Transmission</Text>
              <View style={styles.filterOptionsGrid}>
                {TRANSMISSIONS.map((transmission) => (
                  <TouchableOpacity
                    key={transmission}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: filters.transmission === transmission ? colors.primary : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => updateFilter('transmission', transmission)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        { color: filters.transmission === transmission ? '#000' : colors.text },
                      ]}
                    >
                      {transmission}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.cancelButton,
                { borderColor: colors.border },
              ]}
              onPress={() => setShowAdvancedFilters(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.applyButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                onApplyFilters();
                setShowAdvancedFilters(false);
              }}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowSortModal(false)}
      >
        <Animatable.View
          animation="zoomIn"
          duration={300}
          style={[
            styles.sortModalContent,
            { backgroundColor: colors.surface },
            shadows.lg,
          ]}
        >
          <Text style={[styles.sortModalTitle, { color: colors.text }]}>
            Sort By
          </Text>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortOption,
                { borderBottomColor: colors.border },
              ]}
              onPress={() => {
                updateFilter('sortBy', option.key as any);
                setShowSortModal(false);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  {
                    color: filters.sortBy === option.key ? colors.primary : colors.text,
                    fontWeight: filters.sortBy === option.key ? '600' : '400',
                  },
                ]}
              >
                {option.label}
              </Text>
              {filters.sortBy === option.key && (
                <TouchableOpacity
                  onPress={() => {
                    updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <AntDesign
                    name={filters.sortOrder === 'asc' ? 'arrowup' : 'arrowdown'}
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </Animatable.View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderSearchBar()}
      {renderStatusFilters()}
      {renderQuickActions()}
      {renderResultsCount()}
      {renderAdvancedFiltersModal()}
      {renderSortModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 8,
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 12,
    marginLeft: 6,
    marginRight: 4,
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  resultsContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  filterOptionsRow: {
    flexDirection: 'row',
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    marginRight: 8,
  },
  applyButton: {
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  sortModalContent: {
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sortOptionText: {
    fontSize: 16,
  },
});

export default FilterSystem;

