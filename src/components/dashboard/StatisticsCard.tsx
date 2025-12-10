import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

import AntDesign from '@react-native-vector-icons/ant-design';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { scaleSize, getResponsiveSpacing, getResponsiveBorderRadius, getResponsiveTypography } from '../../utils/responsiveEnhanced';
import { useTheme } from '../../theme';


export interface StatisticData {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  icon: string;
  iconType?: 'AntDesign' | 'MaterialIcons';
  gradient: string[];
  backgroundColor?: string;
}

interface StatisticsCardProps {
  data: StatisticData;
  index: number;
  variant?: 'default' | 'gradient' | 'glass';
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  data,
  index,
  variant = 'gradient'
}) => {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const { colors } = theme;

  // Calculate card width dynamically based on screen width
  // We assume 2 columns with padding
  const padding = getResponsiveSpacing('lg');
  const gap = getResponsiveSpacing('md');
  const cardWidth = (width - (padding * 2) - gap) / 2;

  const renderIcon = () => {
    const IconComponent = data.iconType === 'MaterialIcons' ? MaterialIcons : AntDesign;
    const iconColor = variant === 'default' ? colors.primary : 'rgba(255, 255, 255, 0.9)';

    return (
      <IconComponent
        name={data.icon as any}
        size={scaleSize(24)}
        color={iconColor}
      />
    );
  };

  const renderTrend = () => {
    if (!data.trend) return null;

    const trendColor = data.trend.isPositive ? '#68D391' : '#FC8181';
    const trendIcon = data.trend.isPositive ? 'arrow-up' : 'arrow-down';

    return (
      <View style={styles.trendContainer}>
        <AntDesign name={trendIcon} size={scaleSize(12)} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>
          {Math.abs(data.trend.value)}%
        </Text>
        {data.trend.period && (
          <Text style={[styles.trendPeriod, { color: variant === 'default' ? colors.textSecondary : 'rgba(255, 255, 255, 0.7)' }]}>
            {data.trend.period}
          </Text>
        )}
      </View>
    );
  };

  const renderCardContent = () => (
    <>
      <View style={styles.header}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: variant === 'default' ? colors.surfaceVariant : 'rgba(255, 255, 255, 0.2)' }
        ]}>
          {renderIcon()}
        </View>
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.value,
            { color: variant === 'default' ? colors.text : '#FFFFFF' }
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {data.value}
        </Text>
        <Text
          style={[
            styles.title,
            { color: variant === 'default' ? colors.textSecondary : 'rgba(255, 255, 255, 0.9)' }
          ]}
          numberOfLines={1}
        >
          {data.title}
        </Text>
        {data.subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: variant === 'default' ? colors.textSecondary : 'rgba(255, 255, 255, 0.7)' }
            ]}
            numberOfLines={1}
          >
            {data.subtitle}
          </Text>
        )}
        {renderTrend()}
      </View>
    </>
  );

  const containerStyle = {
    width: cardWidth,
    marginRight: (index % 2 === 0) ? gap : 0, // Add margin only to the first item in a row if needed, handled by parent usually but good for safety
    marginBottom: gap,
    borderRadius: getResponsiveBorderRadius('xl'),
  };

  if (variant === 'gradient') {
    return (
      <View style={{ width: cardWidth, marginBottom: gap }}>
        <View
          style={[styles.cardBase, { width: '100%', backgroundColor: data.gradient[0] }]}
        >
          {renderCardContent()}
        </View>
      </View>
    );
  }

  if (variant === 'glass') {
    return (
      <View style={{ width: cardWidth, marginBottom: gap }}>
        <View
          style={[
            styles.cardBase,
            {
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1,
            }
          ]}
        >
          {renderCardContent()}
        </View>
      </View>
    );
  }

  return (
    <View style={{ width: cardWidth, marginBottom: gap }}>
      <View
        style={[
          styles.cardBase,
          {
            width: '100%',
            backgroundColor: data.backgroundColor || colors.surface,
            borderColor: colors.border,
            borderWidth: 1,

            elevation: 2,
          }
        ]}
      >
        {renderCardContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    height: scaleSize(140),
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('xl'),
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: getResponsiveBorderRadius('lg'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: getResponsiveSpacing('sm'),
  },
  value: {
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '700',
    marginBottom: scaleSize(4),
  },
  title: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '600',
    marginBottom: scaleSize(2),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: getResponsiveTypography('xs'),
    marginBottom: scaleSize(8),
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '700',
    marginLeft: scaleSize(4),
  },
  trendPeriod: {
    fontSize: getResponsiveTypography('xs'),
    marginLeft: scaleSize(4),
  },
});

export default StatisticsCard;
