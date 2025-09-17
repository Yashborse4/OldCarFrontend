import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import * as Animatable from 'react-native-animatable';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

const { width } = Dimensions.get('window');

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
  const { colors: themeColors, spacing, borderRadius, shadows } = useTheme();
  
  const cardWidth = (width - 48) / 2; // 2 cards per row with spacing

  const renderIcon = () => {
    const IconComponent = data.iconType === 'MaterialIcons' ? MaterialIcons : AntDesign;
    return (
      <IconComponent
        name={data.icon as any}
        size={24}
        color="rgba(255, 255, 255, 0.9)"
      />
    );
  };

  const renderTrend = () => {
    if (!data.trend) return null;

    const trendColor = data.trend.isPositive ? '#68D391' : '#FC8181';
    const trendIcon = data.trend.isPositive ? 'up' : 'down';

    return (
      <View style={styles.trendContainer}>
        <AntDesign name={trendIcon} size={12} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>
          {Math.abs(data.trend.value)}%
        </Text>
        {data.trend.period && (
          <Text style={styles.trendPeriod}>{data.trend.period}</Text>
        )}
      </View>
    );
  };

  const renderCardContent = () => (
    <>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.value}>{data.value}</Text>
        <Text style={styles.title}>{data.title}</Text>
        {data.subtitle && (
          <Text style={styles.subtitle}>{data.subtitle}</Text>
        )}
        {renderTrend()}
      </View>
    </>
  );

  if (variant === 'gradient') {
    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 150}
        duration={600}
      >
        <LinearGradient
          colors={data.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientCard, { width: cardWidth }, shadows.md]}
        >
          {renderCardContent()}
        </LinearGradient>
      </Animatable.View>
    );
  }

  if (variant === 'glass') {
    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 150}
        duration={600}
      >
        <View
          style={[
            styles.glassCard,
            { 
              width: cardWidth,
              backgroundColor: themeColors.glass,
              borderColor: themeColors.glassBorder,
            },
            shadows.sm
          ]}
        >
          {renderCardContent()}
        </View>
      </Animatable.View>
    );
  }

  return (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 150}
      duration={600}
    >
      <View
        style={[
          styles.defaultCard,
          {
            width: cardWidth,
            backgroundColor: data.backgroundColor || themeColors.surface,
            borderColor: themeColors.border,
          },
          shadows.md
        ]}
      >
        {renderCardContent()}
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  gradientCard: {
    height: 120,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginRight: 16,
  },
  glassCard: {
    height: 120,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginRight: 16,
    borderWidth: 1,
    // backdropFilter not supported in React Native
  },
  defaultCard: {
    height: 120,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginRight: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  trendPeriod: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 4,
  },
});

export default StatisticsCard;



