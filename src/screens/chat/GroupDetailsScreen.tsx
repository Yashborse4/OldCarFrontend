import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import { GroupDetailsRouteProp, DealerGroup, Vehicle } from '../../navigation/types'; // Update this path based on your project structure

// Temporary interfaces until proper types are available
interface DealerGroup {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  adminId: string;
  members: Array<{
    id: string;
    name: string;
    dealership: string;
    role: 'admin' | 'member';
  }>;
  createdAt: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  location: string;
  condition: string;
  images: string[];
  specifications: any;
  dealerId: string;
  dealerName: string;
  isCoListed: boolean;
  coListedIn: string[];
  views: number;
  inquiries: number;
  shares: number;
}

const GroupDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };

  const [group, setGroup] = useState<DealerGroup | null>(null);
  const [groupVehicles, setGroupVehicles] = useState<Vehicle[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'members'>('overview');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API calls later
  const mockGroup: DealerGroup = {
    id: groupId,
    name: 'Luxury Car Dealers Network',
    description: 'Network for premium luxury vehicle dealers. Share inventory, collaborate on sales, and expand your reach in the luxury car market.',
    isPrivate: false,
    adminId: 'dealer1',
    members: [
      { id: 'dealer1', name: 'John Smith', dealership: 'Premium Motors', role: 'admin' },
      { id: 'dealer2', name: 'Sarah Johnson', dealership: 'Elite Cars', role: 'member' },
      { id: 'dealer3', name: 'Mike Wilson', dealership: 'Luxury Auto Group', role: 'member' },
      { id: 'dealer4', name: 'Lisa Garcia', dealership: 'Speed Motors', role: 'member' },
    ],
    createdAt: new Date().toISOString(),
  };

  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      make: 'BMW',
      model: 'X5',
      year: 2023,
      price: 75000,
      mileage: 15000,
      location: 'New York',
      condition: 'Excellent',
      images: ['https://example.com/bmw1.jpg', 'https://example.com/bmw2.jpg'],
      specifications: { engine: '3.0L Twin Turbo', transmission: 'Automatic' },
      dealerId: 'dealer2',
      dealerName: 'Sarah Johnson - Elite Cars',
      isCoListed: true,
      coListedIn: [groupId],
      views: 234,
      inquiries: 12,
      shares: 8,
    },
    {
      id: '2',
      make: 'Mercedes-Benz',
      model: 'S-Class',
      year: 2024,
      price: 95000,
      mileage: 5000,
      location: 'Los Angeles',
      condition: 'Like New',
      images: ['https://example.com/merc1.jpg'],
      specifications: { engine: '4.0L V8 Biturbo', transmission: 'Automatic' },
      dealerId: 'dealer3',
      dealerName: 'Mike Wilson - Luxury Auto Group',
      isCoListed: true,
      coListedIn: [groupId],
      views: 456,
      inquiries: 23,
      shares: 15,
    },
  ];

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      setTimeout(() => {
        setGroup(mockGroup);
        setGroupVehicles(mockVehicles);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading group details:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const isAdmin = group?.adminId === 'dealer1'; // Replace with current user ID check

  const handleInviteMembers = () => {
    // navigation.navigate('InviteMembers', { groupId }); // Update screen name based on your navigation structure
    Alert.alert('Feature', 'Invite members feature will be implemented');
  };

  const handleViewMembers = () => {
    // navigation.navigate('GroupMembers', { groupId }); // Update screen name based on your navigation structure
    Alert.alert('Feature', 'View members feature will be implemented');
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? ',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement leave group logic
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete group logic
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleVehiclePress = (vehicle: Vehicle) => {
    // navigation.navigate('VehicleDetailScreen', { 
    //   vehicleId: vehicle.id,
    //   enableCoListing: true 
    // }); // Update screen name based on your navigation structure
    Alert.alert('Feature', 'Vehicle details will be implemented');
  };

  const handleMessageDealer = (dealerId: string, dealerName: string) => {
    (navigation as any).navigate('ChatScreen', { dealerId, dealerName });
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      style={styles.vehicleCard}
      onPress={() => handleVehiclePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.vehicleImageContainer}>
        {item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.vehicleImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="car" size={40} color="#ccc" />
          </View>
        )}
      </View>
      
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleTitle}>{item.year} {item.make} {item.model}</Text>
        <Text style={styles.vehiclePrice}>${item.price.toLocaleString()}</Text>
        <Text style={styles.vehicleDetails}>{item.mileage.toLocaleString()} miles • {item.location}</Text>
        <Text style={styles.dealerInfo}>{item.dealerName}</Text>
        
        <View style={styles.vehicleStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={16} color="#666" />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="message" size={16} color="#666" />
            <Text style={styles.statText}>{item.inquiries}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="share" size={16} color="#666" />
            <Text style={styles.statText}>{item.shares}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMemberItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => handleMessageDealer(item.id, item.name)}
      activeOpacity={0.8}
    >
      <View style={styles.memberAvatar}>
        <Text style={styles.memberInitial}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberDealership}>{item.dealership}</Text>
        {item.role === 'admin' && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.messageButton}>
        <Ionicons name="message" size={20} color="#4ECDC4" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{group?.members.length}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{groupVehicles.length}</Text>
            <Text style={styles.statLabel}>Vehicles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {groupVehicles.reduce((sum, v) => sum + v.views, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {groupVehicles.reduce((sum, v) => sum + v.inquiries, 0)}
            </Text>
            <Text style={styles.statLabel}>Inquiries</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Ionicons name="add" size={20} color="#4ECDC4" />
            <Text style={styles.activityText}>
              Sarah Johnson co-listed BMW X5 in this group
            </Text>
            <Text style={styles.activityTime}>2h ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="person-add" size={20} color="#4ECDC4" />
            <Text style={styles.activityText}>
              Lisa Garcia joined the group
            </Text>
            <Text style={styles.activityTime}>1d ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="share" size={20} color="#4ECDC4" />
            <Text style={styles.activityText}>
              Mike Wilson shared Mercedes-Benz S-Class
            </Text>
            <Text style={styles.activityTime}>2d ago</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading || !group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {group.name}
        </Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenuModal(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.groupInfo}>
        <View style={styles.groupHeader}>
          <View style={styles.privacyIndicator}>
            <Ionicons
              name={group.isPrivate ? 'lock' : 'public'}
              size={16}
              color={group.isPrivate ? '#FF6B6B' : '#4ECDC4'}
            />
            <Text style={[styles.privacyText, { color: group.isPrivate ? '#FF6B6B' : '#4ECDC4' }]}>
              {group.isPrivate ? 'Private' : 'Public'}
            </Text>
          </View>
        </View>
        <Text style={styles.groupDescription}>{group.description}</Text>
        
        {isAdmin && (
          <TouchableOpacity style={styles.inviteButton} onPress={handleInviteMembers}>
            <Ionicons name="person-add" size={20} color="#fff" />
            <Text style={styles.inviteButtonText}>Invite Members</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vehicles' && styles.activeTab]}
          onPress={() => setActiveTab('vehicles')}
        >
          <Text style={[styles.tabText, activeTab === 'vehicles' && styles.activeTabText]}>
            Vehicles ({groupVehicles.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'members' && styles.activeTab]}
          onPress={() => setActiveTab('members')}
        >
          <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
            Members ({group.members.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' && renderOverview()}
      
      {activeTab === 'vehicles' && (
        <FlatList
          data={groupVehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {activeTab === 'members' && (
        <FlatList
          data={group.members}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowMenuModal(false)}
          activeOpacity={1}
        >
          <View style={styles.menuModal}>
            <TouchableOpacity style={styles.menuItem} onPress={handleViewMembers}>
              <Ionicons name="people" size={20} color="#333" />
              <Text style={styles.menuItemText}>View All Members</Text>
            </TouchableOpacity>
            
            {isAdmin ? (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={handleInviteMembers}>
                  <Ionicons name="person-add" size={20} color="#333" />
                  <Text style={styles.menuItemText}>Invite Members</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleDeleteGroup}>
                  <Ionicons name="trash" size={20} color="#FF6B6B" />
                  <Text style={[styles.menuItemText, { color: '#FF6B6B' }]}>Delete Group</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.menuItem} onPress={handleLeaveGroup}>
                <Ionicons name="exit-to-app" size={20} color="#FF6B6B" />
                <Text style={[styles.menuItemText, { color: '#FF6B6B' }]}>Leave Group</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
  },
  menuButton: {
    padding: 4,
  },
  groupInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  privacyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  inviteButton: {
    flexDirection: 'row',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4ECDC4',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,

    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  listContainer: {
    padding: 20,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,

    elevation: 3,
  },
  vehicleImageContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vehiclePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dealerInfo: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  vehicleStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  memberCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',

    elevation: 3,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memberInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  memberDealership: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
});

export default GroupDetailsScreen;


