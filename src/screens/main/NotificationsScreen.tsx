import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from '../../components/ui/Button';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeContext';


type IconProps = React.ComponentProps<typeof Ionicons>['name'];

interface Notification {
  id: string;
  type: 'new_listing' | 'inquiry' | 'co_listing' | 'message' | 'group_invite' | 'price_alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: any;
  actionable?: boolean;
}

interface NotificationSettings {
  newListings: boolean;
  inquiries: boolean;
  coListingActions: boolean;
  newMessages: boolean;
  groupInvites: boolean;
  priceAlerts: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

type NotificationsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Notifications'>;

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const spacing = { sm: 8, md: 16, lg: 24, xl: 32 };
  const styles = React.useMemo(() => createStyles(colors), [colors]);


  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'actionable'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    newListings: true,
    inquiries: true,
    coListingActions: true,
    newMessages: true,
    groupInvites: true,
    priceAlerts: true,
    systemNotifications: true,
    emailNotifications: false,
    pushNotifications: true,
  });

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'inquiry',
      title: 'New Inquiry',
      message: 'Sarah Johnson inquired about your 2023 BMW X5',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      isRead: false,
      data: { vehicleId: 'v1', dealerId: 'dealer2', dealerName: 'Sarah Johnson' },
      actionable: true,
    },
    {
      id: '2',
      type: 'co_listing',
      title: 'Co-listing Request',
      message: 'Mike Wilson wants to co-list your Mercedes C-Class in Luxury Car Network',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      isRead: false,
      data: { vehicleId: 'v2', groupId: 'g1', dealerId: 'dealer3' },
      actionable: true,
    },
    {
      id: '3',
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from Tom Anderson',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isRead: true,
      data: { dealerId: 'dealer6', dealerName: 'Tom Anderson' },
      actionable: true,
    },
    {
      id: '4',
      type: 'group_invite',
      title: 'Group Invitation',
      message: 'You\'ve been invited to join "Regional Sports Car Dealers"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      isRead: true,
      data: { groupId: 'g2', groupName: 'Regional Sports Car Dealers', invitedBy: 'Lisa Garcia' },
      actionable: true,
    },
    {
      id: '5',
      type: 'new_listing',
      title: 'New Listing Alert',
      message: 'A 2022 Porsche 911 matching your interests was just listed in your area',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      isRead: true,
      data: { vehicleId: 'v3', make: 'Porsche', model: '911', location: 'New York' },
      actionable: true,
    },
    {
      id: '6',
      type: 'price_alert',
      title: 'Price Drop Alert',
      message: 'BMW X5 2023 price dropped by $2,000 - now $73,000',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      isRead: true,
      data: { vehicleId: 'v4', oldPrice: 75000, newPrice: 73000 },
      actionable: true,
    },
    {
      id: '7',
      type: 'system',
      title: 'App Update Available',
      message: 'CarWorld v2.1 is now available with new features',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      isRead: true,
      data: { version: '2.1.0' },
      actionable: false,
    },
  ];

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setNotifications(mockNotifications);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setLoading(false);
    }
  }, []);

  const filterNotifications = useCallback(() => {
    let filtered = notifications;

    switch (selectedFilter) {
      case 'unread':
        filtered = notifications.filter(n => !n.isRead);
        break;
      case 'actionable':
        filtered = notifications.filter(n => n.actionable);
        break;
      default:
        filtered = notifications;
    }

    setFilteredNotifications(filtered);
  }, [notifications, selectedFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    filterNotifications();
  }, [filterNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications().finally(() => setRefreshing(false));
  }, [loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      // TODO: Call API to mark as read
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: Call API to mark all as read
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'inquiry':
        navigation.navigate('Chat', {
          dealerId: notification.data.dealerId,
          dealerName: notification.data.dealerName,
        });
        break;
      case 'message':
        navigation.navigate('Chat', {
          dealerId: notification.data.dealerId,
          dealerName: notification.data.dealerName,
        });
        break;
      case 'co_listing':
        navigation.navigate('VehicleDetail', {
          vehicleId: notification.data.vehicleId,
        });
        break;
      case 'group_invite':
        navigation.navigate('GroupDetails', {
          groupId: notification.data.groupId,
        });
        break;
      case 'new_listing':
      case 'price_alert':
        navigation.navigate('VehicleDetail', {
          vehicleId: notification.data.vehicleId,
        });
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: Notification['type']): { name: IconProps; color: string } => {
    switch (type) {
      case 'inquiry':
        return { name: 'question-answer', color: '#2196F3' };
      case 'message':
        return { name: 'message', color: '#4CAF50' };
      case 'co_listing':
        return { name: 'share', color: '#FF9800' };
      case 'group_invite':
        return { name: 'group-add', color: '#9C27B0' };
      case 'new_listing':
        return { name: 'directions-car', color: '#4ECDC4' };
      case 'price_alert':
        return { name: 'trending-down', color: '#F44336' };
      case 'system':
        return { name: 'system-update', color: '#607D8B' };
      default:
        return { name: 'notifications', color: '#666' };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 7 * 24 * 60) return `${Math.floor(diffInMinutes / (24 * 60))}d ago`;

    return messageTime.toLocaleDateString();
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.isRead && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.notificationIcon, { backgroundColor: `${icon.color}20` }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationTime}>{formatTimestamp(item.timestamp)}</Text>
          </View>

          <Text style={[
            styles.notificationMessage,
            !item.isRead && styles.unreadMessage
          ]}>
            {item.message}
          </Text>

          {item.actionable && (
            <View style={styles.actionIndicator}>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </View>
          )}
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filter: typeof selectedFilter, label: string, count?: number) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.activeFilterButtonText
      ]}>
        {label}
        {count !== undefined && count > 0 && ` (${count})`}
      </Text>
    </TouchableOpacity>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.settingsModal}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Notification Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsContent}>
            {Object.entries(settings).map(([key, value]) => (
              <View key={key} style={styles.settingRow}>
                <Text style={styles.settingLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <Switch
                  value={value}
                  onValueChange={(newValue) =>
                    setSettings(prev => ({ ...prev, [key]: newValue }))
                  }
                  trackColor={{ false: '#ddd', true: colors.primary }}
                  thumbColor={value ? '#fff' : '#f4f3f4'}
                />
              </View>
            ))}
          </View>

          <Button
            title="Save Settings"
            onPress={() => {
              // TODO: Save settings to backend
              setShowSettings(false);
              Alert.alert('Settings Saved', 'Your notification preferences have been updated.');
            }}
            style={styles.saveButton}
          />
        </View>
      </View>
    </Modal>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const actionableCount = notifications.filter(n => n.actionable && !n.isRead).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="settings" size={24} color={colors.text} />
          </TouchableOpacity>

          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={markAllAsRead}
            >
              <Text style={{ fontSize: 24, color: colors.primary }}>✓✓</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('unread', 'Unread', unreadCount)}
        {renderFilterButton('actionable', 'Actionable', actionableCount)}
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={80} color="#ddd" />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'all'
                ? 'You have no notifications yet.' : `No ${selectedFilter} notifications found.`
              }
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {renderSettingsModal()}
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  notificationsList: {
    paddingVertical: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'flex-start',
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#F0F7FF',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
    paddingRight: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
  },
  actionIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -8,
  },
  unreadDot: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsModal: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    minWidth: '90%',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  settingsContent: {
    paddingVertical: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  saveButton: {
    margin: 20,
  },
});

export default NotificationsScreen;



