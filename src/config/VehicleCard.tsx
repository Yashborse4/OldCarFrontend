import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import { Vehicle } from '../services/CarApi';

const { width } = Dimensions.get('window');

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
  showCoListButton?: boolean;
  onCoList?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPress,
  showCoListButton = false,
  onCoList,
  onBookmark,
  isBookmarked = false,
}) => {
  const colors = { text: '#1A202C', textSecondary: '#4A5568', primary: '#FFD700', surface: '#FFFFFF' };
  const spacing = { sm: 8, md: 16 };
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
  };

  const formatMileage = (mileage: number) => {
    if (mileage >= 100000) {
      return `${(mileage / 100000).toFixed(1)}L km`;
    } else if (mileage >= 1000) {
      return `${(mileage / 1000).toFixed(1)}K km`;
    }
    return `${mileage} km`;
  };

  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'Available':
        return '#4CAF50';
      case 'Sold':
        return '#F44336';
      case 'Reserved':
        return '#FF9800';
      case 'Archived':
        return '#9E9E9E';
      default:
        return '#4CAF50';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.card}>
        {/* Image Container */}
        <View style={styles.imageContainer}>
          {!imageError && vehicle.images && vehicle.images.length > 0 ? (
            <Image
              source={{ uri: vehicle.images[0] }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialIcons name="directions-car" size={40} color="#ccc" />
            </View>
          )}

          {/* Badges */}
          <View style={styles.badges}>
            {vehicle.featured && (
              <View style={styles.featuredBadge}>
                <MaterialIcons name="star" size={12} color="#fff" />
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            )}

            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) }]}>
              <Text style={styles.statusText}>{vehicle.status}</Text>
            </View>
          </View>

          {/* Bookmark Button */}
          {onBookmark && (
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={onBookmark}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                size={20}
                color={isBookmarked ? colors.primary : '#fff'}
              />
            </TouchableOpacity>
          )}

          {/* Image Count */}
          {vehicle.images && vehicle.images.length > 1 && (
            <View style={styles.imageCount}>
              <MaterialIcons name="photo-library" size={14} color="#fff" />
              <Text style={styles.imageCountText}>{vehicle.images.length}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Year */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            {vehicle.isCoListed && (
              <View style={styles.coListedBadge}>
                <MaterialIcons name="share" size={12} color={colors.primary} />
              </View>
            )}
          </View>

          {/* Price */}
          <Text style={styles.price}>{formatPrice(vehicle.price)}</Text>

          {/* Details Row */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MaterialIcons name="speed" size={16} color="#666" />
              <Text style={styles.detailText}>{formatMileage(vehicle.mileage)}</Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons name="location-on" size={16} color="#666" />
              <Text style={styles.detailText}>{vehicle.location}</Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons name="build" size={16} color="#666" />
              <Text style={styles.detailText}>{vehicle.condition}</Text>
            </View>
          </View>

          {/* Dealer Info */}
          <View style={styles.dealerRow}>
            <View style={styles.dealerInfo}>
              <MaterialIcons name="storefront" size={14} color="#666" />
              <Text style={styles.dealerText}>{vehicle.dealerName}</Text>
            </View>

            {/* Stats */}
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <MaterialIcons name="visibility" size={12} color="#666" />
                <Text style={styles.statText}>{vehicle.views}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="message" size={12} color="#666" />
                <Text style={styles.statText}>{vehicle.inquiries}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.contactButton} onPress={onPress}>
              <MaterialIcons name="phone" size={16} color={colors.primary} />
              <Text style={styles.contactText}>Contact</Text>
            </TouchableOpacity>

            {showCoListButton && onCoList && (
              <TouchableOpacity style={styles.coListButton} onPress={onCoList}>
                <MaterialIcons name="share" size={16} color={colors.primary} />
                <Text style={styles.coListText}>Co-List</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.viewButton} onPress={onPress}>
              <Text style={styles.viewText}>View Details</Text>
              <MaterialIcons name="chevron-right" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',

    elevation: 4,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    backgroundColor: '#FFD700',
  },
  featuredText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCount: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  imageCountText: {
    fontSize: 11,
    color: '#fff',
    marginLeft: 2,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  coListedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  dealerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dealerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dealerText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    marginRight: 8,
  },
  contactText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
    marginLeft: 4,
  },
  coListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    marginRight: 8,
  },
  coListText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
    marginLeft: 4,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    marginLeft: 8,
  },
  viewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default VehicleCard;



