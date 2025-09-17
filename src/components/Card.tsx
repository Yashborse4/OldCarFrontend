/**
 * Advanced Card Components
 * Provides comprehensive card solutions for car listings, profiles, and content display
 */

import React, { memo, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextStyle,
  Pressable,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { 
  scale, 
  SPACING, 
  FONT_SIZES, 
  DIMENSIONS as RESPONSIVE_DIMENSIONS,
  useResponsive 
} from '../utils/responsive';
import { withPerformanceTracking } from '../utils/performance';
import { Skeleton } from './Loading';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Base Card Props
interface BaseCardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  
  // Animation
  animatePress?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'text' | 'image' | 'none';
}

// Base Card Component
const BaseCardComponent: React.FC<BaseCardProps> = ({
  children,
  style,
  contentStyle,
  variant = 'elevated',
  onPress,
  onLongPress,
  disabled = false,
  loading = false,
  animatePress = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
}) => {
  const { colors: themeColors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (animatePress && !disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  }, [animatePress, disabled, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (animatePress && !disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  }, [animatePress, disabled, scaleAnim]);

  const getCardStyles = useCallback(() => {
    const baseStyle: ViewStyle = {
      borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.medium,
      overflow: 'hidden',
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: themeColors.surface,
          elevation: 4,
          shadowColor: themeColors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        };
      
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: themeColors.surface,
          borderWidth: 1,
          borderColor: themeColors.border,
        };
      
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: themeColors.surfaceVariant,
        };
      
      default:
        return baseStyle;
    }
    }, [variant, themeColors]);

  const cardStyles = getCardStyles();

  if (loading) {
    return (
      <View style={[cardStyles, style]}>
        <Skeleton
          width="100%"
          height={scale(120)}
          animated={true}
        />
      </View>
    );
  }

  const CardWrapper = onPress || onLongPress ? Pressable : View;

  return (
    <Animated.View
      style={[
        cardStyles,
        style,
        disabled && styles.disabled,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <CardWrapper
        onPress={disabled ? undefined : onPress}
        onLongPress={disabled ? undefined : onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.cardContent, contentStyle]}
        disabled={disabled}
        accessible={!!onPress || !!onLongPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled }}
      >
        {children}
      </CardWrapper>
    </Animated.View>
  );
};

// Car Card Props
interface CarCardProps extends Omit<BaseCardProps, 'children'> {
  car: {
    id: string;
    title: string;
    subtitle?: string;
    price: string | number;
    originalPrice?: string | number;
    location?: string;
    year?: number;
    mileage?: string;
    fuelType?: string;
    transmission?: string;
    images: string[];
    isFavorite?: boolean;
    isVerified?: boolean;
    rating?: number;
    dealerName?: string;
    features?: string[];
    condition?: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  };
  
  // Display options
  showFavorite?: boolean;
  showVerified?: boolean;
  showRating?: boolean;
  showFeatures?: boolean;
  compact?: boolean;
  
  // Callbacks
  onFavoritePress?: (carId: string, isFavorite: boolean) => void;
  onImagePress?: (carId: string, imageIndex: number) => void;
}

// Car Card Component
const CarCardComponent: React.FC<CarCardProps> = ({
  car,
  showFavorite = true,
  showVerified = true,
  showRating = true,
  showFeatures = false,
  compact = false,
  onFavoritePress,
  onImagePress,
  ...baseProps
}) => {
  const { colors: themeColors } = useTheme();
  const { deviceInfo } = useResponsive();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleFavoritePress = useCallback(() => {
    onFavoritePress?.(car.id, !car.isFavorite);
  }, [car.id, car.isFavorite, onFavoritePress]);

  const handleImagePress = useCallback(() => {
    onImagePress?.(car.id, currentImageIndex);
  }, [car.id, currentImageIndex, onImagePress]);

  const formatPrice = useCallback((price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(1)}L`;
    } else if (numPrice >= 1000) {
      return `₹${(numPrice / 1000).toFixed(0)}K`;
    }
    return `₹${numPrice.toLocaleString()}`;
  }, []);

  const getConditionColor = useCallback((condition?: string) => {
    switch (condition) {
      case 'Excellent': return themeColors.success;
      case 'Good': return themeColors.info;
      case 'Fair': return themeColors.warning;
      case 'Poor': return themeColors.error;
      default: return themeColors.textSecondary;
    }
    }, [themeColors]);

  return (
    <BaseCard
      {...baseProps}
      style={[
        styles.carCard,
        compact && styles.carCardCompact,
        baseProps.style,
      ]}
      accessibilityLabel={`${car.title} for ${formatPrice(car.price)}`}
    >
      {/* Image Section */}
      <View style={styles.carImageContainer}>
        <Skeleton
          width="100%"
          height={scale(200)}
          animated={true}
          style={[
            styles.carImage,
            compact && styles.carImageCompact,
          ]}
        />
        
        {/* Image Indicators */}
        {car.images.length > 1 && (
          <View style={styles.imageIndicators}>
            {car.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.imageIndicator,
                  {
                    backgroundColor: index === currentImageIndex 
                      ? themeColors.primary 
                      : themeColors.surface,
                  },
                ]}
              />
            ))}
          </View>
        )}
        
        {/* Overlay Actions */}
        <View style={styles.imageOverlay}>
          {/* Favorite Button */}
          {showFavorite && (
            <TouchableOpacity
              onPress={handleFavoritePress}
              style={[styles.favoriteButton, { backgroundColor: themeColors.surface }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name={car.isFavorite ? 'favorite' : 'favorite-border'}
                size={scale(20)}
                color={car.isFavorite ? themeColors.error : themeColors.textSecondary}
              />
            </TouchableOpacity>
          )}
          
          {/* Verified Badge */}
          {showVerified && car.isVerified && (
            <View style={[styles.verifiedBadge, { backgroundColor: themeColors.success }]}>
              <MaterialIcons
                name="verified"
                size={scale(16)}
                color={themeColors.onSuccess}
              />
            </View>
          )}
        </View>
        
        {/* Condition Badge */}
        {car.condition && (
          <View style={styles.conditionBadge}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.conditionGradient}
            />
            <Text
              style={[
                styles.conditionText,
                { color: getConditionColor(car.condition) },
              ]}
            >
              {car.condition}
            </Text>
          </View>
        )}
      </View>
      
      {/* Content Section */}
      <View style={[styles.carContent, compact && styles.carContentCompact]}>
        {/* Title and Price */}
        <View style={styles.carHeader}>
          <View style={styles.carTitleContainer}>
            <Text
              style={[styles.carTitle, { color: themeColors.text }]}
              numberOfLines={1}
            >
              {car.title}
            </Text>
            {car.subtitle && (
              <Text
                style={[styles.carSubtitle, { color: themeColors.textSecondary }]}
                numberOfLines={1}
              >
                {car.subtitle}
              </Text>
            )}
          </View>
          
          <View style={styles.carPriceContainer}>
            <Text style={[styles.carPrice, { color: themeColors.primary }]}>
              {formatPrice(car.price)}
            </Text>
            {car.originalPrice && car.originalPrice !== car.price && (
              <Text
                style={[
                  styles.carOriginalPrice,
                  { color: themeColors.textSecondary },
                ]}
              >
                {formatPrice(car.originalPrice)}
              </Text>
            )}
          </View>
        </View>
        
        {/* Details */}
        {!compact && (
          <View style={styles.carDetails}>
            {car.year && (
              <View style={styles.carDetailItem}>
                <MaterialIcons
                  name="event"
                  size={scale(14)}
                  color={themeColors.textSecondary}
                />
                <Text style={[styles.carDetailText, { color: themeColors.textSecondary }]}>
                  {car.year}
                </Text>
              </View>
            )}
            
            {car.mileage && (
              <View style={styles.carDetailItem}>
                <MaterialIcons
                  name="speed"
                  size={scale(14)}
                  color={themeColors.textSecondary}
                />
                <Text style={[styles.carDetailText, { color: themeColors.textSecondary }]}>
                  {car.mileage}
                </Text>
              </View>
            )}
            
            {car.fuelType && (
              <View style={styles.carDetailItem}>
                <MaterialIcons
                  name="local-gas-station"
                  size={scale(14)}
                  color={themeColors.textSecondary}
                />
                <Text style={[styles.carDetailText, { color: themeColors.textSecondary }]}>
                  {car.fuelType}
                </Text>
              </View>
            )}
            
            {car.transmission && (
              <View style={styles.carDetailItem}>
                <MaterialIcons
                  name="settings"
                  size={scale(14)}
                  color={themeColors.textSecondary}
                />
                <Text style={[styles.carDetailText, { color: themeColors.textSecondary }]}>
                  {car.transmission}
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Location and Rating */}
        <View style={styles.carFooter}>
          {car.location && (
            <View style={styles.carLocationContainer}>
              <MaterialIcons
                name="location-on"
                size={scale(14)}
                color={themeColors.textSecondary}
              />
              <Text
                style={[styles.carLocationText, { color: themeColors.textSecondary }]}
                numberOfLines={1}
              >
                {car.location}
              </Text>
            </View>
          )}
          
          {showRating && car.rating && (
            <View style={styles.carRatingContainer}>
              <MaterialIcons
                name="star"
                size={scale(14)}
                color={themeColors.warning}
              />
              <Text style={[styles.carRatingText, { color: themeColors.text }]}>
                {car.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
        
        {/* Features */}
        {showFeatures && car.features && car.features.length > 0 && (
          <View style={styles.carFeatures}>
            {car.features.slice(0, 3).map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.carFeatureTag,
                  { backgroundColor: themeColors.surfaceVariant },
                ]}
              >
                <Text
                  style={[
                    styles.carFeatureText,
                    { color: themeColors.onSurfaceVariant },
                  ]}
                >
                  {feature}
                </Text>
              </View>
            ))}
            {car.features.length > 3 && (
              <Text style={[styles.carMoreFeatures, { color: themeColors.primary }]}>
                +{car.features.length - 3} more
              </Text>
            )}
          </View>
        )}
        
        {/* Dealer */}
        {car.dealerName && (
          <View style={styles.carDealer}>
            <MaterialIcons
              name="store"
              size={scale(14)}
              color={themeColors.textSecondary}
            />
            <Text
              style={[styles.carDealerText, { color: themeColors.textSecondary }]}
              numberOfLines={1}
            >
              Sold by {car.dealerName}
            </Text>
          </View>
        )}
      </View>
    </BaseCard>
  );
};

// Profile Card Props
interface ProfileCardProps extends Omit<BaseCardProps, 'children'> {
  user: {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
    location?: string;
    rating?: number;
    reviewCount?: number;
    isVerified?: boolean;
    joinDate?: string;
    badges?: string[];
  };
  
  showStats?: boolean;
  showBadges?: boolean;
  horizontal?: boolean;
  
  onAvatarPress?: (userId: string) => void;
}

// Profile Card Component
const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  user,
  showStats = true,
  showBadges = true,
  horizontal = false,
  onAvatarPress,
  ...baseProps
}) => {
  const { colors: themeColors } = useTheme();

  const handleAvatarPress = useCallback(() => {
    onAvatarPress?.(user.id);
  }, [user.id, onAvatarPress]);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);

  return (
    <BaseCard
      {...baseProps}
      style={[
        styles.profileCard,
        horizontal && styles.profileCardHorizontal,
        baseProps.style,
      ]}
      accessibilityLabel={`${user.name} profile`}
    >
      <View style={[
        styles.profileContent,
        horizontal && styles.profileContentHorizontal,
      ]}>
        {/* Avatar */}
        <TouchableOpacity
          onPress={handleAvatarPress}
          style={[
            styles.profileAvatar,
            horizontal && styles.profileAvatarHorizontal,
          ]}
          disabled={!onAvatarPress}
        >
          {user.avatar ? (
            <View
              style={[
                styles.profileAvatarImage,
                { borderRadius: horizontal ? scale(25) : scale(35) }
              ]}
            />
          ) : (
            <View
              style={[
                styles.profileAvatarPlaceholder,
                { backgroundColor: themeColors.primary },
                horizontal && styles.profileAvatarPlaceholderHorizontal,
              ]}
            >
              <Text
                style={[
                  styles.profileAvatarText,
                  { color: themeColors.onPrimary },
                  horizontal && styles.profileAvatarTextHorizontal,
                ]}
              >
                {getInitials(user.name)}
              </Text>
            </View>
          )}
          
          {user.isVerified && (
            <View
              style={[
                styles.profileVerifiedBadge,
                { backgroundColor: themeColors.success },
                horizontal && styles.profileVerifiedBadgeHorizontal,
              ]}
            >
              <MaterialIcons
                name="verified"
                size={scale(horizontal ? 12 : 14)}
                color={themeColors.onSuccess}
              />
            </View>
          )}
        </TouchableOpacity>
        
        {/* Info */}
        <View style={[
          styles.profileInfo,
          horizontal && styles.profileInfoHorizontal,
        ]}>
          <Text
            style={[
              styles.profileName,
              { color: themeColors.text },
              horizontal && styles.profileNameHorizontal,
            ]}
            numberOfLines={1}
          >
            {user.name}
          </Text>
          
          {user.title && (
            <Text
              style={[
                styles.profileTitle,
                { color: themeColors.textSecondary },
                horizontal && styles.profileTitleHorizontal,
              ]}
              numberOfLines={1}
            >
              {user.title}
            </Text>
          )}
          
          {user.location && (
            <View style={styles.profileLocation}>
              <MaterialIcons
                name="location-on"
                size={scale(14)}
                color={themeColors.textSecondary}
              />
              <Text
                style={[styles.profileLocationText, { color: themeColors.textSecondary }]}
                numberOfLines={1}
              >
                {user.location}
              </Text>
            </View>
          )}
          
          {/* Stats */}
          {showStats && (user.rating || user.reviewCount) && (
            <View style={styles.profileStats}>
              {user.rating && (
                <View style={styles.profileStat}>
                  <MaterialIcons
                    name="star"
                    size={scale(14)}
                    color={themeColors.warning}
                  />
                  <Text style={[styles.profileStatText, { color: themeColors.text }]}>
                    {user.rating.toFixed(1)}
                  </Text>
                </View>
              )}
              
              {user.reviewCount && (
                <View style={styles.profileStat}>
                  <MaterialIcons
                    name="rate-review"
                    size={scale(14)}
                    color={themeColors.textSecondary}
                  />
                  <Text style={[styles.profileStatText, { color: themeColors.text }]}>
                    {user.reviewCount}
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {/* Badges */}
          {showBadges && user.badges && user.badges.length > 0 && (
            <View style={styles.profileBadges}>
              {user.badges.slice(0, 3).map((badge, index) => (
                <View
                  key={index}
                  style={[
                    styles.profileBadge,
                    { backgroundColor: themeColors.surfaceVariant },
                  ]}
                >
                  <Text
                    style={[
                      styles.profileBadgeText,
                      { color: themeColors.onSurfaceVariant },
                    ]}
                  >
                    {badge}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {user.joinDate && (
            <Text
              style={[
                styles.profileJoinDate,
                { color: themeColors.textSecondary },
              ]}
            >
              Member since {user.joinDate}
            </Text>
          )}
        </View>
      </View>
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  // Base Card
  disabled: {
    opacity: 0.6,
  },
  cardContent: {
    flex: 1,
  },
  
  // Car Card
  carCard: {
    marginBottom: SPACING.md,
  },
  carCardCompact: {
    flexDirection: 'row',
  },
  carImageContainer: {
    position: 'relative',
  },
  carImage: {
    width: '100%',
    height: scale(200),
  },
  carImageCompact: {
    width: scale(120),
    height: scale(90),
  },
  imageIndicators: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs / 2,
  },
  imageIndicator: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },
  imageOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  favoriteButton: {
    padding: SPACING.xs,
    borderRadius: scale(20),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  verifiedBadge: {
    padding: SPACING.xs / 2,
    borderRadius: scale(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  conditionBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: scale(30),
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  conditionGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  conditionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  carContent: {
    padding: SPACING.md,
  },
  carContentCompact: {
    flex: 1,
    padding: SPACING.sm,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  carTitleContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  carTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  carSubtitle: {
    fontSize: FONT_SIZES.sm,
  },
  carPriceContainer: {
    alignItems: 'flex-end',
  },
  carPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  carOriginalPrice: {
    fontSize: FONT_SIZES.sm,
    textDecorationLine: 'line-through',
    marginTop: SPACING.xs / 2,
  },
  carDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  carDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  carDetailText: {
    fontSize: FONT_SIZES.xs,
  },
  carFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  carLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.xs / 2,
  },
  carLocationText: {
    fontSize: FONT_SIZES.xs,
    flex: 1,
  },
  carRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  carRatingText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  carFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  carFeatureTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.small,
  },
  carFeatureText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  carMoreFeatures: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  carDealer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  carDealerText: {
    fontSize: FONT_SIZES.xs,
    flex: 1,
  },
  
  // Profile Card
  profileCard: {
    marginBottom: SPACING.md,
  },
  profileCardHorizontal: {
    minHeight: scale(80),
  },
  profileContent: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  profileContentHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  profileAvatarHorizontal: {
    marginBottom: 0,
    marginRight: SPACING.md,
  },
  profileAvatarImage: {
    width: scale(70),
    height: scale(70),
  },
  profileAvatarPlaceholder: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarPlaceholderHorizontal: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
  },
  profileAvatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  profileAvatarTextHorizontal: {
    fontSize: FONT_SIZES.md,
  },
  profileVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: scale(12),
    padding: SPACING.xs / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileVerifiedBadgeHorizontal: {
    borderRadius: scale(10),
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileInfoHorizontal: {
    flex: 1,
    alignItems: 'flex-start',
  },
  profileName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs / 2,
  },
  profileNameHorizontal: {
    fontSize: FONT_SIZES.md,
    textAlign: 'left',
  },
  profileTitle: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  profileTitleHorizontal: {
    textAlign: 'left',
  },
  profileLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
    marginBottom: SPACING.xs,
  },
  profileLocationText: {
    fontSize: FONT_SIZES.xs,
  },
  profileStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  profileStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  profileStatText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  profileBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  profileBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.small,
  },
  profileBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  profileJoinDate: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
});

// Memoized exports
export const BaseCard = memo(withPerformanceTracking(BaseCardComponent, 'BaseCard'));
export const CarCard = memo(withPerformanceTracking(CarCardComponent, 'CarCard'));
export const ProfileCard = memo(withPerformanceTracking(ProfileCardComponent, 'ProfileCard'));

// Display names
BaseCard.displayName = 'BaseCard';
CarCard.displayName = 'CarCard';
ProfileCard.displayName = 'ProfileCard';

export default BaseCard;


