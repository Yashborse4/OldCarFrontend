import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { carApi, Vehicle } from '../../services/CarApi';
import {
  scaleSize,
  getResponsiveSpacing,
  getResponsiveTypography,
  getResponsiveBorderRadius,
} from '../../utils/responsiveEnhanced';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type VehicleAnalyticsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VehicleAnalytics'>;

interface AnalyticsData {
  totalVehicles: number;
  totalViews: number;
  totalInquiries: number;
  totalShares: number;
  avgDaysOnMarket: number;
  topPerformers: Vehicle[];
  recentActivity: any[];
  locationStats: { location: string; count: number }[];
  monthlyStats: { month: string; views: number; inquiries: number }[];
}

const VehicleAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<VehicleAnalyticsScreenNavigationProp>();
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { hasRole, isLoading: authLoading } = useAuth();

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('7d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);

      const isAdmin = hasRole('ADMIN');
      const isDealer = hasRole('DEALER');

      if (!isAdmin && !isDealer) {
        setAnalyticsData(null);
        return;
      }

      // Mock data/logic integration (Simplified for UI redesign focus)
      // In a real scenario, this would filter by selectedPeriod
      let vehicles: Vehicle[] = [];
      let stats = { totalCars: 0 };

      if (isAdmin) {
        // [top_level_await_placeholder]
        const [statistics, allVehicles] = await Promise.all([
          carApi.getAdminCarStatistics(),
          carApi.getAllVehicles(0, 100),
        ]);
        stats = statistics;
        vehicles = allVehicles.content || [];
      } else {
        const myCars = await carApi.getMyCarListings(0, 100);
        vehicles = myCars.content || [];
        stats = { totalCars: vehicles.length };
      }

      const totalViews = vehicles.reduce((sum, car) => sum + (car.views || 0), 0);
      const totalInquiries = vehicles.reduce((sum, car) => sum + (car.inquiries || 0), 0);
      const totalShares = vehicles.reduce((sum, car) => sum + (car.shares || 0), 0);

      const topPerformers = [...vehicles]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

      const locationMap: { [loc: string]: number } = {};
      vehicles.forEach(car => {
        if (car.location) {
          const key = car.location;
          locationMap[key] = (locationMap[key] || 0) + (car.views || 0);
        }
      });

      const locationStats = Object.keys(locationMap).map(location => ({
        location,
        count: locationMap[location],
      })).sort((a, b) => b.count - a.count).slice(0, 5);

      // Mock monthly stats for chart visualization
      const monthlyStats = [
        { month: 'Jan', views: 120, inquiries: 15 },
        { month: 'Feb', views: 150, inquiries: 20 },
        { month: 'Mar', views: 180, inquiries: 25 },
        { month: 'Apr', views: 220, inquiries: 30 },
        { month: 'May', views: 250, inquiries: 40 },
        { month: 'Jun', views: 300, inquiries: 45 },
      ];

      setAnalyticsData({
        totalVehicles: stats.totalCars || vehicles.length,
        totalViews,
        totalInquiries,
        totalShares,
        avgDaysOnMarket: 14, // Mock value
        topPerformers,
        recentActivity: [],
        locationStats,
        monthlyStats,
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [hasRole]);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, loadAnalyticsData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  const renderHeader = () => (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Analytics Dashboard</Text>
      <TouchableOpacity style={styles.exportButton}>
        <Ionicons name="download-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderPeriodTabs = () => (
    <View
      style={[
        styles.periodContainer,
        {
          backgroundColor: isDark ? colors.surface : '#F3F4F6',
          borderColor: colors.border,
        },
      ]}
    >
      {['7d', '30d', '90d', '1y'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodTab,
            selectedPeriod === period && { backgroundColor: colors.primary }
          ]}
          onPress={() => setSelectedPeriod(period as any)}
        >
          <Text
            style={[
              styles.periodText,
              { color: selectedPeriod === period ? '#111827' : colors.textSecondary }
            ]}
          >
            {period.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewCards = () => {
    if (!analyticsData) return null;

    const stats = [
      {
        label: 'Total Views',
        value: analyticsData.totalViews.toLocaleString(),
        icon: 'eye-outline',
        color: '#3B82F6',
        bg: '#DBEAFE',
      },
      {
        label: 'Inquiries',
        value: analyticsData.totalInquiries.toLocaleString(),
        icon: 'chatbubbles-outline',
        color: '#10B981',
        bg: '#D1FAE5',
      },
      {
        label: 'Listings',
        value: analyticsData.totalVehicles.toLocaleString(),
        icon: 'car-sport-outline',
        color: '#8B5CF6',
        bg: '#EDE9FE',
      },
      {
        label: 'Avg. Days',
        value: `${analyticsData.avgDaysOnMarket}d`,
        icon: 'time-outline',
        color: '#F59E0B',
        bg: '#FEF3C7',
      },
    ];

    return (
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={[
              styles.statCard,
              { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border }
            ]}
          >
            <View style={[styles.statIconBadge, { backgroundColor: stat.bg }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderChart = () => {
    if (!analyticsData?.monthlyStats) return null;
    const maxVal = Math.max(...analyticsData.monthlyStats.map(s => s.views));

    return (
      <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Growth Trends</Text>
          <Ionicons name="trending-up-outline" size={20} color="#10B981" />
        </View>

        <View style={styles.chartContainer}>
          {analyticsData.monthlyStats.map((item, index) => (
            <View key={index} style={styles.chartBarWrapper}>
              <View style={styles.barGroup}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(item.views / maxVal) * 100}%`,
                      backgroundColor: colors.primary,
                      opacity: 0.8,
                    }
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(item.inquiries / maxVal) * 100}%`,
                      backgroundColor: '#10B981',
                      position: 'absolute',
                      bottom: 0,
                      width: 6,
                      right: -4
                    }
                  ]}
                />
              </View>
              <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>{item.month}</Text>
            </View>
          ))}
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Views</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Inquiries</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTopPerformers = () => {
    if (!analyticsData?.topPerformers.length) return null;

    return (
      <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: getResponsiveSpacing('md') }]}>Top Vehicles</Text>

        {analyticsData.topPerformers.map((car, index) => (
          <TouchableOpacity
            key={car.id}
            style={[
              styles.performerRow,
              index !== analyticsData.topPerformers.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
            ]}
            onPress={() => navigation.navigate('VehicleDetail', { vehicleId: car.id })}
          >
            <Text style={[styles.rankText, { color: colors.textSecondary }]}>#{index + 1}</Text>
            <View style={styles.performerInfo}>
              <Text style={[styles.performerName, { color: colors.text }]} numberOfLines={1}>
                {car.year} {car.make} {car.model}
              </Text>
              <Text style={[styles.performerMetrics, { color: colors.textSecondary }]}>
                {car.views || 0} views • {car.inquiries || 0} leads
              </Text>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="trending-up-outline" size={14} color="#10B981" />
              <Text style={[styles.trendText, { color: '#10B981' }]}>High</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (authLoading || loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {renderHeader()}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderPeriodTabs()}
        {renderOverviewCards()}
        {renderChart()}
        {renderTopPerformers()}

        <View style={{ height: getResponsiveSpacing('xl') }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderBottomWidth: 1,
  },
  backButton: {
    padding: scaleSize(4),
  },
  headerTitle: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '700',
  },
  exportButton: {
    padding: scaleSize(4),
  },
  scrollContent: {
    padding: getResponsiveSpacing('lg'),
  },
  periodContainer: {
    flexDirection: 'row',
    borderRadius: getResponsiveBorderRadius('lg'),
    padding: scaleSize(4),
    marginBottom: getResponsiveSpacing('lg'),
  },
  periodTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: scaleSize(6),
    borderRadius: getResponsiveBorderRadius('md'),
  },
  periodText: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  statCard: {
    width: (SCREEN_WIDTH - getResponsiveSpacing('lg') * 2 - getResponsiveSpacing('md')) / 2,
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('xl'),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconBadge: {
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: getResponsiveBorderRadius('lg'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  statValue: {
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '700',
    marginBottom: scaleSize(2),
  },
  statLabel: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '500',
  },
  sectionCard: {
    padding: getResponsiveSpacing('lg'),
    borderRadius: getResponsiveBorderRadius('xl'),
    borderWidth: 1,
    marginBottom: getResponsiveSpacing('lg'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  sectionTitle: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '700',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: scaleSize(150),
    marginBottom: getResponsiveSpacing('md'),
  },
  chartBarWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    width: scaleSize(24),
  },
  barGroup: {
    flex: 1,
    width: scaleSize(12),
    justifyContent: 'flex-end',
    position: 'relative',
  },
  bar: {
    width: '100%',
    borderRadius: scaleSize(4),
  },
  chartLabel: {
    fontSize: getResponsiveTypography('xs'),
    marginTop: scaleSize(8),
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: getResponsiveSpacing('lg'),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(6),
  },
  legendDot: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
  },
  legendText: {
    fontSize: getResponsiveTypography('xs'),
  },
  performerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing('sm'),
  },
  rankText: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '700',
    width: scaleSize(24),
  },
  performerInfo: {
    flex: 1,
    marginHorizontal: getResponsiveSpacing('sm'),
  },
  performerName: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '600',
  },
  performerMetrics: {
    fontSize: getResponsiveTypography('xs'),
    marginTop: scaleSize(2),
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(4),
    borderRadius: getResponsiveBorderRadius('full'),
  },
  trendText: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '700',
  },
});

export default VehicleAnalyticsScreen;
