import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// API Configuration
const API_CONFIG = {
  baseURL: __DEV__ ? 'http://localhost:9000' : 'https://your-production-api.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Storage keys for secure token management
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@carworld_access_token',
  REFRESH_TOKEN: '@carworld_refresh_token',
  USER_DATA: '@carworld_user_data',
};

// API Response types
export interface ApiSuccessResponse<T> {
  timestamp: string;
  message: string;
  details: string;
  data: T;
  success: boolean;
}

export interface ApiErrorResponse {
  timestamp: string;
  message: string;
  details: string;
  path: string;
  errorCode: string;
  fieldErrors?: {[key: string]: string};
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  role: string;
  location?: string;
  expiresAt: string;
  refreshExpiresAt: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface UserData {
  userId: number;
  username: string;
  email: string;
  role: string;
  location?: string;
}

// Custom error class for API errors
export class ApiError extends Error {
  public errorCode: string;
  public details: string;
  public path: string;
  public fieldErrors?: {[key: string]: string};
  public status: number;

  constructor(response: ApiErrorResponse, status: number = 500) {
    super(response.message);
    this.name = 'ApiError';
    this.errorCode = response.errorCode;
    this.details = response.details;
    this.path = response.path;
    this.fieldErrors = response.fieldErrors;
    this.status = status;
  }
}

// Network error class specifically for connection issues
export class NetworkError extends Error {
  public isNetworkError = true;
  
  constructor(message: string = 'No internet connection available') {
    super(message);
    this.name = 'NetworkError';
  }
}

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private networkCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.instance = axios.create(API_CONFIG);
    this.setupInterceptors();
    this.startNetworkMonitoring();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token to requests
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Failed to get access token:', error);
        }

        // Add additional headers for mobile
        if (Platform.OS === 'ios') {
          config.headers['User-Agent'] = 'CarWorld-iOS';
        } else if (Platform.OS === 'android') {
          config.headers['User-Agent'] = 'CarWorld-Android';
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor - Handle token refresh and errors
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors and token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request if token refresh is in progress
            return new Promise((resolve, reject) => {
              this.failedQueue.push({resolve, reject});
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.instance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await AsyncStorage.getItem(
              STORAGE_KEYS.REFRESH_TOKEN,
            );
            if (refreshToken) {
              const newTokens = await this.refreshAccessToken(refreshToken);
              this.processQueue(newTokens.accessToken);
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              }
              
              return this.instance(originalRequest);
            } else {
              throw new Error('No refresh token available');
            }
          } catch (refreshError) {
            this.processQueue(null);
            await this.clearAuthData();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors
        if (error.response?.data) {
          throw new ApiError(error.response.data, error.response.status);
        } else if (error.request) {
          // Check if it's a network connectivity issue
          const isOnline = await this.checkNetworkConnectivity();
          
          if (!isOnline) {
            throw new NetworkError('No internet connection available');
          }
          
          throw new ApiError(
            {
              timestamp: new Date().toISOString(),
              message: 'Network error - please check your connection',
              details: 'No response received from server',
              path: originalRequest.url || '',
              errorCode: 'NETWORK_ERROR',
            },
            0,
          );
        } else {
          throw new ApiError(
            {
              timestamp: new Date().toISOString(),
              message: 'Request failed',
              details: error.message,
              path: originalRequest?.url || '',
              errorCode: 'REQUEST_ERROR',
            },
            500,
          );
        }
      },
    );
  }

  private processQueue(token: string | null) {
    this.failedQueue.forEach(({resolve, reject}) => {
      if (token) {
        resolve(token);
      } else {
        reject(new Error('Token refresh failed'));
      }
    });
    this.failedQueue = [];
  }

  // Auth methods
  async login(credentials: {
    usernameOrEmail: string;
    password: string;
  }): Promise<AuthTokens> {
    const response = await this.instance.post<ApiSuccessResponse<AuthTokens>>(
      '/api/auth/login',
      credentials,
    );
    const authData = response.data.data;
    await this.saveAuthData(authData);
    return authData;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<{
    userId: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
  }> {
    const response = await this.instance.post<
      ApiSuccessResponse<{
        userId: number;
        username: string;
        email: string;
        role: string;
        createdAt: string;
      }>
    >('/api/auth/register', userData);
    return response.data.data;
  }

  async forgotPassword(username: string): Promise<void> {
    await this.instance.post('/api/auth/forgot-password', {username});
  }

  async resetPassword(data: {
    username: string;
    otp: string;
    newPassword: string;
  }): Promise<void> {
    await this.instance.post('/api/auth/reset-password', data);
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.instance.post<ApiSuccessResponse<AuthTokens>>(
      '/api/auth/refresh-token',
      {refreshToken},
    );
    const authData = response.data.data;
    await this.saveAuthData(authData);
    return authData;
  }

  async validateToken(): Promise<{
    valid: boolean;
    userDetails?: UserData;
  }> {
    const response = await this.instance.post<
      ApiSuccessResponse<{
        valid: boolean;
        userDetails?: UserData;
      }>
    >('/api/auth/validate-token');
    return response.data.data;
  }

  async logout(): Promise<void> {
    await this.clearAuthData();
  }

  // Car management methods
  async getCars(): Promise<any[]> {
    const response = await this.instance.get<any[]>('/api/v2/cars');
    return response.data;
  }

  async getCarById(id: number): Promise<any> {
    const response = await this.instance.get(`/api/v2/cars/${id}`);
    return response.data;
  }

  async createCar(carData: any): Promise<any> {
    const response = await this.instance.post('/api/v2/cars', carData);
    return response.data;
  }

  async updateCar(id: number, carData: any): Promise<any> {
    const response = await this.instance.patch(`/api/v2/cars/${id}`, carData);
    return response.data;
  }

  async deleteCar(id: number, hard: boolean = false): Promise<void> {
    await this.instance.delete(`/api/v2/cars/${id}?hard=${hard}`);
  }

  async updateCarStatus(id: number, status: string): Promise<any> {
    const response = await this.instance.post(`/api/v2/cars/${id}/status`, {
      status,
    });
    return response.data;
  }

  async featureCar(id: number, featured: boolean = true): Promise<any> {
    const response = await this.instance.post(
      `/api/v2/cars/${id}/feature?featured=${featured}`,
    );
    return response.data;
  }

  async searchCars(filters: {
    make?: string;
    model?: string;
    minYear?: number;
    maxYear?: number;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    featured?: boolean;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await this.instance.get(
      `/api/v2/cars/search?${params.toString()}`,
    );
    return response.data;
  }

  // User profile methods
  async getUserProfile(): Promise<UserData> {
    const response = await this.instance.get<UserData>('/api/user/profile');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.instance.get('/api/auth/health');
    return response.data;
  }

  // Network connectivity methods
  private async checkNetworkConnectivity(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected === true && netInfo.isInternetReachable === true;
    } catch (error) {
      console.error('Error checking network connectivity:', error);
      return false;
    }
  }

  async isNetworkAvailable(): Promise<boolean> {
    return this.checkNetworkConnectivity();
  }

  private startNetworkMonitoring(): void {
    // Monitor network status periodically
    this.networkCheckInterval = setInterval(async () => {
      const isOnline = await this.checkNetworkConnectivity();
      if (!isOnline && __DEV__) {
        console.log('📵 Network connectivity lost');
      }
    }, 30000); // Check every 30 seconds
  }

  private stopNetworkMonitoring(): void {
    if (this.networkCheckInterval) {
      clearInterval(this.networkCheckInterval);
      this.networkCheckInterval = null;
    }
  }

  // Method to destroy the client and clean up resources
  destroy(): void {
    this.stopNetworkMonitoring();
  }

  // Token and storage management
  private async saveAuthData(authData: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken],
        [
          STORAGE_KEYS.USER_DATA,
          JSON.stringify({
            userId: authData.userId,
            username: authData.username,
            email: authData.email,
            role: authData.role,
            location: authData.location,
          }),
        ],
      ]);
    } catch (error) {
      console.error('Failed to save auth data:', error);
      throw new Error('Failed to save authentication data');
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  async getStoredUserData(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get stored user data:', error);
      return null;
    }
  }

  async getStoredAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to get stored access token:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) return false;

      // Check network connectivity first
      const isOnline = await this.checkNetworkConnectivity();
      if (!isOnline) {
        // Return true if token exists but we're offline
        // The actual validation will happen when connection is restored
        return true;
      }

      // Validate token with server
      const validation = await this.validateToken();
      return validation.valid;
    } catch (error) {
      console.error('Authentication check failed:', error);
      
      // If it's a network error, check if we have a token stored
      if (error instanceof NetworkError) {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        return !!token;
      }
      
      return false;
    }
  }

  // Public HTTP methods for external services
  async get<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config);
  }

  async delete<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config);
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.patch(url, data, config);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export { ApiClient };
export default apiClient;
