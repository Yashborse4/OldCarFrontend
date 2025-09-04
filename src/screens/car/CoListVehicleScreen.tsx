import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,  
  FlatList,
  Modal,
  Image,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { CoListVehicleRouteProp, Vehicle, DealerGroup, DealerMember } from '../../navigation/types';
import { carApi } from '../../services/CarApi';

interface CoListingOption {
  id: string;
  type: 'group' | 'dealer';
  name: string;
  subtitle?: string;
  memberCount?: number;
  isPrivate?: boolean;
  selected: boolean;
}

const CoListVehicleScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CoListVehicleRouteProp>();
  const { vehicleId } = route.params;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [searchText, setSearchText] = useState('');
  const [coListingOptions, setCoListingOptions] = useState<CoListingOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<CoListingOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<CoListingOption[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with API calls later
  const mockVehicle: Vehicle = {
    id: vehicleId,
    make: 'BMW',
    model: 'X5',
    year: 2023,
    price: 75000,
    mileage: 15000,
    location: 'New York',
    condition: 'Excellent',
    images: ['https://example.com/bmw1.jpg'],
    specifications: { engine: '3.0L Twin Turbo', transmission: 'Automatic' },
    dealerId: 'current-dealer',
    dealerName: 'Your Dealership',
    isCoListed: false,
    coListedIn: [],
    views: 234,
    inquiries: 12,
    shares: 8,
  };

  const mockGroups: DealerGroup[] = [
    {
      id: '1',
      name: 'Luxury Car Dealers Network',
      description: 'Premium luxury vehicle dealers',
      isPrivate: false,
      adminId: 'dealer1',
      members: [
        { id: 'dealer1', name: 'John Smith', dealership: 'Premium Motors', role: 'admin' },
        { id: 'dealer2', name: 'Sarah Johnson', dealership: 'Elite Cars', role: 'member' },
        { id: 'dealer3', name: 'Mike Wilson', dealership: 'Luxury Auto Group', role: 'member' },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Regional Dealers Alliance',
      description: 'Regional dealer partnerships',
      isPrivate: true,
      adminId: 'dealer2',
      members: [
        { id: 'dealer2', name: 'Sarah Johnson', dealership: 'Elite Cars', role: 'admin' },
        { id: 'dealer4', name: 'David Brown', dealership: 'Metro Auto', role: 'member' },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  const mockDealers: DealerMember[] = [
    { id: 'dealer5', name: 'Lisa Garcia', dealership: 'Speed Motors', role: 'member' },
    { id: 'dealer6', name: 'Tom Anderson', dealership: 'Performance Plus', role: 'member' },
    { id: 'dealer7', name: 'Chris Lee', dealership: 'Turbo Cars', role: 'member' },
  ];

  useEffect(() => {
    loadVehicleAndOptions();
  }, [vehicleId]);

  useEffect(() => {
    filterOptions();
  }, [searchText, coListingOptions]);

  const loadVehicleAndOptions = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      setTimeout(() => {
        setVehicle(mockVehicle);
        
        const options: CoListingOption[] = [
          // Groups
          ...mockGroups.map(group => ({
            id: `group_${group.id}`,
            type: 'group' as const,
            name: group.name,
            subtitle: group.description,
            memberCount: group.members.length,
            isPrivate: group.isPrivate,
            selected: false,
          })),
          // Individual dealers
          ...mockDealers.map(dealer => ({
            id: `dealer_${dealer.id}`,
            type: 'dealer' as const,
            name: dealer.name,
            subtitle: dealer.dealership,
            selected: false,
          })),
        ];
        
        setCoListingOptions(options);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading vehicle and options:', error);
      setLoading(false);
    }
  };

  const filterOptions = () => {
    if (!searchText.trim()) {
      setFilteredOptions(coListingOptions);
      return;
    }

    const filtered = coListingOptions.filter(option =>
      option.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (option.subtitle && option.subtitle.toLowerCase().includes(searchText.toLowerCase()))
    );
    setFilteredOptions(filtered);
  };

  const toggleOption = (option: CoListingOption) => {
    const updatedOptions = coListingOptions.map(opt =>
      opt.id === option.id ? { ...opt, selected: !opt.selected } : opt
    );
    setCoListingOptions(updatedOptions);
    
    // Update selected options
    const selected = updatedOptions.filter(opt => opt.selected);
    setSelectedOptions(selected);
  };

  const handleCoList = () => {
    if (selectedOptions.length === 0) {
      Alert.alert('No Selection', 'Please select at least one group or dealer to co-list with.');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmCoListing = async () => {
    try {
      setLoading(true);
      setShowConfirmModal(false);

      // TODO: Replace with actual API call
      const coListData = {
        vehicleId,
        selections: selectedOptions.map(opt => ({
          id: opt.id,
          type: opt.type,
          name: opt.name,
        })),
      };

      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success!',
        `Vehicle co-listed with ${selectedOptions.length} ${selectedOptions.length === 1 ? 'recipient' : 'recipients'}.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to co-list vehicle. Please try again.');
      console.error('Error co-listing vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOptionItem = ({ item }: { item: CoListingOption }) => (
    <TouchableOpacity
      style={[styles.optionCard, item.selected && styles.selectedOptionCard]}
      onPress={() => toggleOption(item)}
      activeOpacity={0.8}
    >
      <View style={styles.optionIcon}>
        <Icon
          name={item.type === 'group' ? 'group' : 'person'}
          size={24}
          color={item.selected ? '#fff' : '#4ECDC4'}
        />
      </View>
      
      <View style={styles.optionInfo}>
        <Text style={[styles.optionName, item.selected && styles.selectedOptionText]}>
          {item.name}
        </Text>
        <Text style={[styles.optionSubtitle, item.selected && styles.selectedOptionSubtext]}>
          {item.subtitle}
        </Text>
        
        {item.type === 'group' && (
          <View style={styles.groupMeta}>
            <View style={styles.memberCountBadge}>
              <Text style={styles.memberCountText}>
                {item.memberCount} member{item.memberCount !== 1 ? 's' : ''}
              </Text>
            </View>
            {item.isPrivate && (
              <View style={styles.privateBadge}>
                <MaterialIcons name="lock" size={12} color="#FF6B6B" />
                <Text style={styles.privateBadgeText}>Private</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      <View style={[styles.checkbox, item.selected && styles.checkedBox]}>
        {item.selected && (
          <MaterialIcons name="check" size={16} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !vehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Co-list Vehicle</Text>
        <View style={styles.placeholder} />
      </View>

      {vehicle && (
        <View style={styles.vehiclePreview}>
          <View style={styles.vehicleImageContainer}>
            {vehicle.images.length > 0 ? (
              <Image source={{ uri: vehicle.images[0] }} style={styles.vehicleImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialIcons name="directions-car" size={40} color="#ccc" />
              </View>
            )}
          </View>
          
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleTitle}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            <Text style={styles.vehiclePrice}>${vehicle.price.toLocaleString()}</Text>
            <Text style={styles.vehicleDetails}>
              {vehicle.mileage.toLocaleString()} miles â€¢ {vehicle.location}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.searchSection}>
        <Input
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search groups or dealers..."
          style={styles.searchInput}
        />
      </View>

      {selectedOptions.length > 0 && (
        <View style={styles.selectionSummary}>
          <Text style={styles.selectionText}>
            {selectedOptions.length} selected
          </Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setCoListingOptions(opts => opts.map(opt => ({ ...opt, selected: false })));
              setSelectedOptions([]);
            }}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredOptions}
        renderItem={renderOptionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.optionsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={60} color="#ddd" />
            <Text style={styles.emptyStateText}>
              {searchText ? 'No results found' : 'No groups or dealers available'}
            </Text>
          </View>
        }
      />

      {selectedOptions.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.coListButton, loading && styles.coListButtonDisabled]}
            onPress={handleCoList}
            disabled={loading}
          >
            <Text style={styles.coListButtonText}>
              Co-list with {selectedOptions.length} recipient{selectedOptions.length !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Confirm Co-listing</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to co-list this vehicle with the selected recipients?
            </Text>
            
            <View style={styles.selectedList}>
              {selectedOptions.map((option, index) => (
                <View key={option.id} style={styles.selectedItem}>
                  <Icon
                    name={option.type === 'group' ? 'group' : 'person'}
                    size={16}
                    color="#666"
                  />
                  <Text style={styles.selectedItemText}>{option.name}</Text>
                </View>
              ))}
            </View>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmCoListing}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Co-listing...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  vehiclePreview: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  vehicleImageContainer: {
    width: 80,
    height: 60,
    marginRight: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 2,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#666',
  },
  searchSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    marginBottom: 0,
  },
  selectionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#e8f8f5',
    borderBottomWidth: 1,
    borderBottomColor: '#4ECDC4',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
  optionsList: {
    padding: 20,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedOptionCard: {
    backgroundColor: '#4ECDC4',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedOptionText: {
    color: '#fff',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  selectedOptionSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCountBadge: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  memberCountText: {
    fontSize: 12,
    color: '#666',
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  privateBadgeText: {
    fontSize: 10,
    color: '#FF6B6B',
    marginLeft: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#fff',
    borderColor: '#fff',
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
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  coListButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  coListButtonDisabled: {
    opacity: 0.6,
  },
  coListButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxHeight: '80%',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  selectedList: {
    maxHeight: 200,
    marginBottom: 24,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedItemText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CoListVehicleScreen;

