/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import 'react-native-screens';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StatusBar, useColorScheme as useDeviceColorScheme } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { isUserAuthorized } from './src/services/auth';
import { RootStackParamList } from './src/navigation/types';
import { ThemeProvider, useTheme } from './src/theme';
import { AuthProvider } from './src/context/AuthContext';
import { AppErrorBoundary } from './src/components/ErrorBoundary';
import { ToastProvider } from './src/components/ui/ToastManager';


function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authorized = await isUserAuthorized();
        setInitialRoute(authorized ? 'Dashboard' : 'Login');
      } catch (error) {
        console.error('Auth status check failed:', error);
        setInitialRoute('Login');
      }
    };

    checkAuthStatus();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <AppContent initialRoute={initialRoute} />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

const AppContent = ({ initialRoute }: { initialRoute: keyof RootStackParamList }) => {
  const { isDark, themeColors } = useTheme();
  
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
        translucent
      />
      <NavigationContainer>
        <AppNavigator initialRouteName={initialRoute} />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
