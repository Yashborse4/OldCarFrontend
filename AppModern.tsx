
import React, { useEffect } from 'react';
import { StatusBar, Platform, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Theme and Context
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { NetworkProvider } from './context/NetworkContext';
import { ToastProvider } from './components/ui/ToastManager';
import { ThemeProvider } from './theme/ThemeContext';


// Modern Screens
import DashboardScreenModern from './screens/main/DashboardScreenModern';

// Legacy screens (to be modernized)
import RegisterUser from './screens/auth/RegisterUser';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import SellCarScreen from './screens/car/SellCarScreen';
import SearchResultsScreen from './screens/car/SearchResultsScreen';
import ChatListScreen from './screens/chat/ChatListScreen';
import ProfileScreen from './screens/main/ProfileScreen';

// Navigation Types
export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Main
  Dashboard: undefined;
  Profile: undefined;
  
  // Car
  CarDetails: { carId: number };
  SellCar: undefined;
  SearchResults: { query?: string };
  
  // Chat
  ChatList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Ignore known warnings in development
if (__DEV__) {
  LogBox.ignoreLogs([
    'Warning: componentWillReceiveProps',
    'Warning: componentWillMount',
    'Non-serializable values',
    'VirtualizedLists should never be nested',
  ]);
}

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
              <ToastProvider>
                <ThemeProvider>
                  <NavigationContainer>
                  <Stack.Navigator
                    initialRouteName="Dashboard"
                    screenOptions={{
                      headerShown: false,
                      gestureEnabled: true,
                      animation: 'slide_from_right',
                      animationDuration: 300,
                    }}
                  >
                    {/* Auth Stack */}
                    {/* <Stack.Screen 
                      name="Login" 
                      component={LoginScreenModern}
                      options={{
                        animation: 'fade',
                      }}
                    /> */}
                    <Stack.Screen 
                      name="Register" 
                      component={RegisterUser}
                      options={{
                        animation: 'slide_from_bottom',
                      }}
                    />
                    <Stack.Screen 
                      name="ForgotPassword" 
                      component={ForgotPasswordScreen}
                      options={{
                        animation: 'slide_from_right',
                      }}
                    />

                    {/* Main Stack */}
                    <Stack.Screen 
                      name="Dashboard" 
                      component={DashboardScreenModern}
                      options={{
                        animation: 'fade',
                      }}
                    />
                    <Stack.Screen 
                      name="Profile" 
                      component={ProfileScreen}
                      options={{
                        animation: 'slide_from_right',
                      }}
                    />

                    {/* Car Stack */}
                    {/* <Stack.Screen 
                      name="CarDetails" 
                      component={CarDetailsScreenModern}
                      options={{
                        animation: 'slide_from_right',
                        gestureDirection: 'horizontal',
                      }}
                    /> */}
                    <Stack.Screen 
                      name="SellCar" 
                      component={SellCarScreen}
                      options={{
                        animation: 'slide_from_bottom',
                      }}
                    />
                    <Stack.Screen 
                      name="SearchResults" 
                      component={SearchResultsScreen}
                      options={{
                        animation: 'slide_from_right',
                      }}
                    />

                    {/* Chat Stack */}
                    <Stack.Screen 
                      name="ChatList" 
                      component={ChatListScreen}
                      options={{
                        animation: 'slide_from_right',
                      }}
                    />
                  </Stack.Navigator>
                  </NavigationContainer>
                </ThemeProvider>
              </ToastProvider>
            </ChatProvider>
          </AuthProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default AppModern;


