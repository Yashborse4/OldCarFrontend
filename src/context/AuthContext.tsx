import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { apiClient, ApiError, AuthTokens, UserData } from '../services/ApiClient';
import { webSocketService } from '../services/WebSocketService';
import { authService } from '../services/authService';

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;

  // Authentication methods
  login: (credentials: {
    usernameOrEmail: string;
    password: string;
  }) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password?: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (username: string) => Promise<void>;
  resetPassword: (data: {
    username: string;
    otp: string;
    newPassword: string;
  }) => Promise<void>;
  
  // OTP-based authentication methods
  requestEmailVerification: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, otp: string) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;

  // Utility methods
  refreshUserData: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canCreateCars: () => boolean;
  canUpdateCars: () => boolean;
  canDeleteCars: () => boolean;
  canFeatureCars: () => boolean;
  isAdmin: () => boolean;
  isSeller: () => boolean;
  isViewer: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle WebSocket connection based on auth state changes
  useEffect(() => {
    if (!isLoading) {
      webSocketService.onAuthStateChange(isAuthenticated, user?.emailVerified);
    }
  }, [isAuthenticated, user?.emailVerified, isLoading]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await apiClient.getStoredAccessToken();

      if (token) {
        // Validate token and get user data
        const validation = await apiClient.validateToken();
        if (validation.valid && validation.userDetails) {
          setUser(validation.userDetails);
          setIsAuthenticated(true);
        } else {
          // Token invalid, clear auth data
          await apiClient.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      await apiClient.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: {
    usernameOrEmail: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      const authData = await authService.loginWithPassword(credentials);

      // CRITICAL FIX: Check if email is verified before proceeding
      if (!authData.emailVerified) {
        // Store user data for email verification flow but don't authenticate
        setUser({
          userId: authData.userId,
          username: authData.username,
          email: authData.email,
          role: authData.role,
          location: authData.location,
          emailVerified: authData.emailVerified,
          verifiedDealer: authData.verifiedDealer,
        });
        setIsAuthenticated(false); // Don't authenticate until email is verified
        
        // Throw specific error for email verification
        const emailNotVerifiedError = new ApiError({
          message: 'Email is not verified. Please verify your email before logging in.',
          timestamp: new Date().toISOString(),
          details: 'User attempted login with unverified email',
          path: '/auth/login',
          errorCode: 'EMAIL_NOT_VERIFIED',
          errorType: 'EMAIL_NOT_VERIFIED',
          redirectTo: 'EMAIL_VERIFICATION'
        }, 401);
        throw emailNotVerifiedError;
      }

      // Only proceed with authentication if email is verified
      setUser({
        userId: authData.userId,
        username: authData.username,
        email: authData.email,
        role: authData.role,
        location: authData.location,
        emailVerified: authData.emailVerified,
        verifiedDealer: authData.verifiedDealer,
      });
      setIsAuthenticated(true);

      // Toast notification removed
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof ApiError) {
        // Handle EMAIL_NOT_VERIFIED error specifically
        if (error.errorType === 'EMAIL_NOT_VERIFIED') {
          console.log('Email verification required for user:', credentials.usernameOrEmail);
          // Don't clear user data here - it's needed for the verification flow
        }
        // Toast notification removed
      } else {
        // Toast notification removed
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password?: string;
    role?: string;
  }) => {
    try {
      setIsLoading(true);
      console.log('🔄 Attempting registration with data:', {
        username: userData.username,
        email: userData.email,
      });

      const authData = await apiClient.register(userData);

      console.log('✅ Registration successful for user:', authData.username);
    } catch (error) {
      console.error('❌ Registration failed:', error);

      if (error instanceof ApiError) {
        let errorMessage = (error as any).message;

        console.error('API Error Details:', {
          message: errorMessage,
          status: (error as any).status,
          errorCode: (error as any).errorCode,
          details: (error as any).details,
          fieldErrors: (error as any).fieldErrors,
        });

        // Show field-specific errors if available
        if ((error as any).fieldErrors) {
          const fieldErrors = Object.values((error as any).fieldErrors).join(', ');
          errorMessage = fieldErrors;
        }

        // Toast notification removed
        console.error('Registration Failed:', errorMessage);
      } else {
        console.error('Unknown error type:', error);
        // Toast notification removed
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiClient.logout();
      setUser(null);
      setIsAuthenticated(false);

      // Toast notification removed
    } catch (error) {
      console.error('Logout failed:', error);
      // Still log out locally even if server call fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // First forgotPassword removed - duplicate

  const forgotPassword = async (username: string) => {
    try {
      setIsLoading(true);
      await apiClient.forgotPassword(username);

      // Toast notification removed
    } catch (error) {
      console.error('Forgot password failed:', error);
      if (error instanceof ApiError) {
        // Toast notification removed
      } else {
        // Toast notification removed
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // First resetPassword removed - duplicate

  const resetPassword = async (data: {
    username: string;
    otp: string;
    newPassword: string;
  }) => {
    try {
      setIsLoading(true);
      await apiClient.resetPassword(data);

      // Toast notification removed
    } catch (error) {
      console.error('Reset password failed:', error);
      if (error instanceof ApiError) {
        // Toast notification removed
      } else {
        // Toast notification removed
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // OTP-based authentication methods
  const requestEmailVerification = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.requestEmailVerification({ email });
    } catch (error) {
      console.error('Failed to request email verification:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailOtp = async (email: string, otp: string): Promise<void> => {
    try {
      setIsLoading(true);
      const authData = await authService.verifyEmailOtp({ email, otp });
      
      // Update user state with verified email
      setUser({
        userId: authData.userId,
        username: authData.username,
        email: authData.email,
        role: authData.role,
        location: authData.location,
        emailVerified: authData.emailVerified,
        verifiedDealer: authData.verifiedDealer,
      });
      setIsAuthenticated(true);

      // Initialize WebSocket connection after successful email verification
      webSocketService.initializeAfterLogin().catch(error => {
        console.error('Failed to initialize WebSocket after email verification:', error);
        // Don't fail the verification if WebSocket initialization fails
      });
    } catch (error) {
      console.error('Failed to verify email OTP:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOtp = async (email: string, otp: string): Promise<void> => {
    try {
      setIsLoading(true);
      const authData = await authService.loginWithOtp({ email, otp });
      
      // Set user state for successful OTP login
      setUser({
        userId: authData.userId,
        username: authData.username,
        email: authData.email,
        role: authData.role,
        location: authData.location,
        emailVerified: authData.emailVerified,
        verifiedDealer: authData.verifiedDealer,
      });
      setIsAuthenticated(true);

      // Initialize WebSocket connection after successful OTP login
      webSocketService.initializeAfterLogin().catch(error => {
        console.error('Failed to initialize WebSocket after OTP login:', error);
        // Don't fail the login if WebSocket initialization fails
      });
    } catch (error) {
      console.error('Failed to login with OTP:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // First refreshUserData removed - duplicate

  const refreshUserData = async () => {
    try {
      const validation = await apiClient.validateToken();
      if (validation.valid && validation.userDetails) {
        setUser(validation.userDetails);
        setIsAuthenticated(true);
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      await logout();
    }
  };

  // Role-based utility methods
  const hasRole = (role: string): boolean => {
    return user?.role?.toUpperCase() === role.toUpperCase();
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const canCreateCars = (): boolean => {
    return hasAnyRole(['SELLER', 'DEALER', 'ADMIN']);
  };

  const canUpdateCars = (): boolean => {
    return hasAnyRole(['SELLER', 'DEALER', 'ADMIN']);
  };

  const canDeleteCars = (): boolean => {
    return hasAnyRole(['SELLER', 'DEALER', 'ADMIN']);
  };

  const canFeatureCars = (): boolean => {
    return hasAnyRole(['DEALER', 'ADMIN']);
  };

  const isAdmin = (): boolean => {
    return hasRole('ADMIN');
  };

  const isSeller = (): boolean => {
    return hasRole('SELLER');
  };

  const isViewer = (): boolean => {
    return hasRole('VIEWER');
  };

  const value: AuthContextType = {
    // State
    isAuthenticated,
    isLoading,
    user,

    // Auth methods
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    
    // OTP-based authentication methods
    requestEmailVerification,
    verifyEmailOtp,
    loginWithOtp,

    // Utility methods
    refreshUserData,
    hasRole,
    hasAnyRole,
    canCreateCars,
    canUpdateCars,
    canDeleteCars,
    canFeatureCars,
    isAdmin,
    isSeller,
    isViewer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
