import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Vehicle, VehiclePerformance, carApi } from '../../services/CarApi';
import { RootStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

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
  const colors = {
    text: '#1A202C',
    primary: '#FFD700',
  };
  const spacing = { md: 16 };

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);

      // For now, using mock data. In real implementation, these would be API calls
      const mockAnalyticsData: AnalyticsData = {
        totalVehicles: 15,
        totalViews: 2840,
        totalInquiries: 178,
        totalShares: 89,
        avgDaysOnMarket: 12,
        topPerformers: [
          {
            id: '1',
            make: 'Toyota',
            model: 'Camry',
            year: 2022,
            price: 2500000,
            mileage: 15000,
            location: 'Mumbai',
            condition: 'Excellent',
            images: ['https://via.placeholder.com/300x200'],
            specifications: {},
            dealerId: 'dealer1',
            dealerName: 'Premium Motors',
            isCoListed: false,
            coListedIn: [],
            views: 456,
            inquiries: 23,
            shares: 12,
            status: 'Available',
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          // Add more mock vehicles...
        ],
        recentActivity: [
          { id: '1', type: 'view', vehicle: 'Toyota Camry 2022', time: '2 hours ago' },
          { id: '2', type: 'inquiry', vehicle: 'Honda Civic 2021', time: '4 hours ago' },
          { id: '3', type: 'share', vehicle: 'BMW X5 2020', time: '6 hours ago' },
        ],
        locationStats: [
          { location: 'Mumbai', count: 456 },
          { location: 'Delhi', count: 387 },
          { location: 'Bangalore', count: 298 },
          { location: 'Chennai', count: 245 },
        ],
        monthlyStats: [
          { month: 'Jan', views: 1200, inquiries: 89 },
          { month: 'Feb', views: 1450, inquiries: 102 },
          { month: 'Mar', views: 1680, inquiries: 125 },
          { month: 'Apr', views: 1890, inquiries: 148 },
          { month: 'May', views: 2100, inquiries: 167 },
          { month: 'Jun', views: 2340, inquiries: 189 },
        ],
      };

      await new Promise<void>(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      setAnalyticsData(mockAnalyticsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, loadAnalyticsData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  const renderStatsOverview = () => {
    if (!analyticsData) return null;

    type Stat = {
      title: string;
      value: string;
      icon: React.ComponentProps<typeof MaterialIcons>['name'];
      color: string;
      change: string;
    };

    const stats: Stat[] = [
      {
        title: 'Total Views',
        value: analyticsData.totalViews.toLocaleString(),
        icon: 'visibility',
        color: '#4CAF50',
        change: '+12%',
      },
      {
        title: 'Inquiries',
        value: analyticsData.totalInquiries.toString(),
        icon: 'message',
        color: '#2196F3',
        change: '+8%',
      },
      {
        title: 'Shares',
        value: analyticsData.totalShares.toString(),
        icon: 'share',
        color: '#FF9800',
        change: '+5%',
      },
      {
        title: 'Avg. Days on Market',
        value: analyticsData.avgDaysOnMarket.toString(),
        icon: 'schedule',
        color: '#9C27B0',
        change: '-2 days',
      },
    ];

    return (
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <Card key={index} style={styles.statCard} variant="elevated">
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <MaterialIcons name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statChange, { color: stat.color }]}>
                {stat.change}
              </Text>
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </Card>
        ))}
      </View>
    );
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['7d', '30d', '90d', '1y'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.activePeriodButton
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.activePeriodButtonText
          ]}>
            {period.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTopPerformers = () => {
    if (!analyticsData?.topPerformers.length) return null;

    return (
      <Card style={styles.section} variant="elevated">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Performing Vehicles</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyGarage')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={analyticsData.topPerformers.slice(0, 3)}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.performerCard}
              onPress={() => navigation.navigate('VehicleDetail', { vehicleId: item.id })}
            >
              <View style={styles.performerGradient}>
                <Text style={styles.performerTitle}>
                  {item.year} {item.make} {item.model}
                </Text>
                <Text style={styles.performerPrice}>
                  {item.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                </Text>

                <View style={styles.performerStats}>
                  <View style={styles.performerStat}>
                    <MaterialIcons name="visibility" size={16} color="#fff" />
                    <Text style={styles.performerStatText}>{item.views}</Text>
                  </View>
                  <View style={styles.performerStat}>
                    <MaterialIcons name="message" size={16} color="#fff" />
                    <Text style={styles.performerStatText}>{item.inquiries}</Text>
                  </View>
                  <View style={styles.performerStat}>
                    <MaterialIcons name="share" size={16} color="#fff" />
                    <Text style={styles.performerStatText}>{item.shares}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </Card>
    );
  };

  const renderLocationStats = () => {
    if (!analyticsData?.locationStats.length) return null;

    const maxCount = Math.max(...analyticsData.locationStats.map(stat => stat.count));

    return (
      <Card style={styles.section} variant="elevated">
        <Text style={styles.sectionTitle}>Views by Location</Text>

        <View style={styles.locationStatsContainer}>
          {analyticsData.locationStats.map((stat, index) => (
            <View key={index} style={styles.locationStatRow}>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{stat.location}</Text>
                <Text style={styles.locationCount}>{stat.count} views</Text>
              </View>
              <View style={styles.locationBarContainer}>
                <View
                  style={[
                    styles.locationBar,
                    { width: `${(stat.count / maxCount) * 100}%` }
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderRecentActivity = () => {
    if (!analyticsData?.recentActivity.length) return null;

    const getActivityIcon = (type: string) => {
      switch (type) {
        case 'view':
          return 'visibility';
        case 'inquiry':
          return 'message';
        case 'share':
          return 'share';
        default:
          return 'info';
      }
    };

    return (
      <Card style={styles.section} variant="elevated">
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        <View style={styles.activityList}>
          {analyticsData.recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <MaterialIcons name={getActivityIcon(activity.type)} size={16} color={colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  New {activity.type} on {activity.vehicle}
                </Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button
          title="View All Activity"
          variant="outline"
          onPress={() => navigation.navigate('Notifications')}
          style={styles.viewActivityButton}
        />
      </Card>
    );
  };

  const renderMonthlyChart = () => {
    if (!analyticsData?.monthlyStats.length) return null;

    const maxViews = Math.max(...analyticsData.monthlyStats.map(stat => stat.views));

    return (
      <Card style={styles.section} variant="elevated">
        <Text style={styles.sectionTitle}>Monthly Performance</Text>

        <View style={styles.chartContainer}>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Views</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.legendText}>Inquiries</Text>
            </View>
          </View>

          <View style={styles.chart}>
            {analyticsData.monthlyStats.map((stat, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (stat.views / maxViews) * 100,
                        backgroundColor: colors.primary
                      }
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (stat.inquiries / maxViews) * 100,
                        backgroundColor: '#FF6B6B',
                        position: 'absolute',
                        right: 0
                      }
                    ]}
                  />
                </View>
                <Text style={styles.monthLabel}>{stat.month}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Analytics</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderPeriodSelector()}
        {renderStatsOverview()}
        {renderTopPerformers()}
        {renderLocationStats()}
        {renderMonthlyChart()}
        {renderRecentActivity()}
      </ScrollView>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    color: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 4,

    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: '#4ECDC4',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activePeriodButtonText: {
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statCard: {
    width: (width - 48) / 2,
    marginRight: 16,
    marginBottom: 16,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statChange: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  performerCard: {
    width: 200,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  performerGradient: {
    padding: 16,
    minHeight: 120,
    backgroundColor: '#4ECDC4',
  },
  performerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  performerPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  performerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performerStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performerStatText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  locationStatsContainer: {
    marginTop: 16,
  },
  locationStatRow: {
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  locationCount: {
    fontSize: 14,
    color: '#666',
  },
  locationBarContainer: {
    height: 6,
    color: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  locationBar: {
    height: '100%',
    color: '#4ECDC4',
    borderRadius: 3,
  },
  activityList: {
    marginTop: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    color: '#f0f0f0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  viewActivityButton: {
    marginTop: 16,
  },
  chartContainer: {
    marginTop: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingTop: 20,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    width: 24,
    height: 100,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  bar: {
    width: 10,
    borderRadius: 2,
    minHeight: 4,
  },
  monthLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default VehicleAnalyticsScreen;



