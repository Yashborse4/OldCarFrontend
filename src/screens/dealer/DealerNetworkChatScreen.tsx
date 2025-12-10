import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import AuthContext from '../../context/AuthContext';

interface DealerContact {
  id: string;
  dealerName: string;
  showroomName: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  location: string;
  specializations: string[];
  rating: number;
  totalDeals: number;
  isVerified: boolean;
  businessType: 'premium' | 'standard' | 'basic';
}

interface NetworkMessage {
  id: string;
  type: 'inventory_share' | 'bulk_inquiry' | 'partnership' | 'financing' | 'general';
  title: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  attachments?: {
    type: 'inventory' | 'document' | 'image';
    data: any;
  }[];
  responses: number;
  isRead: boolean;
}

interface InventoryItem {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: string;
  image: string;
  availability: number;
  dealerId: string;
}

const DealerNetworkChatScreen: React.FC = ({ navigation }: any) => {
  const colors = {
    primary: '#FFD700',
    text: '#1A202C',
    textSecondary: '#4A5568',
    surface: '#FFFFFF',
    background: '#FAFBFC',
    border: '#E2E8F0',
  };
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    throw new Error('Component must be used within AuthProvider');
  }
  
  const user = authContext.user;
  
  const [dealers, setDealers] = useState<DealerContact[]>([]);
  const [networkMessages, setNetworkMessages] = useState<NetworkMessage[]>([]);
  const [selectedTab, setSelectedTab] = useState<'dealers' | 'network' | 'inventory'>('network');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDealers, setSelectedDealers] = useState<string[]>([]);
  const [sharedInventory, setSharedInventory] = useState<InventoryItem[]>([]);

  // Mock data
  const mockDealers = React.useMemo<DealerContact[]>(() => [
    {
      id: 'dealer1',
      dealerName: 'Rajesh Motors',
      showroomName: 'Rajesh Premium Cars',
      avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&h=100&fit=crop',
      isOnline: true,
      lastSeen: new Date(),
      location: 'Mumbai, Maharashtra',
      specializations: ['Luxury Cars', 'SUVs'],
      rating: 4.8,
      totalDeals: 1250,
      isVerified: true,
      businessType: 'premium'
    },
    {
      id: 'dealer2',
      dealerName: 'AutoWorld Delhi',
      showroomName: 'AutoWorld Premium',
      avatar: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&h=100&fit=crop',
      isOnline: false,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000),
      location: 'Delhi, India',
      specializations: ['Sedans', 'Hatchbacks'],
      rating: 4.6,
      totalDeals: 890,
      isVerified: true,
      businessType: 'standard'
    },
    {
      id: 'dealer3',
      dealerName: 'Bangalore Motors',
      showroomName: 'BLR Car Hub',
      isOnline: true,
      lastSeen: new Date(),
      location: 'Bangalore, Karnataka',
      specializations: ['Electric Cars', 'Hybrids'],
      rating: 4.9,
      totalDeals: 650,
      isVerified: true,
      businessType: 'premium'
    }
  ], []);

  const mockNetworkMessages = React.useMemo<NetworkMessage[]>(() => [
    {
      id: 'msg1',
      type: 'bulk_inquiry',
      title: 'Bulk Purchase: 10 Maruti Swift',
      content: 'Looking for 10 units of Maruti Swift Dzire for corporate fleet. Immediate requirement. Best rates appreciated.',
      senderId: 'dealer1',
      senderName: 'Rajesh Motors',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      priority: 'high',
      responses: 7,
      isRead: false
    },
    {
      id: 'msg2',
      type: 'inventory_share',
      title: 'Premium Inventory Available',
      content: 'Sharing latest luxury car inventory. BMW, Audi, Mercedes models available at competitive rates.',
      senderId: 'dealer2',
      senderName: 'AutoWorld Delhi',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: 'medium',
      attachments: [
        {
          type: 'inventory',
          data: { count: 15, categories: ['BMW', 'Audi', 'Mercedes'] }
        }
      ],
      responses: 3,
      isRead: true
    },
    {
      id: 'msg3',
      type: 'partnership',
      title: 'Partnership Opportunity',
      content: 'Looking for dealers in South India for strategic partnership. Mutual inventory sharing and customer referrals.',
      senderId: 'dealer3',
      senderName: 'Bangalore Motors',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      priority: 'medium',
      responses: 12,
      isRead: true
    }
  ], []);

  const mockInventory = React.useMemo<InventoryItem[]>(() => [
    {
      id: 'inv1',
      title: '2022 BMW X5 xDrive40i',
      make: 'BMW',
      model: 'X5',
      year: 2022,
      price: '₹85,00,000',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&h=200&fit=crop',
      availability: 2,
      dealerId: 'dealer1'
    },
    {
      id: 'inv2',
      title: '2021 Audi Q7 Technology',
      make: 'Audi',
      model: 'Q7',
      year: 2021,
      price: '₹75,00,000',
      image: 'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=300&h=200&fit=crop',
      availability: 1,
      dealerId: 'dealer2'
    }
  ], []);

  useEffect(() => {
    setDealers(mockDealers);
    setNetworkMessages(mockNetworkMessages);
    setSharedInventory(mockInventory);
  }, [mockDealers, mockNetworkMessages, mockInventory]);

  const renderTabButton = (tab: 'dealers' | 'network' | 'inventory', label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: selectedTab === tab ? colors.primary : 'transparent',
          borderBottomColor: selectedTab === tab ? colors.primary : 'transparent'
        }
      ]}
      onPress={() => setSelectedTab(tab)}
    >
      <MaterialIcons
        name={icon as any}
        size={20}
        color={selectedTab === tab ? '#000000' : colors.text}
      />
      <Text style={[
        styles.tabButtonText,
        { color: selectedTab === tab ? '#000000' : colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderDealerItem = ({ item }: { item: DealerContact }) => (
    <TouchableOpacity
      style={[styles.dealerItem, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('ChatConversation', {
        participantId: item.id,
        participantName: item.dealerName,
        participantType: 'dealer'
      })}
    >
      <View style={styles.dealerAvatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.dealerAvatar} />
        ) : (
          <View style={[styles.dealerAvatarPlaceholder, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="store" size={24} color="#000000" />
          </View>
        )}
        
        {item.isOnline && <View style={[styles.onlineIndicator, { borderColor: colors.surface }]} />}
        
        {item.isVerified && (
          <View style={[styles.verifiedBadge, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="verified" size={16} color="#4CAF50" />
          </View>
        )}
      </View>

      <View style={styles.dealerInfo}>
        <View style={styles.dealerHeader}>
          <Text style={[styles.dealerName, { color: colors.text }]}>
            {item.dealerName}
          </Text>
          <View style={[
            styles.businessTypeBadge,
            { backgroundColor: item.businessType === 'premium' ? '#FFD700' : item.businessType === 'standard' ? '#87CEEB' : '#C0C0C0' }
          ]}>
            <Text style={styles.businessTypeText}>
              {item.businessType.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={[styles.showroomName, { color: colors.textSecondary }]}>
          {item.showroomName}
        </Text>
        
        <Text style={[styles.dealerLocation, { color: colors.textSecondary }]}>
          📍 {item.location}
        </Text>

        <View style={styles.dealerStats}>
          <View style={styles.statItem}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={[styles.statText, { color: colors.text }]}>
              {item.rating}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="handshake" size={16} color={colors.primary} />
            <Text style={[styles.statText, { color: colors.text }]}>
              {item.totalDeals} deals
            </Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specializationsContainer}>
          {item.specializations.map((spec, index) => (
            <View key={index} style={[styles.specializationTag, { backgroundColor: colors.primary }]}>
              <Text style={styles.specializationText}>{spec}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  );

  const renderNetworkMessage = ({ item }: { item: NetworkMessage }) => (
    <TouchableOpacity
      style={[
        styles.networkMessageItem,
        {
          backgroundColor: colors.surface,
          borderLeftColor: item.priority === 'high' ? '#FF3B30' : item.priority === 'medium' ? '#FF9800' : '#4CAF50'
        }
      ]}
    >
      <View style={styles.messageHeader}>
        <View style={styles.messageTypeContainer}>
          <MaterialIcons
            name={
              item.type === 'bulk_inquiry' ? 'shopping-cart' :
              item.type === 'inventory_share' ? 'directions-car' :
              item.type === 'partnership' ? 'handshake' :
              item.type === 'financing' ? 'account-balance' : 'message'
            }
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.messageType, { color: colors.primary }]}>
            {item.type.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        
        <Text style={[styles.messageTimestamp, { color: colors.textSecondary }]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      <Text style={[styles.messageTitle, { color: colors.text }]}>
        {item.title}
      </Text>
      
      <Text style={[styles.messageContent, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.content}
      </Text>

      <View style={styles.messageFooter}>
        <Text style={[styles.messageSender, { color: colors.textSecondary }]}>
          By {item.senderName}
        </Text>
        
        <View style={styles.messageStats}>
          <MaterialIcons name="reply" size={16} color={colors.textSecondary} />
          <Text style={[styles.responseCount, { color: colors.textSecondary }]}>
            {item.responses} responses
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity style={[styles.inventoryItem, { backgroundColor: colors.surface }]}>
      <Image source={{ uri: item.image }} style={styles.inventoryImage} />
      
      <View style={styles.inventoryDetails}>
        <Text style={[styles.inventoryTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        
        <Text style={[styles.inventoryPrice, { color: colors.primary }]}>
          {item.price}
        </Text>
        
        <Text style={[styles.inventoryAvailability, { color: colors.textSecondary }]}>
          {item.availability} units available
        </Text>
        
        <View style={styles.inventoryActions}>
          <TouchableOpacity style={[styles.inventoryButton, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="visibility" size={16} color="#000000" />
            <Text style={[styles.inventoryButtonText, { backgroundColor: '#000000' }]}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.inventoryButton, { backgroundColor: '#4CAF50' }]}>
            <MaterialIcons name="share" size={16} color="#FFFFFF" />
            <Text style={styles.inventoryButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface,
          borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Dealer Network</Text>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.background,
          borderColor: colors.border }]}>
          <MaterialIcons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search dealers, messages, inventory..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
        {renderTabButton('network', 'Network', 'forum')}
        {renderTabButton('dealers', 'Dealers', 'group')}
        {renderTabButton('inventory', 'Inventory', 'directions-car')}
      </View>

      <View style={styles.content}>
        {selectedTab === 'dealers' && (
          <FlatList
            data={dealers}
            keyExtractor={(item) => item.id}
            renderItem={renderDealerItem}
            showsVerticalScrollIndicator={false}
          />
        )}

        {selectedTab === 'network' && (
          <FlatList
            data={networkMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderNetworkMessage}
            showsVerticalScrollIndicator={false}
          />
        )}

        {selectedTab === 'inventory' && (
          <FlatList
            data={sharedInventory}
            keyExtractor={(item) => item.id}
            renderItem={renderInventoryItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => Alert.alert('Add', 'Add new message or inventory')}
      >
        <MaterialIcons name="add" size={28} color="#000000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  dealerItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,

  },
  dealerAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  dealerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  dealerAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    color: '#4CAF50',
    borderWidth: 2,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 12,
    padding: 2,
  },
  dealerInfo: {
    flex: 1,
  },
  dealerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dealerName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  businessTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  businessTypeText: {
    fontSize: 10,
    fontWeight: '700',

  },
  showroomName: {
    fontSize: 14,
    marginBottom: 4,
  },
  dealerLocation: {
    fontSize: 12,
    marginBottom: 8,
  },
  dealerStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  specializationsContainer: {
    maxHeight: 24,
  },
  specializationTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  specializationText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#000000',
  },
  networkMessageItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,

  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  messageType: {
    fontSize: 10,
    fontWeight: '700',
  },
  messageTimestamp: {
    fontSize: 12,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  messageContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageSender: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  messageStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  responseCount: {
    fontSize: 12,
  },
  inventoryItem: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,

  },
  inventoryImage: {
    width: 120,
    height: 90,
  },
  inventoryDetails: {
    flex: 1,
    padding: 12,
  },
  inventoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  inventoryPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  inventoryAvailability: {
    fontSize: 12,
    marginBottom: 8,
  },
  inventoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  inventoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  inventoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,

  },
});

export default DealerNetworkChatScreen;
