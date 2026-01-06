import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  FlatList,
  RefreshControl,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import {
  scaleSize,
  getResponsiveSpacing,
  getResponsiveTypography,
  getResponsiveBorderRadius,
} from '../../utils/responsiveEnhanced';

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

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'interested', label: 'Interested' },
  { key: 'sold', label: 'Sold' },
];

const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: '1',
    carId: 'c1',
    carTitle: '2022 Hyundai Creta SX',
    carPrice: '₹14,50,000',
    carImage: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=200',
    buyerName: 'Rahul Sharma',
    buyerPhone: '+91 98765 43210',
    location: 'Mumbai, MH',
    message: 'Is this car still available? I am interested in a test drive this weekend.',
    inquiryType: 'form',
    status: 'new',
    priority: 'high',
    leadScore: 85,
    createdAt: new Date().toISOString(),
    notes: [],
    tags: ['First Buyer', 'Finance Needed'],
  },
  {
    id: '2',
    carId: 'c2',
    carTitle: '2020 Maruti Swift ZXi',
    carPrice: '₹6,25,000',
    carImage: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=200',
    buyerName: 'Priya Patel',
    buyerPhone: '+91 87654 32109',
    location: 'Pune, MH',
    message: 'What is the final price? Can we negotiate?',
    inquiryType: 'whatsapp',
    status: 'contacted',
    priority: 'medium',
    leadScore: 60,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    notes: ['Called regarding price', 'Wants 5.8L'],
    tags: ['Negotiating'],
  },
  {
    id: '3',
    carId: 'c3',
    carTitle: '2021 Tata Nexon XZ+',
    carPrice: '₹9,80,000',
    carImage: 'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg?auto=compress&cs=tinysrgb&w=200',
    buyerName: 'Amit Kumar',
    buyerPhone: '+91 76543 21098',
    location: 'Thane, MH',
    message: 'Looking for a family car.',
    inquiryType: 'phone',
    status: 'interested',
    priority: 'high',
    leadScore: 90,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    notes: ['Test drive scheduled'],
    tags: ['Ready to Buy'],
  },
];

const DealerInquiriesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const [inquiries, setInquiries] = useState<Inquiry[]>(MOCK_INQUIRIES);

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesFilter = selectedFilter === 'all' || inquiry.status === selectedFilter;
    const matchesSearch = searchQuery === '' ||
      inquiry.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.carTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    Linking.openURL(`whatsapp://send?phone=${phone}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#3B82F6';
      case 'contacted': return '#F59E0B';
      case 'interested': return '#10B981';
      case 'not_interested': return '#EF4444';
      case 'sold': return '#8B5CF6';
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return 'flash-outline';
      case 'contacted': return 'chatbubbles-outline';
      case 'interested': return 'heart-outline';
      case 'not_interested': return 'close-circle-outline';
      case 'sold': return 'checkmark-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const renderInquiryCard = ({ item }: { item: Inquiry }) => (
    <TouchableOpacity
      style={[styles.inquiryCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border }]}
      onPress={() => {
        setSelectedInquiry(item);
        setShowInquiryModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{item.buyerName[0]}</Text>
          </View>
          <View>
            <Text style={[styles.buyerName, { color: colors.text }]}>{item.buyerName}</Text>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {formatTime(item.createdAt)} • {item.location}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={[styles.carInfoContainer, { backgroundColor: isDark ? colors.background : '#F3F4F6' }]}>
        <Image source={{ uri: item.carImage }} style={styles.carThumbnail} />
        <View style={styles.carDetails}>
          <Text style={[styles.carTitle, { color: colors.text }]} numberOfLines={1}>{item.carTitle}</Text>
          <Text style={[styles.carPrice, { color: colors.primary }]}>{item.carPrice}</Text>
        </View>
      </View>

      <Text style={[styles.messagePreview, { color: colors.textSecondary }]} numberOfLines={2}>
        "{item.message}"
      </Text>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCall(item.buyerPhone)}
        >
          <Ionicons name="call-outline" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.text }]}>Call</Text>
        </TouchableOpacity>

        <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleWhatsApp(item.buyerPhone)}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>WhatsApp</Text>
        </TouchableOpacity>

        <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedInquiry(item);
            setShowInquiryModal(true);
          }}
        >
          <Text style={[styles.actionText, { color: colors.primary, fontWeight: '600' }]}>View Details</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Lead Inquiries</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View
        style={[
          styles.searchSection,
          {
            backgroundColor: isDark ? colors.background : '#F9FAFB',
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.searchInputContainer,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search buyer or car"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {FILTER_OPTIONS.map(filter => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      selectedFilter === filter.key
                        ? colors.primary
                        : isDark
                        ? colors.surface
                        : '#FFFFFF',
                    borderColor:
                      selectedFilter === filter.key ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        selectedFilter === filter.key
                          ? '#111827'
                          : colors.textSecondary,
                      fontWeight: selectedFilter === filter.key ? '600' : '400',
                    },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={filteredInquiries}
        renderItem={renderInquiryCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No inquiries found</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={showInquiryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInquiryModal(false)}
      >
        {selectedInquiry && (
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Inquiry Details</Text>
              <TouchableOpacity onPress={() => setShowInquiryModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Status Section */}
              <View style={[styles.statusSection, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
                <View style={[styles.largeStatusBadge, { backgroundColor: getStatusColor(selectedInquiry.status) + '20' }]}>
                  <Ionicons name={getStatusIcon(selectedInquiry.status)} size={20} color={getStatusColor(selectedInquiry.status)} />
                  <Text style={[styles.largeStatusText, { color: getStatusColor(selectedInquiry.status) }]}>
                    {selectedInquiry.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.leadScore, { color: colors.textSecondary }]}>
                  Lead Score: <Text style={{ color: selectedInquiry.leadScore > 70 ? '#10B981' : '#F59E0B', fontWeight: '700' }}>{selectedInquiry.leadScore}/100</Text>
                </Text>
              </View>

              {/* Buyer Info */}
              <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Buyer Information</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                  <Text style={[styles.infoText, { color: colors.text }]}>{selectedInquiry.buyerName}</Text>
                </View>
                <TouchableOpacity onPress={() => handleCall(selectedInquiry.buyerPhone)} style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
                  <Text style={[styles.infoText, { color: colors.primary }]}>{selectedInquiry.buyerPhone}</Text>
                </TouchableOpacity>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                  <Text style={[styles.infoText, { color: colors.text }]}>{selectedInquiry.location}</Text>
                </View>
              </View>

              {/* Car Info */}
              <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Interested Vehicle</Text>
                <View style={styles.modalCarRow}>
                  <Image source={{ uri: selectedInquiry.carImage }} style={styles.modalCarImage} />
                  <View style={styles.modalCarDetails}>
                    <Text style={[styles.modalCarTitle, { color: colors.text }]}>{selectedInquiry.carTitle}</Text>
                    <Text style={[styles.modalCarPrice, { color: colors.primary }]}>{selectedInquiry.carPrice}</Text>
                  </View>
                </View>
              </View>

              {/* Message */}
              <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Message</Text>
                <View style={[styles.messageBox, { backgroundColor: isDark ? colors.background : '#F9FAFB' }]}>
                  <Text style={[styles.fullMessage, { color: colors.text }]}>{selectedInquiry.message}</Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionButton, { backgroundColor: '#10B981' }]}
                  onPress={() => handleCall(selectedInquiry.buyerPhone)}
                >
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                  <Text style={styles.modalActionText}>Call Buyer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionButton, { backgroundColor: '#25D366' }]}
                  onPress={() => handleWhatsApp(selectedInquiry.buyerPhone)}
                >
                  <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                  <Text style={styles.modalActionText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
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
  headerSpacer: {
    width: scaleSize(24),
    height: scaleSize(24),
  },
  searchSection: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: scaleSize(6),
    borderRadius: getResponsiveBorderRadius('full'),
    borderWidth: 1,
    marginBottom: getResponsiveSpacing('md'),
  },
  searchInput: {
    flex: 1,
    marginLeft: getResponsiveSpacing('sm'),
    fontSize: getResponsiveTypography('sm'),
  },
  filterContainer: {
    paddingBottom: getResponsiveSpacing('xs'),
  },
  filterContent: {
    paddingHorizontal: 0,
    gap: getResponsiveSpacing('sm'),
  },
  filterChip: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: scaleSize(6),
    borderRadius: getResponsiveBorderRadius('full'),
    borderWidth: 1,
  },
  filterText: {
    fontSize: getResponsiveTypography('sm'),
  },
  listContent: {
    padding: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('md'),
  },
  inquiryCard: {
    borderRadius: getResponsiveBorderRadius('xl'),
    padding: getResponsiveSpacing('md'),
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: getResponsiveSpacing('md'),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: getResponsiveBorderRadius('full'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getResponsiveSpacing('sm'),
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '700',
  },
  buyerName: {
    fontSize: getResponsiveTypography('md'),
    fontWeight: '600',
  },
  timestamp: {
    fontSize: getResponsiveTypography('xs'),
    marginTop: scaleSize(2),
  },
  statusBadge: {
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(4),
    borderRadius: getResponsiveBorderRadius('sm'),
  },
  statusText: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '700',
  },
  carInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing('sm'),
    borderRadius: getResponsiveBorderRadius('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  carThumbnail: {
    width: scaleSize(48),
    height: scaleSize(36),
    borderRadius: getResponsiveBorderRadius('sm'),
    marginRight: getResponsiveSpacing('sm'),
  },
  carDetails: {
    flex: 1,
  },
  carTitle: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '600',
  },
  carPrice: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '700',
    marginTop: scaleSize(2),
  },
  messagePreview: {
    fontSize: getResponsiveTypography('sm'),
    fontStyle: 'italic',
    marginBottom: getResponsiveSpacing('md'),
  },
  divider: {
    height: 1,
    marginBottom: getResponsiveSpacing('sm'),
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
    padding: scaleSize(4),
  },
  actionText: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '500',
  },
  verticalDivider: {
    width: 1,
    height: scaleSize(16),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: scaleSize(100),
  },
  emptyText: {
    marginTop: getResponsiveSpacing('md'),
    fontSize: getResponsiveTypography('md'),
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getResponsiveSpacing('md'),
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '700',
  },
  closeButton: {
    padding: scaleSize(4),
  },
  modalScroll: {
    padding: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('lg'),
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('lg'),
  },
  largeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(8),
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: scaleSize(6),
    borderRadius: getResponsiveBorderRadius('full'),
  },
  largeStatusText: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '700',
  },
  leadScore: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '500',
  },
  sectionCard: {
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('xl'),
  },
  sectionHeader: {
    fontSize: getResponsiveTypography('md'),
    fontWeight: '700',
    marginBottom: getResponsiveSpacing('md'),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
    marginBottom: getResponsiveSpacing('sm'),
  },
  infoText: {
    fontSize: getResponsiveTypography('md'),
  },
  modalCarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  modalCarImage: {
    width: scaleSize(80),
    height: scaleSize(60),
    borderRadius: getResponsiveBorderRadius('lg'),
  },
  modalCarDetails: {
    flex: 1,
  },
  modalCarTitle: {
    fontSize: getResponsiveTypography('md'),
    fontWeight: '600',
    marginBottom: scaleSize(4),
  },
  modalCarPrice: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '700',
  },
  messageBox: {
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('lg'),
  },
  fullMessage: {
    fontSize: getResponsiveTypography('md'),
    lineHeight: scaleSize(24),
  },
  modalActions: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('xl'),
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(8),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('lg'),
  },
  modalActionText: {
    color: '#FFFFFF',
    fontSize: getResponsiveTypography('md'),
    fontWeight: '600',
  },
});

export default DealerInquiriesScreen;
