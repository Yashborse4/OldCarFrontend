import React from 'react';
import { Platform, Easing } from 'react-native';
import { createStackNavigator, TransitionPresets, CardStyleInterpolators, HeaderStyleInterpolators } from '@react-navigation/stack';

// Authentication HOC
import { withAuthProtection } from '../components/auth/withAuthProtection';

// Authentication Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterUser from '../screens/auth/RegisterUser';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';

// Main App Screens
import DashboardScreenModern from '../screens/main/DashboardScreenModern';
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
import CarListScreen from '../screens/car/CarListScreen';

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
import DealerCarsListScreen from '../screens/dealer/DealerCarsListScreen';
import DealerVerificationScreen from '../screens/dealer/DealerVerificationScreen';

// Admin Screens
import AdminDealerVerificationScreen from '../screens/admin/AdminDealerVerificationScreen';

import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

// Default screen options for modern navigation
const iosTransition = {
  gestureEnabled: true,
  animationEnabled: true,
  cardOverlayEnabled: true,
  ...TransitionPresets.SlideFromRightIOS,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
  transitionSpec: {
    open: {
      animation: 'timing' as const,
      config: { duration: 320, easing: Easing.out(Easing.poly(5)) },
    },
    close: {
      animation: 'timing' as const,
      config: { duration: 300, easing: Easing.in(Easing.poly(4)) },
    },
  },
};

const androidTransition = {
  gestureEnabled: true,
  animationEnabled: true,
  cardOverlayEnabled: true,
  cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
  headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
  transitionSpec: {
    open: {
      animation: 'timing' as const,
      config: { duration: 280, easing: Easing.bezier(0.2, 0, 0, 1) },
    },
    close: {
      animation: 'timing' as const,
      config: { duration: 250, easing: Easing.bezier(0.4, 0, 1, 1) },
    },
  },
};

const defaultScreenOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: '#FAFBFC' },
  detachPreviousScreen: true,
  ...(Platform.OS === 'ios' ? iosTransition : androidTransition),
};

// Protected Screen Components (with authentication and email verification guards)
const ProtectedDashboardScreen = withAuthProtection(DashboardScreenModern, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedSettingsScreen = withAuthProtection(SettingsScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedProfileScreen = withAuthProtection(ProfileScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedNotificationsScreen = withAuthProtection(NotificationsScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

// Car-related Protected Screens
const ProtectedCarDetailsScreen = withAuthProtection(CarDetailsScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedSellCarScreen = withAuthProtection(SellCarScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedCoListVehicleScreen = withAuthProtection(CoListVehicleScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedVehicleSearchScreen = withAuthProtection(VehicleSearchScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedVehicleDetailScreen = withAuthProtection(VehicleDetailScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedSearchResultsScreen = withAuthProtection(SearchResultsScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedVehicleAnalyticsScreen = withAuthProtection(VehicleAnalyticsScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedManageCarScreen = withAuthProtection(ManageCarScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedMyGarageScreen = withAuthProtection(MyGarageScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedCarListScreen = withAuthProtection(CarListScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

// Chat Protected Screens
const ProtectedMessagesScreen = withAuthProtection(MessagesScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedChatScreen = withAuthProtection(ChatScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedChatListScreen = withAuthProtection(ChatListScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedChatConversationScreen = withAuthProtection(ChatConversationScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

// Dealer Protected Screens
const ProtectedDealerGroupsScreen = withAuthProtection(DealerGroupsScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedDealerAddCarScreen = withAuthProtection(DealerAddCarScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedDealerDashboardScreen = withAuthProtection(DealerDashboardScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedDealerInquiriesScreen = withAuthProtection(DealerInquiriesScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedDealerNetworkChatScreen = withAuthProtection(DealerNetworkChatScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedDealerProfileScreen = withAuthProtection(DealerProfileScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedDealerCarsListScreen = withAuthProtection(DealerCarsListScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

const ProtectedDealerVerificationScreen = withAuthProtection(DealerVerificationScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

// Admin Protected Screens
const ProtectedAdminDealerVerificationScreen = withAuthProtection(AdminDealerVerificationScreen, {
  requireEmailVerification: true,
  redirectTo: 'Login'
});

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
      <Stack.Screen name="EmailVerificationScreen" component={EmailVerificationScreen} />

      {/* Main App Screens */}
      <Stack.Screen name="Dashboard" component={ProtectedDashboardScreen} />
      <Stack.Screen name="Settings" component={ProtectedSettingsScreen} />
      <Stack.Screen name="Profile" component={ProtectedProfileScreen} />
      <Stack.Screen name="Notifications" component={ProtectedNotificationsScreen} />

      {/* Car-related Screens */}
      <Stack.Screen name="CarDetails" component={ProtectedCarDetailsScreen} />
      <Stack.Screen name="SellCar" component={ProtectedSellCarScreen} />
      <Stack.Screen name="CoListVehicle" component={ProtectedCoListVehicleScreen} />
      <Stack.Screen name="VehicleSearch" component={ProtectedVehicleSearchScreen} />
      <Stack.Screen name="VehicleDetail" component={ProtectedVehicleDetailScreen} />
      <Stack.Screen name="SearchResults" component={ProtectedSearchResultsScreen} />
      <Stack.Screen name="VehicleAnalytics" component={ProtectedVehicleAnalyticsScreen} />
      <Stack.Screen name="ManageCar" component={ProtectedManageCarScreen} />
      <Stack.Screen name="MyGarage" component={ProtectedMyGarageScreen} />
      <Stack.Screen name="CarList" component={ProtectedCarListScreen} />

      {/* Chat/Messaging Screens */}
      <Stack.Screen name="Messages" component={ProtectedMessagesScreen} />
      <Stack.Screen name="Chat" component={ProtectedChatScreen} />
      <Stack.Screen name="ChatList" component={ProtectedChatListScreen} />
      <Stack.Screen name="ChatConversation" component={ProtectedChatConversationScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />

      {/* Dealer Networking Screens */}
      <Stack.Screen name="DealerGroups" component={ProtectedDealerGroupsScreen} />
      <Stack.Screen name="DealerAddCar" component={ProtectedDealerAddCarScreen} />
      <Stack.Screen name="DealerDashboard" component={ProtectedDealerDashboardScreen} />
      <Stack.Screen name="DealerInquiries" component={ProtectedDealerInquiriesScreen} />
      <Stack.Screen name="DealerNetworkChat" component={ProtectedDealerNetworkChatScreen} />
      <Stack.Screen name="DealerProfile" component={ProtectedDealerProfileScreen} />
      <Stack.Screen name="DealerCarsList" component={ProtectedDealerCarsListScreen} />
      <Stack.Screen name="DealerVerification" component={ProtectedDealerVerificationScreen} />

      {/* Admin Screens */}
      <Stack.Screen name="AdminDealerVerification" component={ProtectedAdminDealerVerificationScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
