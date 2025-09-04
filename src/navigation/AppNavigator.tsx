import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// Authentication Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterUser from '../screens/auth/RegisterUser';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main App Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Main App Screens (additional)
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
import CreateGroupScreen from '../screens/chat/CreateGroupScreen';
import GroupDetailsScreen from '../screens/chat/GroupDetailsScreen';

// Dealer Networking Screens
import DealerGroupsScreen from '../screens/dealer/DealerGroupsScreen';
import DealerAddCarScreen from '../screens/dealer/DealerAddCarScreen';
import DealerDashboardScreen from '../screens/dealer/DealerDashboardScreen';
import DealerInquiriesScreen from '../screens/dealer/DealerInquiriesScreen';
import DealerNetworkChatScreen from '../screens/dealer/DealerNetworkChatScreen';
import DealerProfileScreen from '../screens/dealer/DealerProfileScreen';

import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = ({ initialRouteName }: { initialRouteName: keyof RootStackParamList }) => {
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      {/* Authentication Screens */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RegisterUser" component={RegisterUser} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ headerShown: false }} />
      
      {/* Main App Screens */}
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      
      {/* Car-related Screens */}
      <Stack.Screen name="CarDetails" component={CarDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SellCar" component={SellCarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CoListVehicle" component={CoListVehicleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VehicleSearch" component={VehicleSearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VehicleAnalytics" component={VehicleAnalyticsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ManageCar" component={ManageCarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyGarage" component={MyGarageScreen} options={{ headerShown: false }} />
      
      {/* Chat/Messaging Screens */}
      <Stack.Screen name="Messages" component={MessagesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChatConversation" component={ChatConversationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} options={{ headerShown: false }} />
      
      {/* Dealer Networking Screens */}
      <Stack.Screen name="DealerGroups" component={DealerGroupsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DealerAddCar" component={DealerAddCarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DealerDashboard" component={DealerDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DealerInquiries" component={DealerInquiriesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DealerNetworkChat" component={DealerNetworkChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DealerProfile" component={DealerProfileScreen} options={{ headerShown: false }} />
      
      {/* TODO: Add these screens when implemented in the future */}
      {/* <Stack.Screen name="GroupMembers" component={GroupMembersScreen} options={{ headerShown: false }} /> */}
      {/* <Stack.Screen name="InviteMembers" component={InviteMembersScreen} options={{ headerShown: false }} /> */}
      {/* <Stack.Screen name="CoListedVehicles" component={CoListedVehiclesScreen} options={{ headerShown: false }} /> */}
      {/* <Stack.Screen name="ListingPerformance" component={ListingPerformanceScreen} options={{ headerShown: false }} /> */}
      {/* <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ headerShown: false }} /> */}
    </Stack.Navigator>
  );
};

export default AppNavigator;