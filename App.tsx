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
import { View, ActivityIndicator, StatusBar, useColorScheme as useDeviceColorScheme } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { isUserAuthorized } from './src/services/auth';
import { RootStackParamList } from './src/navigation/types';
import { ThemeProvider, useTheme } from './src/theme';
import { AuthProvider } from './src/context/AuthContext';


function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const authorized = await isUserAuthorized();
      setInitialRoute(authorized ? 'Dashboard' : 'Login');
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
    <ThemeProvider>
      <AuthProvider>
        <AppContent initialRoute={initialRoute} />
      </AuthProvider>
    </ThemeProvider>
  );
}

const AppContent = ({ initialRoute }: { initialRoute: keyof RootStackParamList }) => {
  const { isDark, theme } = useTheme();
  
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
        translucent
      />
      <NavigationContainer>
        <AppNavigator initialRouteName={initialRoute} />
        <Toast />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
