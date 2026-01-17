import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    TextInput,
    Alert,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { Video, getVideoMetaData } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import { useTheme } from '../../theme';
import { formatIndianNumber } from '../../utils/formatting';
import { useAuth } from '../../context/AuthContext';
import { Gradient } from '../../components/ui/Gradient';
import {
    scaleSize,
    getResponsiveSpacing,
    getResponsiveTypography,
    getResponsiveBorderRadius,
    wp,
    hp,
} from '../../utils/responsiveEnhanced';
import apiClient from '../../services/ApiClient';
import { carApi } from '../../services/CarApi';
import { useUploadQueue } from '../../context/UploadQueueContext';

// Brand logo imports
const BRAND_LOGOS: Record<string, any> = {
    maruti: require('../../../assets/brand/Suzuki.png'),
    hyundai: require('../../../assets/brand/hyndai.png'),
    tata: require('../../../assets/brand/tata.png'),
    mahindra: require('../../../assets/brand/Mahindra-Logo-2012.png'),
    honda: require('../../../assets/brand/Honda-Logo.png'),
    toyota: require('../../../assets/brand/toyta.png'),
    kia: require('../../../assets/brand/Kia.png'),
    mg: require('../../../assets/brand/MG.png'),
    skoda: require('../../../assets/brand/skoda.jpg'),
    volkswagen: require('../../../assets/brand/VW.png'),
    nissan: require('../../../assets/brand/nissan.png'),
    jeep: require('../../../assets/brand/jeep.png'),
    jaguar: require('../../../assets/brand/jaguar.png'),
    volvo: require('../../../assets/brand/volvo.png'),
    mitsubishi: require('../../../assets/brand/MITSUBISHI.png'),
    chevrolet: require('../../../assets/brand/chevrolet.png'),
    landrover: require('../../../assets/brand/land_rover.png'),
    renault: require('../../../assets/brand/renault.png'),
    // New brands
    bmw: require('../../../assets/brand/bmw.png'),
    audi: require('../../../assets/brand/audi.png'),
    citroen: require('../../../assets/brand/citroen.png'),
    datsun: require('../../../assets/brand/datsun.png'),
    fiat: require('../../../assets/brand/fiat.png'),
    force: require('../../../assets/brand/force.png'),
    ford: require('../../../assets/brand/ford.png'),
    lexus: require('../../../assets/brand/lexus.png'),
    mercedes: require('../../../assets/brand/mercedes.png'),
    mini: require('../../../assets/brand/mini.png'),
    ferrari: require('../../../assets/brand/ferrari.png'),
    tataev: require('../../../assets/brand/tataev.png'),
};

// Car brands with logos
const CAR_BRANDS = [
    { id: 'maruti', name: 'Maruti Suzuki' },
    { id: 'hyundai', name: 'Hyundai' },
    { id: 'tata', name: 'Tata' },
    { id: 'mahindra', name: 'Mahindra' },
    { id: 'honda', name: 'Honda' },
    { id: 'toyota', name: 'Toyota' },
    { id: 'kia', name: 'Kia' },
    { id: 'mg', name: 'MG' },
    { id: 'skoda', name: 'Skoda' },
    { id: 'volkswagen', name: 'Volkswagen' },
    { id: 'nissan', name: 'Nissan' },
    { id: 'jeep', name: 'Jeep' },
    { id: 'jaguar', name: 'Jaguar' },
    { id: 'volvo', name: 'Volvo' },
    { id: 'mitsubishi', name: 'Mitsubishi' },
    { id: 'chevrolet', name: 'Chevrolet' },
    { id: 'landrover', name: 'Land Rover' },
    { id: 'renault', name: 'Renault' },
    { id: 'bmw', name: 'BMW' },
    { id: 'audi', name: 'Audi' },
    { id: 'citroen', name: 'Citroën' },
    { id: 'datsun', name: 'Datsun' },
    { id: 'fiat', name: 'Fiat' },
    { id: 'force', name: 'Force' },
    { id: 'ford', name: 'Ford' },
    { id: 'lexus', name: 'Lexus' },
    { id: 'mercedes', name: 'Mercedes' },
    { id: 'mini', name: 'Mini' },
    { id: 'ferrari', name: 'Ferrari' },
    { id: 'tataev', name: 'Tata EV' },
];

const POPULAR_BRANDS = ['maruti', 'hyundai', 'tata', 'mahindra', 'honda', 'toyota'];
const PREMIUM_BRANDS = ['bmw', 'audi', 'mercedes', 'jaguar', 'landrover', 'volvo'];
const TOTAL_STEPS = 4;
const ADD_CAR_DRAFT_KEY = 'car_submission_draft';

const FUEL_TYPES = [
    { id: 'petrol', name: 'Petrol', icon: 'water-outline' },
    { id: 'diesel', name: 'Diesel', icon: 'flash-outline' },
    { id: 'electric', name: 'Electric', icon: 'battery-charging-outline' },
    { id: 'cng', name: 'CNG', icon: 'leaf-outline' },
    { id: 'hybrid', name: 'Hybrid', icon: 'sync-outline' },
];

const TRANSMISSION_TYPES = [
    { id: 'manual', name: 'Manual', icon: 'cog-outline' },
    { id: 'automatic', name: 'Automatic', icon: 'settings-outline' },
];

const OWNER_OPTIONS = [
    { id: '1', label: '1st Owner', sublabel: 'First hand' },
    { id: '2', label: '2nd Owner', sublabel: 'Second hand' },
    { id: '3', label: '3rd Owner', sublabel: 'Third hand' },
    { id: '4', label: '4+ Owners', sublabel: 'Multiple owners' },
];

const COLORS = [
    { id: 'white', name: 'White', hex: '#FFFFFF' },
    { id: 'black', name: 'Black', hex: '#1A1A1A' },
    { id: 'silver', name: 'Silver', hex: '#C0C0C0' },
    { id: 'grey', name: 'Grey', hex: '#808080' },
    { id: 'red', name: 'Red', hex: '#DC2626' },
    { id: 'blue', name: 'Blue', hex: '#2563EB' },
    { id: 'brown', name: 'Brown', hex: '#92400E' },
    { id: 'green', name: 'Green', hex: '#059669' },
];

interface FormData {
    brand: string;
    model: string;
    variant: string;
    color: string;
    registrationYear: string;
    ownerNumber: string;
    fuelType: string;
    transmission: string;
    mileage: string;
    usage: string;
    accidentHistory: boolean | null;
    repaintedParts: boolean | null;
    engineIssues: boolean | null;
    floodDamage: boolean | null;
    insuranceClaims: boolean | null;
    price: string;
    description: string;
    vin: string;
    videoUrl?: string; // For existing key if needed
}

export interface VideoAsset {
    uri: string;
    fileName?: string;
    type?: string;
    fileSize?: number;
    duration?: number;
}

export interface SelectedImage {
    uri: string;
    fileName?: string;
    type?: string;
    fileSize?: number;
    width?: number;
    height?: number;
}

interface Props {
    navigation: any;
    isDealer?: boolean;
    onCarCreated?: (carId: string, images: SelectedImage[], video: VideoAsset | null) => void;
}

const CarSubmissionForm: React.FC<Props> = ({ navigation, isDealer = false, onCarCreated }) => {
    const { theme, isDark } = useTheme();
    const { colors } = theme;
    const { user } = useAuth();
    const { addToQueue } = useUploadQueue();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<VideoAsset | null>(null);
    const [brandSearch, setBrandSearch] = useState('');
    const [showAllBrands, setShowAllBrands] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        brand: '',
        model: '',
        variant: '',
        color: '',
        registrationYear: '',
        ownerNumber: '',
        fuelType: '',
        transmission: '',
        mileage: '',
        usage: '',
        accidentHistory: null,
        repaintedParts: null,
        engineIssues: null,
        floodDamage: null,
        insuranceClaims: null,
        price: '',
        description: '',
        vin: '',
        videoUrl: '',
    });

    const [errors, setErrors] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const loadDraft = async () => {
            try {
                const stored = await AsyncStorage.getItem(ADD_CAR_DRAFT_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored) as Partial<FormData>;
                    setFormData(prev => ({ ...prev, ...parsed }));
                }
            } catch { }
        };
        loadDraft();
    }, []);

    const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            AsyncStorage.setItem(ADD_CAR_DRAFT_KEY, JSON.stringify(updated)).catch(() => { });
            return updated;
        });
        // Clear error when field is updated
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: false }));
        }
    }, [errors]);

    const [availableModels, setAvailableModels] = useState<string[]>([]);

    useEffect(() => {
        const fetchModels = async () => {
            if (formData.brand && formData.brand !== 'other') {
                const brandObj = CAR_BRANDS.find(b => b.id === formData.brand);
                const make = brandObj ? brandObj.name : formData.brand;
                try {
                    const models = await apiClient.getCarModelSuggestions(make, '');
                    setAvailableModels(models);
                } catch (error) {
                    console.log('Failed to fetch models', error);
                }
            } else {
                setAvailableModels([]);
            }
        };
        fetchModels();
    }, [formData.brand]);

    const handleModelChange = (text: string) => {
        updateField('model', text);

        if (availableModels.length > 0) {
            const filtered = availableModels.filter(m =>
                m.toLowerCase().includes(text.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else if (text.length > 1 && formData.brand) {
            // Fallback to API if availableModels is empty (e.g. 'other' brand or fetch failed)
            const brandObj = CAR_BRANDS.find(b => b.id === formData.brand);
            const make = brandObj ? brandObj.name : formData.brand;
            apiClient.getCarModelSuggestions(make, text)
                .then(results => {
                    setSuggestions(results);
                    setShowSuggestions(true);
                })
                .catch(() => { });
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (model: string) => {
        updateField('model', model);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handlePickImages = async () => {
        try {
            const currentCount = selectedImages.length;
            if (currentCount >= 8) {
                Alert.alert('Limit Reached', 'You can upload a maximum of 8 images.');
                return;
            }

            const result = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 8 - currentCount,
                quality: 1, // Full quality, we'll compress with ImageResizer
            });

            if (result.didCancel || !result.assets) {
                return;
            }

            // Compress each selected image
            const compressedImages: SelectedImage[] = [];
            for (const asset of result.assets) {
                if (!asset.uri) continue;

                try {
                    // Compress using ImageResizer
                    const resized = await ImageResizer.createResizedImage(
                        asset.uri,
                        1920,  // maxWidth
                        1080,  // maxHeight
                        'JPEG',
                        80,    // quality (0-100)
                        0,     // rotation
                        undefined, // outputPath (undefined = cache)
                        false, // keepMeta
                    );

                    compressedImages.push({
                        uri: resized.uri,
                        fileName: resized.name || `image_${Date.now()}.jpg`,
                        type: 'image/jpeg',
                        fileSize: resized.size,
                        width: resized.width,
                        height: resized.height,
                    });
                } catch (resizeError) {
                    console.warn('Image resize failed, using original:', resizeError);
                    // Fallback: use original if resize fails
                    compressedImages.push({
                        uri: asset.uri,
                        fileName: asset.fileName || `image_${Date.now()}.jpg`,
                        type: asset.type || 'image/jpeg',
                        fileSize: asset.fileSize,
                        width: asset.width,
                        height: asset.height,
                    });
                }
            }

            if (currentCount + compressedImages.length > 8) {
                Alert.alert('Limit Exceeded', `You can only add ${8 - currentCount} more images.`);
                const allowed = compressedImages.slice(0, 8 - currentCount);
                setSelectedImages(prev => [...prev, ...allowed]);
            } else {
                setSelectedImages(prev => [...prev, ...compressedImages]);
            }

        } catch (error: any) {
            console.error('handlePickImages error:', error);
            Alert.alert('Error', 'Failed to pick images');
        }
    };

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                // Android 13+ (API 33) uses granular media permissions
                if (Platform.Version >= 33) {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                        {
                            title: 'Video Access Permission',
                            message: 'We need access to your videos to let you select and upload a car video.',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        },
                    );
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                } else {
                    // Android < 13
                    const granted = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    ]);
                    return (
                        granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
                        granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
                    );
                }
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true; // iOS handles permissions via Info.plist automatically when accessing library
    };


    const handlePickVideo = async () => {
        // Request Permission first
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Storage permission is required to select and compress videos.');
            return;
        }

        try {
            const result = await launchImageLibrary({
                mediaType: 'video',
                selectionLimit: 1,
            });

            if (result.didCancel || !result.assets || result.assets.length === 0) {
                return;
            }

            const rawVideo = result.assets[0];
            if (!rawVideo.uri) {
                Alert.alert('Error', 'Could not get video URI');
                return;
            }

            // Validate Duration or get it from react-native-compressor
            let duration = rawVideo.duration ? rawVideo.duration * 1000 : undefined; // react-native-image-picker gives duration in seconds
            if (!duration) {
                try {
                    const info = await getVideoMetaData(rawVideo.uri);
                    const durationVal = info.duration; // duration in seconds
                    if (durationVal) {
                        duration = parseFloat(durationVal.toString()) * 1000;
                    }
                } catch (e) {
                    console.warn("Could not retrieve duration with compressor", e);
                }
            }

            // 4.5 mins = 270 seconds = 270000 ms
            if (duration && duration > 270000) {
                Alert.alert('Video too long', 'Video must be less than 4 minutes 30 seconds.');
                return;
            }

            // Execute Video Compression
            try {
                const timestamp = Date.now();
                const compressedUri = await Video.compress(
                    rawVideo.uri,
                    {
                        compressionMethod: 'manual',
                        // maxWidth is not supported in videoCompresssionType; use default output size
                        bitrate: 2000000, // ~2Mbps, comparable to ultrafast/crf 28
                    }
                );

                if (compressedUri) {
                    const cleanPath = compressedUri.replace('file://', '');
                    const stat = await RNFS.stat(cleanPath);
                    const size = stat.size;

                    // Validate Size (100 MB)
                    if (size > 100 * 1024 * 1024) {
                        Alert.alert('File too large', 'Compressed video is still larger than 100MB.');
                        // Cleanup
                        await RNFS.unlink(cleanPath).catch(() => { });
                        return;
                    }

                    setSelectedVideo({
                        uri: `file://${cleanPath}`,
                        fileName: `video_${timestamp}.mp4`,
                        type: 'video/mp4',
                        fileSize: size,
                        duration: duration ? duration / 1000 : 0
                    });
                } else {
                    Alert.alert('Error', 'Failed to compress video. Please try again.');
                }
            } catch (compressionError) {
                console.error("Compression failed:", compressionError);
                Alert.alert('Error', 'Failed to compress video. Please try again.');
            }

        } catch (error: any) {
            console.error("handlePickVideo error:", error);
            Alert.alert('Error', 'Failed to pick or compress video');
        }
    };

    const handleRemoveVideo = () => {
        setSelectedVideo(null);
    };

    const handleRemoveImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSetBanner = (index: number) => {
        if (index === 0) return;
        const newImages = [...selectedImages];
        const item = newImages.splice(index, 1)[0];
        newImages.unshift(item);
        setSelectedImages(newImages);
    };


    const canProceed = useCallback(() => {
        switch (currentStep) {
            case 1:
                return formData.brand && formData.model;
            case 2:
                return formData.registrationYear && formData.fuelType && formData.transmission;
            case 3:
                return true;
            case 4:
                return formData.price && selectedImages.length > 0;
            default:
                return false;
        }
    }, [currentStep, formData, selectedImages]);

    const validateStep = (step: number) => {
        const newErrors: Record<string, boolean> = {};
        let isValid = true;

        if (step === 1) {
            if (!formData.brand) newErrors.brand = true;
            if (!formData.model) newErrors.model = true;
            if (!formData.variant) newErrors.variant = true;
            if (!formData.color) newErrors.color = true;
        } else if (step === 2) {
            if (!formData.registrationYear) newErrors.registrationYear = true;
            if (!formData.fuelType) newErrors.fuelType = true;
            if (!formData.transmission) newErrors.transmission = true;
        } else if (step === 4) {
            if (!formData.price) newErrors.price = true;
            if (selectedImages.length === 0) newErrors.images = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
            // Optional: Scroll to top or show toast (not crucial if fields are highlighted)
            if (step === 4 && newErrors.images) {
                Alert.alert('Missing Photos', 'Please add at least one photo of your car.');
            }
        }

        return isValid;
    };


    const handleNext = () => {
        if (validateStep(currentStep)) {
            setErrors({});
            if (currentStep < TOTAL_STEPS) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleSubmit = async () => {
        if (!formData.price || selectedImages.length === 0) {
            Alert.alert('Missing Details', 'Please add a price and at least one photo.');
            return;
        }

        setLoading(true);
        try {
            // 1. Prepare Data with Processing status (no images/video yet)
            const brandObj = CAR_BRANDS.find(b => b.id === formData.brand);
            const makeName = brandObj ? brandObj.name : (formData.brand === 'other' ? formData.variant : formData.brand);

            const carData: any = {
                make: makeName,
                model: formData.model,
                year: parseInt(formData.registrationYear) || new Date().getFullYear(),
                price: parseFloat(formData.price.replace(/,/g, '')),
                mileage: parseInt(formData.mileage) || 0,
                fuelType: formData.fuelType,
                transmission: formData.transmission,
                numberOfOwners: parseInt(formData.ownerNumber) || 1,
                description: formData.description,
                color: formData.color,
                vin: formData.vin,
                status: 'Processing', // Set as Processing initially

                // condition fields (flattend for DTO compatibility)
                usage: formData.usage,
                accidentHistory: formData.accidentHistory,
                repaintedParts: formData.repaintedParts,
                engineIssues: formData.engineIssues,
                floodDamage: formData.floodDamage,
                insuranceClaims: formData.insuranceClaims,
                variant: formData.variant,

                // Placeholder - will be updated by background upload
                imageUrl: '',
                images: [],
                videoUrl: null,
            };

            // 2. Create vehicle immediately (with Processing status)
            const createdCar = await carApi.createVehicle(carData);

            // 3. Queue background upload using the upload queue context
            const queued = await addToQueue(createdCar.id, selectedImages, selectedVideo);
            if (!queued) {
                console.warn('Failed to queue upload, but car was created');
            }

            // 4. Clear draft
            await AsyncStorage.removeItem(ADD_CAR_DRAFT_KEY);

            // 5. Navigate immediately - show success
            Alert.alert(
                'Car Added! 🎉',
                'Your car is being processed. You can track the upload progress in your inventory.',
                [{ text: 'View Inventory', onPress: () => navigation.navigate('DealerCarsList') }]
            );
        } catch (error: any) {
            console.error('Submission error:', error);
            Alert.alert('Error', error.message || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER HELPERS ---

    const renderProgressBar = () => (
        <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                    Step {currentStep} of {TOTAL_STEPS}
                </Text>
                <Text style={[styles.progressTitle, { color: colors.text }]}>
                    {currentStep === 1 && 'Identify Your Car'}
                    {currentStep === 2 && 'Ownership Details'}
                    {currentStep === 3 && 'Condition Check'}
                    {currentStep === 4 && 'Pricing & Media'}
                </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: isDark ? colors.surface : '#E5E7EB' }]}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${(currentStep / TOTAL_STEPS) * 100}%`, backgroundColor: colors.primary }
                    ]}
                />
            </View>
        </View>
    );

    const renderBrandGrid = (brands: typeof CAR_BRANDS) => (
        <View style={styles.brandGridContainer}>
            {brands.map(brand => (
                <TouchableOpacity
                    key={brand.id}
                    style={[
                        styles.brandCardNew,
                        { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: errors.brand ? '#EF4444' : colors.border },
                        formData.brand === brand.id && { borderColor: colors.primary, backgroundColor: isDark ? '#1F2937' : '#FEF3C7' }
                    ]}
                    onPress={() => updateField('brand', brand.id)}
                >
                    {BRAND_LOGOS[brand.id] ? (
                        <Image source={BRAND_LOGOS[brand.id]} style={styles.brandLogoNew} resizeMode="contain" />
                    ) : (
                        <Ionicons name="car-sport-outline" size={24} color={colors.textSecondary} />
                    )}
                    <Text style={[styles.brandNameNew, { color: colors.text }]} numberOfLines={1}>
                        {brand.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderStep1 = () => {
        const filteredBrands = CAR_BRANDS.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()));

        // Categorize brands (only if not searching)
        const popularList = !brandSearch ? CAR_BRANDS.filter(b => POPULAR_BRANDS.includes(b.id)) : [];
        const premiumList = !brandSearch ? CAR_BRANDS.filter(b => PREMIUM_BRANDS.includes(b.id)) : [];
        const otherList = !brandSearch ? CAR_BRANDS.filter(b => !POPULAR_BRANDS.includes(b.id) && !PREMIUM_BRANDS.includes(b.id)) : [];

        return (
            <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.stepQuestion, { color: colors.text }]}>
                    What car are you selling?
                </Text>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.surface : '#F3F4F6', borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search Brand (e.g., Tata, BMW)"
                        placeholderTextColor={colors.textSecondary}
                        value={brandSearch}
                        onChangeText={setBrandSearch}
                    />
                    {brandSearch.length > 0 && (
                        <TouchableOpacity onPress={() => setBrandSearch('')}>
                            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {!brandSearch ? (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Popular Brands</Text>
                        {renderBrandGrid(popularList)}

                        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: getResponsiveSpacing('md') }]}>Premium Brands</Text>
                        {renderBrandGrid(premiumList)}

                        {showAllBrands && (
                            <>
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: getResponsiveSpacing('md') }]}>All Brands</Text>
                                {renderBrandGrid(otherList)}
                            </>
                        )}

                        <TouchableOpacity
                            style={[styles.showMoreButton, { borderColor: colors.border }]}
                            onPress={() => setShowAllBrands(!showAllBrands)}
                        >
                            <Text style={[styles.showMoreText, { color: colors.primary }]}>{showAllBrands ? 'Show Less' : 'Show All Brands'}</Text>
                            <Ionicons name={showAllBrands ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Search Results</Text>
                        {renderBrandGrid(filteredBrands)}
                        {filteredBrands.length === 0 && (
                            <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>No brands found matching "{brandSearch}"</Text>
                        )}
                    </>
                )}

                <TouchableOpacity
                    style={[
                        styles.otherBrandButton,
                        { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: errors.brand ? '#EF4444' : colors.border },
                        formData.brand === 'other' && { borderColor: colors.primary, backgroundColor: isDark ? '#1F2937' : '#FEF3C7' }
                    ]}
                    onPress={() => updateField('brand', 'other')}
                >
                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                    <Text style={[styles.otherBrandText, { color: colors.text }]}>Can't find your brand? Add Other</Text>
                </TouchableOpacity>

                {formData.brand && (
                    <View style={[styles.inputSection, { zIndex: 1000 }]}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Model Name *</Text>
                        <View>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: isDark ? colors.surface : '#F3F4F6', color: colors.text, borderColor: errors.model ? '#EF4444' : colors.border }]}
                                value={formData.model}
                                onChangeText={handleModelChange}
                                placeholder="e.g., Swift, i20, Nexon"
                                placeholderTextColor={colors.textSecondary}
                                onFocus={() => {
                                    if (availableModels.length > 0) {
                                        setSuggestions(availableModels);
                                        setShowSuggestions(true);
                                    }
                                }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <View style={[styles.suggestionsDropdown, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border }]}>
                                    {suggestions.map((item, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                                            onPress={() => selectSuggestion(item)}
                                        >
                                            <Text style={[styles.suggestionText, { color: colors.text }]}>{item}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {formData.model && (
                    <View style={styles.inputSection}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Variant *</Text>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: isDark ? colors.surface : '#F3F4F6', color: colors.text, borderColor: errors.variant ? '#EF4444' : colors.border }]}
                            value={formData.variant}
                            onChangeText={(text) => updateField('variant', text)}
                            placeholder="e.g., VXi, Sportz, XM"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>
                )}

                {formData.model && (
                    <View style={styles.inputSection}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Color *</Text>
                        <View style={styles.colorGrid}>
                            {COLORS.map(color => (
                                <TouchableOpacity
                                    key={color.id}
                                    style={[
                                        styles.colorChip,
                                        { backgroundColor: color.hex, borderColor: formData.color === color.id ? colors.primary : (errors.color ? '#EF4444' : colors.border) }
                                    ]}
                                    onPress={() => updateField('color', color.id)}
                                >
                                    {formData.color === color.id && (
                                        <Ionicons name="checkmark" size={16} color={color.id === 'white' || color.id === 'silver' ? '#111827' : '#FFFFFF'} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
                <View style={{ height: hp(15) }} />
            </ScrollView>
        );
    };

    const renderStep2 = () => (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.stepQuestion, { color: colors.text }]}>
                Tell us about the car's history
            </Text>

            <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Registration Year *</Text>
                <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? colors.surface : '#F3F4F6', color: colors.text, borderColor: errors.registrationYear ? '#EF4444' : colors.border }]}
                    value={formData.registrationYear}
                    onChangeText={(text) => updateField('registrationYear', text)}
                    placeholder="e.g., 2020"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={4}
                />
            </View>

            <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Number of Owners</Text>
                <View style={styles.ownerGrid}>
                    {OWNER_OPTIONS.map(option => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.ownerCard,
                                { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border },
                                formData.ownerNumber === option.id && { borderColor: colors.primary, backgroundColor: isDark ? '#1F2937' : '#FEF3C7' }
                            ]}
                            onPress={() => updateField('ownerNumber', option.id)}
                        >
                            <Text style={[styles.ownerLabel, { color: colors.text }]}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Fuel Type *</Text>
                <View style={styles.optionRow}>
                    {FUEL_TYPES.map(fuel => (
                        <TouchableOpacity
                            key={fuel.id}
                            style={[
                                styles.optionPill,
                                { backgroundColor: isDark ? colors.surface : '#F3F4F6', borderColor: errors.fuelType ? '#EF4444' : colors.border },
                                formData.fuelType === fuel.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                            ]}
                            onPress={() => updateField('fuelType', fuel.id)}
                        >
                            <Ionicons name={fuel.icon as any} size={18} color={formData.fuelType === fuel.id ? '#111827' : colors.text} />
                            <Text style={[styles.optionPillText, { color: formData.fuelType === fuel.id ? '#111827' : colors.text }]}>{fuel.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Transmission *</Text>
                <View style={styles.transmissionRow}>
                    {TRANSMISSION_TYPES.map(trans => (
                        <TouchableOpacity
                            key={trans.id}
                            style={[
                                styles.transmissionCard,
                                { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: errors.transmission ? '#EF4444' : colors.border },
                                formData.transmission === trans.id && { borderColor: colors.primary, backgroundColor: isDark ? '#1F2937' : '#FEF3C7' }
                            ]}
                            onPress={() => updateField('transmission', trans.id)}
                        >
                            <Text style={[styles.transmissionName, { color: colors.text }]}>{trans.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Kilometers Driven</Text>
                <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? colors.surface : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
                    value={formData.mileage}
                    onChangeText={(text) => updateField('mileage', text)}
                    placeholder="e.g., 45000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                />
            </View>

            <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>VIN (Optional)</Text>
                <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? colors.surface : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
                    value={formData.vin}
                    onChangeText={(text) => updateField('vin', text)}
                    placeholder="17 chars"
                    placeholderTextColor={colors.textSecondary}
                    maxLength={17}
                />
            </View>
            <View style={{ height: hp(15) }} />
        </ScrollView>
    );

    const renderStep3 = () => {
        const questions = [
            { key: 'accidentHistory', question: 'Has the car been in an accident?', icon: 'warning-outline' },
            { key: 'repaintedParts', question: 'Any parts repainted or replaced?', icon: 'color-palette-outline' },
            { key: 'engineIssues', question: 'Engine or transmission issues?', icon: 'construct-outline' },
            { key: 'floodDamage', question: 'Any flood damage history?', icon: 'water-outline' },
            { key: 'insuranceClaims', question: 'Insurance claims made?', icon: 'document-text-outline' },
        ];

        return (
            <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.stepQuestion, { color: colors.text }]}>
                    Let's verify the condition
                </Text>
                <Text style={[styles.stepHint, { color: colors.textSecondary }]}>
                    Honest answers build buyer trust
                </Text>

                {questions.map((q) => (
                    <View key={q.key} style={[styles.conditionCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border }]}>
                        <View style={styles.conditionHeader}>
                            <View style={[styles.conditionIconWrap, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                <Ionicons name={q.icon as any} size={20} color={colors.text} />
                            </View>
                            <Text style={[styles.conditionQuestion, { color: colors.text }]}>{q.question}</Text>
                        </View>
                        <View style={styles.conditionButtons}>
                            {['Yes', 'No', 'Not Sure'].map(answer => {
                                const value = answer === 'Yes' ? true : answer === 'No' ? false : null;
                                const isSelected = formData[q.key as keyof FormData] === value;

                                // Color Logic
                                let bgColor, borderColor, textColor;

                                if (isDark) {
                                    // DARK MODE: Transparent backgrounds, Neon borders
                                    if (answer === 'Yes') {
                                        bgColor = isSelected ? 'rgba(239, 68, 68, 0.15)' : '#374151';
                                        borderColor = isSelected ? '#EF4444' : 'transparent';
                                        textColor = isSelected ? '#FCA5A5' : colors.text;
                                    } else if (answer === 'No') {
                                        bgColor = isSelected ? 'rgba(16, 185, 129, 0.15)' : '#374151';
                                        borderColor = isSelected ? '#10B981' : 'transparent';
                                        textColor = isSelected ? '#6EE7B7' : colors.text;
                                    } else {
                                        bgColor = isSelected ? 'rgba(245, 158, 11, 0.15)' : '#374151';
                                        borderColor = isSelected ? '#F59E0B' : 'transparent';
                                        textColor = isSelected ? '#FCD34D' : colors.text;
                                    }
                                } else {
                                    // LIGHT MODE: Pastel backgrounds, Dark text
                                    if (answer === 'Yes') {
                                        bgColor = isSelected ? '#FEE2E2' : '#F3F4F6';
                                        borderColor = isSelected ? '#EF4444' : 'transparent';
                                        textColor = isSelected ? '#991B1B' : colors.text;
                                    } else if (answer === 'No') {
                                        bgColor = isSelected ? '#D1FAE5' : '#F3F4F6';
                                        borderColor = isSelected ? '#10B981' : 'transparent';
                                        textColor = isSelected ? '#065F46' : colors.text;
                                    } else {
                                        bgColor = isSelected ? '#FEF3C7' : '#F3F4F6';
                                        borderColor = isSelected ? '#F59E0B' : 'transparent';
                                        textColor = isSelected ? '#92400E' : colors.text;
                                    }
                                }

                                return (
                                    <TouchableOpacity
                                        key={answer}
                                        style={[
                                            styles.conditionButton,
                                            {
                                                backgroundColor: bgColor,
                                                borderColor: borderColor,
                                                borderWidth: isSelected ? 1 : 0,
                                            }
                                        ]}
                                        onPress={() => updateField(q.key as keyof FormData, value as any)}
                                    >
                                        <Text style={[
                                            styles.conditionButtonText,
                                            { color: textColor },
                                            isSelected && { fontWeight: '700' }
                                        ]}>{answer}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
                <View style={{ height: hp(15) }} />
            </ScrollView>
        );
    };

    const renderStep4 = () => {
        return (
            <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.stepQuestion, { color: colors.text }]}>
                    Set your price and add media
                </Text>

                <View style={styles.inputSection}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Expected Price *</Text>
                    <View style={[styles.priceInput, { backgroundColor: isDark ? colors.surface : '#F3F4F6', borderColor: errors.price ? '#EF4444' : colors.border }]}>
                        <Text style={[styles.currencySymbol, { color: colors.text }]}>₹</Text>
                        <TextInput
                            style={[styles.priceTextInput, { color: colors.text }]}
                            value={formData.price}
                            onChangeText={(text) => updateField('price', formatIndianNumber(text))}
                            placeholder="e.g., 5,00,000"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="number-pad"
                        />
                    </View>
                </View>

                <View style={styles.inputSection}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Car Photos *</Text>
                    <View style={styles.photoGrid}>
                        <TouchableOpacity onPress={handlePickImages} style={[styles.photoBox, { backgroundColor: isDark ? colors.surface : '#F3F4F6', borderColor: errors.images ? '#EF4444' : colors.border }]}>
                            <Ionicons name="camera" size={32} color={colors.primary} />
                            <Text style={[styles.photoLabel, { color: colors.textSecondary }]}>Add Photos</Text>
                        </TouchableOpacity>

                        {selectedImages.map((img, index) => (
                            <TouchableOpacity key={index} onPress={() => handleSetBanner(index)} style={[styles.imageWrapper, index === 0 && { borderColor: colors.primary, borderWidth: 3 }]}>
                                <Image source={{ uri: img.uri }} style={styles.imageThumbnail} />
                                {index === 0 && (
                                    <View style={[styles.bannerBadge, { backgroundColor: colors.primary }]}>
                                        <Text style={styles.bannerText}>Banner</Text>
                                    </View>
                                )}
                                <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveImage(index)}>
                                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}

                    </View>

                    {/* Video Upload Section */}
                    <View style={styles.inputSection}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Car Video (Optional)</Text>
                        <View style={styles.photoGrid}>
                            {!selectedVideo ? (
                                <TouchableOpacity
                                    onPress={handlePickVideo}
                                    style={[styles.photoBox, { backgroundColor: isDark ? colors.surface : '#F3F4F6', borderColor: colors.border }]}
                                >
                                    <Ionicons name="videocam" size={32} color={colors.primary} />
                                    <Text style={[styles.photoLabel, { color: colors.textSecondary }]}>Add Video</Text>
                                    <Text style={[styles.photoLabel, { fontSize: 10, marginTop: 2 }]}>Max 100MB</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={[styles.imageWrapper, { borderColor: colors.primary, borderWidth: 1 }]}>
                                    <View style={[styles.imageThumbnail, { backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }]}>
                                        <Ionicons name="play-circle" size={40} color="#FFF" />
                                    </View>
                                    <View style={[styles.bannerBadge, { backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'column' }]}>
                                        <Text style={[styles.bannerText, { color: '#FFF' }]} numberOfLines={1}>{selectedVideo.fileName || 'Video'}</Text>
                                        {selectedVideo.fileSize && (
                                            <Text style={{ fontSize: 9, color: '#DDD' }}>
                                                {(selectedVideo.fileSize / (1024 * 1024)).toFixed(1)} MB
                                            </Text>
                                        )}
                                    </View>
                                    <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveVideo}>
                                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: isDark ? colors.surface : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
                            value={formData.description}
                            onChangeText={(text) => updateField('description', text)}
                            placeholder={'Add any additional details about your car...'}
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                    <View style={{ height: hp(15) }} />
                </View>
            </ScrollView >
        );
    };

    return (
        <View style={styles.container}>
            {renderProgressBar()}
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
            </KeyboardAvoidingView>

            <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                {currentStep < TOTAL_STEPS ? (
                    <TouchableOpacity
                        style={[styles.continueButton, { backgroundColor: colors.primary }]}
                        onPress={handleNext}
                    >
                        <Text style={[styles.continueText, { color: '#111827' }]}>Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color="#111827" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: colors.primary }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator size="small" color="#111827" /> : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#111827" />
                                <Text style={styles.submitText}>Submit for Review</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    progressContainer: { paddingHorizontal: getResponsiveSpacing('lg'), paddingVertical: getResponsiveSpacing('md') },
    progressHeader: { marginBottom: getResponsiveSpacing('sm') },
    progressText: { fontSize: getResponsiveTypography('xs'), fontWeight: '500' },
    progressTitle: { fontSize: getResponsiveTypography('lg'), fontWeight: '700', marginTop: scaleSize(2) },
    progressTrack: { height: scaleSize(4), borderRadius: scaleSize(2), overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: scaleSize(2) },
    stepContent: { flex: 1, paddingHorizontal: getResponsiveSpacing('lg') },
    stepQuestion: { fontSize: getResponsiveTypography('xl'), fontWeight: '700', marginTop: getResponsiveSpacing('md') },
    stepHint: { fontSize: getResponsiveTypography('sm'), marginTop: scaleSize(4), marginBottom: getResponsiveSpacing('lg') },

    // Brand Selection Styles
    searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: getResponsiveBorderRadius('full'), paddingHorizontal: getResponsiveSpacing('md'), paddingVertical: getResponsiveSpacing('sm'), marginBottom: getResponsiveSpacing('lg') },
    searchInput: { flex: 1, marginLeft: getResponsiveSpacing('sm'), fontSize: getResponsiveTypography('md'), paddingVertical: 0 },
    sectionTitle: { fontSize: getResponsiveTypography('sm'), fontWeight: '600', marginBottom: getResponsiveSpacing('sm'), textTransform: 'uppercase', letterSpacing: 0.5 },
    brandGridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: getResponsiveSpacing('sm') },
    brandCardNew: { width: (wp(100) - getResponsiveSpacing('lg') * 2 - getResponsiveSpacing('sm') * 3) / 4, aspectRatio: 1, borderRadius: getResponsiveBorderRadius('lg'), borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: scaleSize(4) },
    brandLogoNew: { width: scaleSize(40), height: scaleSize(40), marginBottom: scaleSize(4) },
    brandNameNew: { fontSize: getResponsiveTypography('xs'), fontWeight: '500', textAlign: 'center' },
    showMoreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: getResponsiveSpacing('sm'), marginTop: getResponsiveSpacing('md'), borderWidth: 1, borderRadius: getResponsiveBorderRadius('full'), borderStyle: 'dashed', gap: scaleSize(4) },
    showMoreText: { fontSize: getResponsiveTypography('sm'), fontWeight: '600' },
    otherBrandButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: getResponsiveSpacing('md'), marginTop: getResponsiveSpacing('xl'), borderWidth: 1, borderRadius: getResponsiveBorderRadius('lg'), gap: scaleSize(8) },
    otherBrandText: { fontSize: getResponsiveTypography('md'), fontWeight: '500' },

    // Keeping other styles
    brandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: getResponsiveSpacing('sm') }, // Legacy (can likely remove if unused in updated code)
    brandCard: { width: (wp(100) - getResponsiveSpacing('lg') * 2 - getResponsiveSpacing('sm') * 4) / 5, aspectRatio: 1, borderRadius: getResponsiveBorderRadius('lg'), borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: scaleSize(4) },
    brandLogo: { width: scaleSize(36), height: scaleSize(36), marginBottom: scaleSize(4) },
    brandName: { fontSize: getResponsiveTypography('xs'), fontWeight: '500', textAlign: 'center' },
    checkBadge: { position: 'absolute', top: scaleSize(4), right: scaleSize(4), width: scaleSize(16), height: scaleSize(16), borderRadius: scaleSize(8), alignItems: 'center', justifyContent: 'center' },
    otherBrandIcon: { width: scaleSize(36), height: scaleSize(36), borderRadius: scaleSize(18), alignItems: 'center', justifyContent: 'center', marginBottom: scaleSize(4) },

    inputSection: { marginTop: getResponsiveSpacing('lg') },
    inputLabel: { fontSize: getResponsiveTypography('sm'), fontWeight: '600', marginBottom: scaleSize(8) },
    textInput: { borderWidth: 1, borderRadius: getResponsiveBorderRadius('lg'), paddingHorizontal: getResponsiveSpacing('md'), paddingVertical: getResponsiveSpacing('sm'), fontSize: getResponsiveTypography('md') },
    suggestionsDropdown: { position: 'absolute', top: '100%', left: 0, right: 0, borderWidth: 1, borderRadius: getResponsiveBorderRadius('lg'), maxHeight: scaleSize(200), zIndex: 1000, marginTop: scaleSize(4) },
    suggestionItem: { padding: getResponsiveSpacing('md'), borderBottomWidth: 1 },
    suggestionText: { fontSize: getResponsiveTypography('md') },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: getResponsiveSpacing('sm') },
    colorChip: { width: scaleSize(40), height: scaleSize(40), borderRadius: getResponsiveBorderRadius('full'), borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    ownerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: getResponsiveSpacing('sm') },
    ownerCard: { flex: 1, padding: getResponsiveSpacing('md'), borderRadius: getResponsiveBorderRadius('lg'), borderWidth: 1 },
    ownerLabel: { fontSize: getResponsiveTypography('sm'), fontWeight: '600' },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: getResponsiveSpacing('sm') },
    optionPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: getResponsiveSpacing('md'), paddingVertical: getResponsiveSpacing('sm'), borderRadius: getResponsiveBorderRadius('full'), borderWidth: 1, gap: scaleSize(6) },
    optionPillText: { fontSize: getResponsiveTypography('sm'), fontWeight: '500' },
    transmissionRow: { flexDirection: 'row', gap: getResponsiveSpacing('md') },
    transmissionCard: { flex: 1, padding: getResponsiveSpacing('md'), borderRadius: getResponsiveBorderRadius('xl'), borderWidth: 1, alignItems: 'center' },
    transmissionName: { fontSize: getResponsiveTypography('sm'), fontWeight: '600' },
    conditionCard: { padding: getResponsiveSpacing('md'), borderRadius: getResponsiveBorderRadius('xl'), borderWidth: 1, marginBottom: getResponsiveSpacing('sm') },
    conditionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: getResponsiveSpacing('sm') },
    conditionIconWrap: { width: scaleSize(36), height: scaleSize(36), borderRadius: getResponsiveBorderRadius('md'), alignItems: 'center', justifyContent: 'center', marginRight: getResponsiveSpacing('sm') },
    conditionQuestion: { flex: 1, fontSize: getResponsiveTypography('sm'), fontWeight: '500' },
    conditionButtons: { flexDirection: 'row', gap: getResponsiveSpacing('sm') },
    conditionButton: { flex: 1, paddingVertical: getResponsiveSpacing('sm'), borderRadius: getResponsiveBorderRadius('md'), alignItems: 'center' },
    conditionButtonText: { fontSize: getResponsiveTypography('sm') },
    priceInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: getResponsiveBorderRadius('lg'), paddingHorizontal: getResponsiveSpacing('md') },
    currencySymbol: { fontSize: getResponsiveTypography('xl'), fontWeight: '700', marginRight: scaleSize(8) },
    priceTextInput: { flex: 1, fontSize: getResponsiveTypography('xl'), fontWeight: '600', paddingVertical: getResponsiveSpacing('md') },
    photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: getResponsiveSpacing('sm') },
    photoBox: { width: (wp(100) - getResponsiveSpacing('lg') * 2 - getResponsiveSpacing('sm') * 2) / 3, aspectRatio: 1, borderRadius: getResponsiveBorderRadius('lg'), borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
    photoLabel: { fontSize: getResponsiveTypography('xs'), marginTop: scaleSize(4), textAlign: 'center' },
    imageWrapper: { width: (wp(100) - getResponsiveSpacing('lg') * 2 - getResponsiveSpacing('sm') * 2) / 3, aspectRatio: 1, borderRadius: getResponsiveBorderRadius('lg'), overflow: 'hidden' },
    imageThumbnail: { width: '100%', height: '100%' },
    bannerBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 2, alignItems: 'center' },
    bannerText: { fontSize: 10, fontWeight: 'bold', color: '#111827' },
    removeImageButton: { position: 'absolute', top: 2, right: 2, backgroundColor: 'white', borderRadius: 10 },
    textArea: { borderWidth: 1, borderRadius: getResponsiveBorderRadius('lg'), paddingHorizontal: getResponsiveSpacing('md'), paddingVertical: getResponsiveSpacing('sm'), fontSize: getResponsiveTypography('md'), minHeight: scaleSize(100) },
    bottomBar: { paddingHorizontal: getResponsiveSpacing('lg'), paddingVertical: getResponsiveSpacing('md'), borderTopWidth: 1 },
    continueButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: getResponsiveSpacing('md'), borderRadius: getResponsiveBorderRadius('lg'), gap: scaleSize(8) },
    continueText: { fontSize: getResponsiveTypography('md'), fontWeight: '600' },
    submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: getResponsiveSpacing('md'), borderRadius: getResponsiveBorderRadius('lg'), gap: scaleSize(8) },
    submitText: { fontSize: getResponsiveTypography('md'), fontWeight: '600', color: '#111827' },
});

// Force update
export default CarSubmissionForm;
