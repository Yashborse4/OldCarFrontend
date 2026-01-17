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
import { getAuthStatusWithRole } from './src/services/auth';
import { RootStackParamList } from './src/navigation/types';
import { AuthProvider } from './src/context/AuthContext';
import { ChatProvider } from './src/context/ChatContext';
import { UploadQueueProvider } from './src/context/UploadQueueContext';
import { ToastProvider } from './src/components/ui/ToastManager';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './src/services/graphql';
import { AnalyticsService } from './src/services/AnalyticsService';

function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Initialize analytics
        await AnalyticsService.initialize();
        AnalyticsService.track('APP_OPEN');

        const { isAuthorized, role } = await getAuthStatusWithRole();

        if (!isAuthorized) {
          setInitialRoute('Login');
          return;
        }

        // Route to appropriate dashboard based on role
        if (role === 'dealer') {
          setInitialRoute('DealerDashboard');
        } else {
          setInitialRoute('Dashboard');
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
        setInitialRoute('Login');
      }
    };

    checkAuthStatus();

    // Cleanup: end session when app unmounts
    return () => {
      AnalyticsService.endSession();
    };
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>

      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <UploadQueueProvider>
              <ChatProvider>
                <ApolloProvider client={client}>
                  <AppContent initialRoute={initialRoute} />
                </ApolloProvider>
              </ChatProvider>
            </UploadQueueProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>

    </SafeAreaProvider>
  );
}

const AppContent = ({ initialRoute }: { initialRoute: keyof RootStackParamList }) => {
  const { theme, isDark } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
        translucent={false}
        hidden={false}
      />
      <NavigationContainer>
        <AppNavigator initialRouteName={initialRoute} />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;