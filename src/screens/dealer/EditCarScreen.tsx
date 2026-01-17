import React, { useState, useEffect, useCallback, useRef } from 'react';
// EditCarScreen Component
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    StatusBar,
    Animated,
    Dimensions,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { Button } from '../../components/ui/Button';
import { useUploadQueue, SelectedImage } from '../../context/UploadQueueContext';
import { launchImageLibrary, Asset } from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');

interface Props {
    navigation: any;
    route: {
        params: {
            carId: string;
        };
    };
}

const STATUS_OPTIONS = [
    { id: 'Available', label: 'Available', color: '#10B981', icon: 'checkmark-circle' },
    { id: 'Reserved', label: 'Reserved', color: '#8B5CF6', icon: 'time' },
    { id: 'Sold', label: 'Sold', color: '#EC4899', icon: 'close-circle' },
];

const CONDITION_OPTIONS = [
    { id: 'Excellent', label: 'Excellent', icon: 'star' },
    { id: 'Good', label: 'Good', icon: 'thumbs-up' },
    { id: 'Fair', label: 'Fair', icon: 'construct' },
];

const EditCarScreen: React.FC<Props> = ({ navigation, route }) => {
    const { theme, isDark } = useTheme();
    const { colors } = theme;
    const { uploads, retryUpload, addToQueue } = useUploadQueue();
    const carId = route.params?.carId;

    // State
    const [car, setCar] = useState<Vehicle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Editable fields
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('Available');
    const [condition, setCondition] = useState('Good');

    // Animations
    const scrollY = useRef(new Animated.Value(0)).current;

    // Fetch car data
    useEffect(() => {
        const fetchCar = async () => {
            if (!carId) {
                setError('No car ID provided');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const carData = await carApi.getVehicleById(String(carId));
                setCar(carData);

                // Initialize editable fields
                setPrice(String(carData.price || ''));
                setDescription(carData.specifications?.description || '');
                setStatus(carData.status || 'Available');
                setCondition(carData.condition || 'Good');
            } catch (err) {
                console.error('Error fetching car:', err);
                setError('Failed to load car details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCar();
    }, [carId]);

    // Track changes
    useEffect(() => {
        if (car) {
            const priceChanged = String(price) !== String(car.price);
            const descriptionChanged = description !== (car.specifications?.description || '');
            const statusChanged = status !== car.status;
            const conditionChanged = condition !== car.condition;
            setHasChanges(priceChanged || descriptionChanged || statusChanged || conditionChanged);
        }
    }, [price, description, status, condition, car]);

    // Format price for display
    const formatPrice = (value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue) {
            const num = parseInt(numericValue, 10);
            return num.toLocaleString('en-IN');
        }
        return '';
    };

    const handlePriceChange = (value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        setPrice(numericValue);
    };

    // Save changes
    const handleSave = async () => {
        if (!car || !hasChanges) return;

        try {
            setIsSaving(true);
            const updates = {
                price: parseInt(price, 10),
                status: status as Vehicle['status'],
                condition: condition,
                specifications: {
                    ...car.specifications,
                    description: description
                }
            };

            await carApi.updateVehicle(String(car.id), updates);

            Alert.alert('Success', 'Car details updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            console.error('Error updating car:', err);
            Alert.alert('Error', 'Failed to update car details.');
        } finally {
            setIsSaving(false);
        }
    };

    // Toggle Visibility (Archive/Unarchive)
    const handleToggleVisibility = () => {
        const newStatus = status === 'Archived' ? 'Available' : 'Archived';
        setStatus(newStatus);
    };

    // Delete Car
    const handleDelete = () => {
        Alert.alert(
            'Delete Car',
            'Are you sure you want to delete this car? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsDeleting(true);
                            await carApi.deleteVehicle(String(carId));
                            Alert.alert('Deleted', 'Car has been removed successfully.', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (err) {
                            console.error('Error deleting car:', err);
                            Alert.alert('Error', 'Failed to delete car.');
                            setIsDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    // Get upload status display
    const handleReSelectPhotos = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 8,
                quality: 0.8,
            });

            if (result.didCancel || !result.assets) return;

            const selectedImages: SelectedImage[] = result.assets.map(asset => ({
                uri: asset.uri || '',
                fileName: asset.fileName,
                type: asset.type,
                fileSize: asset.fileSize,
                width: asset.width,
                height: asset.height,
            })).filter(img => img.uri.length > 0);

            if (selectedImages.length > 0) {
                await addToQueue(carId, selectedImages, null);
                Alert.alert('Uploading', 'Your photos are being uploaded in the background.');
            }
        } catch (error) {
            console.error('Failed to pick images', error);
            Alert.alert('Error', 'Failed to pick images.');
        }
    };

    const handleRetryUpload = () => {
        const task = uploads.get(carId);
        // If we have a local task, we can just retry it
        if (task && (task.status === 'failed' || task.status === 'partial')) {
            retryUpload(carId);
            Alert.alert('Retrying', 'Upload restarted.');
        } else {
            // No local task found (e.g. app restart), so we must ask user to re-select
            Alert.alert(
                'Resume Upload',
                'The previous upload session has expired. Please select your photos again to resume.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Select Photos', onPress: handleReSelectPhotos }
                ]
            );
        }
    };

    const getUploadStatusDisplay = () => {
        if (!car) return null;
        const mediaStatus = (car.mediaStatus as string)?.toUpperCase() || 'NONE';

        if (mediaStatus === 'PROCESSING' || mediaStatus === 'UPLOADING' || mediaStatus === 'UPLOADED' || mediaStatus === 'PENDING' || mediaStatus === 'MEDIA_PENDING') {
            return {
                text: mediaStatus === 'UPLOADING' ? 'Media Uploading...' : 'Processing Media...',
                color: '#F59E0B',
                icon: 'cloud-upload',
                bg: '#FEF3C7',
                isProcessing: true
            };
        }
        if (mediaStatus === 'NONE') {
            return {
                text: 'No Media Uploaded',
                color: '#6B7280',
                icon: 'image',
                bg: '#F3F4F6',
                isProcessing: false
            };
        }
        if (mediaStatus === 'FAILED') {
            return {
                text: 'Processing Failed',
                color: '#EF4444',
                icon: 'alert-circle',
                bg: '#FEE2E2',
                isProcessing: false,
                isFailed: true,
                action: handleRetryUpload
            };
        }
        return null;
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#111827' : '#F9FAFB',
        },
        headerOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: getResponsiveSpacing('lg'),
            paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
        },
        backButtonCircle: {
            width: scaleSize(40),
            height: scaleSize(40),
            borderRadius: 20,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        heroContainer: {
            height: hp(35),
            width: '100%',
        },
        heroImage: {
            width: '100%',
            height: '100%',
        },
        gradientOverlay: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            backgroundColor: 'transparent', // Using rgba inside simple View if LinearGradient not avail
            // Since we removed LinearGradient, we simulation gradient or used just solid fade?
            // User requested NO LinearGradient. We'll use a semi-transparent View.
        },
        contentContainer: {
            flex: 1,
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            marginTop: -scaleSize(20),
            borderTopLeftRadius: scaleSize(24),
            borderTopRightRadius: scaleSize(24),
            paddingTop: getResponsiveSpacing('xl'),
            paddingHorizontal: getResponsiveSpacing('lg'),
            minHeight: hp(70),
        },
        carTitle: {
            fontSize: getResponsiveTypography('xxl'),
            fontWeight: '800',
            color: colors.text,
            letterSpacing: -0.5,
        },
        carSubtitle: {
            fontSize: getResponsiveTypography('md'),
            color: colors.textSecondary,
            marginTop: scaleSize(4),
            fontWeight: '500',
        },
        priceSection: {
            marginTop: getResponsiveSpacing('xl'),
            paddingBottom: getResponsiveSpacing('md'),
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#374151' : '#F3F4F6',
        },
        priceLabel: {
            fontSize: getResponsiveTypography('sm'),
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontWeight: '600',
            marginBottom: scaleSize(8),
        },
        priceInputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        currency: {
            fontSize: getResponsiveTypography('xxl'),
            color: colors.primary,
            fontWeight: '700',
            marginRight: scaleSize(4),
        },
        priceInput: {
            flex: 1,
            fontSize: getResponsiveTypography('xxl'),
            fontWeight: '800',
            color: colors.text,
            padding: 0,
        },
        section: {
            marginTop: getResponsiveSpacing('xl'),
        },
        sectionTitle: {
            fontSize: getResponsiveTypography('lg'),
            fontWeight: '700',
            color: colors.text,
            marginBottom: getResponsiveSpacing('md'),
        },
        statusGrid: {
            flexDirection: 'row',
            gap: scaleSize(10),
        },
        statusCard: {
            flex: 1,
            padding: getResponsiveSpacing('md'),
            borderRadius: scaleSize(16),
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
        },
        statusIcon: {
            marginBottom: scaleSize(8),
        },
        statusLabel: {
            fontSize: getResponsiveTypography('xs'),
            fontWeight: '700',
        },
        conditionRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: scaleSize(10),
        },
        conditionChip: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: scaleSize(12),
            borderRadius: scaleSize(12),
            borderWidth: 1,
        },
        conditionText: {
            marginLeft: scaleSize(6),
            fontWeight: '600',
            fontSize: getResponsiveTypography('sm'),
        },
        alertBanner: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: getResponsiveSpacing('md'),
            borderRadius: scaleSize(12),
            marginTop: getResponsiveSpacing('lg'),
            marginBottom: getResponsiveSpacing('sm'),
        },
        alertText: {
            marginLeft: scaleSize(10),
            fontWeight: '600',
            fontSize: getResponsiveTypography('sm'),
        },
        bottomBar: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: getResponsiveSpacing('lg'),
            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#374151' : '#E5E7EB',
            paddingBottom: hp(4), // Safe area bottom
        },
        saveButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: scaleSize(16),
            borderRadius: scaleSize(16),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        },
        saveText: {
            color: '#111827',
            fontSize: getResponsiveTypography('lg'),
            fontWeight: '700',
            marginLeft: scaleSize(8),
        },
        textInput: {
            borderWidth: 1,
            borderRadius: scaleSize(12),
            padding: getResponsiveSpacing('md'),
            fontSize: getResponsiveTypography('md'),
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        analyticsContainer: {
            flexDirection: 'row',
            marginTop: getResponsiveSpacing('lg'),
            gap: scaleSize(12),
        },
        analyticsCard: {
            flex: 1,
            padding: getResponsiveSpacing('md'),
            borderRadius: scaleSize(16),
            alignItems: 'center',
            justifyContent: 'center',
        },
        analyticsValue: {
            fontSize: getResponsiveTypography('xl'),
            fontWeight: '800',
            marginTop: scaleSize(4),
        },
        analyticsLabel: {
            fontSize: getResponsiveTypography('xs'),
            marginTop: scaleSize(2),
        },
        deleteButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: scaleSize(14),
            borderRadius: scaleSize(12),
            borderWidth: 1,
            borderStyle: 'dashed',
        },
        deleteText: {
            color: '#EF4444',
            fontWeight: '600',
            marginLeft: scaleSize(8),
            fontSize: getResponsiveTypography('md'),
        },
    });

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !car) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={{ color: colors.error }}>{error || 'Car not found'}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const uploadStatus = getUploadStatusDisplay();
    const coverImage = car.images?.[0] || car.imageUrl || 'https://via.placeholder.com/400x300';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >

                {/* Header Overlay */}
                <View style={styles.headerOverlay}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonCircle}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={[styles.backButtonCircle, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                        <Ionicons name="ellipsis-horizontal" size={24} color="#FFF" />
                    </View>
                </View>

                <Animated.ScrollView
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false } // false because we might animate non-transform props or layout
                    )}
                    scrollEventThrottle={16}
                    contentContainerStyle={{ paddingBottom: 120 }} // Space for bottom bar
                >
                    {/* Hero Image Parallax */}
                    {/* Hero Image Parallax */}
                    <View style={styles.heroContainer}>
                        {coverImage && coverImage !== 'https://via.placeholder.com/400x300' ? (
                            <Image
                                source={{ uri: coverImage }}
                                style={styles.heroImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.heroImage, { backgroundColor: isDark ? '#374151' : '#E5E7EB', alignItems: 'center', justifyContent: 'center' }]}>
                                <Ionicons name="images-outline" size={64} color={colors.textSecondary} />
                                <Text style={{ color: colors.textSecondary, marginTop: 8 }}>No Cover Image</Text>
                            </View>
                        )}

                        {/* Gradient Simulation Overlay */}
                        <View style={{
                            position: 'absolute',
                            bottom: 0, left: 0, right: 0, height: 100,
                            backgroundColor: 'rgba(0,0,0,0.4)'
                        }} />

                        {/* Edit Photos Button floating on Hero */}
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                right: 16,
                                bottom: 16,
                                backgroundColor: uploadStatus?.isProcessing ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.6)',
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20,
                                flexDirection: 'row',
                                alignItems: 'center',
                                opacity: uploadStatus?.isProcessing ? 0.7 : 1
                            }}
                            onPress={handleReSelectPhotos}
                            disabled={uploadStatus?.isProcessing}
                        >
                            <Ionicons
                                name={uploadStatus?.isProcessing ? "hourglass" : "camera"}
                                size={20}
                                color="#FFF"
                                style={{ marginRight: 6 }}
                            />
                            <Text style={{ color: '#FFF', fontWeight: '600' }}>
                                {uploadStatus?.isProcessing ? 'Uploading...' : 'Change Photos'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Main Content Surface */}
                    <View style={styles.contentContainer}>
                        {/* Status Banner */}
                        {uploadStatus && (
                            <TouchableOpacity
                                disabled={!uploadStatus.action}
                                onPress={uploadStatus.action}
                                style={[styles.alertBanner, { backgroundColor: uploadStatus.bg }]}
                            >
                                <Ionicons name={uploadStatus.icon as any} size={20} color={uploadStatus.color} />
                                <Text style={[styles.alertText, { color: uploadStatus.color }]}>
                                    {uploadStatus.text}
                                </Text>
                                {uploadStatus.action && (
                                    <View style={{ marginLeft: 'auto', backgroundColor: colors.background, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 }}>
                                        <Text style={{ color: uploadStatus.color, fontWeight: '700', fontSize: 12 }}>
                                            {uploadStatus.text.includes('Failed') ? 'TAP TO RETRY' : 'VIEW'}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}

                        <Text style={styles.carTitle}>{car.make} {car.model}</Text>
                        <Text style={styles.carSubtitle}>
                            {car.year} • {car.variant} • {car.mileage?.toLocaleString()} km
                        </Text>

                        {/* Analytics Dashboard */}
                        {/* Media Health Dashboard */}
                        {uploads.has(carId) && (
                            <View style={[styles.section, { marginTop: 0, marginBottom: 20 }]}>
                                <Text style={styles.sectionTitle}>Media Health</Text>
                                <View style={[styles.analyticsContainer, { marginTop: 0 }]}>
                                    <View style={[styles.analyticsCard, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                        <Text style={[styles.analyticsValue, { color: colors.text }]}>
                                            {Math.round(uploads.get(carId)?.progress || 0)}%
                                        </Text>
                                        <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Success</Text>
                                    </View>
                                    <View style={[styles.analyticsCard, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                        <Ionicons name="alert-circle" size={20} color={uploads.get(carId)?.failedImageIndices.length ? "#EF4444" : colors.textSecondary} />
                                        <Text style={[styles.analyticsValue, { color: colors.text }]}>
                                            {uploads.get(carId)?.failedImageIndices.length || 0}
                                        </Text>
                                        <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Failures</Text>
                                    </View>
                                    <View style={[styles.analyticsCard, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                        <Ionicons name="refresh" size={20} color="#F59E0B" />
                                        <Text style={[styles.analyticsValue, { color: colors.text }]}>
                                            {uploads.get(carId)?.retryCount || 0}
                                        </Text>
                                        <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Retries</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Advanced Analytics Dashboard */}
                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Engagement & Funnel</Text>
                        <View style={styles.analyticsContainer}>
                            <View style={[styles.analyticsCard, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                <Ionicons name="eye" size={20} color={colors.primary} />
                                <Text style={[styles.analyticsValue, { color: colors.text }]}>{car.views || 0}</Text>
                                <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Views</Text>
                            </View>
                            <View style={[styles.analyticsCard, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                <Ionicons name="finger-print" size={20} color="#8B5CF6" />
                                <Text style={[styles.analyticsValue, { color: colors.text }]}>{(car as any).contactClickCount || 0}</Text>
                                <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Clicks</Text>
                            </View>
                            <View style={[styles.analyticsCard, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                <Ionicons name="chatbubbles" size={20} color="#10B981" />
                                <Text style={[styles.analyticsValue, { color: colors.text }]}>{car.inquiries || 0}</Text>
                                <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Leads</Text>
                            </View>
                        </View>

                        <View style={[styles.analyticsContainer, { marginTop: 12 }]}>
                            <View style={[styles.analyticsCard, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                <Ionicons name="images" size={20} color={colors.textSecondary} />
                                <Text style={[styles.analyticsValue, { color: colors.text }]}>{(car as any).imageSwipeCount || 0}</Text>
                                <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Swipes</Text>
                            </View>
                            <View style={[styles.analyticsCard, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                <Ionicons name="play-circle" size={20} color="#EF4444" />
                                <Text style={[styles.analyticsValue, { color: colors.text }]}>{(car as any).videoPlayCount || 0}</Text>
                                <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Plays</Text>
                            </View>
                            <View style={[styles.analyticsCard, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                <Ionicons name="share-social" size={20} color="#3B82F6" />
                                <Text style={[styles.analyticsValue, { color: colors.text }]}>{car.shares || 0}</Text>
                                <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Shares</Text>
                            </View>
                        </View>

                        {/* Price Input Section */}
                        <View style={styles.priceSection}>
                            <Text style={styles.priceLabel}>Asking Price</Text>
                            <View style={styles.priceInputWrapper}>
                                <Text style={styles.currency}>₹</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    value={formatPrice(price)}
                                    onChangeText={handlePriceChange}
                                    keyboardType="number-pad"
                                    placeholder="0"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                        </View>

                        {/* Status & Visibility */}
                        <View style={styles.section}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.sectionTitle}>Listing Status</Text>
                                <TouchableOpacity
                                    onPress={handleToggleVisibility}
                                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                                >
                                    <Text style={{ color: status === 'Archived' ? colors.textSecondary : colors.primary, marginRight: 8, fontWeight: '600' }}>
                                        {status === 'Archived' ? 'Hidden' : 'Visible'}
                                    </Text>
                                    <Ionicons
                                        name={status === 'Archived' ? 'eye-off' : 'eye'}
                                        size={22}
                                        color={status === 'Archived' ? colors.textSecondary : colors.primary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.statusGrid}>
                                {STATUS_OPTIONS.map(opt => {
                                    const selected = status === opt.id;
                                    return (
                                        <TouchableOpacity
                                            key={opt.id}
                                            style={[
                                                styles.statusCard,
                                                {
                                                    borderColor: selected ? opt.color : (isDark ? '#374151' : '#E5E7EB'),
                                                    backgroundColor: selected ? `${opt.color}15` : 'transparent',
                                                }
                                            ]}
                                            onPress={() => setStatus(opt.id)}
                                        >
                                            <Ionicons
                                                name={opt.icon as any}
                                                size={24}
                                                color={selected ? opt.color : colors.textSecondary}
                                                style={styles.statusIcon}
                                            />
                                            <Text style={[
                                                styles.statusLabel,
                                                { color: selected ? opt.color : colors.textSecondary }
                                            ]}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Condition Selector */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Condition</Text>
                            <View style={styles.conditionRow}>
                                {CONDITION_OPTIONS.map(opt => {
                                    const selected = condition === opt.id;
                                    return (
                                        <TouchableOpacity
                                            key={opt.id}
                                            style={[
                                                styles.conditionChip,
                                                {
                                                    borderColor: selected ? colors.primary : (isDark ? '#374151' : '#E5E7EB'),
                                                    backgroundColor: selected ? colors.primary + '15' : 'transparent'
                                                }
                                            ]}
                                            onPress={() => setCondition(opt.id)}
                                        >
                                            <Ionicons
                                                name={opt.icon as any}
                                                size={16}
                                                color={selected ? colors.primary : colors.textSecondary}
                                            />
                                            <Text style={[
                                                styles.conditionText,
                                                { color: selected ? colors.primary : colors.textSecondary }
                                            ]}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>




                        {/* Description */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    {
                                        minHeight: 100,
                                        textAlignVertical: 'top',
                                        color: colors.text,
                                        borderColor: colors.border,
                                        backgroundColor: isDark ? colors.surface : '#FFFFFF'
                                    }
                                ]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Describe your car..."
                                placeholderTextColor={colors.textSecondary}
                                multiline
                            />
                        </View>

                        {/* Additional Info Read-only */}
                        <View style={[styles.section, { opacity: 0.6 }]}>
                            <Text style={styles.sectionTitle}>Specification (Read-only)</Text>
                            <Text style={{ color: colors.textSecondary }}>
                                {car.fuelType} • {car.transmission} • {car.specifications?.numberOfOwners || '1st'} Owner
                            </Text>
                        </View>

                        {/* Danger Zone */}
                        <View style={[styles.section, { paddingBottom: 40 }]}>
                            <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Danger Zone</Text>
                            <TouchableOpacity
                                style={[styles.deleteButton, { borderColor: '#EF4444', backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2' }]}
                                onPress={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <ActivityIndicator color="#EF4444" />
                                ) : (
                                    <>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                        <Text style={styles.deleteText}>Delete Car Listing</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.ScrollView >

                {/* Bottom Sticky Action Bar */}
                < View style={styles.bottomBar} >
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: hasChanges ? '#F59E0B' : (isDark ? '#374151' : '#E5E7EB') }
                        ]}
                        onPress={handleSave}
                        disabled={!hasChanges || isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color={hasChanges ? '#111827' : colors.textSecondary} />
                        ) : (
                            <>
                                <Ionicons
                                    name="save-outline"
                                    size={20}
                                    color={hasChanges ? '#111827' : colors.textSecondary}
                                />
                                <Text style={[
                                    styles.saveText,
                                    { color: hasChanges ? '#111827' : colors.textSecondary }
                                ]}>
                                    {hasChanges ? 'Save Changes' : 'No Changes'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View >
            </KeyboardAvoidingView >
        </View >
    );
};

export default EditCarScreen;
