import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import ToastItem, { ToastConfig, ToastType, ToastPosition } from './Toast';

interface ToastContextType {
  showToast: (config: Omit<ToastConfig, 'id'>) => string;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const generateId = () => `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const showToast = (config: Omit<ToastConfig, 'id'>): string => {
    const id = generateId();
    const newToast: ToastConfig = {
      id,
      position: 'top',
      duration: 3000,
      backdrop: false,
      ...config,
    };

    setToasts(prev => {
      // Remove any existing toasts if max limit reached (keep it to 3 max)
      const filtered = prev.length >= 3 ? prev.slice(1) : prev;
      return [...filtered, newToast];
    });

    return id;
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const hideAllToasts = () => {
    setToasts([]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, hideAllToasts }}>
      {children}
      <View style={styles.toastContainer} pointerEvents="box-none">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            {...toast}
            index={index}
            onRemove={removeToast}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience functions for different toast types
export const useToastActions = () => {
  const { showToast, hideToast, hideAllToasts } = useToast();

  return {
    showSuccess: (title: string, message?: string, options?: Partial<ToastConfig>) =>
      showToast({ type: 'success', title, message, ...options }),
    
    showError: (title: string, message?: string, options?: Partial<ToastConfig>) =>
      showToast({ type: 'error', title, message, ...options }),
    
    showWarning: (title: string, message?: string, options?: Partial<ToastConfig>) =>
      showToast({ type: 'warning', title, message, ...options }),
    
    showInfo: (title: string, message?: string, options?: Partial<ToastConfig>) =>
      showToast({ type: 'info', title, message, ...options }),
    
    hideToast,
    hideAllToasts,
  };
};

// Hook for quick toast notifications with better UX
export const useNotifications = () => {
  const actions = useToastActions();

  return {
    ...actions,
    
    // Authentication notifications
    notifyLoginSuccess: (username?: string) =>
      actions.showSuccess(
        'Welcome back!',
        username ? `Hello ${username}` : 'Successfully logged in',
        { duration: 2000 }
      ),
    
    notifyLoginError: (message?: string) =>
      actions.showError(
        'Login Failed',
        message || 'Please check your credentials',
        { duration: 4000 }
      ),
    
    notifyLogout: () =>
      actions.showInfo('Logged Out', 'See you next time!', { duration: 2000 }),
    
    // Car-related notifications
    notifyCarSaved: (carName?: string) =>
      actions.showSuccess(
        'Car Saved',
        carName ? `${carName} added to favorites` : 'Added to your favorites',
        { duration: 2500 }
      ),
    
    notifyCarRemoved: (carName?: string) =>
      actions.showInfo(
        'Car Removed',
        carName ? `${carName} removed from favorites` : 'Removed from favorites',
        { duration: 2000 }
      ),
    
    notifyMessageSent: () =>
      actions.showSuccess('Message Sent', 'The seller will get back to you soon', { duration: 3000 }),
    
    // Network notifications
    notifyNetworkError: () =>
      actions.showError(
        'Connection Error',
        'Please check your internet connection',
        { duration: 5000 }
      ),
    
    notifyOffline: () =>
      actions.showWarning('Offline', 'Some features may be limited', { duration: 4000 }),
    
    notifyOnline: () =>
      actions.showSuccess('Back Online', 'Connection restored', { duration: 2000 }),
    
    // Generic action notifications
    notifyActionSuccess: (action: string) =>
      actions.showSuccess('Success', `${action} completed successfully`, { duration: 2500 }),
    
    notifyActionError: (action: string, error?: string) =>
      actions.showError(
        `${action} Failed`,
        error || 'Something went wrong. Please try again.',
        { duration: 4000 }
      ),
  };
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});

export default ToastProvider;


