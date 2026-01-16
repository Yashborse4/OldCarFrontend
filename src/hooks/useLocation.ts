import { useState, useCallback } from 'react';
import {
    Platform,
    PermissionsAndroid,
    Alert,
    Linking,
} from 'react-native';
import Geolocation, { GeolocationError } from '@react-native-community/geolocation';

export interface LocationState {
    latitude: number | null;
    longitude: number | null;
    formattedAddress: string;
    isLoading: boolean;
    error: LocationError | null;
}

export type LocationError =
    | 'PERMISSION_DENIED'
    | 'LOCATION_UNAVAILABLE'
    | 'TIMEOUT'
    | 'LOCATION_DISABLED'
    | 'UNKNOWN';

interface UseLocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
}

const DEFAULT_OPTIONS: UseLocationOptions = {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 10000,
};

/**
 * Custom hook for handling location with proper permission management
 * Supports both Android and iOS with fallback handling
 */
export const useLocation = (options: UseLocationOptions = {}) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    const [state, setState] = useState<LocationState>({
        latitude: null,
        longitude: null,
        formattedAddress: '',
        isLoading: false,
        error: null,
    });

    /**
     * Request location permission for Android
     */
    const requestAndroidPermission = async (): Promise<boolean> => {
        try {
            // First check if we already have permission
            const hasPermission = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );

            if (hasPermission) {
                return true;
            }

            // Request permission
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission Required',
                    message: 'This app needs access to your location to verify your showroom address.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'Allow',
                }
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            }

            if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                // User has permanently denied, guide them to settings
                showSettingsAlert();
                return false;
            }

            return false;
        } catch (err) {
            console.warn('Android permission error:', err);
            return false;
        }
    };

    /**
     * Request location permission for iOS
     * Note: iOS handles permission request automatically when getCurrentPosition is called
     * But we can configure Geolocation to request it properly
     */
    const requestIOSPermission = async (): Promise<boolean> => {
        // Configure geolocation for iOS
        Geolocation.setRNConfiguration({
            skipPermissionRequests: false,
            authorizationLevel: 'whenInUse',
            locationProvider: 'auto',
        });

        return true; // iOS will prompt automatically
    };

    /**
     * Show alert to open settings when permission is permanently denied
     */
    const showSettingsAlert = () => {
        Alert.alert(
            'Location Permission Required',
            'Location permission has been denied. Please enable it in your device settings to use this feature.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Settings',
                    onPress: () => {
                        if (Platform.OS === 'ios') {
                            Linking.openURL('app-settings:');
                        } else {
                            Linking.openSettings();
                        }
                    }
                },
            ]
        );
    };

    /**
     * Show alert when location services are disabled
     */
    const showLocationDisabledAlert = () => {
        Alert.alert(
            'Location Services Disabled',
            'Please enable location services on your device to detect your location.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Settings',
                    onPress: () => {
                        if (Platform.OS === 'ios') {
                            Linking.openURL('App-Prefs:Privacy&path=LOCATION');
                        } else {
                            Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS').catch(() => {
                                Linking.openSettings();
                            });
                        }
                    }
                },
            ]
        );
    };

    /**
     * Reverse geocode coordinates to address
     */
    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                {
                    headers: {
                        'User-Agent': 'CarSellingApp/1.0',
                    },
                }
            );
            const data = await response.json();
            return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    };

    /**
     * Get current position with fallback to low accuracy
     */
    const getPositionWithFallback = (highAccuracy: boolean): Promise<{ latitude: number; longitude: number }> => {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error: GeolocationError) => {
                    // If high accuracy failed, try low accuracy as fallback
                    if (highAccuracy && (error.code === 2 || error.code === 3)) {
                        console.log('High accuracy failed, trying low accuracy...');
                        Geolocation.getCurrentPosition(
                            (position) => {
                                resolve({
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude,
                                });
                            },
                            (fallbackError) => {
                                reject(fallbackError);
                            },
                            {
                                enableHighAccuracy: false,
                                timeout: 30000,
                                maximumAge: 60000,
                            }
                        );
                    } else {
                        reject(error);
                    }
                },
                {
                    enableHighAccuracy: highAccuracy,
                    timeout: mergedOptions.timeout,
                    maximumAge: mergedOptions.maximumAge,
                }
            );
        });
    };

    /**
     * Map geolocation error code to LocationError type
     */
    const mapGeolocationError = (error: GeolocationError): LocationError => {
        switch (error.code) {
            case 1: // PERMISSION_DENIED
                return 'PERMISSION_DENIED';
            case 2: // POSITION_UNAVAILABLE
                if (error.message?.toLowerCase().includes('no location provider')) {
                    return 'LOCATION_DISABLED';
                }
                return 'LOCATION_UNAVAILABLE';
            case 3: // TIMEOUT
                return 'TIMEOUT';
            default:
                return 'UNKNOWN';
        }
    };

    /**
     * Get user-friendly error message
     */
    const getErrorMessage = (errorType: LocationError): string => {
        switch (errorType) {
            case 'PERMISSION_DENIED':
                return 'Location permission was denied. Please allow location access to continue.';
            case 'LOCATION_DISABLED':
                return 'Location services are turned off. Please enable GPS/Location on your device.';
            case 'LOCATION_UNAVAILABLE':
                return 'Unable to determine your location. Please check your GPS signal and try again.';
            case 'TIMEOUT':
                return 'Location request timed out. Please ensure you have a clear view of the sky and try again.';
            default:
                return 'An unexpected error occurred while getting your location.';
        }
    };

    /**
     * Main function to get current location
     */
    const getCurrentLocation = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Request permission based on platform
            const hasPermission = Platform.OS === 'android'
                ? await requestAndroidPermission()
                : await requestIOSPermission();

            if (!hasPermission) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'PERMISSION_DENIED'
                }));
                return null;
            }

            // Get position with fallback
            const position = await getPositionWithFallback(mergedOptions.enableHighAccuracy!);

            // Reverse geocode
            const address = await reverseGeocode(position.latitude, position.longitude);

            setState({
                latitude: position.latitude,
                longitude: position.longitude,
                formattedAddress: address,
                isLoading: false,
                error: null,
            });

            return position;
        } catch (error: any) {
            console.error('Location error:', error);

            const errorType = mapGeolocationError(error);

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorType
            }));

            // Show appropriate alert based on error type
            if (errorType === 'LOCATION_DISABLED') {
                showLocationDisabledAlert();
            } else if (errorType === 'PERMISSION_DENIED') {
                showSettingsAlert();
            } else {
                Alert.alert('Location Error', getErrorMessage(errorType));
            }

            return null;
        }
    }, [mergedOptions.enableHighAccuracy, mergedOptions.timeout, mergedOptions.maximumAge]);

    /**
     * Clear location state
     */
    const clearLocation = useCallback(() => {
        setState({
            latitude: null,
            longitude: null,
            formattedAddress: '',
            isLoading: false,
            error: null,
        });
    }, []);

    return {
        ...state,
        getCurrentLocation,
        clearLocation,
        getErrorMessage,
    };
};

export default useLocation;
