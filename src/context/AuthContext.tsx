import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {apiClient, ApiError, AuthTokens, UserData} from '../services/ApiClient';
import Toast from 'react-native-toast-message';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
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
      
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: `Welcome back, ${authData.username}!`,
        position: 'top',
      });
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof ApiError) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: (error as any).message,
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'An unexpected error occurred. Please try again.',
          position: 'top',
        });
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
      await apiClient.register(userData);
      
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Your account has been created. Please login.',
        position: 'top',
      });
    } catch (error) {
      console.error('Registration failed:', error);
      if (error instanceof ApiError) {
        let errorMessage = (error as any).message;
        
        // Show field-specific errors if available
        if ((error as any).fieldErrors) {
          const fieldErrors = Object.values((error as any).fieldErrors).join(', ');
          errorMessage = fieldErrors;
        }
        
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: errorMessage,
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: 'An unexpected error occurred. Please try again.',
          position: 'top',
        });
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
      
      Toast.show({
        type: 'info',
        text1: 'Logged Out',
        text2: 'You have been successfully logged out.',
        position: 'top',
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // Still log out locally even if server call fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (username: string) => {
    try {
      setIsLoading(true);
      await apiClient.forgotPassword(username);
      
      Toast.show({
        type: 'success',
        text1: 'Reset Code Sent',
        text2: 'Please check your email for the reset code.',
        position: 'top',
      });
    } catch (error) {
      console.error('Forgot password failed:', error);
      if (error instanceof ApiError) {
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: (error as any).message,
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: 'An unexpected error occurred. Please try again.',
          position: 'top',
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: {
    username: string;
    otp: string;
    newPassword: string;
  }) => {
    try {
      setIsLoading(true);
      await apiClient.resetPassword(data);
      
      Toast.show({
        type: 'success',
        text1: 'Password Reset Successful',
        text2: 'Your password has been updated. Please login.',
        position: 'top',
      });
    } catch (error) {
      console.error('Reset password failed:', error);
      if (error instanceof ApiError) {
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: (error as any).message,
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: 'An unexpected error occurred. Please try again.',
          position: 'top',
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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


