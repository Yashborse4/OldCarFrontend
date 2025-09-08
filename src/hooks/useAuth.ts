import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isUserAuthorized, AUTH_STATUS_KEY } from '../services/auth';

/**
 * A lightweight hook that provides authentication state and handles
 * app state changes to refresh auth status when needed.
 * 
 * @returns {Object} Object containing authorized status and refreshing state
 */
export const useAuth = () => {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(true);

  // Function to check auth status
  const checkAuthStatus = async () => {
    setRefreshing(true);
    try {
      const isAuthorized = await isUserAuthorized();
      setAuthorized(isAuthorized);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthorized(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check auth status when component mounts
    checkAuthStatus();

    // Add listener for app state changes
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Refresh auth status when app becomes active
        checkAuthStatus();
      }
    });

    // Note: AsyncStorage doesn't have a real storage event listener like browser localStorage
    // This is a mock implementation for demonstration purposes
    const storageListener = { remove: () => {} };
    
    // In a real implementation, you might want to periodically check for auth changes
    // or implement a custom event system

    // Clean up listeners
    return () => {
      subscription.remove();
      storageListener.remove();
    };
  }, []);

  return { authorized, refreshing };
};

export default useAuth;


