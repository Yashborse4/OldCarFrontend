import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    StatusBar,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/ApiClient';
import { useLocation } from '../../hooks/useLocation';
import {
    scaleSize,
    getResponsiveTypography,
    getResponsiveBorderRadius,
} from '../../utils/responsiveEnhanced';

interface VerificationStatus {
    id: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    statusDisplayName: string;
    adminNotes?: string;
    submittedAt: string;
    businessName: string;
    businessAddress: string;
    showroomExteriorImage?: string;
    showroomInteriorImage?: string;
    visitingCardImage?: string;
}

interface Props {
    navigation: any;
}

const DealerVerificationScreen: React.FC<Props> = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const { colors } = theme;
    const { user } = useAuth();

    // Location hook
    const {
        latitude,
        longitude,
        formattedAddress,
        isLoading: isLoadingLocation,
        getCurrentLocation
    } = useLocation();

    // Form state
    const [businessName, setBusinessName] = useState('');
    const [businessAddress, setBusinessAddress] = useState('');
    const [gstNumber, setGstNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    // Specific images
    const [exteriorImage, setExteriorImage] = useState<Asset | null>(null);
    const [interiorImage, setInteriorImage] = useState<Asset | null>(null);
    const [visitingCardImage, setVisitingCardImage] = useState<Asset | null>(null);

    // Declarations
    const [infoConfirmed, setInfoConfirmed] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingRequest, setExistingRequest] = useState<VerificationStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState<string>('');

    useEffect(() => {
        fetchVerificationStatus();
    }, []);

    const fetchVerificationStatus = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get<{ data: VerificationStatus }>('/api/dealer/verification/status');
            if (response.data?.data) {
                setExistingRequest(response.data.data);
            }
        } catch (error) {
            console.log('No existing verification request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDetectLocation = async () => {
        await getCurrentLocation();
    };

    const pickImage = async (setter: (img: Asset | null) => void) => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 1,
                quality: 0.8,
            });

            if (result.assets && result.assets[0]) {
                setter(result.assets[0]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    /**
     * Upload image securely through backend API (not direct Firebase)
     */
    const uploadImageToBackend = async (image: Asset, imageType: string): Promise<string> => {
        const formData = new FormData();

        formData.append('file', {
            uri: Platform.OS === 'ios' ? image.uri?.replace('file://', '') : image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `${imageType}_${Date.now()}.jpg`,
        } as any);

        formData.append('folder', `dealer_verification/${user?.id}/${imageType}`);

        const response = await apiClient.post<{ fileUrl: string }>('/api/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000, // 60 second timeout for uploads
        });

        if (!response.data?.fileUrl) {
            throw new Error('Failed to get file URL from server');
        }

        return response.data.fileUrl;
    };

    const handleSubmit = async () => {
        // Validation
        if (!businessName.trim()) {
            Alert.alert('Missing Field', 'Please enter your business name');
            return;
        }
        if (!businessAddress.trim()) {
            Alert.alert('Missing Field', 'Please enter your business address');
            return;
        }
        if (latitude === null || longitude === null) {
            Alert.alert('Missing Location', 'Please detect your showroom location');
            return;
        }
        if (!exteriorImage) {
            Alert.alert('Missing Image', 'Showroom exterior photo is mandatory');
            return;
        }
        if (!infoConfirmed) {
            Alert.alert('Confirmation Required', 'Please confirm that the information is correct');
            return;
        }
        if (!termsAccepted) {
            Alert.alert('Terms Required', 'Please accept the terms and verification policy');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Upload images through secure backend API
            setUploadProgress('Uploading exterior image...');
            const exteriorUrl = await uploadImageToBackend(exteriorImage, 'exterior');

            let interiorUrl: string | undefined;
            if (interiorImage) {
                setUploadProgress('Uploading interior image...');
                interiorUrl = await uploadImageToBackend(interiorImage, 'interior');
            }

            let visitingCardUrl: string | undefined;
            if (visitingCardImage) {
                setUploadProgress('Uploading visiting card...');
                visitingCardUrl = await uploadImageToBackend(visitingCardImage, 'visiting_card');
            }

            setUploadProgress('Submitting verification request...');

            // 2. Submit verification request
            const requestData = {
                businessName: businessName.trim(),
                businessAddress: businessAddress.trim(),
                gstNumber: gstNumber.trim() || null,
                phoneNumber: phoneNumber.trim() || null,
                latitude,
                longitude,
                formattedAddress,
                showroomExteriorImage: exteriorUrl,
                showroomInteriorImage: interiorUrl || null,
                visitingCardImage: visitingCardUrl || null,
                infoConfirmed: true,
                termsAccepted: true,
            };

            const endpoint = existingRequest?.status === 'REJECTED'
                ? '/api/dealer/verification/update'
                : '/api/dealer/verification/apply';

            const method = existingRequest?.status === 'REJECTED' ? 'put' : 'post';

            await apiClient[method](endpoint, requestData);

            Alert.alert(
                'Success',
                'Your verification request has been submitted. We will review it shortly.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            console.error('Submission error:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                'Failed to submit verification request';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsSubmitting(false);
            setUploadProgress('');
        }
    };

    const renderImagePicker = (
        label: string,
        image: Asset | null,
        setter: (img: Asset | null) => void,
        required: boolean = false
    ) => (
        <View style={styles.imagePickerContainer}>
            <Text style={[styles.imageLabel, { color: colors.text }]}>
                {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
            </Text>
            {image ? (
                <View style={styles.imagePreviewWrapper}>
                    <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => setter(null)}
                    >
                        <Ionicons name="close-circle" size={28} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.imagePlaceholder, { borderColor: colors.border }]}
                    onPress={() => pickImage(setter)}
                >
                    <Ionicons name="camera-outline" size={40} color={colors.primary} />
                    <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                        Tap to add
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderExistingRequest = () => {
        if (!existingRequest) return null;

        const statusColors = {
            PENDING: '#F59E0B',
            APPROVED: '#10B981',
            REJECTED: '#EF4444',
        };

        const statusIcons = {
            PENDING: 'time-outline',
            APPROVED: 'checkmark-circle',
            REJECTED: 'close-circle',
        };

        return (
            <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
                <View style={styles.statusHeader}>
                    <Ionicons
                        name={statusIcons[existingRequest.status] as any}
                        size={scaleSize(40)}
                        color={statusColors[existingRequest.status]}
                    />
                    <View style={styles.statusInfo}>
                        <Text style={[styles.statusTitle, { color: colors.text }]}>
                            {existingRequest.statusDisplayName}
                        </Text>
                        <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                            Submitted on {new Date(existingRequest.submittedAt).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                {existingRequest.status === 'REJECTED' && existingRequest.adminNotes && (
                    <View style={[styles.rejectionNote, { backgroundColor: '#FEE2E2' }]}>
                        <Ionicons name="information-circle" size={20} color="#DC2626" />
                        <Text style={styles.rejectionText}>{existingRequest.adminNotes}</Text>
                    </View>
                )}

                <View style={styles.submittedDetails}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Business Name</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{existingRequest.businessName}</Text>

                    <Text style={[styles.detailLabel, { color: colors.textSecondary, marginTop: 12 }]}>Address</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{existingRequest.businessAddress}</Text>
                </View>

                {existingRequest.showroomExteriorImage && (
                    <View style={styles.submittedImages}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Showroom Exterior</Text>
                        <Image source={{ uri: existingRequest.showroomExteriorImage }} style={styles.submittedImage} />
                    </View>
                )}

                {existingRequest.status === 'REJECTED' && (
                    <TouchableOpacity
                        style={[styles.reapplyButton, { backgroundColor: colors.primary }]}
                        onPress={() => setExistingRequest(null)}
                    >
                        <Text style={styles.reapplyButtonText}>Submit New Request</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (existingRequest && existingRequest.status !== 'REJECTED') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Verification Status</Text>
                    <View style={{ width: 40 }} />
                </View>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {renderExistingRequest()}
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Get Verified</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Rejected request message */}
                {existingRequest?.status === 'REJECTED' && (
                    <View style={[styles.rejectedBanner, { backgroundColor: '#FEF2F2' }]}>
                        <Ionicons name="alert-circle" size={24} color="#DC2626" />
                        <Text style={styles.rejectedText}>
                            Your previous request was rejected. Please update and resubmit.
                        </Text>
                    </View>
                )}

                {/* Introduction */}
                <View style={[styles.introCard, { backgroundColor: colors.surface }]}>
                    <Ionicons name="shield-checkmark" size={scaleSize(48)} color={colors.primary} />
                    <Text style={[styles.introTitle, { color: colors.text }]}>Become a Verified Dealer</Text>
                    <Text style={[styles.introText, { color: colors.textSecondary }]}>
                        Verified dealers get increased visibility and trust from buyers.
                    </Text>
                </View>

                {/* Section 1: Showroom Images */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>📸 Showroom Photos</Text>

                    {renderImagePicker('Showroom Exterior Photo', exteriorImage, setExteriorImage, true)}
                    {renderImagePicker('Showroom Interior Photo', interiorImage, setInteriorImage, false)}
                    {renderImagePicker('Visiting Card / Board Photo', visitingCardImage, setVisitingCardImage, false)}
                </View>

                {/* Section 2: Business Details */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>📋 Business Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Business Name *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
                            placeholder="e.g. ABC Auto Sales"
                            placeholderTextColor={colors.textSecondary}
                            value={businessName}
                            onChangeText={setBusinessName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Business Address *</Text>
                        <TextInput
                            style={[styles.input, styles.multilineInput, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
                            placeholder="Full address of your showroom"
                            placeholderTextColor={colors.textSecondary}
                            value={businessAddress}
                            onChangeText={setBusinessAddress}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>GST Number (Optional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
                            placeholder="e.g. 22AAAAA0000A1Z5"
                            placeholderTextColor={colors.textSecondary}
                            value={gstNumber}
                            onChangeText={setGstNumber}
                            autoCapitalize="characters"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number (Optional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
                            placeholder="e.g. +91 98765 43210"
                            placeholderTextColor={colors.textSecondary}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Section 3: Location */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Showroom Location</Text>
                    <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
                        We need your precise location to verify your showroom
                    </Text>

                    <TouchableOpacity
                        style={[styles.locationButton, { backgroundColor: colors.primary }]}
                        onPress={handleDetectLocation}
                        disabled={isLoadingLocation}
                    >
                        {isLoadingLocation ? (
                            <ActivityIndicator color="#111827" />
                        ) : (
                            <>
                                <Ionicons name="locate" size={24} color="#111827" />
                                <Text style={styles.locationButtonText}>Detect My Location</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {formattedAddress && (
                        <View style={[styles.locationResult, { backgroundColor: isDark ? '#2C2C2C' : '#F0FDF4' }]}>
                            <Ionicons name="location" size={20} color="#10B981" />
                            <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={3}>
                                {formattedAddress}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Section 4: Declarations */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>✅ Declarations</Text>

                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setInfoConfirmed(!infoConfirmed)}
                    >
                        <View style={[styles.checkbox, infoConfirmed && styles.checkboxChecked]}>
                            {infoConfirmed && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                        <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                            I confirm the information provided is correct
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setTermsAccepted(!termsAccepted)}
                    >
                        <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                            {termsAccepted && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                        <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                            I accept the{' '}
                            <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>
                                Terms & Verification Policy
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={[styles.bottomContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                {uploadProgress ? (
                    <View style={styles.progressContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={[styles.progressText, { color: colors.textSecondary }]}>{uploadProgress}</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#111827" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                {existingRequest?.status === 'REJECTED' ? 'Resubmit for Verification' : 'Submit for Verification'}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
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
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },

    // Rejected banner
    rejectedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    rejectedText: {
        flex: 1,
        color: '#DC2626',
        fontSize: 14,
    },

    // Intro Card
    introCard: {
        padding: 24,
        borderRadius: getResponsiveBorderRadius('xl'),
        alignItems: 'center',
        marginBottom: 16,
        elevation: 2,
    },
    introTitle: {
        fontSize: getResponsiveTypography('xl'),
        fontWeight: 'bold',
        marginTop: 12,
    },
    introText: {
        fontSize: getResponsiveTypography('sm'),
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 22,
    },

    // Section
    section: {
        padding: 20,
        borderRadius: getResponsiveBorderRadius('xl'),
        marginBottom: 16,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: getResponsiveTypography('lg'),
        fontWeight: '700',
        marginBottom: 16,
    },
    sectionHint: {
        fontSize: getResponsiveTypography('sm'),
        marginBottom: 16,
        marginTop: -8,
    },

    // Image Picker
    imagePickerContainer: {
        marginBottom: 16,
    },
    imageLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    imagePlaceholder: {
        width: '100%',
        height: 120,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 12,
        marginTop: 4,
    },
    imagePreviewWrapper: {
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: 150,
        borderRadius: 12,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 14,
    },

    // Inputs
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    multilineInput: {
        height: 80,
        paddingTop: 12,
        textAlignVertical: 'top',
    },

    // Location
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    locationButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    locationResult: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 12,
        marginTop: 12,
        gap: 8,
    },
    locationText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },

    // Checkbox
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },

    // Bottom
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    progressText: {
        fontSize: 14,
    },
    submitButton: {
        height: 56,
        borderRadius: 12,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },

    // Status Card
    statusCard: {
        padding: 20,
        borderRadius: getResponsiveBorderRadius('xl'),
        elevation: 2,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusInfo: {
        marginLeft: 16,
        flex: 1,
    },
    statusTitle: {
        fontSize: getResponsiveTypography('lg'),
        fontWeight: '700',
    },
    statusSubtitle: {
        fontSize: getResponsiveTypography('sm'),
        marginTop: 4,
    },
    rejectionNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    rejectionText: {
        flex: 1,
        fontSize: 14,
        color: '#DC2626',
        lineHeight: 20,
    },
    submittedDetails: {
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 16,
        marginTop: 4,
    },
    submittedImages: {
        marginTop: 8,
    },
    submittedImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginTop: 8,
    },
    reapplyButton: {
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    reapplyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
});

export default DealerVerificationScreen;
