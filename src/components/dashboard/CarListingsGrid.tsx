import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { useTheme } from '../../theme';
import * as Animatable from 'react-native-animatable';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export interface CarListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  status: 'active' | 'sold' | 'expired';
  specifications: {
    fuelType: string;
    transmission: string;
    kmDriven: number;
    owners: number;
    location: string;
  };
  views: number;
  likes: number;
  inquiries: number;
  dateAdded: string;
  featured: boolean;
  verified: boolean;
}

interface CarListingsGridProps {
  listings: CarListing[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onCarPress: (car: CarListing) => void;
  onEditCar: (car: CarListing) => void;
  onDeleteCar: (car: CarListing) => void;
  onToggleStatus: (car: CarListing) => void;
  onToggleFeatured: (car: CarListing) => void;
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const CarListingsGrid: React.FC<CarListingsGridProps> = ({
  listings,
  viewMode,
  onViewModeChange,
  onCarPress,
  onEditCar,
  onDeleteCar,
  onToggleStatus,
  onToggleFeatured,
  loading = false,
  onRefresh,
  refreshing = false,
}) => {
  const { colors: themeColors, spacing, borderRadius, shadows } = useTheme();
  const [selectedCar, setSelectedCar] = useState<CarListing | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#48BB78';
      case 'sold':
        return '#ED8936';
      case 'expired':
        return '#F56565';
      default:
        return themeColors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return 'checkcircle';
      case 'sold':
        return 'heart';
      case 'expired':
        return 'closecircle';
      default:
        return 'questioncircle';
    }
  };

  const formatPrice = (price: number, currency: string = '₹') => {
    if (price >= 10000000) {
      return `${currency}${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `${currency}${(price / 100000).toFixed(1)}L`;
    } else if (price >= 1000) {
      return `${currency}${(price / 1000).toFixed(0)}K`;
    }
    return `${currency}${price.toLocaleString()}`;
  };

  const formatKm = (km: number) => {
    if (km >= 100000) {
      return `${(km / 100000).toFixed(1)}L km`;
    } else if (km >= 1000) {
      return `${(km / 1000).toFixed(0)}K km`;
    }
    return `${km} km`;
  };

  const handleLongPress = (car: CarListing) => {
    setSelectedCar(car);
    setShowActionsModal(true);
  };

  const handleDelete = () => {
    if (!selectedCar) return;
    
    Alert.alert(
      'Delete Car',
      `Are you sure you want to delete "${selectedCar.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeleteCar(selectedCar);
            setShowActionsModal(false);
          },
        },
      ]
    );
  };

  const renderGridItem = ({ item, index }: { item: CarListing; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      duration={600}
      style={styles.gridItemContainer}
    >
      <TouchableOpacity
        style={[
          styles.gridCard,
          { backgroundColor: themeColors.surface },
          shadows.md,
        ]}
        onPress={() => onCarPress(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.9}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.images[0] }}
            style={styles.carImage}
            resizeMode="cover"
          />
          
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <AntDesign
              name={getStatusIcon(item.status) as any}
              size={10}
              color="#FFFFFF"
            />
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>

          {/* Featured Badge */}
          {item.featured && (
            <View style={[styles.featuredBadge, { backgroundColor: themeColors.primary }]}>
              <AntDesign name="star" size={10} color="#000" />
            </View>
          )}

          {/* Verified Badge */}
          {item.verified && (
            <View style={[styles.verifiedBadge, { backgroundColor: themeColors.success }]}>
              <AntDesign name="check-circle" size={10} color="#FFFFFF" />
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
              onPress={() => onEditCar(item)}
            >
              <AntDesign name="edit" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.gridCardContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.carTitle, { color: themeColors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.carYear, { color: themeColors.textSecondary }]}>
              {item.year}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: themeColors.success }]}>
              {formatPrice(item.price, item.currency)}
            </Text>
            {item.originalPrice && item.originalPrice > item.price && (
              <Text style={[styles.originalPrice, { color: themeColors.textSecondary }]}>
                {formatPrice(item.originalPrice, item.currency)}
              </Text>
            )}
          </View>

          <View style={styles.specsRow}>
            <Text style={[styles.specs, { color: themeColors.textSecondary }]} numberOfLines={1}>
              {formatKm(item.specifications.kmDriven)} • {item.specifications.fuelType} • {item.specifications.transmission}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <AntDesign name="eye" size={12} color={themeColors.textSecondary} />
              <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
                {item.views}
              </Text>
            </View>
            <View style={styles.stat}>
              <AntDesign name="heart" size={12} color={themeColors.textSecondary} />
              <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
                {item.likes}
              </Text>
            </View>
            <View style={styles.stat}>
              <AntDesign name="message" size={12} color={themeColors.textSecondary} />
              <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
                {item.inquiries}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderListItem = ({ item, index }: { item: CarListing; index: number }) => (
    <Animatable.View
      animation="fadeInRight"
      delay={index * 50}
      duration={400}
    >
      <TouchableOpacity
        style={[
          styles.listCard,
          { backgroundColor: themeColors.surface, borderColor: themeColors.border },
          shadows.sm,
        ]}
        onPress={() => onCarPress(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: item.images[0] }}
          style={styles.listImage}
          resizeMode="cover"
        />

        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <View style={styles.listTitleContainer}>
              <Text style={[styles.listTitle, { color: themeColors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.listBadges}>
                {item.featured && (
                  <AntDesign name="star" size={12} color={themeColors.primary} />
                )}
                {item.verified && (
                  <AntDesign name="check-circle" size={12} color={themeColors.success} />
                )}
              </View>
            </View>
            
            <View style={[styles.listStatusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.listStatusText}>{item.status}</Text>
            </View>
          </View>

          <Text style={[styles.listSpecs, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {item.year} • {formatKm(item.specifications.kmDriven)} • {item.specifications.fuelType} • {item.specifications.location}
          </Text>

          <View style={styles.listFooter}>
            <View style={styles.listPriceContainer}>
              <Text style={[styles.listPrice, { color: themeColors.success }]}>
                {formatPrice(item.price, item.currency)}
              </Text>
              {item.originalPrice && item.originalPrice > item.price && (
                <Text style={[styles.listOriginalPrice, { color: themeColors.textSecondary }]}>
                  {formatPrice(item.originalPrice, item.currency)}
                </Text>
              )}
            </View>

            <View style={styles.listStats}>
              <View style={styles.listStat}>
                <AntDesign name="eye" size={10} color={themeColors.textSecondary} />
                <Text style={[styles.listStatText, { color: themeColors.textSecondary }]}>
                  {item.views}
                </Text>
              </View>
              <View style={styles.listStat}>
                <AntDesign name="message" size={10} color={themeColors.textSecondary} />
                <Text style={[styles.listStatText, { color: themeColors.textSecondary }]}>
                  {item.inquiries}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.listActionButton}
          onPress={() => onEditCar(item)}
        >
          <AntDesign name="edit" size={16} color={themeColors.text} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: themeColors.text }]}>
        Your Listings ({listings.length})
      </Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            {
              backgroundColor: viewMode === 'grid' ? themeColors.primary : themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
          onPress={() => onViewModeChange('grid')}
        >
          <MaterialIcons
            name="grid-view"
            size={16}
            color={viewMode === 'grid' ? '#000' : themeColors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            {
              backgroundColor: viewMode === 'list' ? themeColors.primary : themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
          onPress={() => onViewModeChange('list')}
        >
          <MaterialIcons
            name="view-list"
            size={16}
            color={viewMode === 'list' ? '#000' : themeColors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActionsModal = () => (
    <Modal
      visible={showActionsModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowActionsModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowActionsModal(false)}
      >
        <Animatable.View
          animation="slideInUp"
          duration={300}
          style={[
            styles.actionsModal,
            { backgroundColor: themeColors.surface },
            shadows.xl,
          ]}
        >
          {selectedCar && (
            <>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                  {selectedCar.title}
                </Text>
                <TouchableOpacity onPress={() => setShowActionsModal(false)}>
                  <AntDesign name="close" size={20} color={themeColors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalAction, { borderBottomColor: themeColors.border }]}
                  onPress={() => {
                    onEditCar(selectedCar);
                    setShowActionsModal(false);
                  }}
                >
                  <AntDesign name="edit" size={20} color={themeColors.text} />
                  <Text style={[styles.modalActionText, { color: themeColors.text }]}>
                    Edit Car
                  </Text>
                </TouchableOpacity>

                <View style={[styles.modalAction, { borderBottomColor: themeColors.border }]}>
                  <AntDesign name="star" size={20} color={themeColors.primary} />
                  <Text style={[styles.modalActionText, { color: themeColors.text }]}>
                    Featured
                  </Text>
                  <Switch
                    value={selectedCar.featured}
                    onValueChange={() => {
                      onToggleFeatured(selectedCar);
                      setShowActionsModal(false);
                    }}
                    thumbColor={selectedCar.featured ? themeColors.primary : themeColors.textSecondary}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.modalAction, { borderBottomColor: themeColors.border }]}
                  onPress={() => {
                    onToggleStatus(selectedCar);
                    setShowActionsModal(false);
                  }}
                >
                  <AntDesign
                    name={getStatusIcon(selectedCar.status) as any}
                    size={20}
                    color={getStatusColor(selectedCar.status)}
                  />
                  <Text style={[styles.modalActionText, { color: themeColors.text }]}>
                    Change Status
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalAction, { borderBottomWidth: 0 }]}
                  onPress={handleDelete}
                >
                  <AntDesign name="delete" size={20} color={themeColors.error} />
                  <Text style={[styles.modalActionText, { color: themeColors.error }]}>
                    Delete Car
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animatable.View>
      </TouchableOpacity>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
          Loading your listings...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={listings}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        columnWrapperStyle={viewMode === 'grid' ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <AntDesign name="car" size={48} color={themeColors.textSecondary} />
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              No cars listed yet
            </Text>
            <Text style={[styles.emptySubtext, { color: themeColors.textTertiary }]}>
              Start by adding your first car listing
            </Text>
          </View>
        )}
      />
      {renderActionsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
  },
  listContainer: {
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  
  // Grid Item Styles
  gridItemContainer: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  gridCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  carImage: {
    width: '100%',
    height: 120,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 2,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 12,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 36,
    right: 8,
    padding: 4,
    borderRadius: 12,
  },
  quickActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  quickActionButton: {
    padding: 6,
    borderRadius: 6,
  },
  gridCardContent: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  carTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  carYear: {
    fontSize: 12,
    marginLeft: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  specsRow: {
    marginBottom: 8,
  },
  specs: {
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 10,
    marginLeft: 4,
  },

  // List Item Styles
  listCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  listImage: {
    width: 80,
    height: 80,
  },
  listContent: {
    flex: 1,
    padding: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  listBadges: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  listStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  listStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listSpecs: {
    fontSize: 11,
    marginBottom: 8,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  listOriginalPrice: {
    fontSize: 10,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  listStats: {
    flexDirection: 'row',
  },
  listStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  listStatText: {
    fontSize: 9,
    marginLeft: 2,
  },
  listActionButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionsModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  modalActions: {},
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalActionText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },

  // Empty State Styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});

export default CarListingsGrid;



