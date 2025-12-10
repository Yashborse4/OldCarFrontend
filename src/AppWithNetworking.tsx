/**
 * Integration Guide for Network Connectivity System
 * =================================================
 * 
 * This file demonstrates how to integrate the network connectivity system
 * into your existing React Native app. Follow these steps:
 * 
 * 1. Wrap your main app with NetworkProvider
 * 2. Use withNetworkHandling HOC for screens
 * 3. Handle network errors in API calls
 * 4. Use NetworkAwareWrapper for specific components
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Network Context Provider
import { NetworkProvider } from './context/NetworkContext';

//  Context Provider (existing)

// Screens (with network handling already applied)
import DashboardScreen from './screens/main/DashboardScreenModern';
import LoginScreen from './screens/auth/LoginScreen';
import MyGarageScreen from './screens/car/MyGarageScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="MyGarage" component={MyGarageScreen} />
      {/* Add other screens here */}
    </Stack.Navigator>
  );
};

/**
 * Main App Component with Network Handling
 * 
 * This is the main wrapper that provides network connectivity to all screens.
 * Place this at the root of your app, wrapping your existing providers.
 */
const AppWithNetworking: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NetworkProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
      </NetworkProvider>
    </SafeAreaProvider>
  );
};

export default AppWithNetworking;

/**
 * INTEGRATION STEPS:
 * ==================
 * 
 * 1. Install Dependencies:
 *    npm install @react-native-netinfo/netinfo
 *    
 * 2. For iOS, add to your Podfile and run 'pod install':
 *    (Usually auto-linked with React Native 0.60+)
 *    
 * 3. Replace your main App.js/App.tsx with this structure:
 *    import AppWithNetworking from './src/AppWithNetworking';
 *    export default AppWithNetworking;
 * 
 * 4. For each screen, choose the appropriate HOC wrapper:
 *    - withOverlayNetworkHandling: Full-screen overlay (recommended for main screens)
 *    - withBannerNetworkHandling: Top banner notification (good for login/forms)
 *    - withInlineNetworkHandling: Inline error messages
 *    - withMinimalNetworkHandling: Just status indicator
 * 
 * 5. Example usage in screens:
 *    import { withOverlayNetworkHandling } from '../components/withNetworkHandling';
 *    
 *    const MyScreenBase = ({ navigation }) => {
 *      // Your screen content
 *    };
 *    
 *    const MyScreen = withOverlayNetworkHandling(MyScreenBase);
 *    export default MyScreen;
 * 
 * 6. For components that need network awareness without HOC:
 *    import { NetworkAwareWrapper } from '../components/withNetworkHandling';
 *    
 *    <NetworkAwareWrapper mode="inline" onRefresh={handleRefresh}>
 *      <YourComponent />
 *    </NetworkAwareWrapper>
 * 
 * 7. Use network hooks directly in components:
 *    import { useNetwork, useNetworkUI } from '../context/NetworkContext';
 *    
 *    const MyComponent = () => {
 *      const { isOnline, isOffline } = useNetwork();
 *      const { showOfflineMessage, retryConnection } = useNetworkUI();
 *      
 *      if (isOffline) {
 *        return <Text>You're offline</Text>;
 *      }
 *      
 *      return <YourContent />;
 *    };
 * 
 * 8. Auto-refresh on reconnection:
 *    import { useNetworkRefresh } from '../context/NetworkContext';
 *    
 *    const MyScreen = () => {
 *      const [data, setData] = useState([]);
 *      
 *      const loadData = async () => {
 *        // Your API call
 *      };
 *      
 *      // This will automatically call loadData when internet is restored
 *      useNetworkRefresh(loadData);
 *      
 *      return <YourContent />;
 *    };
 * 
 * TESTING:
 * ========
 * 
 * 1. Physical Device Testing:
 *    - Turn airplane mode on/off
 *    - Disconnect WiFi
 *    - Switch between WiFi and cellular
 * 
 * 2. iOS Simulator:
 *    - Device > Network Link Conditioner
 *    - Choose "100% Loss" to simulate no internet
 * 
 * 3. Android Emulator:
 *    - Extended Controls > Cellular > Data Status: Off
 *    - Extended Controls > WiFi > Disable WiFi
 * 
 * CUSTOMIZATION:
 * ==============
 * 
 * 1. Custom Error Messages:
 *    Pass custom props to NetworkError component:
 *    title="Custom No Internet Title"
 *    message="Custom message for your app"
 * 
 * 2. Custom Error Component:
 *    Create your own component and pass it as:
 *    customNetworkErrorComponent={YourCustomComponent}
 * 
 * 3. Different Modes per Screen:
 *    - Login/Register: Banner mode (less intrusive)
 *    - Main app screens: Overlay mode (clear indication)
 *    - Secondary screens: Inline mode (integrated with content)
 * 
 * BEST PRACTICES:
 * ===============
 * 
 * 1. Always handle network errors in try-catch blocks
 * 2. Show appropriate loading states during network operations
 * 3. Cache important data locally when possible
 * 4. Provide retry mechanisms for failed operations
 * 5. Don't block the entire app for network issues unless necessary
 * 6. Give users clear feedback about their connection status
 * 7. Test thoroughly on different connection types and speeds
 */


