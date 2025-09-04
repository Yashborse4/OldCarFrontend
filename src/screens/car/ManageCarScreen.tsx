import React, { useState } from 'react';
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
  Image,
  Modal,
  Switch,
  TextInput,
  Share,
  Linking,
} from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: {
    params: {
      car: Car;
    };
  };
}

export interface Car {
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

interface Theme {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    shadow: string;
    success: string;
    warning: string;
    error: string;
  };
}

// Mock theme hook
const useTheme = (): Theme => {
  const [isDark] = useState(false);
  
  const colors = {
    background: isDark ? '#0A0A0A' : '#F8F9FA',
    surface: isDark ? '#1A1A1A' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#333333',
    textSecondary: isDark ? '#BBBBBB' : '#666666',
    primary: '#FFD700',
    border: isDark ? '#333333' : '#E0E0E0',
    shadow: isDark ? '#000000' : '#888888',
    success: '#30D158',
    warning: '#FF9500',
    error: '#FF3B30',
  };
  
  return { isDark, colors };
};

// Mock API functions
const updateCarStatus = async (carId: string, status: Car['status']) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 800);
  });
};

const updateCarPrice = async (carId: string, price: string) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 600);
  });
};

const deleteCar = async (carId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 600);
  });
};

const promoteCar = async (carId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 800);
  });
};

const renewCar = async (carId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 600);
  });
};

const ManageCarScreen: React.FC<Props> = ({ navigation, route }) => {
  const { isDark, colors } = useTheme();
  const [car, setCar] = useState<Car>(route.params.car);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [newPrice, setNewPrice] = useState(car.price);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: Car['status']) => {
    if (newStatus === car.status) {
      setShowStatusModal(false);
      return;
    }

    setLoading(true);
    try {
      await updateCarStatus(car.id, newStatus);
      setCar(prev => ({ ...prev, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }));
      Alert.alert('Success', `Car status updated to ${newStatus.toUpperCase()}`);
      setShowStatusModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update car status');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceUpdate = async () => {
    if (!newPrice.trim() || newPrice === car.price) {
      setShowPriceModal(false);
      return;
    }

    setLoading(true);
    try {
      await updateCarPrice(car.id, newPrice);
      setCar(prev => ({ ...prev, price: newPrice, updatedAt: new Date().toISOString().split('T')[0] }));
      Alert.alert('Success', 'Car price updated successfully');
      setShowPriceModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update car price');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async () => {
    setLoading(true);
    try {
      await deleteCar(car.id);
      Alert.alert('Success', 'Car deleted successfully');
      setShowDeleteModal(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete car');
      setLoading(false);
    }
  };

  const handlePromoteCar = async () => {
    setLoading(true);
    try {
      await promoteCar(car.id);
      setCar(prev => ({ ...prev, isPromoted: true }));
      Alert.alert('Success', 'Your car has been promoted for better visibility!');
      setShowPromoteModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to promote car');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewCar = async () => {
    Alert.alert(
      'Renew Listing',
      'This will refresh your car listing and move it to the top of search results.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Renew',
          onPress: async () => {
            setLoading(true);
            try {
              await renewCar(car.id);
              setCar(prev => ({ ...prev, updatedAt: new Date().toISOString().split('T')[0] }));
              Alert.alert('Success', 'Car listing renewed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to renew car listing');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleShareCar = async () => {
    try {
      await Share.share({
        message: `Check out this ${car.title} for ${car.price}! Available in ${car.location}`,
        title: car.title,
      });
    } catch (error) {
      console.log('Error sharing car:', error);
    }
  };

  const handleDuplicateCar = () => {
    Alert.alert(
      'Duplicate Listing',
      'This will create a copy of your car listing that you can modify.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Duplicate',
          onPress: () => {
            navigation.navigate('EditCar', { 
              carId: car.id, 
              isDuplicate: true 
            });
          },
        },
      ]
    );
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
      default: return 'help-circle';
    }
  };

  const getStatusDescription = (status: Car['status']) => {
    switch (status) {
      case 'active': return 'Your car is visible to buyers and can receive inquiries';
      case 'inactive': return 'Your car is temporarily hidden from search results';
      case 'sold': return 'Mark as sold to stop receiving inquiries';
      case 'draft': return 'Complete your listing to make it visible to buyers';
      default: return '';
    }
  };

  const quickActions = [
    {
      id: 'edit',
      title: 'Edit Details',
      description: 'Update car information, photos, and description',
      icon: 'pencil',
      color: colors.primary,
      onPress: () => navigation.navigate('EditCar', { carId: car.id }),
    },
    {
      id: 'price',
      title: 'Change Price',
      description: 'Update your car\'s selling price',
      icon: 'currency-inr',
      color: colors.success,
      onPress: () => setShowPriceModal(true),
    },
    {
      id: 'status',
      title: 'Change Status',
      description: 'Make active, inactive, or mark as sold',
      icon: 'toggle-switch',
      color: colors.warning,
      onPress: () => setShowStatusModal(true),
    },
    {
      id: 'promote',
      title: 'Promote Listing',
      description: 'Get more visibility with promoted listing',
      icon: 'trending-up',
      color: '#FF6B6B',
      onPress: () => setShowPromoteModal(true),
      disabled: car.isPromoted,
    },
    {
      id: 'renew',
      title: 'Renew Listing',
      description: 'Refresh and move to top of search results',
      icon: 'refresh',
      color: '#4ECDC4',
      onPress: handleRenewCar,
    },
    {
      id: 'duplicate',
      title: 'Duplicate Listing',
      description: 'Create a copy of this listing',
      icon: 'content-copy',
      color: '#9B59B6',
      onPress: handleDuplicateCar,
    },
    {
      id: 'share',
      title: 'Share Listing',
      description: 'Share with friends or on social media',
      icon: 'share',
      color: '#3498DB',
      onPress: handleShareCar,
    },
    {
      id: 'delete',
      title: 'Delete Listing',
      description: 'Permanently remove this car listing',
      icon: 'delete',
      color: colors.error,
      onPress: () => setShowDeleteModal(true),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 16,
    },
    carImageContainer: {
      position: 'relative',
      height: 200,
      margin: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    carImage: {
      width: '100%',
      height: '100%',
    },
    statusOverlay: {
      position: 'absolute',
      top: 12,
      left: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
      textTransform: 'capitalize',
    },
    promotedOverlay: {
      position: 'absolute',
      top: 12,
      right: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.primary,
    },
    promotedText: {
      color: '#111827',
      fontSize: 12,
      fontWeight: '700',
    },
    carInfo: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 16,
      padding: 16,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    carTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    carPrice: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 8,
    },
    carDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 12,
    },
    carDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
      marginBottom: 4,
    },
    carDetailText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    carStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    actionsContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    actionCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 8,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      overflow: 'hidden',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    actionIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    actionDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    actionChevron: {
      marginLeft: 8,
    },
    disabledAction: {
      opacity: 0.5,
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
      width: width * 0.85,
      maxHeight: height * 0.7,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    modalSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    statusOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    statusOptionActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
    },
    statusOptionContent: {
      flex: 1,
      marginLeft: 12,
    },
    statusOptionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    statusOptionDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
      lineHeight: 18,
    },
    priceInputContainer: {
      marginBottom: 20,
    },
    priceInputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    priceInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
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
      alignItems: 'center',
    },
    modalButtonPrimary: {
      backgroundColor: colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalButtonDanger: {
      backgroundColor: colors.error,
    },
    modalButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    modalButtonTextPrimary: {
      color: '#111827',
    },
    modalButtonTextSecondary: {
      color: colors.textSecondary,
    },
    modalButtonTextDanger: {
      color: '#FFFFFF',
    },
    deleteWarning: {
      backgroundColor: isDark ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.1)',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.error + '30',
    },
    deleteWarningText: {
      fontSize: 14,
      color: colors.error,
      textAlign: 'center',
      lineHeight: 20,
    },
    promoteFeature: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      marginBottom: 4,
    },
    promoteFeatureText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 8,
      flex: 1,
    },
    promotePricing: {
      backgroundColor: isDark ? 'rgba(255,215,0,0.1)' : 'rgba(255,215,0,0.1)',
      borderRadius: 8,
      padding: 12,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    promotePricingText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
    },
    promotePricingSubtext: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
  });

  // Status Modal Component
  const StatusModal = () => (
    <Modal visible={showStatusModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animatable.View animation="zoomIn" duration={300} style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Status</Text>
          <Text style={styles.modalSubtitle}>
            Choose the status that best describes your car listing
          </Text>
          
          {[
            { key: 'active', label: 'Active', icon: 'check-circle' },
            { key: 'inactive', label: 'Inactive', icon: 'pause-circle' },
            { key: 'sold', label: 'Sold', icon: 'check-circle-outline' },
            { key: 'draft', label: 'Draft', icon: 'edit' },
          ].map((status) => (
            <TouchableOpacity
              key={status.key}
              style={[
                styles.statusOption,
                car.status === status.key && styles.statusOptionActive,
              ]}
              onPress={() => handleStatusChange(status.key as Car['status'])}
              disabled={loading}
            >
              <MaterialCommunityIcons
                name={status.icon as any}
                size={20}
                color={getStatusColor(status.key as Car['status'])}
              />
              <View style={styles.statusOptionContent}>
                <Text style={styles.statusOptionTitle}>{status.label}</Text>
                <Text style={styles.statusOptionDescription}>
                  {getStatusDescription(status.key as Car['status'])}
                </Text>
              </View>
              {car.status === status.key && (
                <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setShowStatusModal(false)}
              disabled={loading}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  // Price Modal Component
  const PriceModal = () => (
    <Modal visible={showPriceModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animatable.View animation="zoomIn" duration={300} style={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Price</Text>
          <Text style={styles.modalSubtitle}>
            Set a competitive price to attract more buyers
          </Text>
          
          <View style={styles.priceInputContainer}>
            <Text style={styles.priceInputLabel}>New Price</Text>
            <TextInput
              style={styles.priceInput}
              value={newPrice}
              onChangeText={setNewPrice}
              placeholder="₹0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => {
                setNewPrice(car.price);
                setShowPriceModal(false);
              }}
              disabled={loading}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={handlePriceUpdate}
              disabled={loading}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                {loading ? 'Updating...' : 'Update Price'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  // Delete Modal Component
  const DeleteModal = () => (
    <Modal visible={showDeleteModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animatable.View animation="zoomIn" duration={300} style={styles.modalContent}>
          <Text style={styles.modalTitle}>Delete Listing</Text>
          
          <View style={styles.deleteWarning}>
            <Text style={styles.deleteWarningText}>
              ⚠️ This action cannot be undone. Your car listing and all associated data will be permanently deleted.
            </Text>
          </View>
          
          <Text style={styles.modalSubtitle}>
            Are you sure you want to delete "{car.title}"?
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setShowDeleteModal(false)}
              disabled={loading}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonDanger]}
              onPress={handleDeleteCar}
              disabled={loading}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextDanger]}>
                {loading ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  // Promote Modal Component
  const PromoteModal = () => (
    <Modal visible={showPromoteModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animatable.View animation="zoomIn" duration={300} style={styles.modalContent}>
          <Text style={styles.modalTitle}>Promote Your Listing</Text>
          <Text style={styles.modalSubtitle}>
            Get more visibility and attract potential buyers faster
          </Text>
          
          <View style={styles.promotePricing}>
            <Text style={styles.promotePricingText}>₹299 for 7 days</Text>
            <Text style={styles.promotePricingSubtext}>Get 5x more views on average</Text>
          </View>
          
          {[
            'Top position in search results',
            'Featured in homepage carousel',
            'Priority in email notifications',
            'Special promoted badge',
            'Extended visibility period',
          ].map((feature, index) => (
            <View key={index} style={styles.promoteFeature}>
              <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
              <Text style={styles.promoteFeatureText}>{feature}</Text>
            </View>
          ))}
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setShowPromoteModal(false)}
              disabled={loading}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>
                Maybe Later
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={handlePromoteCar}
              disabled={loading}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                {loading ? 'Processing...' : 'Promote Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <StatusModal />
      <PriceModal />
      <DeleteModal />
      <PromoteModal />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Car</Text>
        <TouchableOpacity onPress={() => navigation.navigate('VehicleDetail', { carId: car.id })}>
          <MaterialCommunityIcons name="eye" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Car Image */}
        <View style={styles.carImageContainer}>
          <Image source={{ uri: car.images[0] }} style={styles.carImage} />
          
          <View style={[styles.statusOverlay, { backgroundColor: getStatusColor(car.status) + '20' }]}>
            <MaterialCommunityIcons 
              name={getStatusIcon(car.status) as any} 
              size={16} 
              color={getStatusColor(car.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(car.status) }]}>
              {car.status}
            </Text>
          </View>
          
          {car.isPromoted && (
            <View style={styles.promotedOverlay}>
              <Text style={styles.promotedText}>PROMOTED</Text>
            </View>
          )}
        </View>

        {/* Car Info */}
        <View style={styles.carInfo}>
          <Text style={styles.carTitle}>{car.title}</Text>
          <Text style={styles.carPrice}>{car.price}</Text>
          
          <View style={styles.carDetails}>
            <View style={styles.carDetailItem}>
              <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
              <Text style={styles.carDetailText}>{car.year}</Text>
            </View>
            <View style={styles.carDetailItem}>
              <MaterialCommunityIcons name="speedometer" size={16} color={colors.textSecondary} />
              <Text style={styles.carDetailText}>{car.mileage}</Text>
            </View>
            <View style={styles.carDetailItem}>
              <MaterialCommunityIcons name="gas-station" size={16} color={colors.textSecondary} />
              <Text style={styles.carDetailText}>{car.fuelType}</Text>
            </View>
            <View style={styles.carDetailItem}>
              <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
              <Text style={styles.carDetailText}>{car.location}</Text>
            </View>
          </View>

          <View style={styles.carStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{car.views}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{car.inquiries}</Text>
              <Text style={styles.statLabel}>Inquiries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{car.updatedAt}</Text>
              <Text style={styles.statLabel}>Updated</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          {quickActions.map((action) => (
            <Animatable.View 
              key={action.id}
              animation="fadeInUp"
              delay={quickActions.indexOf(action) * 100}
              style={[styles.actionCard, action.disabled && styles.disabledAction]}
            >
              <TouchableOpacity
                style={styles.actionButton}
                onPress={action.onPress}
                disabled={action.disabled || loading}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                  <MaterialCommunityIcons 
                    name={action.icon as any} 
                    size={20} 
                    color={action.color} 
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>
                    {action.title}
                    {action.disabled && ' ✓'}
                  </Text>
                  <Text style={styles.actionDescription}>
                    {action.disabled && action.id === 'promote' 
                      ? 'Your car is already promoted' 
                      : action.description
                    }
                  </Text>
                </View>
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={20} 
                  color={colors.textSecondary}
                  style={styles.actionChevron}
                />
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageCarScreen;
