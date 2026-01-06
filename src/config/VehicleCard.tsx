import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme';
import { Vehicle } from '../services/CarApi';
import {
  scaleSize,
  getResponsiveSpacing,
  getResponsiveTypography,
  getResponsiveBorderRadius,
  wp,
} from '../utils/responsiveEnhanced';

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
  const { theme, isDark } = useTheme();
  const { colors } = theme;
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
        return '#10B981'; // Green
      case 'Sold':
        return '#EF4444'; // Red
      case 'Reserved':
        return '#F59E0B'; // Amber
      case 'Archived':
        return '#6B7280'; // Gray
      default:
        return '#10B981';
    }
  };

  const getStatusIcon = (status: Vehicle['status']) => {
    switch (status) {
      case 'Available': return 'checkmark-circle';
      case 'Sold': return 'close-circle';
      case 'Reserved': return 'time';
      case 'Archived': return 'archive';
      default: return 'checkmark-circle';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surface : '#FFFFFF',
          borderColor: colors.border,
          shadowColor: isDark ? '#000' : '#ccc',
        }
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        {!imageError && vehicle.images && vehicle.images.length > 0 ? (
          <Image
            source={{ uri: vehicle.images[0] }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: isDark ? '#2C2C2C' : '#F3F4F6' }]}>
            <Ionicons name="car-sport" size={64} color={colors.textSecondary} />
          </View>
        )}

        {/* Top Badges */}
        <View style={styles.topOverlay}>
          <View style={styles.leftBadges}>
            {vehicle.featured && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Ionicons name="star" size={12} color="#111827" />
                <Text style={[styles.badgeText, { color: '#111827' }]}>Featured</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: getStatusColor(vehicle.status) }]}>
              <Ionicons name={getStatusIcon(vehicle.status) as any} size={12} color="#FFFFFF" />
              <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>{vehicle.status}</Text>
            </View>
          </View>

          {onBookmark && (
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={onBookmark}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isBookmarked ? colors.primary : '#FFFFFF'}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Overlay - Image Count */}
        {vehicle.images && vehicle.images.length > 1 && (
          <View style={styles.imageCountBadge}>
            <Ionicons name="images-outline" size={12} color="#FFFFFF" />
            <Text style={styles.imageCountText}>{vehicle.images.length}</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            <Text style={[styles.variant, { color: colors.textSecondary }]} numberOfLines={1}>
              {vehicle.variant}
            </Text>
          </View>
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatPrice(vehicle.price)}
          </Text>
        </View>

        {/* Specs Grid */}
        <View style={[styles.specsGrid, { backgroundColor: isDark ? colors.background : '#F9FAFB' }]}>
          <View style={styles.specItem}>
            <Ionicons name="speedometer-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {formatMileage(vehicle.mileage)}
            </Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.specItem}>
            <Ionicons name="filter-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {vehicle.fuelType}
            </Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.specItem}>
            <Ionicons name="hardware-chip-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {vehicle.transmission}
            </Text>
          </View>
        </View>

        {/* Location & Dealer */}
        <View style={styles.footerRow}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
              {vehicle.location}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.statValue, { color: colors.textSecondary }]}>{vehicle.views}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.statValue, { color: colors.textSecondary }]}>{vehicle.inquiries}</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={[styles.actionButtons, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={onPress}
          >
            <Text style={styles.primaryButtonText}>View Details</Text>
            <Ionicons name="arrow-forward" size={16} color="#111827" />
          </TouchableOpacity>

          {showCoListButton && onCoList && (
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
              ]}
              onPress={onCoList}
            >
              <Ionicons name="share-social-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
            ]}
            onPress={onPress} // Default call/chat action
          >
            <Ionicons name="call-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: getResponsiveBorderRadius('xl'),
    marginBottom: getResponsiveSpacing('lg'),
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: scaleSize(180),
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topOverlay: {
    position: 'absolute',
    top: getResponsiveSpacing('sm'),
    left: getResponsiveSpacing('sm'),
    right: getResponsiveSpacing('sm'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  leftBadges: {
    flexDirection: 'row',
    gap: scaleSize(6),
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(4),
    borderRadius: getResponsiveBorderRadius('full'),
  },
  badgeText: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '700',
  },
  bookmarkButton: {
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: getResponsiveBorderRadius('full'),
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: getResponsiveSpacing('sm'),
    right: getResponsiveSpacing('sm'),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(4),
    borderRadius: getResponsiveBorderRadius('md'),
  },
  imageCountText: {
    color: '#FFFFFF',
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '600',
  },
  content: {
    padding: getResponsiveSpacing('md'),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: getResponsiveSpacing('md'),
  },
  titleContainer: {
    flex: 1,
    marginRight: getResponsiveSpacing('sm'),
  },
  title: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '700',
    marginBottom: scaleSize(2),
  },
  variant: {
    fontSize: getResponsiveTypography('sm'),
  },
  price: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '800',
  },
  specsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getResponsiveSpacing('sm'),
    borderRadius: getResponsiveBorderRadius('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
  },
  specText: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '500',
  },
  verticalDivider: {
    width: 1,
    height: scaleSize(12),
    backgroundColor: '#D1D5DB',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getResponsiveSpacing('md'),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
    flex: 1,
  },
  locationText: {
    fontSize: getResponsiveTypography('sm'),
  },
  statsContainer: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('md'),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
  },
  statValue: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('sm'),
    paddingTop: getResponsiveSpacing('md'),
    borderTopWidth: 1,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(6),
    paddingVertical: scaleSize(10),
    borderRadius: getResponsiveBorderRadius('lg'),
  },
  primaryButtonText: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '700',
    color: '#111827',
  },
  iconButton: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: getResponsiveBorderRadius('lg'),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VehicleCard;
