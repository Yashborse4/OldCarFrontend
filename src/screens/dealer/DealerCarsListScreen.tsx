import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme';
import {
    scaleSize,
    getResponsiveSpacing,
    getResponsiveTypography,
    getResponsiveBorderRadius,
    wp,
    hp,
} from '../../utils/responsiveEnhanced';
import { carApi, Vehicle } from '../../services/CarApi';
import { useUploadQueue, UploadTask } from '../../context/UploadQueueContext';

interface Props {
    navigation: any;
    route: {
        params?: {
            filter?: string;
            title?: string;
        };
    };
}

const DealerCarsListScreen: React.FC<Props> = ({ navigation, route }) => {
    const { theme, isDark } = useTheme();
    const { colors } = theme;
    const { uploads, retryUpload } = useUploadQueue();

    const filter = route.params?.filter || 'all';
    const title = route.params?.title || 'My Cars';

    const [cars, setCars] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const loadCars = useCallback(async (pageNum: number = 0, isRefresh: boolean = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else if (pageNum === 0) {
                // Only show full loader on initial load, not on focus refresh if we have data
                if (cars.length === 0) setLoading(true);
            }

            setError(null);
            const status = filter === 'all' ? undefined : filter;
            const response = await carApi.getMyCarListings(pageNum, 20, status);

            if (isRefresh || pageNum === 0) {
                setCars(response.content.filter(c => c.status !== 'Deleted'));
            } else {
                setCars(prev => [...prev, ...response.content.filter(c => c.status !== 'Deleted')]);
            }

            setHasMore(response.content.length === 20);
            setPage(pageNum);
        } catch (err) {
            console.error('Error loading cars:', err);
            setError('Failed to load cars. Pull to refresh.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filter]); // Removing cars from dependency to avoid loop, though cars.length check is safe inside

    const handleRefresh = () => loadCars(0, true);

    // Auto-refresh every 10 seconds to keep statuses updated (Processing -> Live)
    useFocusEffect(
        useCallback(() => {
            loadCars(0);

            const intervalId = setInterval(() => {
                // Silent refresh (no loading spinner)
                loadCars(0, false);
            }, 10000);

            return () => clearInterval(intervalId);
        }, [loadCars])
    );

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadCars(page + 1);
        }
    };

    const handleCarPress = (car: Vehicle) => {
        navigation.navigate('EditCar', { carId: car.id });
    };

    const formatPrice = (price: number) => {
        if (price >= 10000000) {
            return `₹${(price / 10000000).toFixed(2)} Cr`;
        } else if (price >= 100000) {
            return `₹${(price / 100000).toFixed(2)} L`;
        }
        return `₹${price.toLocaleString()}`;
    };

    const renderCarItem = ({ item }: { item: Vehicle }) => {
        const uploadTask = uploads.get(item.id);
        const itemStatus = (item.status as string)?.toUpperCase() || 'AVAILABLE';
        const mediaStatus = (item.mediaStatus as string)?.toUpperCase() || 'NONE';

        // Helper to check if we are in a processing state
        // We only consider it processing if the BACKEND says so, or if we are actively uploading
        // But for 'READY' transition, we MUST wait for backend
        const isBackendProcessing = mediaStatus === 'PROCESSING' || mediaStatus === 'UPLOADING' || mediaStatus === 'UPLOADED' || mediaStatus === 'PENDING' || mediaStatus === 'MEDIA_PENDING';
        const isBackendReady = mediaStatus === 'READY';
        const isBackendFailed = mediaStatus === 'FAILED';
        const isBackendNone = mediaStatus === 'NONE';

        // Get status display info
        const getStatusInfo = () => {
            // IF we have a local upload task running, show its status until backend takes over
            if (uploadTask && (mediaStatus === 'UPLOADING' || mediaStatus === 'NONE' || mediaStatus === 'MEDIA_PENDING')) {
                switch (uploadTask.status) {
                    case 'validating':
                    case 'compressing':
                    case 'uploading':
                        return { icon: 'cloud-upload-outline', color: '#3B82F6', text: `Uploading ${uploadTask.progress}%` };
                    case 'failed':
                        return { icon: 'close-circle', color: '#EF4444', text: 'Upload Failed' };
                    case 'partial':
                        return { icon: 'warning-outline', color: '#F59E0B', text: 'Partial Upload' };
                    case 'completed':
                        return { icon: 'cog-outline', color: '#F59E0B', text: 'Processing...' };
                    case 'pending':
                        return { icon: 'time-outline', color: '#6B7280', text: 'Queued' };
                }
            }

            // Check Media Status First (Pipeline Feedback)
            switch (mediaStatus) {
                case 'UPLOADING':
                    // If no local task but backend says uploading, show generic
                    return { icon: 'cloud-upload-outline', color: '#3B82F6', text: 'Uploading...' };
                case 'PROCESSING':
                case 'MEDIA_PENDING':
                    return { icon: 'cog-outline', color: '#F59E0B', text: 'Processing media...' };
                case 'FAILED':
                    return { icon: 'close-circle', color: '#EF4444', text: 'Processing Failed' };
                // If READY or NONE, fall through to Business Status
            }

            // Business Status
            switch (itemStatus) {
                case 'SOLD':
                    return { icon: 'checkmark-done-circle', color: '#EC4899', text: 'Sold' };
                case 'RESERVED':
                    return { icon: 'bookmark', color: '#8B5CF6', text: 'Reserved' };
                case 'ARCHIVED':
                    return { icon: 'archive-outline', color: '#6B7280', text: 'Archived' };
                case 'AVAILABLE':
                default:
                    if (isBackendNone) {
                        return { icon: 'image-outline', color: '#6B7280', text: 'No Media' };
                    }
                    return { icon: 'checkmark-circle', color: '#10B981', text: 'Live' };
            }
        };

        const statusInfo = getStatusInfo();

        const handleCarPress = (car: Vehicle) => {
            navigation.navigate('EditCar', { carId: car.id });
        };

        const handleDeleteCar = (car: Vehicle) => {
            Alert.alert(
                'Delete Car',
                `Are you sure you want to delete ${car.make} ${car.model}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await carApi.deleteVehicle(car.id);
                                loadCars(); // Refresh list
                            } catch (error) {
                                console.error('Delete failed', error);
                                Alert.alert('Error', 'Failed to delete car');
                            }
                        }
                    }
                ]
            );
        };

        const handleAddMedia = () => {
            // For now, navigate to EditCar. Ideally this would open a dedicated media picker.
            // Assuming EditCar helps or we need a specific 'AddMedia' route.
            // Given constraint, I'll route to EditCar for now as it's the edit entry point.
            navigation.navigate('EditCar', { carId: item.id });
        };

        return (
            <TouchableOpacity
                style={[styles.carCard, { backgroundColor: colors.surface }]}
                onPress={() => handleCarPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.carContent}>
                    <View style={[styles.carImage, { overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }]}>
                        {isBackendProcessing ? (
                            <View style={{ width: '100%', height: '100%', backgroundColor: isDark ? '#374151' : '#E5E7EB', justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        ) : (
                            <Image
                                source={{ uri: (item.images && item.images.length > 0) ? item.images[0] : (item.imageUrl || 'https://via.placeholder.com/80x60.png?text=Add+Media') }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                            />
                        )}
                    </View>
                    <View style={styles.carInfo}>
                        <Text style={[styles.carTitle, { color: colors.text }]} numberOfLines={1}>
                            {item.make} {item.model}
                        </Text>
                        {item.variant && (
                            <Text style={[styles.carVariant, { color: colors.textSecondary }]} numberOfLines={1}>
                                {item.variant}
                            </Text>
                        )}
                        <Text style={[styles.carYear, { color: colors.textSecondary }]}>
                            {item.year} • {item.mileage?.toLocaleString() || 0} km
                        </Text>
                        <Text style={[styles.carPrice, { color: colors.primary }]}>
                            {formatPrice(item.price)}
                        </Text>
                    </View>

                    {/* Edit and Delete Buttons */}
                    <View style={styles.actionIconsContainer}>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6', marginRight: 8 }]}
                            onPress={() => handleCarPress(item)}
                        >
                            <Ionicons name="create-outline" size={scaleSize(18)} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2' }]}
                            onPress={() => handleDeleteCar(item)}
                        >
                            <Ionicons name="trash-outline" size={scaleSize(18)} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Status Badge with Icon - ALWAYS VISIBLE */}
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                    <Ionicons name={statusInfo.icon as any} size={scaleSize(12)} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.statusText}>{statusInfo.text}</Text>
                </View>

                {/* VISIBILITY STATE: Only show stats if READY */}
                {isBackendReady && (
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="eye-outline" size={scaleSize(14)} color={colors.textSecondary} />
                            <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.views || 0}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="chatbubble-outline" size={scaleSize(14)} color={colors.textSecondary} />
                            <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.inquiries || 0}</Text>
                        </View>
                    </View>
                )}

                {/* ACTIONABLE STATES (NONE -> Add Media, FAILED -> Retry) */}
                {isBackendNone && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                            onPress={handleAddMedia}
                        >
                            <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Add Photos</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {(isBackendFailed || (uploadTask?.status === 'failed')) && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                            onPress={() => retryUpload(item.id)}
                        >
                            <Ionicons name="refresh-circle-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Retry Upload</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* UPLOAD PROGRESS BAR (Only if actively uploading) */}
                {uploadTask && (uploadTask.status === 'uploading' || uploadTask.status === 'compressing') && (
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressTrack, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${uploadTask.progress}%`,
                                        backgroundColor: colors.primary
                                    }
                                ]}
                            />
                        </View>
                    </View>
                )}

                {/* Spinner for Server-Side Processing (No local upload task) */}
                {(isBackendProcessing && !uploadTask) && (
                    <View style={styles.progressContainer}>
                        <ActivityIndicator size="small" color="#F59E0B" style={{ marginRight: 8 }} />
                        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                            Server is processing media...
                        </Text>
                    </View>
                )}

                {/* Retry Button for Server-Side FAILED status */}
                {(itemStatus === 'FAILED') && (
                    <View style={styles.progressContainer}>
                        <Text style={[styles.progressText, { color: '#FF6B6B', width: 'auto', marginRight: 8 }]}>
                            Upload Failed
                        </Text>
                        <TouchableOpacity
                            style={[styles.retryButton, { backgroundColor: colors.primary }]}
                            onPress={() => {
                                if (uploads.has(item.id)) {
                                    retryUpload(item.id);
                                } else {
                                    // If no local task (app restart), go to Edit screen to re-select
                                    navigation.navigate('EditCar', { carId: item.id });
                                }
                            }}
                        >
                            <Ionicons name="refresh" size={scaleSize(14)} color="#111827" />
                            <Text style={styles.retryText}>{uploads.has(item.id) ? 'Retry' : 'Fix'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={scaleSize(64)} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Cars Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {filter === 'ACTIVE' ? "You don't have any active listings." : "You haven't listed any cars yet."}
            </Text>
        </View>
    );

    const renderFooter = () => {
        if (!hasMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={scaleSize(24)} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
                <View style={styles.headerRight} />
            </View>

            {loading && page === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading cars...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={scaleSize(48)} color={colors.error || '#FF6B6B'} />
                    <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={cars}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCarItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                />
            )}
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
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: {
        width: scaleSize(40),
        height: scaleSize(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: getResponsiveTypography('lg'),
        fontWeight: '700',
    },
    headerRight: {
        width: scaleSize(40),
    },
    listContent: {
        padding: getResponsiveSpacing('lg'),
    },
    carCard: {
        borderRadius: getResponsiveBorderRadius('lg'),
        marginBottom: getResponsiveSpacing('md'),
        padding: getResponsiveSpacing('md'),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    carContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    carImage: {
        width: scaleSize(80),
        height: scaleSize(60),
        borderRadius: getResponsiveBorderRadius('md'),
        marginRight: getResponsiveSpacing('md'),
        backgroundColor: '#E5E7EB',
    },
    carInfo: {
        flex: 1,
    },
    carTitle: {
        fontSize: getResponsiveTypography('md'),
        fontWeight: '600',
        marginBottom: scaleSize(4),
    },
    carYear: {
        fontSize: getResponsiveTypography('sm'),
        marginBottom: scaleSize(8),
    },
    carPrice: {
        fontSize: getResponsiveTypography('lg'),
        fontWeight: '700',
    },
    carVariant: {
        fontSize: getResponsiveTypography('xs'),
        marginBottom: scaleSize(2),
    },
    actionIconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: scaleSize(32),
        height: scaleSize(32),
        borderRadius: scaleSize(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        width: scaleSize(36),
        height: scaleSize(36),
        borderRadius: getResponsiveBorderRadius('full'),
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: getResponsiveSpacing('sm'),
    },
    statsRow: {
        flexDirection: 'row',
        gap: getResponsiveSpacing('md'),
        marginTop: getResponsiveSpacing('sm'),
        paddingTop: getResponsiveSpacing('sm'),
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    carStats: {
        flexDirection: 'row',
        gap: getResponsiveSpacing('md'),
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleSize(4),
    },
    statText: {
        fontSize: getResponsiveTypography('xs'),
    },
    statusBadge: {
        position: 'absolute',
        top: getResponsiveSpacing('md'),
        right: getResponsiveSpacing('md'),
        paddingHorizontal: scaleSize(8),
        paddingVertical: scaleSize(4),
        borderRadius: getResponsiveBorderRadius('sm'),
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: getResponsiveTypography('xs'),
        fontWeight: '600',
        color: '#FFFFFF',
    },
    actionRow: {
        marginTop: getResponsiveSpacing('sm'),
        marginBottom: getResponsiveSpacing('xs'),
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getResponsiveSpacing('md'),
        paddingVertical: getResponsiveSpacing('sm'),
        borderRadius: getResponsiveBorderRadius('sm'),
        alignSelf: 'flex-start',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: getResponsiveTypography('xs'),
        fontWeight: '600',
        marginLeft: scaleSize(4),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: getResponsiveSpacing('md'),
        fontSize: getResponsiveTypography('sm'),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: getResponsiveSpacing('xl'),
    },
    errorText: {
        marginTop: getResponsiveSpacing('md'),
        fontSize: getResponsiveTypography('sm'),
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: hp(20),
    },
    emptyTitle: {
        fontSize: getResponsiveTypography('lg'),
        fontWeight: '600',
        marginTop: getResponsiveSpacing('md'),
    },
    emptySubtitle: {
        fontSize: getResponsiveTypography('sm'),
        marginTop: getResponsiveSpacing('sm'),
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: getResponsiveSpacing('md'),
        alignItems: 'center',
    },
    // Upload Progress styles
    progressContainer: {
        marginTop: getResponsiveSpacing('sm'),
        flexDirection: 'row',
        alignItems: 'center',
        gap: getResponsiveSpacing('sm'),
    },
    progressTrack: {
        flex: 1,
        height: scaleSize(6),
        borderRadius: scaleSize(3),
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: scaleSize(3),
    },
    progressText: {
        fontSize: getResponsiveTypography('xs'),
        fontWeight: '500',
        minWidth: scaleSize(35),
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scaleSize(10),
        paddingVertical: scaleSize(4),
        borderRadius: getResponsiveBorderRadius('sm'),
        gap: scaleSize(4),
    },
    retryText: {
        fontSize: getResponsiveTypography('xs'),
        fontWeight: '600',
        color: '#111827',
    },
});

export default DealerCarsListScreen;
