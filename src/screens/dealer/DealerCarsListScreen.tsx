import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
                setLoading(true);
            }

            setError(null);
            const status = filter === 'all' ? undefined : filter;
            const response = await carApi.getMyCarListings(pageNum, 20, status);

            if (isRefresh || pageNum === 0) {
                setCars(response.content);
            } else {
                setCars(prev => [...prev, ...response.content]);
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
    }, [filter]);

    useEffect(() => {
        loadCars(0);
    }, [loadCars]);

    const handleRefresh = () => loadCars(0, true);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadCars(page + 1);
        }
    };

    const handleCarPress = (car: Vehicle) => {
        navigation.navigate('CarDetails', { carId: car.id });
    };

    const formatPrice = (price: number) => {
        if (price >= 10000000) {
            return `₹${(price / 10000000).toFixed(2)} Cr`;
        } else if (price >= 100000) {
            return `₹${(price / 100000).toFixed(2)} L`;
        }
        return `₹${price.toLocaleString()}`;
    };

    const renderCarItem = ({ item }: { item: Vehicle }) => (
        <TouchableOpacity
            style={[styles.carCard, { backgroundColor: colors.surface }]}
            onPress={() => handleCarPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.carContent}>
                <View style={styles.carInfo}>
                    <Text style={[styles.carTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.make} {item.model}
                    </Text>
                    <Text style={[styles.carYear, { color: colors.textSecondary }]}>
                        {item.year} • {item.mileage?.toLocaleString()} km
                    </Text>
                    <Text style={[styles.carPrice, { color: colors.primary }]}>
                        {formatPrice(item.price)}
                    </Text>
                </View>
                <View style={styles.carStats}>
                    <View style={styles.statItem}>
                        <Ionicons name="eye-outline" size={scaleSize(16)} color={colors.textSecondary} />
                        <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.views || 0}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="chatbubble-outline" size={scaleSize(16)} color={colors.textSecondary} />
                        <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.inquiries || 0}</Text>
                    </View>
                </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'Available' ? '#43e97b' : '#fa709a' }]}>
                <Text style={styles.statusText}>{item.status}</Text>
            </View>
        </TouchableOpacity>
    );

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
    },
    statusText: {
        fontSize: getResponsiveTypography('xs'),
        fontWeight: '600',
        color: '#FFFFFF',
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
});

export default DealerCarsListScreen;
