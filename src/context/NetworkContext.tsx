import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string | null;
  details: any;
}

interface NetworkContextValue {
  networkState: NetworkState;
  isOnline: boolean;
  isOffline: boolean;
  checkConnection: () => Promise<boolean>;
  retryConnection: () => Promise<void>;
  addOnlineListener: (callback: () => void) => () => void;
  addOfflineListener: (callback: () => void) => () => void;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

interface NetworkProviderProps {
  children: React.ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    type: null,
    details: null,
  });

  const onlineListeners = useRef<Array<() => void>>([]);
  const offlineListeners = useRef<Array<() => void>>([]);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable ?? false;
      const isOnline = isConnected && isInternetReachable;

      // Check if we just came back online
      const wasOffline = wasOfflineRef.current;
      const isNowOnline = isOnline;

      setNetworkState({
        isConnected,
        isInternetReachable,
        type: state.type,
        details: state.details,
      });

      // Trigger listeners based on connection state changes
      if (wasOffline && isNowOnline) {
        // Just came back online
        onlineListeners.current.forEach(callback => callback());
        console.log('📶 Connection restored - notifying listeners');
      } else if (!wasOffline && !isNowOnline) {
        // Just went offline
        offlineListeners.current.forEach(callback => callback());
        console.log('📵 Connection lost - notifying listeners');
      }

      // Update the offline state reference
      wasOfflineRef.current = !isOnline;
    });

    // Initial connection check
    NetInfo.fetch().then(state => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable ?? false;
      
      setNetworkState({
        isConnected,
        isInternetReachable,
        type: state.type,
        details: state.details,
      });

      wasOfflineRef.current = !(isConnected && isInternetReachable);
    });

    return unsubscribe;
  }, []);

  const checkConnection = async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      const isOnline = (state.isConnected ?? false) && (state.isInternetReachable ?? false);
      
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        details: state.details,
      });

      return isOnline;
    } catch (error) {
      console.error('Error checking network connection:', error);
      return false;
    }
  };

  const retryConnection = async (): Promise<void> => {
    try {
      const isOnline = await checkConnection();
      
      if (isOnline) {
        Alert.alert(
          'Connection Restored',
          'Your internet connection has been restored.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Still Offline',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Unable to check your internet connection.',
        [{ text: 'OK' }]
      );
    }
  };

  const addOnlineListener = (callback: () => void): (() => void) => {
    onlineListeners.current.push(callback);
    
    // Return cleanup function
    return () => {
      const index = onlineListeners.current.indexOf(callback);
      if (index > -1) {
        onlineListeners.current.splice(index, 1);
      }
    };
  };

  const addOfflineListener = (callback: () => void): (() => void) => {
    offlineListeners.current.push(callback);
    
    // Return cleanup function
    return () => {
      const index = offlineListeners.current.indexOf(callback);
      if (index > -1) {
        offlineListeners.current.splice(index, 1);
      }
    };
  };

  const isOnline = networkState.isConnected && networkState.isInternetReachable;
  const isOffline = !isOnline;

  const value: NetworkContextValue = {
    networkState,
    isOnline,
    isOffline,
    checkConnection,
    retryConnection,
    addOnlineListener,
    addOfflineListener,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

export const useNetwork = (): NetworkContextValue => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

// Custom hook for screens that need to refresh when coming back online
export const useNetworkRefresh = (refreshCallback: () => void | Promise<void>) => {
  const { addOnlineListener } = useNetwork();
  
  useEffect(() => {
    const cleanup = addOnlineListener(() => {
      console.log('📶 Auto-refreshing screen content...');
      refreshCallback();
    });
    
    return cleanup;
  }, [refreshCallback, addOnlineListener]);
};

// Custom hook for showing network-dependent UI
export const useNetworkUI = () => {
  const { isOnline, isOffline, retryConnection } = useNetwork();
  
  return {
    isOnline,
    isOffline,
    showOfflineMessage: isOffline,
    retryConnection,
  };
};


