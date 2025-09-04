import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

interface Inquiry {
  id: string;
  carId: string;
  carTitle: string;
  carPrice: string;
  carImage: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  location: string;
  message: string;
  inquiryType: 'phone' | 'email' | 'whatsapp' | 'form';
  status: 'new' | 'contacted' | 'interested' | 'not_interested' | 'sold';
  priority: 'high' | 'medium' | 'low';
  leadScore: number;
  createdAt: string;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  notes: string[];
  tags: string[];
}

interface InquiryStats {
  total: number;
  new: number;
  contacted: number;
  interested: number;
  converted: number;
  conversionRate: number;
}

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'interested', label: 'Interested' },
  { key: 'not_interested', label: 'Not Interested' },
  { key: 'sold', label: 'Sold' },
];

const PRIORITY_COLORS = {
  high: '#FF3B30',
  medium: '#FF9800',
  low: '#4CAF50',
};

const STATUS_COLORS = {
  new: '#FF9800',
  contacted: '#2196F3',
  interested: '#4CAF50',
  not_interested: '#9E9E9E',
  sold: '#8BC34A',
};

const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: '1',
    carId: 'car1',
    carTitle: 'BMW X3 2020',
    carPrice: '₹35,00,000',
    carImage: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=400',
    buyerName: 'Arjun Sharma',
    buyerPhone: '+91 9876543210',
    buyerEmail: 'arjun.sharma@email.com',
    location: 'Mumbai',
    message: 'Hi, I am interested in this car. Can we schedule a test drive?',
    inquiryType: 'form',
    status: 'new',
    priority: 'high',
    leadScore: 85,
    createdAt: '2024-01-15T10:30:00',
    notes: [],
    tags: ['test-drive', 'financing'],
  },
  {
    id: '2',
    carId: 'car2',
    carTitle: 'Audi A4 2019',
    carPrice: '₹28,50,000',
    carImage: 'https://images.pexels.com/photos/170782/pexels-photo-170782.jpeg?auto=compress&w=400',
    buyerName: 'Priya Patel',
    buyerPhone: '+91 9765432109',
    location: 'Pune',
    message: 'What is the final price? Is it negotiable?',
    inquiryType: 'phone',
    status: 'contacted',
    priority: 'medium',
    leadScore: 70,
    createdAt: '2024-01-14T15:45:00',
    lastContactAt: '2024-01-14T16:30:00',
    nextFollowUpAt: '2024-01-16T10:00:00',
    notes: ['Called back, interested in financing options'],
    tags: ['negotiation', 'financing'],
  },
  {
    id: '3',
    carId: 'car3',
    carTitle: 'Mercedes C-Class 2021',
    carPrice: '₹42,00,000',
    carImage: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=400',
    buyerName: 'Rahul Kumar',
    buyerPhone: '+91 9654321098',
    buyerEmail: 'rahul.kumar@email.com',
    location: 'Delhi',
    message: 'Is this car still available? I want to buy it.',
    inquiryType: 'whatsapp',
    status: 'interested',
    priority: 'high',
    leadScore: 90,
    createdAt: '2024-01-13T09:15:00',
    lastContactAt: '2024-01-13T14:20:00',
    nextFollowUpAt: '2024-01-15T11:00:00',
    notes: ['Very interested, ready to close deal', 'Arranged bank loan'],
    tags: ['hot-lead', 'ready-to-buy'],
  },
  {
    id: '4',
    carId: 'car4',
    carTitle: 'Honda Civic 2018',
    carPrice: '₹15,80,000',
    carImage: 'https://images.pexels.com/photos/170782/pexels-photo-170782.jpeg?auto=compress&w=400',
    buyerName: 'Sneha Reddy',
    buyerPhone: '+91 9543210987',
    location: 'Bangalore',
    message: 'Can you send more photos of the interior?',
    inquiryType: 'email',
    status: 'not_interested',
    priority: 'low',
    leadScore: 30,
    createdAt: '2024-01-12T11:20:00',
    lastContactAt: '2024-01-12T16:45:00',
    notes: ['Not satisfied with interior condition', 'Looking for newer model'],
    tags: ['interior-concerns'],
  },
];

const DealerInquiriesScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  
  const [inquiries, setInquiries] = useState<Inquiry[]>(MOCK_INQUIRIES);
  const [inquiryStats, setInquiryStats] = useState<InquiryStats>({
    total: 145,
    new: 23,
    contacted: 45,
    interested: 32,
    converted: 18,
    conversionRate: 12.4,
  });

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesFilter = selectedFilter === 'all' || inquiry.status === selectedFilter;
    const matchesSearch = searchQuery === '' || 
      inquiry.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.carTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleInquiryPress = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowInquiryModal(true);
  };

  const handleStatusUpdate = (inquiryId: string, newStatus: Inquiry['status']) => {
    setInquiries(prev => prev.map(inquiry => 
      inquiry.id === inquiryId 
        ? { ...inquiry, status: newStatus, lastContactAt: new Date().toISOString() }
        : inquiry
    ));
    setShowActionModal(false);
    Alert.alert('Success', 'Inquiry status updated successfully');
  };

  const handleCallBuyer = (phone: string) => {
    Alert.alert('Call Buyer', `Call ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => console.log(`Calling ${phone}`) }
    ]);
  };

  const handleWhatsAppBuyer = (phone: string) => {
    Alert.alert('WhatsApp', `Send WhatsApp message to ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send', onPress: () => console.log(`WhatsApp ${phone}`) }
    ]);
  };

  const getStatusColor = (status: Inquiry['status']) => {
    return STATUS_COLORS[status];
  };

  const getPriorityColor = (priority: Inquiry['priority']) => {
    return PRIORITY_COLORS[priority];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderStatsCard = (title: string, value: string | number, subtitle: string, icon: string, color: string) => (
    <Animatable.View animation="fadeInUp" style={[styles.statsCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.statsIconContainer, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.statsContent}>
        <Text style={[styles.statsValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statsTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.statsSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
    </Animatable.View>
  );

  const renderInquiryItem = ({ item, index }: { item: Inquiry; index: number }) => (
    <Animatable.View animation="fadeInUp" delay={index * 100}>
      <TouchableOpacity
        style={[styles.inquiryCard, { backgroundColor: colors.surface }]}
        onPress={() => handleInquiryPress(item)}
      >
        {/* Header */}
        <View style={styles.inquiryHeader}>
          <View style={styles.inquiryHeaderLeft}>
            <Text style={[styles.buyerName, { color: colors.text }]}>{item.buyerName}</Text>
            <Text style={[styles.inquiryTime, { color: colors.textSecondary }]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
          <View style={styles.inquiryHeaderRight}>
            <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(item.priority)}15` }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {item.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Car Info */}
        <View style={styles.carInfo}>
          <View style={styles.carDetails}>
            <Text style={[styles.carTitle, { color: colors.text }]}>{item.carTitle}</Text>
            <Text style={[styles.carPrice, { color: colors.primary }]}>{item.carPrice}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
        </View>

        {/* Message Preview */}
        <Text style={[styles.messagePreview, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.message}
        </Text>

        {/* Status and Actions */}
        <View style={styles.inquiryFooter}>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
            <MaterialCommunityIcons 
              name={item.status === 'new' ? 'new-box' : item.status === 'contacted' ? 'phone' : item.status === 'interested' ? 'heart' : item.status === 'not_interested' ? 'heart-off' : 'check-circle'} 
              size={14} 
              color={getStatusColor(item.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF5015' }]}
              onPress={() => handleCallBuyer(item.buyerPhone)}
            >
              <MaterialCommunityIcons name="phone" size={14} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FF980015' }]}
              onPress={() => handleWhatsAppBuyer(item.buyerPhone)}
            >
              <MaterialCommunityIcons name="whatsapp" size={14} color="#FF9800" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Lead Score */}
        <View style={styles.leadScoreContainer}>
          <Text style={[styles.leadScoreLabel, { color: colors.textSecondary }]}>Lead Score: </Text>
          <View style={[styles.leadScoreBar, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' }]}>
            <View 
              style={[
                styles.leadScoreFill, 
                { 
                  backgroundColor: item.leadScore >= 70 ? '#4CAF50' : item.leadScore >= 50 ? '#FF9800' : '#FF3B30',
                  width: `${item.leadScore}%`
                }
              ]} 
            />
          </View>
          <Text style={[styles.leadScoreValue, { color: colors.text }]}>{item.leadScore}%</Text>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderInquiryModal = () => (
    <Modal visible={showInquiryModal} animationType="slide" presentationStyle="pageSheet">
      {selectedInquiry && (
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={() => setShowInquiryModal(false)}>
              <AntDesign name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Inquiry Details</Text>
            <TouchableOpacity onPress={() => setShowActionModal(true)}>
              <MaterialCommunityIcons name="dots-vertical" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Buyer Information */}
            <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Buyer Information</Text>
              <View style={styles.buyerInfoRow}>
                <MaterialCommunityIcons name="account" size={20} color={colors.primary} />
                <Text style={[styles.buyerInfoText, { color: colors.text }]}>{selectedInquiry.buyerName}</Text>
              </View>
              <View style={styles.buyerInfoRow}>
                <MaterialCommunityIcons name="phone" size={20} color={colors.primary} />
                <Text style={[styles.buyerInfoText, { color: colors.text }]}>{selectedInquiry.buyerPhone}</Text>
              </View>
              {selectedInquiry.buyerEmail && (
                <View style={styles.buyerInfoRow}>
                  <MaterialCommunityIcons name="email" size={20} color={colors.primary} />
                  <Text style={[styles.buyerInfoText, { color: colors.text }]}>{selectedInquiry.buyerEmail}</Text>
                </View>
              )}
              <View style={styles.buyerInfoRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
                <Text style={[styles.buyerInfoText, { color: colors.text }]}>{selectedInquiry.location}</Text>
              </View>
            </View>

            {/* Car Information */}
            <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Car Details</Text>
              <Text style={[styles.carModalTitle, { color: colors.text }]}>{selectedInquiry.carTitle}</Text>
              <Text style={[styles.carModalPrice, { color: colors.primary }]}>{selectedInquiry.carPrice}</Text>
            </View>

            {/* Message */}
            <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Message</Text>
              <Text style={[styles.messageText, { color: colors.text }]}>{selectedInquiry.message}</Text>
            </View>

            {/* Notes */}
            {selectedInquiry.notes.length > 0 && (
              <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
                {selectedInquiry.notes.map((note, index) => (
                  <Text key={index} style={[styles.noteText, { color: colors.textSecondary }]}>
                    • {note}
                  </Text>
                ))}
              </View>
            )}

            {/* Quick Actions */}
            <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: '#4CAF5015' }]}
                  onPress={() => handleCallBuyer(selectedInquiry.buyerPhone)}
                >
                  <MaterialCommunityIcons name="phone" size={20} color="#4CAF50" />
                  <Text style={[styles.quickActionText, { color: '#4CAF50' }]}>Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: '#FF980015' }]}
                  onPress={() => handleWhatsAppBuyer(selectedInquiry.buyerPhone)}
                >
                  <MaterialCommunityIcons name="whatsapp" size={20} color="#FF9800" />
                  <Text style={[styles.quickActionText, { color: '#FF9800' }]}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: colors.primary + '15' }]}
                  onPress={() => {
                    setShowInquiryModal(false);
                    navigation.navigate('CarDetails', { carId: selectedInquiry.carId });
                  }}
                >
                  <MaterialCommunityIcons name="car" size={20} color={colors.primary} />
                  <Text style={[styles.quickActionText, { color: colors.primary }]}>View Car</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </Modal>
  );

  const renderActionModal = () => (
    <Modal visible={showActionModal} transparent animationType="fade">
      <View style={styles.actionModalOverlay}>
        <View style={[styles.actionModalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.actionModalTitle, { color: colors.text }]}>Update Status</Text>
          
          {[
            { key: 'contacted', label: 'Mark as Contacted', icon: 'phone' },
            { key: 'interested', label: 'Mark as Interested', icon: 'heart' },
            { key: 'not_interested', label: 'Mark as Not Interested', icon: 'heart-off' },
            { key: 'sold', label: 'Mark as Sold', icon: 'check-circle' },
          ].map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.actionModalButton}
              onPress={() => selectedInquiry && handleStatusUpdate(selectedInquiry.id, action.key as Inquiry['status'])}
            >
              <MaterialCommunityIcons name={action.icon as any} size={20} color={colors.text} />
              <Text style={[styles.actionModalButtonText, { color: colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={[styles.actionModalButton, styles.cancelButton]}
            onPress={() => setShowActionModal(false)}
          >
            <Text style={[styles.actionModalButtonText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Inquiries</Text>
        <TouchableOpacity onPress={() => navigation.navigate('DealerInquiryAnalytics')}>
          <MaterialCommunityIcons name="chart-line" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {renderStatsCard('New', inquiryStats.new, 'Uncontacted', 'new-box', '#FF9800')}
            {renderStatsCard('Contacted', inquiryStats.contacted, 'In progress', 'phone', '#2196F3')}
            {renderStatsCard('Interested', inquiryStats.interested, 'Hot leads', 'heart', '#4CAF50')}
            {renderStatsCard('Conversion', `${inquiryStats.conversionRate}%`, `${inquiryStats.converted} sold`, 'trending-up', '#9C27B0')}
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersContainer}>
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search inquiries..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtons}>
            {FILTER_OPTIONS.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                  selectedFilter === filter.key && { backgroundColor: colors.primary },
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    { color: colors.text },
                    selectedFilter === filter.key && { color: '#111827' },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Inquiries List */}
        {filteredInquiries.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="message-text-outline" 
              size={64} 
              color={colors.textSecondary} 
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No inquiries found</Text>
            <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
              {searchQuery.trim() 
                ? `No inquiries match "${searchQuery}"`
                : 'No inquiries in this category'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.inquiriesList}>
            <FlatList
              data={filteredInquiries}
              renderItem={renderInquiryItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>

      {renderInquiryModal()}
      {renderActionModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statsCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 1,
  },
  statsSubtitle: {
    fontSize: 11,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  inquiriesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inquiryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  inquiryHeaderLeft: {
    flex: 1,
  },
  inquiryHeaderRight: {
    marginLeft: 12,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  inquiryTime: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  carDetails: {
    flex: 1,
  },
  carTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  messagePreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  inquiryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leadScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadScoreLabel: {
    fontSize: 12,
    marginRight: 8,
  },
  leadScoreBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  leadScoreFill: {
    height: '100%',
    borderRadius: 2,
  },
  leadScoreValue: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    minWidth: 32,
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  buyerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  buyerInfoText: {
    fontSize: 14,
    marginLeft: 12,
  },
  carModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  carModalPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModalContent: {
    width: width * 0.8,
    borderRadius: 12,
    padding: 16,
  },
  actionModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionModalButtonText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 8,
    justifyContent: 'center',
  },
});

export default DealerInquiriesScreen;
