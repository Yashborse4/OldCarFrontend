import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import CryptoJS from 'crypto-js';

// Configuration
const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://localhost:3000/api' : 'https://api.carworld.com/api',
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  ENCRYPTION_KEY: 'carworld_encryption_key_2024', // Should be from secure config
} as const;

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@carworld_access_token',
  REFRESH_TOKEN: '@carworld_refresh_token',
  API_CACHE: '@carworld_api_cache',
} as const;

// Custom error types
export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(message: string, status: number = 500, code: string = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends Error {
  public isNetworkError = true;
  
  constructor(message: string = 'Network error. Please check your internet connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed. Please login again.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  public fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipRetry?: boolean;
  skipCache?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  encrypt?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

// Cache interface
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class ApiService {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;
  private requestQueue: Array<(token: string) => void> = [];
  private cache = new Map<string, CacheEntry>();
  private requestCounts = new Map<string, number>();

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client': 'CarWorld-Mobile',
        'X-Version': '1.0.0',
      },
    });

    this.setupInterceptors();
    this.loadCache();
  }

  // Public API methods
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  // Upload file with progress
  async uploadFile<T = any>(
    url: string, 
    file: any, 
    onProgress?: (progress: number) => void,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    if (file.uri) {
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'upload.jpg',
      } as any);
    }

    const requestConfig: RequestConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    return this.request<T>('POST', url, formData, requestConfig);
  }

  // Download file
  async downloadFile(url: string, config?: RequestConfig): Promise<Blob> {
    const response = await this.instance.get(url, {
      ...config,
      responseType: 'blob',
    });
    return response.data;
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
    AsyncStorage.removeItem(STORAGE_KEYS.API_CACHE);
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  // Network status
  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable === true;
  }

  // Rate limiting info
  getRateLimitInfo(): Record<string, number> {
    return Object.fromEntries(this.requestCounts);
  }

  // Private methods
  private async request<T>(
    method: string, 
    url: string, 
    data?: any, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    // Check network connectivity
    if (!(await this.isOnline())) {
      throw new NetworkError('No internet connection available. Please check your connection and try again.');
    }

    // Check cache first for GET requests
    if (method === 'GET' && !config?.skipCache) {
      const cached = this.getCachedData<T>(config?.cacheKey || url);
      if (cached) {
        return cached;
      }
    }

    // Rate limiting check
    this.checkRateLimit(url);

    // Encrypt sensitive data
    if (config?.encrypt && data) {
      data = this.encryptData(data);
    }

    const requestConfig: AxiosRequestConfig = {
      method,
      url,
      data,
      ...config,
      headers: {
        ...this.instance.defaults.headers,
        ...config?.headers,
      },
    };

    // Add authentication if needed
    if (!config?.skipAuth) {
      const token = await this.getAccessToken();
      if (token) {
        requestConfig.headers = {
          ...requestConfig.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    // Add request priority
    if (config?.priority) {
      requestConfig.headers = {
        ...requestConfig.headers,
        'X-Priority': config.priority,
      };
    }

    try {
      const response = await this.executeRequest<T>(requestConfig);
      
      // Cache successful GET responses
      if (method === 'GET' && !config?.skipCache && response.status < 400) {
        this.setCachedData(config?.cacheKey || url, response, config?.cacheDuration);
      }

      return response.data;
    } catch (error) {
      // Retry logic for failed requests
      if (!config?.skipRetry && this.shouldRetry(error as AxiosError)) {
        return this.retryRequest<T>(requestConfig, config);
      }
      
      throw this.handleError(error as AxiosError);
    }
  }

  private async executeRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.request<ApiResponse<T>>(config);
  }

  private async retryRequest<T>(
    config: AxiosRequestConfig, 
    originalConfig?: RequestConfig,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    if (attempt > API_CONFIG.RETRY_ATTEMPTS) {
      throw new ApiError('Maximum retry attempts exceeded');
    }

    // Exponential backoff
    const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
    await new Promise<void>(resolve => setTimeout(resolve, delay));

    try {
      const response = await this.executeRequest<T>(config);
      return response.data;
    } catch (error) {
      return this.retryRequest<T>(config, originalConfig, attempt + 1);
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) return true; // Network error
    
    const status = error.response.status;
    return status >= 500 || status === 408 || status === 429;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add timestamp to prevent caching
        if (config.params) {
          config.params._t = Date.now();
        } else {
          config.params = { _t: Date.now() };
        }

        // Add request ID for tracking
        config.headers = {
          ...config.headers,
          'X-Request-ID': this.generateRequestId(),
        };

        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        if (__DEV__) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        if (__DEV__) {
          console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
        }

        // Handle token refresh
        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/refresh')) {
          return this.handleTokenRefresh(error);
        }

        return Promise.reject(error);
      }
    );
  }

  private async handleTokenRefresh(error: AxiosError): Promise<any> {
    const originalRequest = error.config as RequestConfig;

    if (!originalRequest || originalRequest.skipAuth) {
      return Promise.reject(error);
    }

    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.requestQueue.push((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(this.instance.request(originalRequest));
        });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new AuthenticationError();
      }

      const response = await this.instance.post('/auth/refresh', {
        refreshToken,
      });

      const { accessToken } = response.data.tokens;
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

      // Process queued requests
      this.requestQueue.forEach(callback => callback(accessToken));
      this.requestQueue = [];

      // Retry original request
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      
      return this.instance.request(originalRequest);
    } catch (refreshError) {
      // Clear auth data on refresh failure
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
      
      throw new AuthenticationError();
    } finally {
      this.isRefreshing = false;
    }
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      return null;
    }
  }

  private handleError(error: AxiosError): Error {
    if (!error.response) {
      return new NetworkError();
    }

    const { status, data } = error.response;
    const message = data?.message || error.message || 'An error occurred';

    switch (status) {
      case 400:
        return new ValidationError(message, data?.errors);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new ApiError('Access forbidden', status, 'FORBIDDEN');
      case 404:
        return new ApiError('Resource not found', status, 'NOT_FOUND');
      case 409:
        return new ApiError('Resource conflict', status, 'CONFLICT');
      case 422:
        return new ValidationError(message, data?.errors);
      case 429:
        return new ApiError('Too many requests', status, 'RATE_LIMIT');
      case 500:
        return new ApiError('Server error', status, 'SERVER_ERROR');
      default:
        return new ApiError(message, status, 'UNKNOWN_ERROR', data);
    }
  }

  private checkRateLimit(url: string): void {
    const key = this.extractEndpoint(url);
    const count = this.requestCounts.get(key) || 0;
    
    // Simple rate limiting: max 100 requests per minute per endpoint
    if (count > 100) {
      throw new ApiError('Rate limit exceeded', 429, 'RATE_LIMIT');
    }
    
    this.requestCounts.set(key, count + 1);
    
    // Reset counter after 1 minute
    setTimeout(() => {
      this.requestCounts.delete(key);
    }, 60000);
  }

  private extractEndpoint(url: string): string {
    return url.split('?')[0].split('/').slice(0, 3).join('/');
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private encryptData(data: any): any {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, API_CONFIG.ENCRYPTION_KEY).toString();
      return { encrypted };
    } catch (error) {
      console.warn('Failed to encrypt data:', error);
      return data;
    }
  }

  private getCachedData<T>(key: string): ApiResponse<T> | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCachedData<T>(
    key: string, 
    data: ApiResponse<T>, 
    duration: number = 5 * 60 * 1000 // 5 minutes default
  ): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration,
    };
    
    this.cache.set(key, entry);
    this.persistCache();
  }

  private async loadCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.API_CACHE);
      if (cached) {
        const entries = JSON.parse(cached);
        const now = Date.now();
        
        Object.entries(entries).forEach(([key, entry]: [string, any]) => {
          if (entry.expiresAt > now) {
            this.cache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cache:', error);
    }
  }

  private async persistCache(): Promise<void> {
    try {
      const entries = Object.fromEntries(this.cache);
      await AsyncStorage.setItem(STORAGE_KEYS.API_CACHE, JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to persist cache:', error);
    }
  }
}

export const apiService = new ApiService();


