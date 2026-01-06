
import React, { useEffect } from 'react';
import { StatusBar, Platform, LogBox, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Theme and Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ChatProvider } from './src/context/ChatContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { ToastProvider } from './src/components/ui/ToastManager';
import { ThemeProvider } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { RootStackParamList } from './src/navigation/types';

// Ignore known warnings in development
if (__DEV__) {
  LogBox.ignoreLogs([
    'Warning: componentWillReceiveProps',
    'Warning: componentWillMount',
    'Non-serializable values',
    'VirtualizedLists should never be nested',
  ]);
}

const RootNavigation: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const getInitialRouteName = (): keyof RootStackParamList => {
    if (!isAuthenticated) {
      return 'Login';
    }
    const role = user?.role?.toUpperCase();
    if (role === 'DEALER' || role === 'ADMIN') {
      return 'DealerDashboard';
    }
    return 'Dashboard';
  };

  return (
    <NavigationContainer>
      <AppNavigator initialRouteName={getInitialRouteName()} />
    </NavigationContainer>
  );
};

const AppModern: React.FC = () => {
  // Set status bar style
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NetworkProvider>
          <AuthProvider>
            <ChatProvider>
              <ThemeProvider>
                <ToastProvider>
                  <RootNavigation />
                </ToastProvider>
              </ThemeProvider>
            </ChatProvider>
          </AuthProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default AppModern;


