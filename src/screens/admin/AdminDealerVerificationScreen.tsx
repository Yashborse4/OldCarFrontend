import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    SafeAreaView,
    RefreshControl,
    ActivityIndicator,
    Modal,
    ScrollView,
    TextInput,
    Alert,
    Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import { apiClient } from '../../services/ApiClient';
import {
    scaleSize,
    getResponsiveSpacing,
    getResponsiveTypography,
    getResponsiveBorderRadius,
    wp,
} from '../../utils/responsiveEnhanced';

interface VerificationRequest {
    id: number;
    dealerId: number;
    dealerUsername: string;
    dealerEmail: string;
    dealerPhone: string;
    businessName: string;
    businessAddress: string;
    gstNumber: string | null;
    phoneNumber: string | null;
    latitude: number;
    longitude: number;
    formattedAddress: string;
    // Specific images
    showroomExteriorImage: string | null;
    showroomInteriorImage: string | null;
    visitingCardImage: string | null;
    // Legacy images
    showroomImages: string[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    statusDisplayName: string;
    adminNotes: string | null;
    submittedAt: string;
    reviewedAt: string | null;
    reviewedByUsername: string | null;
}

type TabFilter = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Props {
    navigation: any;
}

const AdminDealerVerificationScreen: React.FC<Props> = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const { colors } = theme;

    const [activeTab, setActiveTab] = useState<TabFilter>('PENDING');
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const fetchRequests = useCallback(async () => {
        try {
            const response = await apiClient.get<{ data: { content: VerificationRequest[] } }>(`/api/admin/verification-requests?status=${activeTab}&size=50`);
            setRequests(response.data?.data?.content || []);
        } catch (error) {
            console.error('Error fetching verification requests:', error);
            Alert.alert('Error', 'Failed to load verification requests');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [activeTab]);

    const fetchPendingCount = useCallback(async () => {
        try {
            const response = await apiClient.get<{ data: { pendingCount: number } }>('/api/admin/verification-requests/pending-count');
            setPendingCount(response.data?.data?.pendingCount || 0);
        } catch (error) {
            console.error('Error fetching pending count:', error);
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetchRequests();
        fetchPendingCount();
    }, [activeTab, fetchRequests, fetchPendingCount]);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchRequests();
        fetchPendingCount();
    }, [fetchRequests, fetchPendingCount]);

    const handleViewDetails = (request: VerificationRequest) => {
        setSelectedRequest(request);
        setRejectionReason('');
        setIsModalVisible(true);
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        setIsProcessing(true);
        try {
            await apiClient.post(`/api/admin/verification-requests/${selectedRequest.id}/approve`);
            Alert.alert('Success', 'Dealer has been verified successfully');
            setIsModalVisible(false);
            fetchRequests();
            fetchPendingCount();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to approve request');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        if (!rejectionReason.trim()) {
            Alert.alert('Required', 'Please provide a reason for rejection');
            return;
        }

        setIsProcessing(true);
        try {
            await apiClient.post(
                `/api/admin/verification-requests/${selectedRequest.id}/reject?reason=${encodeURIComponent(rejectionReason)}`
            );
            Alert.alert('Success', 'Request has been rejected');
            setIsModalVisible(false);
            fetchRequests();
            fetchPendingCount();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to reject request');
        } finally {
            setIsProcessing(false);
        }
    };

    const openInMaps = (lat: number, lng: number) => {
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        Linking.openURL(url);
    };

    const renderTab = (tab: TabFilter, label: string, count?: number) => {
        const isActive = activeTab === tab;
        return (
            <TouchableOpacity
                style={[
                    styles.tab,
                    isActive && { backgroundColor: colors.primary },
                ]}
                onPress={() => setActiveTab(tab)}
            >
                <Text style={[
                    styles.tabText,
                    { color: isActive ? '#111827' : colors.textSecondary },
                    isActive && styles.tabTextActive,
                ]}>
                    {label}
                </Text>
                {count !== undefined && count > 0 && (
                    <View style={[styles.tabBadge, { backgroundColor: isActive ? '#111827' : colors.primary }]}>
                        <Text style={[styles.tabBadgeText, { color: isActive ? colors.primary : '#111827' }]}>{count}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderRequestItem = ({ item }: { item: VerificationRequest }) => {
        const statusColors = {
            PENDING: '#F59E0B',
            APPROVED: '#10B981',
            REJECTED: '#EF4444',
        };

        return (
            <TouchableOpacity
                style={[styles.requestCard, { backgroundColor: colors.surface }]}
                onPress={() => handleViewDetails(item)}
                activeOpacity={0.8}
            >
                <View style={styles.requestHeader}>
                    <View style={styles.dealerInfo}>
                        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarText}>
                                {item.dealerUsername?.[0]?.toUpperCase() || 'D'}
                            </Text>
                        </View>
                        <View style={styles.dealerDetails}>
                            <Text style={[styles.dealerName, { color: colors.text }]}>
                                {item.businessName}
                            </Text>
                            <Text style={[styles.dealerUsername, { color: colors.textSecondary }]}>
                                @{item.dealerUsername}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColors[item.status]}20` }]}>
                        <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
                            {item.statusDisplayName}
                        </Text>
                    </View>
                </View>

                <View style={styles.requestBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {item.businessAddress}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            Submitted: {new Date(item.submittedAt).toLocaleDateString()}
                        </Text>
                    </View>
                    {item.showroomImages && item.showroomImages.length > 0 && (
                        <View style={styles.imagePreview}>
                            {item.showroomImages.slice(0, 3).map((url, index) => (
                                <Image key={index} source={{ uri: url }} style={styles.previewImage} />
                            ))}
                            {item.showroomImages.length > 3 && (
                                <View style={[styles.moreImages, { backgroundColor: colors.background }]}>
                                    <Text style={[styles.moreImagesText, { color: colors.text }]}>
                                        +{item.showroomImages.length - 3}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.requestFooter}>
                    <Text style={[styles.viewDetails, { color: colors.primary }]}>View Details →</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderDetailsModal = () => {
        if (!selectedRequest) return null;

        return (
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Verification Request</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            {/* Dealer Info */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Dealer Information</Text>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Username</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>@{selectedRequest.dealerUsername}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRequest.dealerEmail}</Text>
                                </View>
                                {selectedRequest.dealerPhone && (
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRequest.dealerPhone}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Business Info */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Details</Text>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Business Name</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRequest.businessName}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Address</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRequest.businessAddress}</Text>
                                </View>
                                {selectedRequest.gstNumber && (
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>GST Number</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRequest.gstNumber}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Location */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
                                <Text style={[styles.locationAddress, { color: colors.textSecondary }]}>
                                    {selectedRequest.formattedAddress}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.mapButton, { backgroundColor: colors.primary }]}
                                    onPress={() => openInMaps(selectedRequest.latitude, selectedRequest.longitude)}
                                >
                                    <Ionicons name="map-outline" size={20} color="#111827" />
                                    <Text style={styles.mapButtonText}>View on Map</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Verification Images */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Verification Images</Text>

                                {selectedRequest.showroomExteriorImage && (
                                    <View style={styles.imageSection}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Showroom Exterior</Text>
                                        <Image source={{ uri: selectedRequest.showroomExteriorImage }} style={styles.verificationImage} />
                                    </View>
                                )}

                                {selectedRequest.showroomInteriorImage && (
                                    <View style={styles.imageSection}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Showroom Interior</Text>
                                        <Image source={{ uri: selectedRequest.showroomInteriorImage }} style={styles.verificationImage} />
                                    </View>
                                )}

                                {selectedRequest.visitingCardImage && (
                                    <View style={styles.imageSection}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Visiting Card / Board</Text>
                                        <Image source={{ uri: selectedRequest.visitingCardImage }} style={styles.verificationImage} />
                                    </View>
                                )}

                                {/* Legacy images */}
                                {selectedRequest.showroomImages && selectedRequest.showroomImages.length > 0 && (
                                    <View style={styles.imageSection}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Additional Images</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {selectedRequest.showroomImages.map((url, index) => (
                                                <Image key={index} source={{ uri: url }} style={styles.modalImage} />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            {/* Admin Notes (if rejected) */}
                            {selectedRequest.status === 'REJECTED' && selectedRequest.adminNotes && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Rejection Reason</Text>
                                    <Text style={[styles.rejectionNote, { color: '#EF4444' }]}>{selectedRequest.adminNotes}</Text>
                                </View>
                            )}

                            {/* Action Buttons (for pending only) */}
                            {selectedRequest.status === 'PENDING' && (
                                <View style={styles.actionSection}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Take Action</Text>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.approveButton]}
                                        onPress={handleApprove}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <>
                                                <Ionicons name="checkmark-circle" size={24} color="white" />
                                                <Text style={styles.actionButtonText}>Approve Dealer</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    <View style={styles.rejectSection}>
                                        <TextInput
                                            style={[styles.rejectInput, { backgroundColor: colors.background, color: colors.text }]}
                                            placeholder="Reason for rejection..."
                                            placeholderTextColor={colors.textSecondary}
                                            value={rejectionReason}
                                            onChangeText={setRejectionReason}
                                            multiline
                                            numberOfLines={3}
                                        />
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.rejectButton]}
                                            onPress={handleReject}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <>
                                                    <Ionicons name="close-circle" size={24} color="white" />
                                                    <Text style={styles.actionButtonText}>Reject Request</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Dealer Verification</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {renderTab('PENDING', 'Pending', pendingCount)}
                {renderTab('APPROVED', 'Verified')}
                {renderTab('REJECTED', 'Rejected')}
            </View>

            {/* List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderRequestItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-outline" size={64} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                No {activeTab.toLowerCase()} requests
                            </Text>
                        </View>
                    }
                />
            )}

            {renderDetailsModal()}
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
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },

    // Tabs
    tabContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: getResponsiveBorderRadius('lg'),
        backgroundColor: 'rgba(0,0,0,0.05)',
        gap: 4,
    },
    tabText: {
        fontSize: getResponsiveTypography('sm'),
        fontWeight: '500',
    },
    tabTextActive: {
        fontWeight: '700',
    },
    tabBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: getResponsiveBorderRadius('full'),
        minWidth: 20,
        alignItems: 'center',
    },
    tabBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },

    // List
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },

    // Request Card
    requestCard: {
        borderRadius: getResponsiveBorderRadius('xl'),
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    dealerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    dealerDetails: {
        marginLeft: 12,
        flex: 1,
    },
    dealerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    dealerUsername: {
        fontSize: 13,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: getResponsiveBorderRadius('full'),
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    requestBody: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 8,
    },
    infoText: {
        fontSize: 13,
        flex: 1,
    },
    imagePreview: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 6,
    },
    previewImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    moreImages: {
        width: 50,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreImagesText: {
        fontSize: 12,
        fontWeight: '600',
    },
    requestFooter: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 12,
    },
    viewDetails: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        maxHeight: '90%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    modalBody: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    detailRow: {
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
    },
    locationAddress: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    mapButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    modalImage: {
        width: 120,
        height: 90,
        borderRadius: 10,
        marginRight: 10,
    },
    imageSection: {
        marginBottom: 16,
    },
    verificationImage: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        marginTop: 8,
    },
    rejectionNote: {
        fontSize: 14,
        lineHeight: 20,
    },

    // Actions
    actionSection: {
        marginTop: 8,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    approveButton: {
        backgroundColor: '#10B981',
        marginBottom: 16,
    },
    rejectButton: {
        backgroundColor: '#EF4444',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    rejectSection: {
        marginTop: 8,
    },
    rejectInput: {
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 12,
    },
});

export default AdminDealerVerificationScreen;
