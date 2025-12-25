import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { apiClient, ApiError, AuthTokens, UserData } from '../services/ApiClient';

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
    password: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (username: string) => Promise<void>;
  resetPassword: (data: {
    username: string;
    otp: string;
    newPassword: string;
  }) => Promise<void>;

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
      const authData = await apiClient.login(credentials);

      setUser({
        userId: authData.userId,
        username: authData.username,
        email: authData.email,
        role: authData.role,
        location: authData.location,
      });
      setIsAuthenticated(true);

      // Toast notification removed
    } catch (error) {
      console.error('Login failed:', error);
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

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    try {
      setIsLoading(true);
      console.log('🔄 Attempting registration with data:', {
        username: userData.username,
        email: userData.email,
        role: userData.role,
      });

      const authData = await apiClient.register(userData);

      console.log('✅ Registration successful for user:', authData.username);

      setUser({
        userId: authData.userId,
        username: authData.username,
        email: authData.email,
        role: authData.role,
        location: authData.location,
      });
      setIsAuthenticated(true);
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

  // First refreshUserData removed - duplicate

  const refreshUserData = async () => {
    try {
      if (isAuthenticated) {
        const validation = await apiClient.validateToken();
        if (validation.valid && validation.userDetails) {
          setUser(validation.userDetails);
        } else {
          // Token expired, log out
          await logout();
        }
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


