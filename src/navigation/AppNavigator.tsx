import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { theme } from '../theme';

// Authentication Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterUser from '../screens/auth/RegisterUser';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main App Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';

// Car-related Screens
import CarDetailsScreen from '../screens/car/CarDetailsScreen';
import SellCarScreen from '../screens/car/SellCarScreen';
import CoListVehicleScreen from '../screens/car/CoListVehicleScreen';
import VehicleSearchScreen from '../screens/car/VehicleSearchScreen';
import VehicleDetailScreen from '../screens/car/VehicleDetailScreen';
import SearchResultsScreen from '../screens/car/SearchResultsScreen';
import VehicleAnalyticsScreen from '../screens/car/VehicleAnalyticsScreen';
import ManageCarScreen from '../screens/car/ManageCarScreen';
import MyGarageScreen from '../screens/car/MyGarageScreen';

// Chat/Messaging Screens
import MessagesScreen from '../screens/chat/MessagesScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatConversationScreen from '../screens/chat/ChatConversationScreen';
// import CreateGroupScreen from '../screens/chat/CreateGroupScreen';
// import GroupDetailsScreen from '../screens/chat/GroupDetailsScreen';

// Dealer Networking Screens
import DealerGroupsScreen from '../screens/dealer/DealerGroupsScreen';
import DealerAddCarScreen from '../screens/dealer/DealerAddCarScreen';
import DealerDashboardScreen from '../screens/dealer/DealerDashboardScreen';
import DealerInquiriesScreen from '../screens/dealer/DealerInquiriesScreen';
import DealerNetworkChatScreen from '../screens/dealer/DealerNetworkChatScreen';
import DealerProfileScreen from '../screens/dealer/DealerProfileScreen';

import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

// Default screen options for modern navigation
const defaultScreenOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: theme.colors.background },
  ...TransitionPresets.SlideFromRightIOS,
};

const AppNavigator = ({ initialRouteName }: { initialRouteName: keyof RootStackParamList }) => {
  return (
    <Stack.Navigator 
      initialRouteName={initialRouteName}
      screenOptions={defaultScreenOptions}
    >
      {/* Authentication Screens */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{
          ...TransitionPresets.ModalSlideFromBottomIOS,
          animationTypeForReplace: 'push'
        }} 
      />
      <Stack.Screen name="RegisterUser" component={RegisterUser} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
      
      {/* Main App Screens */}
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      
      {/* Car-related Screens */}
      <Stack.Screen name="CarDetails" component={CarDetailsScreen} />
      <Stack.Screen name="SellCar" component={SellCarScreen} />
      <Stack.Screen name="CoListVehicle" component={CoListVehicleScreen} />
      <Stack.Screen name="VehicleSearch" component={VehicleSearchScreen} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="VehicleAnalytics" component={VehicleAnalyticsScreen} />
      <Stack.Screen name="ManageCar" component={ManageCarScreen} />
      <Stack.Screen name="MyGarage" component={MyGarageScreen} />
      
      {/* Chat/Messaging Screens */}
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
      <Stack.Screen name="ChatConversationScreen" component={ChatConversationScreen} />
      
      {/* Dealer Networking Screens */}
      <Stack.Screen name="DealerGroups" component={DealerGroupsScreen} />
      <Stack.Screen name="DealerAddCar" component={DealerAddCarScreen} />
      <Stack.Screen name="DealerDashboard" component={DealerDashboardScreen} />
      <Stack.Screen name="DealerInquiries" component={DealerInquiriesScreen} />
      <Stack.Screen name="DealerNetworkChat" component={DealerNetworkChatScreen} />
      <Stack.Screen name="DealerProfile" component={DealerProfileScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;


