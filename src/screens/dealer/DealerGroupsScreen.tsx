import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { DealerGroupsNavigationProp, DealerGroup } from '../../navigation/types';

const DealerGroupsScreen: React.FC = () => {
  const navigation = useNavigation<DealerGroupsNavigationProp>();
  const [groups, setGroups] = useState<DealerGroup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API calls later
  const mockGroups: DealerGroup[] = [
    {
      id: '1',
      name: 'Luxury Car Dealers Network',
      description: 'Network for premium luxury vehicle dealers',
      isPrivate: false,
      adminId: 'dealer1',
      members: [
        { id: 'dealer1', name: 'John Smith', dealership: 'Premium Motors', role: 'admin' },
        { id: 'dealer2', name: 'Sarah Johnson', dealership: 'Elite Cars', role: 'member' },
        { id: 'dealer3', name: 'Mike Wilson', dealership: 'Luxury Auto Group', role: 'member' },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Regional Dealers Alliance',
      description: 'Private group for regional dealer partnerships',
      isPrivate: true,
      adminId: 'dealer2',
      members: [
        { id: 'dealer2', name: 'Sarah Johnson', dealership: 'Elite Cars', role: 'admin' },
        { id: 'dealer4', name: 'David Brown', dealership: 'Metro Auto', role: 'member' },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Sports Car Enthusiasts',
      description: 'Group focused on sports and performance vehicles',
      isPrivate: false,
      adminId: 'dealer1',
      members: [
        { id: 'dealer1', name: 'John Smith', dealership: 'Premium Motors', role: 'admin' },
        { id: 'dealer5', name: 'Lisa Garcia', dealership: 'Speed Motors', role: 'member' },
        { id: 'dealer6', name: 'Tom Anderson', dealership: 'Performance Plus', role: 'member' },
        { id: 'dealer7', name: 'Chris Lee', dealership: 'Turbo Cars', role: 'member' },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setGroups(mockGroups);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading groups:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  const handleGroupPress = (group: DealerGroup) => {
    navigation.navigate('GroupDetails', { groupId: group.id });
  };

  const renderGroupItem = ({ item }: { item: DealerGroup }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => handleGroupPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View style={styles.groupMeta}>
          <View style={styles.privacyIndicator}>
            <Icon
              name={item.isPrivate ? 'lock' : 'public'}
              size={16}
              color={item.isPrivate ? '#FF6B6B' : '#4ECDC4'}
            />
            <Text style={[styles.privacyText, { color: item.isPrivate ? '#FF6B6B' : '#4ECDC4' }]}>
              {item.isPrivate ? 'Private' : 'Public'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.groupFooter}>
        <View style={styles.memberCount}>
          <MaterialIcons name="group" size={16} color="#666" />
          <Text style={styles.memberCountText}>
            {item.members.length} member{item.members.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <MaterialIcons name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="group-add" size={80} color="#ddd" />
      <Text style={styles.emptyStateTitle}>No Groups Yet</Text>
      <Text style={styles.emptyStateText}>
        Create or join dealer groups to start networking and co-listing vehicles
      </Text>
      <TouchableOpacity style={styles.createFirstGroupButton} onPress={handleCreateGroup}>
        <Text style={styles.createFirstGroupText}>Create Your First Group</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dealer Groups</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={groups.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#4ECDC4',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
    marginRight: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  groupMeta: {
    alignItems: 'flex-end',
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
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCountText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  moreButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  createFirstGroupButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstGroupText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DealerGroupsScreen;


