// Re-export from the authService for backward compatibility

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './ApiClient';

// Types for authentication
export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    profileImage?: string;
    role: 'user' | 'dealer' | 'admin';
    emailVerified: boolean;
    phoneVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    tokenType: 'Bearer';
    expiresIn: number; // seconds
    refreshExpiresIn: number; // seconds
}

export interface AuthResponse {
    user: User;
    tokens: AuthTokens;
}

export interface LoginCredentials {
    usernameOrEmail: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
}

// Storage keys (with proper naming convention)
const STORAGE_KEYS = {
    ACCESS_TOKEN: '@carworld_access_token',
    REFRESH_TOKEN: '@carworld_refresh_token',
    USER_DATA: '@carworld_user_data',
    TOKEN_EXPIRY: '@carworld_token_expiry',
    REFRESH_EXPIRY: '@carworld_refresh_expiry',
    BIOMETRIC_ENABLED: '@carworld_biometric_enabled',
    AUTO_LOGIN: '@carworld_auto_login',
};

class AuthService {
    private isRefreshing = false;
    private refreshPromise: Promise<AuthTokens> | null = null;
    private refreshTokenTimeoutId: number | null = null;

    /**
     * Login user with credentials
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<AuthResponse>('/auth/login', {
                usernameOrEmail: credentials.usernameOrEmail.trim().toLowerCase(),
                password: credentials.password,
                deviceInfo: await this.getDeviceInfo(),
            });

            await this.storeAuthData(response.data);
            this.scheduleTokenRefresh(response.data.tokens.expiresIn);

            return response.data;
        } catch (error: any) {
            this.handleAuthError(error);
            throw error;
        }
    }

    /**
     * Register new user
     */
    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        try {
            // Client-side validation
            this.validateRegistrationCredentials(credentials);

            const response = await apiClient.post<AuthResponse>('/auth/register', {
                ...credentials,
                email: credentials.email.trim().toLowerCase(),
                deviceInfo: await this.getDeviceInfo(),
            });

            await this.storeAuthData(response.data);
            this.scheduleTokenRefresh(response.data.tokens.expiresIn);

            return response.data;
        } catch (error: any) {
            this.handleAuthError(error);
            throw error;
        }
    }

    /**
     * Logout user and clear all data
     */
    async logout(): Promise<void> {
        try {
            const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

            if (refreshToken) {
                // Notify server about logout to invalidate tokens
                await apiClient.post('/auth/logout', { refreshToken }).catch(() => {
                    // Ignore logout API errors as we're clearing local data anyway
                });
            }
        } catch (error) {
            console.warn('Logout API call failed:', error);
        } finally {
            await this.clearAuthData();
        }
    }

    /**
     * Forgot password request
     */
    async forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
        try {
            const response = await apiClient.post<{ message: string }>('/auth/forgot-password', {
                email: request.email.trim().toLowerCase(),
            });

            return response.data;
        } catch (error: any) {
            this.handleAuthError(error);
            throw error;
        }
    }

    /**
     * Reset password with token
     */
    async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
        try {
            if (request.password !== request.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
                token: request.token,
                password: request.password,
            });

            return response.data;
        } catch (error: any) {
            this.handleAuthError(error);
            throw error;
        }
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(): Promise<AuthTokens> {
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;
        this.refreshPromise = this.performTokenRefresh();

        try {
            const tokens = await this.refreshPromise;
            this.scheduleTokenRefresh(tokens.expiresIn);
            return tokens;
        } catch (error) {
            await this.clearAuthData();
            throw error;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    /**
     * Get current user data
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    }

    /**
     * Get access token
     */
    async getAccessToken(): Promise<string | null> {
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            const expiry = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

            if (!token || !expiry) return null;

            const now = Date.now();
            const expiryTime = parseInt(expiry, 10);

            // If token expires in less than 2 minutes, refresh it
            if (expiryTime - now < 2 * 60 * 1000) {
                try {
                    const newTokens = await this.refreshAccessToken();
                    return newTokens.accessToken;
                } catch (error) {
                    return null;
                }
            }

            return token;
        } catch (error) {
            console.error('Failed to get access token:', error);
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await this.getAccessToken();
            const user = await this.getCurrentUser();
            return !!(token && user);
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if user is authorized (alias for isAuthenticated)
     */
    async isUserAuthorized(): Promise<boolean> {
        return this.isAuthenticated();
    }

    /**
     * Verify email
     */
    async verifyEmail(token: string): Promise<{ message: string }> {
        try {
            const response = await apiClient.post<{ message: string }>('/auth/verify-email', {
                token,
            });

            // Update user data to reflect email verification
            const currentUser = await this.getCurrentUser();
            if (currentUser) {
                currentUser.emailVerified = true;
                await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(currentUser));
            }

            return response.data;
        } catch (error: any) {
            this.handleAuthError(error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(updates: Partial<User>): Promise<User> {
        try {
            const response = await apiClient.patch<{ user: User }>('/auth/profile', updates);

            // Update stored user data
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));

            return response.data.user;
        } catch (error: any) {
            this.handleAuthError(error);
            throw error;
        }
    }

    /**
     * Change password
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
        try {
            const response = await apiClient.post<{ message: string }>('/auth/change-password', {
                currentPassword,
                newPassword,
            });

            return response.data;
        } catch (error: any) {
            this.handleAuthError(error);
            throw error;
        }
    }

    /**
     * Enable/disable biometric authentication
     */
    async setBiometricEnabled(enabled: boolean): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, JSON.stringify(enabled));
    }

    /**
     * Check if biometric is enabled
     */
    async isBiometricEnabled(): Promise<boolean> {
        try {
            const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
            return enabled ? JSON.parse(enabled) : false;
        } catch (error) {
            return false;
        }
    }

    // Private methods
    private async performTokenRefresh(): Promise<AuthTokens> {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const refreshExpiry = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_EXPIRY);

        if (!refreshToken || !refreshExpiry) {
            throw new Error('No refresh token available');
        }

        if (Date.now() >= parseInt(refreshExpiry, 10)) {
            throw new Error('Refresh token expired');
        }

        const response = await apiClient.post<{ tokens: AuthTokens }>('/auth/refresh', {
            refreshToken,
            deviceInfo: await this.getDeviceInfo(),
        });

        const tokens = response.data.tokens;
        await this.storeTokens(tokens);

        return tokens;
    }

    private async storeAuthData(authData: AuthResponse): Promise<void> {
        try {
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authData.user)),
                this.storeTokens(authData.tokens),
            ]);
        } catch (error) {
            console.error('Failed to store auth data:', error);
            throw new Error('Failed to store authentication data');
        }
    }

    private async storeTokens(tokens: AuthTokens): Promise<void> {
        const now = Date.now();
        const accessTokenExpiry = now + (tokens.expiresIn * 1000);
        const refreshTokenExpiry = now + (tokens.refreshExpiresIn * 1000);

        await Promise.all([
            AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
            AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
            AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, accessTokenExpiry.toString()),
            AsyncStorage.setItem(STORAGE_KEYS.REFRESH_EXPIRY, refreshTokenExpiry.toString()),
        ]);
    }

    private async clearAuthData(): Promise<void> {
        try {
            if (this.refreshTokenTimeoutId) {
                clearTimeout(this.refreshTokenTimeoutId);
                this.refreshTokenTimeoutId = null;
            }

            await AsyncStorage.multiRemove([
                STORAGE_KEYS.ACCESS_TOKEN,
                STORAGE_KEYS.REFRESH_TOKEN,
                STORAGE_KEYS.USER_DATA,
                STORAGE_KEYS.TOKEN_EXPIRY,
                STORAGE_KEYS.REFRESH_EXPIRY,
            ]);
        } catch (error) {
            console.error('Failed to clear auth data:', error);
        }
    }

    private scheduleTokenRefresh(expiresInSeconds: number): void {
        if (this.refreshTokenTimeoutId) {
            clearTimeout(this.refreshTokenTimeoutId);
        }

        // Schedule refresh 2 minutes before token expires
        const refreshTime = Math.max((expiresInSeconds - 120) * 1000, 60000); // At least 1 minute

        this.refreshTokenTimeoutId = setTimeout(() => {
            this.refreshAccessToken().catch((error) => {
                console.error('Automatic token refresh failed:', error);
            });
        }, refreshTime);
    }

    private async getDeviceInfo(): Promise<any> {
        try {
            const { Platform, Dimensions } = require('react-native');
            const DeviceInfo = require('react-native-device-info');

            return {
                platform: Platform.OS,
                version: Platform.Version,
                screenSize: Dimensions.get('screen'),
                deviceId: await DeviceInfo.getDeviceId().catch(() => 'unknown'),
                brand: await DeviceInfo.getBrand().catch(() => 'unknown'),
                model: await DeviceInfo.getModel().catch(() => 'unknown'),
                systemName: await DeviceInfo.getSystemName().catch(() => 'unknown'),
                systemVersion: await DeviceInfo.getSystemVersion().catch(() => 'unknown'),
                bundleId: await DeviceInfo.getBundleId().catch(() => 'com.carworld.app'),
                buildNumber: await DeviceInfo.getBuildNumber().catch(() => '1'),
                appVersion: await DeviceInfo.getVersion().catch(() => '1.0.0'),
                timestamp: Date.now(),
            };
        } catch (error) {
            return {
                platform: 'unknown',
                timestamp: Date.now(),
            };
        }
    }

    private validateRegistrationCredentials(credentials: RegisterCredentials): void {
        const { name, email, password, confirmPassword } = credentials;

        if (!name || name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        if (!email || !this.isValidEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
        }

        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private handleAuthError(error: any): void {
        let message = 'An unexpected error occurred';

        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    message = data.message || 'Invalid request';
                    break;
                case 401:
                    message = data.message || 'Invalid credentials';
                    break;
                case 403:
                    message = data.message || 'Access forbidden';
                    break;
                case 404:
                    message = data.message || 'Service not found';
                    break;
                case 409:
                    message = data.message || 'User already exists';
                    break;
                case 422:
                    message = data.message || 'Invalid input data';
                    break;
                case 429:
                    message = 'Too many requests. Please try again later';
                    break;
                case 500:
                    message = 'Server error. Please try again later';
                    break;
                default:
                    message = data.message || 'Service temporarily unavailable';
            }
        } else if (error.request) {
            // Network error
            message = 'Network error. Please check your internet connection';
        } else if (error.message) {
            // Custom error message
            message = error.message;
        }

        // Log error for debugging (remove in production)
        if (__DEV__) {
            console.error('Auth Error:', error);
        }

        // Update error message in error object
        error.message = message;
    }
}

export const authService = new AuthService();

const SKIP_LOGIN_KEY = '@carworld_skip_login';

export const isUserAuthorized = async (): Promise<boolean> => {
    try {
        const skipLogin = await AsyncStorage.getItem(SKIP_LOGIN_KEY);
        if (skipLogin === 'true') {
            return true;
        }
    } catch (error) {
        if (__DEV__) {
            console.error('Skip login flag read failed:', error);
        }
    }
    return authService.isUserAuthorized();
};

export const isAuthenticated = () => authService.isAuthenticated();

export const setSkipLogin = async (value: boolean): Promise<void> => {
    try {
        if (value) {
            await AsyncStorage.setItem(SKIP_LOGIN_KEY, 'true');
        } else {
            await AsyncStorage.removeItem(SKIP_LOGIN_KEY);
        }
    } catch (error) {
        if (__DEV__) {
            console.error('Skip login flag write failed:', error);
        }
    }
};



