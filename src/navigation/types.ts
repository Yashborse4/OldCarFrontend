// navigation/types.ts
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Car } from '../screens/car/ManageCarScreen';

// Define dealer group and vehicle interfaces
export interface DealerGroup {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  adminId: string;
  members: DealerMember[];
  createdAt: string;
}

export interface DealerMember {
  id: string;
  name: string;
  dealership: string;
  role: 'admin' | 'member';
  avatar?: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  location: string;
  condition: string;
  images: string[];
  specifications: Record<string, any>;
  dealerId: string;
  dealerName: string;
  isCoListed: boolean;
  coListedIn: string[];
  views: number;
  inquiries: number;
  shares: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'vehicle' | 'quote';
  attachments?: any[];
}

// Define the navigation stack param list
export type RootStackParamList = {
  // Authentication
  Login: undefined;
  RegisterUser: undefined;
  ForgotPasswordScreen: undefined;
  
  // Main App
  Dashboard: undefined;
  Settings: undefined;
  Profile: undefined;
  Notifications: undefined;
  
  // Car-related
  CarDetails: { carId: string };
  SellCar: undefined;
  CoListVehicle: { vehicleId: string };
  VehicleSearch: undefined;
  VehicleDetail: { vehicleId: string; enableCoListing?: boolean };
  SearchResults: { filters: any };
  VehicleAnalytics: undefined;
  ManageCar: { car: Car };
  MyGarage: undefined;
  
  // Chat/Messaging
  Messages: undefined;
  Chat: { dealerId: string; dealerName: string };
  ChatList: undefined;
  ChatConversation: { conversationId: string };
  CreateGroup: undefined;
  GroupDetails: { groupId: string };
  
  // Dealer Networking
  DealerGroups: undefined;
  DealerAddCar: undefined;
  DealerDashboard: undefined;
  DealerInquiries: undefined;
  DealerNetworkChat: { networkId: string };
  DealerProfile: { dealerId: string };
  
  // Future screens (commented out in navigator)
  GroupMembers?: { groupId: string };
  InviteMembers?: { groupId: string };
  CoListedVehicles?: undefined;
  ListingPerformance?: { vehicleId: string };
  NotificationSettings?: undefined;
};

// Navigation prop types
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;
export type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RegisterUser'>;
export type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPasswordScreen'>;
export type DealerGroupsNavigationProp = StackNavigationProp<RootStackParamList, 'DealerGroups'>;
export type MessagesNavigationProp = StackNavigationProp<RootStackParamList, 'Messages'>;
export type VehicleSearchNavigationProp = StackNavigationProp<RootStackParamList, 'VehicleSearch'>;
export type VehicleAnalyticsNavigationProp = StackNavigationProp<RootStackParamList, 'VehicleAnalytics'>;
export type CreateGroupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateGroup'>;

// Route prop types
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
export type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;
export type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'RegisterUser'>;
export type ForgotPasswordScreenRouteProp = RouteProp<RootStackParamList, 'ForgotPasswordScreen'>;
export type GroupDetailsRouteProp = RouteProp<RootStackParamList, 'GroupDetails'>;
export type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
export type VehicleDetailScreenRouteProp = RouteProp<RootStackParamList, 'VehicleDetail'>;
export type CoListVehicleRouteProp = RouteProp<RootStackParamList, 'CoListVehicle'>;

// Additional route prop types for new screens
export type ChatConversationRouteProp = RouteProp<RootStackParamList, 'ChatConversation'>;
export type ManageCarRouteProp = RouteProp<RootStackParamList, 'ManageCar'>;
export type DealerProfileRouteProp = RouteProp<RootStackParamList, 'DealerProfile'>;
export type DealerNetworkChatRouteProp = RouteProp<RootStackParamList, 'DealerNetworkChat'>;
