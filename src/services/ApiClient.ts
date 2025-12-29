import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';


// API Configuration
const API_CONFIG = {
  baseURL: 'http://192.168.1.11:9000', // Use your server's IP address
  timeout: 15000, // Increased timeout for better mobile network handling
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
};

// Storage keys for secure token management
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@carworld_access_token',
  REFRESH_TOKEN: '@carworld_refresh_token',
  USER_DATA: '@carworld_user_data',
  TOKEN_EXPIRY: '@carworld_token_expiry',
  REFRESH_EXPIRY: '@carworld_refresh_expiry',
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
  fieldErrors?: { [key: string]: string };
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
  // Backend verification flags coming from JwtAuthResponseV2
  emailVerified: boolean;
  verifiedDealer: boolean;
  expiresAt: string;
  refreshExpiresAt: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface RegisterResponse {
  userId: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface UserData {
  id?: string | number; // For backward compatibility with chat features
  userId: number;
  username: string;
  name?: string; // Display name for chat features
  email: string;
  role: string;
  location?: string;
  // Role/verification flags used for permission matrix
  emailVerified?: boolean;
  verifiedDealer?: boolean;
}

// Custom error class for API errors
export class ApiError extends Error {
  public errorCode: string;
  public details: string;
  public path: string;
  public fieldErrors?: { [key: string]: string };
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
  private networkCheckInterval: ReturnType<typeof setTimeout> | null = null;
  private tokenRefreshTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private retryConfig = {
    retries: 3,
    retryDelay: 1000, // Base delay in milliseconds
    retryCondition: (error: any) => {
      const status = error.response?.status;
      const code = error.code;

      return (
        !status ||
        status >= 500 ||
        code === 'NETWORK_ERROR' ||
        code === 'ERR_NETWORK' ||
        code === 'ECONNABORTED'
      );
    },
  };

  public getBaseUrl(): string {
    return API_CONFIG.baseURL;
  }

  constructor() {
    this.instance = axios.create(API_CONFIG);
    this.setupInterceptors();
    this.setupRetryLogic();
    this.startNetworkMonitoring();
    this.scheduleTokenRefreshFromStorage().catch(() => undefined);
  }

  private clearTokenRefreshTimer(): void {
    if (this.tokenRefreshTimeoutId) {
      clearTimeout(this.tokenRefreshTimeoutId);
      this.tokenRefreshTimeoutId = null;
    }
  }

  private scheduleTokenRefresh(expiresAtMs: number): void {
    this.clearTokenRefreshTimer();

    const now = Date.now();
    const msUntilExpiry = expiresAtMs - now;
    const refreshInMs = Math.max(msUntilExpiry - 120_000, 60_000);

    if (msUntilExpiry <= 0) {
      this.tokenRefreshTimeoutId = setTimeout(() => {
        this.performProactiveRefresh().catch(() => undefined);
      }, 0);
      return;
    }

    this.tokenRefreshTimeoutId = setTimeout(() => {
      this.performProactiveRefresh().catch(() => undefined);
    }, refreshInMs);
  }

  async scheduleTokenRefreshFromStorage(): Promise<void> {
    const [accessToken, refreshToken, tokenExpiry] = await AsyncStorage.multiGet([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.TOKEN_EXPIRY,
    ]);

    if (!accessToken?.[1] || !refreshToken?.[1] || !tokenExpiry?.[1]) {
      this.clearTokenRefreshTimer();
      return;
    }

    const expiresAtMs = Number(tokenExpiry[1]);
    if (!Number.isFinite(expiresAtMs)) {
      this.clearTokenRefreshTimer();
      return;
    }

    this.scheduleTokenRefresh(expiresAtMs);
  }

  private async performProactiveRefresh(): Promise<void> {
    const isOnline = await this.checkNetworkConnectivity();
    if (!isOnline) {
      this.clearTokenRefreshTimer();
      this.tokenRefreshTimeoutId = setTimeout(() => {
        this.performProactiveRefresh().catch(() => undefined);
      }, 30_000);
      return;
    }

    const [refreshToken, refreshExpiry] = await AsyncStorage.multiGet([
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.REFRESH_EXPIRY,
    ]);

    const refreshTokenValue = refreshToken?.[1];
    const refreshExpiryMs = refreshExpiry?.[1] ? Number(refreshExpiry[1]) : NaN;

    if (!refreshTokenValue || !Number.isFinite(refreshExpiryMs) || Date.now() >= refreshExpiryMs) {
      await this.clearAuthData();
      return;
    }

    await this.refreshAccessToken(refreshTokenValue);
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token to requests
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Skip adding JWT token for public auth endpoints (login, register)
        const publicEndpoints = [
          '/api/auth/login',
          '/api/auth/register',
          '/api/auth/refresh-token',
          '/api/auth/forgot-password',
          '/api/auth/reset-password',
          '/api/auth/validate-token',
        ];
        const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

        if (!isPublicEndpoint) {
          try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            if (token && config.headers) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.warn('Failed to get access token:', error);
          }
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
        const isRefreshEndpoint = typeof originalRequest?.url === 'string'
          ? originalRequest.url.includes('/api/auth/refresh-token')
          : false;

        // Handle 401 errors and token refresh
        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
          if (this.isRefreshing) {
            // Queue the request if token refresh is in progress
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
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
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (token) {
        resolve(token);
      } else {
        reject(new Error('Token refresh failed'));
      }
    });
    this.failedQueue = [];
  }

  private setupRetryLogic() {
    // Add request retry logic
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;

        // If there is no config, we can't retry this request
        if (!config) {
          return Promise.reject(error);
        }

        // Initialize retry count if not present
        if (!config.__retryCount) {
          config.__retryCount = 0;
        }

        // Check if we should retry
        const shouldRetry =
          this.retryConfig.retryCondition(error) &&
          config.__retryCount < this.retryConfig.retries;

        if (shouldRetry) {
          config.__retryCount += 1;

          // Exponential backoff
          const delay =
            this.retryConfig.retryDelay * Math.pow(2, config.__retryCount - 1);

          console.log(
            `Retrying request (attempt ${config.__retryCount}/${this.retryConfig.retries}) after ${delay}ms`,
          );

          await new Promise<void>((resolve) =>
            setTimeout(() => resolve(), delay),
          );

          return this.instance(config);
        }

        return Promise.reject(error);
      },
    );
  }

  private async retryRequest<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<AxiosResponse<T>> {
    // The retry logic is handled by interceptors, so just call the function
    return requestFn();
  }


  // Auth methods
  async login(credentials: {
    usernameOrEmail: string;
    password: string;
  }): Promise<AuthTokens> {
    try {
      const response = await this.instance.post<ApiSuccessResponse<AuthTokens>>(
        '/api/auth/login',
        credentials,
      );

      const authData = response.data.data;
      await this.saveAuthData(authData);

      console.log('Login successful for user:', authData.username);
      return authData;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw this.handleAuthError(error, 'Login failed');
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthTokens> {
    try {
      const payload = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      };
      const response = await this.instance.post<ApiSuccessResponse<AuthTokens>>(
        '/api/auth/register',
        payload
      );
      const authData = response.data.data;
      await this.saveAuthData(authData);

      console.log('Registration successful for user:', authData.username);
      return authData;
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw this.handleAuthError(error, 'Registration failed');
    }
  }

  async forgotPassword(username: string): Promise<void> {
    await this.instance.post('/api/auth/forgot-password', { username });
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
      { refreshToken },
    );
    const authData = response.data.data;
    await this.saveAuthData(authData);
    return authData;
  }

  async validateToken(): Promise<{
    valid: boolean;
    userDetails?: UserData;
  }> {
    try {
      const response = await this.instance.post<
        ApiSuccessResponse<{
          valid: boolean;
          userDetails?: UserData;
        }>
      >('/api/auth/validate-token');
      return response.data.data;
    } catch (error: any) {
      console.error('Token validation failed:', error);
      return {
        valid: false,
        userDetails: undefined
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Attempt to notify server of logout (optional)
      await this.instance.post('/api/auth/logout');
    } catch (error) {
      // Logout server notification is optional
      console.warn('Server logout notification failed:', error);
    } finally {
      await this.clearAuthData();
    }
  }

  private handleAuthError(error: any, defaultMessage: string): Error {
    if (error.response?.data) {
      const apiError = error.response.data;

      // Handle field validation errors
      if (apiError.fieldErrors) {
        const fieldErrors = Object.entries(apiError.fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        return new ApiError({
          ...apiError,
          message: fieldErrors
        }, error.response.status);
      }

      return new ApiError(apiError, error.response.status);
    }

    if (error.request) {
      return new NetworkError('Network error - please check your connection');
    }

    return new Error(defaultMessage);
  }

  // Car management methods
  async getCars(page = 0, size = 20, sort = 'createdAt,desc'): Promise<any> {
    try {
      const response = await this.instance.get(`/api/v2/cars?page=${page}&size=${size}&sort=${sort}`);
      // Backend returns ApiResponse<Page<CarResponseV2>>
      if (response.data && response.data.success && response.data.data) {
        return response.data.data; // Return the Page<CarResponseV2>
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching cars:', error);
      throw this.handleApiError(error, 'Failed to fetch vehicles');
    }
  }

  async getCarById(id: string | number): Promise<any> {
    try {
      const response = await this.instance.get(`/api/v2/cars/${id}`);
      // Backend returns ApiResponse<CarResponseV2>
      if (response.data && response.data.success && response.data.data) {
        return response.data.data; // Return the CarResponseV2
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching car by ID:', error);
      throw this.handleApiError(error, 'Failed to fetch vehicle details');
    }
  }

  async createCar(carData: any): Promise<any> {
    try {
      const response = await this.instance.post('/api/v2/cars', carData);
      // Backend returns ApiResponse<CarResponseV2>
      if (response.data && response.data.success && response.data.data) {
        return response.data.data; // Return the created CarResponseV2
      }
      return response.data;
    } catch (error: any) {
      console.error('Error creating car:', error);
      throw this.handleApiError(error, 'Failed to create vehicle listing');
    }
  }

  async updateCar(id: string | number, carData: any): Promise<any> {
    try {
      const response = await this.instance.patch(`/api/v2/cars/${id}`, carData);
      // Backend returns ApiResponse<CarResponseV2>
      if (response.data && response.data.success && response.data.data) {
        return response.data.data; // Return the updated CarResponseV2
      }
      return response.data;
    } catch (error: any) {
      console.error('Error updating car:', error);
      throw this.handleApiError(error, 'Failed to update vehicle listing');
    }
  }

  async deleteCar(id: string | number, hard: boolean = false): Promise<void> {
    try {
      await this.instance.delete(`/api/v2/cars/${id}?hard=${hard}`);
    } catch (error: any) {
      console.error('Error deleting car:', error);
      throw this.handleApiError(error, 'Failed to delete vehicle listing');
    }
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
    location?: string;
    condition?: string;
    status?: string;
    featured?: boolean;
    fuelType?: string;
    transmission?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await this.instance.get(`/api/v2/cars/search?${params.toString()}`);

      // Backend returns ApiResponse<Page<CarResponseV2>>
      if (response.data && response.data.success && response.data.data) {
        return response.data.data; // Return the Page<CarResponseV2>
      }
      return response.data;
    } catch (error: any) {
      console.error('Error searching cars:', error);
      throw this.handleApiError(error, 'Failed to search vehicles');
    }
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

  private handleApiError(error: any, defaultMessage: string): Error {
    if (error instanceof ApiError || error instanceof NetworkError) {
      return error;
    }

    if (error.response?.data) {
      const apiError = error.response.data;
      return new ApiError(apiError, error.response.status);
    }

    if (error.request) {
      return new NetworkError('Network error - please check your connection');
    }

    return new Error(defaultMessage);
  }

  // Token and storage management
  private async saveAuthData(authData: AuthTokens): Promise<void> {
    try {
      const now = Date.now();
      const parsedExpiresAt = authData.expiresAt ? new Date(authData.expiresAt).getTime() : NaN;
      const parsedRefreshExpiresAt = authData.refreshExpiresAt ? new Date(authData.refreshExpiresAt).getTime() : NaN;

      const accessExpiryMs = Number.isFinite(parsedExpiresAt)
        ? parsedExpiresAt
        : now + authData.expiresIn * 1000;
      const refreshExpiryMs = Number.isFinite(parsedRefreshExpiresAt)
        ? parsedRefreshExpiresAt
        : now + authData.refreshExpiresIn * 1000;

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken],
        [STORAGE_KEYS.TOKEN_EXPIRY, accessExpiryMs.toString()],
        [STORAGE_KEYS.REFRESH_EXPIRY, refreshExpiryMs.toString()],
        [
          STORAGE_KEYS.USER_DATA,
          JSON.stringify({
            userId: authData.userId,
            username: authData.username,
            email: authData.email,
            role: authData.role,
            location: authData.location,
            emailVerified: authData.emailVerified,
            verifiedDealer: authData.verifiedDealer,
          }),
        ],
      ]);
      this.scheduleTokenRefresh(accessExpiryMs);
    } catch (error) {
      console.error('Failed to save auth data:', error);
      throw new Error('Failed to save authentication data');
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      this.clearTokenRefreshTimer();
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


