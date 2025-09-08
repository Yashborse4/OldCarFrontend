import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiClient, apiClient } from './ApiClient';

// Vehicle interfaces
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
  status: 'Available' | 'Sold' | 'Reserved' | 'Archived';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleSearchFilters {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  condition?: string;
  status?: string;
  featured?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface VehiclePerformance {
  vehicleId: string;
  views: number;
  inquiries: number;
  shares: number;
  coListings: number;
  avgTimeOnMarket: number;
  lastActivity: string;
  topLocations: string[];
  dealerInterest: number;
}

// Dealer Group related interfaces
export interface DealerGroup {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  adminId: string;
  members: DealerMember[];
  createdAt: string;
  vehicleCount?: number;
}

export interface DealerMember {
  id: string;
  name: string;
  dealership: string;
  role: 'admin' | 'member';
  avatar?: string;
  joinedAt?: string;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
  invitedByName: string;
  invitedDealer: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  expiresAt: string;
}

class CarApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = apiClient; // Use the singleton instance
  }

  // Get all cars
  async getAllVehicles(page = 0, size = 20, sort = 'createdAt,desc'): Promise<{ content: Vehicle[], totalElements: number, totalPages: number }> {
    try {
      const response = await this.apiClient.getCars(page, size, sort);
      return response;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  // Get car by ID
  async getVehicleById(id: string): Promise<Vehicle> {
    try {
      return await this.apiClient.getCarById(id);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  }

  // Create new car listing
  async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'inquiries' | 'shares'>): Promise<Vehicle> {
    try {
      return await this.apiClient.createCar(vehicleData);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  // Update car listing
  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    try {
      return await this.apiClient.updateCar(id, updates);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  // Delete car listing
  async deleteVehicle(id: string, hard: boolean = false): Promise<void> {
    try {
      await this.apiClient.deleteCar(id, hard);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }

  // Update car status
  async updateVehicleStatus(id: string, status: Vehicle['status']): Promise<Vehicle> {
    try {
      const response = await this.apiClient.post<Vehicle>(`/api/v2/cars/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      throw error;
    }
  }

  // Search vehicles with filters
  async searchVehicles(filters: VehicleSearchFilters): Promise<{ content: Vehicle[], totalElements: number, totalPages: number }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await this.apiClient.get(`/api/v2/cars/search?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  }

  // Get vehicles by dealer
  async getVehiclesByDealer(dealerId: string): Promise<Vehicle[]> {
    try {
      const response = await this.apiClient.get<Vehicle[]>(`/api/v1/seller/${dealerId}/cars`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dealer vehicles:', error);
      throw error;
    }
  }

  // Get vehicle performance analytics
  async getVehiclePerformance(vehicleId: string): Promise<VehiclePerformance> {
    try {
      // This would be a custom endpoint - implement on backend
      const response = await this.apiClient.get<VehiclePerformance>(`/api/v2/cars/${vehicleId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle performance:', error);
      // Return mock data for now
      return {
        vehicleId,
        views: Math.floor(Math.random() * 1000) + 100,
        inquiries: Math.floor(Math.random() * 50) + 5,
        shares: Math.floor(Math.random() * 25) + 2,
        coListings: Math.floor(Math.random() * 5),
        avgTimeOnMarket: Math.floor(Math.random() * 30) + 7,
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        topLocations: ['Mumbai', 'Delhi', 'Bangalore'],
        dealerInterest: Math.floor(Math.random() * 100) + 20
      };
    }
  }

  // Feature/Unfeature vehicle (admin only)
  async featureVehicle(vehicleId: string, featured: boolean = true): Promise<Vehicle> {
    try {
      const response = await this.apiClient.post<Vehicle>(`/api/v2/cars/${vehicleId}/feature?featured=${featured}`);
      return response.data;
    } catch (error) {
      console.error('Error featuring vehicle:', error);
      throw error;
    }
  }

  // Co-list vehicle to groups
  async coListVehicle(vehicleId: string, groupIds: string[]): Promise<Vehicle> {
    try {
      // This would need custom endpoint implementation
      const response = await this.apiClient.post<Vehicle>(`/api/v2/cars/${vehicleId}/co-list`, { groupIds });
      return response.data;
    } catch (error) {
      console.error('Error co-listing vehicle:', error);
      throw error;
    }
  }

  // Remove co-listing from groups
  async removeCoListing(vehicleId: string, groupIds: string[]): Promise<Vehicle> {
    try {
      const response = await this.apiClient.delete<Vehicle>(`/api/v2/cars/${vehicleId}/co-list`, { data: { groupIds } });
      return response.data;
    } catch (error) {
      console.error('Error removing co-listing:', error);
      throw error;
    }
  }

  // Get co-listed vehicles for current dealer
  async getCoListedVehicles(): Promise<Vehicle[]> {
    try {
      const response = await this.apiClient.get<Vehicle[]>('/api/v2/cars/co-listed');
      return response.data;
    } catch (error) {
      console.error('Error fetching co-listed vehicles:', error);
      throw error;
    }
  }

  // Track vehicle view
  async trackVehicleView(vehicleId: string): Promise<void> {
    try {
      await this.apiClient.post(`/api/v2/cars/${vehicleId}/view`);
    } catch (error) {
      console.error('Error tracking view:', error);
      // Don't throw error for tracking - it's non-critical
    }
  }

  // Track vehicle share
  async trackVehicleShare(vehicleId: string, platform: string): Promise<void> {
    try {
      await this.apiClient.post(`/api/v2/cars/${vehicleId}/share`, { platform });
    } catch (error) {
      console.error('Error tracking share:', error);
      // Don't throw error for tracking - it's non-critical
    }
  }

  // Get similar vehicles
  async getSimilarVehicles(vehicleId: string, limit: number = 5): Promise<Vehicle[]> {
    try {
      const response = await this.apiClient.get<Vehicle[]>(`/api/v2/cars/${vehicleId}/similar?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar vehicles:', error);
      throw error;
    }
  }

  // Dealer Groups API
  async getAllGroups(): Promise<DealerGroup[]> {
    try {
      const response = await this.apiClient.get<DealerGroup[]>('/api/v2/groups');
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  async getGroupById(groupId: string): Promise<DealerGroup> {
    try {
      const response = await this.apiClient.get<DealerGroup>(`/api/v2/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  }

  async createGroup(groupData: Omit<DealerGroup, 'id' | 'createdAt' | 'members'>): Promise<DealerGroup> {
    try {
      const response = await this.apiClient.post<DealerGroup>('/api/v2/groups', groupData);
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async updateGroup(groupId: string, updates: Partial<DealerGroup>): Promise<DealerGroup> {
    try {
      const response = await this.apiClient.patch<DealerGroup>(`/api/v2/groups/${groupId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/api/v2/groups/${groupId}`);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  async inviteMember(groupId: string, dealerId: string): Promise<GroupInvitation> {
    try {
      const response = await this.apiClient.post<GroupInvitation>(`/api/v2/groups/${groupId}/invite`, { dealerId });
      return response.data;
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  async removeMember(groupId: string, memberId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/api/v2/groups/${groupId}/members/${memberId}`);
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  async acceptInvitation(invitationId: string): Promise<DealerGroup> {
    try {
      const response = await this.apiClient.post<DealerGroup>(`/api/v2/invitations/${invitationId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  async rejectInvitation(invitationId: string): Promise<void> {
    try {
      await this.apiClient.post(`/api/v2/invitations/${invitationId}/reject`);
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      throw error;
    }
  }

  async getMyInvitations(): Promise<GroupInvitation[]> {
    try {
      const response = await this.apiClient.get<GroupInvitation[]>('/api/v2/invitations/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }
  }

  async leaveGroup(groupId: string): Promise<void> {
    try {
      await this.apiClient.post(`/api/v2/groups/${groupId}/leave`);
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  // Messaging API
  async getConversations(): Promise<any[]> {
    try {
      const response = await this.apiClient.get('/api/v2/messages/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  async getChatMessages(dealerId: string, page: number = 0, size: number = 50): Promise<any[]> {
    try {
      const response = await this.apiClient.get(`/api/v2/messages/${dealerId}?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  async sendMessage(receiverId: string, message: string, type: string = 'text', attachments?: any[]): Promise<any> {
    try {
      const response = await this.apiClient.post('/api/v2/messages/send', {
        receiverId,
        message,
        type,
        attachments
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await this.apiClient.post(`/api/v2/messages/${messageId}/read`);
    } catch (error) {
      console.error('Error marking message as read:', error);
      // Non-critical error, don't throw
    }
  }

  // Notification API
  async getNotifications(page: number = 0, size: number = 20): Promise<any[]> {
    try {
      const response = await this.apiClient.get(`/api/v2/notifications?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await this.apiClient.post(`/api/v2/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Non-critical error, don't throw
    }
  }

  async updateNotificationSettings(settings: any): Promise<any> {
    try {
      const response = await this.apiClient.post('/api/v2/notifications/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const carApi = new CarApiService();
export default carApi;



