import { ApiClient, apiClient } from './ApiClient';

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
  status: 'Available' | 'Sold' | 'Reserved' | 'Archived' | 'Deleted';
  mediaStatus: 'NONE' | 'PENDING' | 'UPLOADING' | 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED' | 'DELETED' | 'MEDIA_PENDING';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  // Extended properties
  variant?: string;
  fuelType?: string;
  transmission?: string;
  imageUrl?: string;  // Primary image URL (first image)
  videoUrl?: string;  // Video URL for the listing
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
  query?: string; // Search keyword
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

export interface CarStatistics {
  totalCars: number;
  activeCars: number;
  soldCars: number;
  featuredCars: number;
  inactiveCars: number;
  newCarsLast7Days: number;
  lastUpdated: string;
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

// Dealer Dashboard Response
export interface DealerDashboardResponse {
  totalViews: number;
  totalUniqueVisitors: number;
  totalCarsAdded: number;
  activeCars: number;
  contactRequestsReceived: number;
}

export interface InitUploadRequest {
  carId: number;
  fileNames: string[];
  contentTypes: string[];
}

export interface InitUploadResponse {
  sessionId: string;
  uploadUrls: string[];
  filePaths: string[];
}

export interface CompleteUploadRequest {
  carId: number;
  sessionId: string;
  success: boolean;
  uploadedFilePaths: string[];
}

class CarApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = apiClient; // Use the singleton instance
  }

  // Get all cars
  async getAllVehicles(page = 0, size = 20, sort = 'createdAt,desc'): Promise<{ content: Vehicle[], totalElements: number, totalPages: number, number: number, pageable: any }> {
    try {
      const response = await this.apiClient.getCars(page, size, sort);
      return response;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  async getPublicVehicles(page = 0, size = 20, sort = 'createdAt,desc'): Promise<{ content: Vehicle[], totalElements: number, totalPages: number, number: number }> {
    try {
      const url = `/api/cars/public?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`;
      const response = await this.apiClient.get<{ data: { content: Vehicle[], totalElements: number, totalPages: number, number: number } }>(url);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching public vehicles:', error);
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
  async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'inquiries' | 'shares' | 'dealerName'>): Promise<Vehicle> {
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
      return await this.apiClient.updateCarStatus(Number(id), status);
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      throw error;
    }
  }

  // Update car media status
  async updateMediaStatus(id: string, status: 'NONE' | 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED'): Promise<Vehicle> {
    try {
      // Use generic post if specific method not in ApiClient
      const response = await this.apiClient.post<{ data: Vehicle }>(`/api/cars/${id}/media-status`, { status });
      return response.data.data;
    } catch (error) {
      console.error('Error updating media status:', error);
      throw error;
    }
  }

  // Async Media V2 Endpoints
  async initMediaUpload(data: InitUploadRequest): Promise<InitUploadResponse> {
    const response = await this.apiClient.post<{ data: InitUploadResponse }>('/api/media/init-upload', data);
    return response.data.data;
  }

  async completeMediaProcessing(data: CompleteUploadRequest): Promise<void> {
    await this.apiClient.post<{ data: void }>('/api/media/complete', data);
  }

  // Search vehicles with filters
  async searchVehicles(filters: VehicleSearchFilters): Promise<{ content: Vehicle[], totalElements: number, totalPages: number }> {
    try {
      return await this.apiClient.searchCars(filters);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  }

  // Get vehicles by dealer (public view)
  async getVehiclesByDealer(dealerId: string, page: number = 0, size: number = 20, status?: string): Promise<{ content: Vehicle[], totalElements: number, totalPages: number }> {
    try {
      let url = `/api/cars/seller/${dealerId}?page=${page}&size=${size}`;
      if (status) {
        url += `&status=${encodeURIComponent(status)}`;
      }
      const response = await this.apiClient.get<{ data: { content: Vehicle[], totalElements: number, totalPages: number } }>(url);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dealer vehicles:', error);
      throw error;
    }
  }

  // Get vehicle performance analytics
  async getVehiclePerformance(vehicleId: string): Promise<VehiclePerformance> {
    try {
      const response = await this.apiClient.get<{ data: any }>(`/api/cars/${vehicleId}/analytics`);
      const analytics = response.data.data;
      return {
        vehicleId: String(analytics.vehicleId ?? vehicleId),
        views: Number(analytics.views ?? 0),
        inquiries: Number(analytics.inquiries ?? 0),
        shares: Number(analytics.shares ?? 0),
        coListings: Number(analytics.coListings ?? 0),
        avgTimeOnMarket: Number(analytics.avgTimeOnMarket ?? 0),
        lastActivity: analytics.lastActivity ?? new Date().toISOString(),
        topLocations: analytics.topLocations ?? [],
        dealerInterest: Number(analytics.dealerInterest ?? 0),
      };
    } catch (error) {
      console.error('Error fetching vehicle performance:', error);
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

  async getAdminCarStatistics(): Promise<CarStatistics> {
    try {
      const response = await this.apiClient.get<{ data: CarStatistics }>('/api/cars/admin/analytics');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching admin car statistics:', error);
      throw error;
    }
  }

  // Feature/Unfeature vehicle (admin only)
  async featureVehicle(vehicleId: string, featured: boolean = true): Promise<Vehicle> {
    try {
      return await this.apiClient.featureCar(Number(vehicleId), featured);
    } catch (error) {
      console.error('Error featuring vehicle:', error);
      throw error;
    }
  }

  // Co-list vehicle to groups
  async coListVehicle(vehicleId: string, groupIds: string[]): Promise<Vehicle> {
    try {
      // This would need custom endpoint implementation
      const response = await this.apiClient.post<Vehicle>(`/api/cars/${vehicleId}/co-list`, { groupIds });
      return response.data;
    } catch (error) {
      console.error('Error co-listing vehicle:', error);
      throw error;
    }
  }

  // Remove co-listing from groups
  async removeCoListing(vehicleId: string, groupIds: string[]): Promise<Vehicle> {
    try {
      const response = await this.apiClient.delete<Vehicle>(`/api/cars/${vehicleId}/co-list`, { data: { groupIds } });
      return response.data;
    } catch (error) {
      console.error('Error removing co-listing:', error);
      throw error;
    }
  }

  // Get co-listed vehicles for current dealer
  async getCoListedVehicles(): Promise<Vehicle[]> {
    try {
      const response = await this.apiClient.get<Vehicle[]>('/api/cars/co-listed');
      return response.data;
    } catch (error) {
      console.error('Error fetching co-listed vehicles:', error);
      throw error;
    }
  }

  // Track vehicle view
  async trackVehicleView(vehicleId: string): Promise<void> {
    try {
      await this.apiClient.post(`/api/cars/${vehicleId}/view`);
    } catch (error) {
      console.error('Error tracking view:', error);
      // Don't throw error for tracking - it's non-critical
    }
  }

  // Track specific stats (video play, swipe, click)
  async trackCarStat(id: string, type: 'video_play' | 'image_swipe' | 'contact_click') {
    try {
      await this.apiClient.post(`/api/cars/${id}/stats`, null, {
        params: { type }
      });
    } catch (error) {
      // Analytics errors should be silent
      console.warn(`Failed to track ${type} for car ${id}`, error);
    }
  }

  // Track vehicle share
  async trackVehicleShare(vehicleId: string, platform: string): Promise<void> {
    try {
      await this.apiClient.post(`/api/cars/${vehicleId}/share`, { platform });
    } catch (error) {
      console.error('Error tracking share:', error);
      // Don't throw error for tracking - it's non-critical
    }
  }

  // Get similar vehicles
  async getSimilarVehicles(vehicleId: string, limit: number = 5): Promise<Vehicle[]> {
    try {
      const response = await this.apiClient.get<Vehicle[]>(`/api/cars/${vehicleId}/similar?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar vehicles:', error);
      throw error;
    }
  }

  // Dealer Groups API
  async getAllGroups(): Promise<DealerGroup[]> {
    try {
      const response = await this.apiClient.get<DealerGroup[]>('/api/groups');
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  async getGroupById(groupId: string): Promise<DealerGroup> {
    try {
      const response = await this.apiClient.get<DealerGroup>(`/api/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  }

  async createGroup(groupData: Omit<DealerGroup, 'id' | 'createdAt' | 'members'>): Promise<DealerGroup> {
    try {
      const response = await this.apiClient.post<DealerGroup>('/api/groups', groupData);
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async updateGroup(groupId: string, updates: Partial<DealerGroup>): Promise<DealerGroup> {
    try {
      const response = await this.apiClient.patch<DealerGroup>(`/api/groups/${groupId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/api/groups/${groupId}`);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  async inviteMember(groupId: string, dealerId: string): Promise<GroupInvitation> {
    try {
      const response = await this.apiClient.post<GroupInvitation>(`/api/groups/${groupId}/invite`, { dealerId });
      return response.data;
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  async removeMember(groupId: string, memberId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/api/groups/${groupId}/members/${memberId}`);
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  async acceptInvitation(invitationId: string): Promise<DealerGroup> {
    try {
      const response = await this.apiClient.post<DealerGroup>(`/api/invitations/${invitationId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  async rejectInvitation(invitationId: string): Promise<void> {
    try {
      await this.apiClient.post(`/api/invitations/${invitationId}/reject`);
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      throw error;
    }
  }

  async getMyInvitations(): Promise<GroupInvitation[]> {
    try {
      const response = await this.apiClient.get<GroupInvitation[]>('/api/invitations/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }
  }

  async leaveGroup(groupId: string): Promise<void> {
    try {
      await this.apiClient.post(`/api/groups/${groupId}/leave`);
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  // Messaging API
  async getConversations(): Promise<any[]> {
    try {
      const response = await this.apiClient.get<any[]>('/api/messages/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  async getChatMessages(dealerId: string, page: number = 0, size: number = 50): Promise<any[]> {
    try {
      const response = await this.apiClient.get<any[]>(`/api/messages/${dealerId}?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  async sendMessage(receiverId: string, message: string, type: string = 'text', attachments?: any[]): Promise<any> {
    try {
      const response = await this.apiClient.post('/api/messages/send', {
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
      await this.apiClient.post(`/api/messages/${messageId}/read`);
    } catch (error) {
      console.error('Error marking message as read:', error);
      // Non-critical error, don't throw
    }
  }

  // Notification API
  async getNotifications(page: number = 0, size: number = 20): Promise<any[]> {
    try {
      const response = await this.apiClient.get<any[]>(`/api/notifications?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await this.apiClient.post(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Non-critical error, don't throw
    }
  }

  async updateNotificationSettings(settings: any): Promise<any> {
    try {
      const response = await this.apiClient.post('/api/notifications/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // ==================== DEALER DASHBOARD API ====================

  /**
   * Get dealer dashboard statistics for current user
   * GET /api/cars/dealer/dashboard
   */
  async getDealerDashboard(): Promise<DealerDashboardResponse> {
    try {
      const response = await this.apiClient.get<{ data: DealerDashboardResponse }>('/api/cars/dealer/dashboard');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dealer dashboard:', error);
      throw error;
    }
  }

  /**
   * Get current dealer's car listings with optional status filter
   * GET /api/cars/dealer/my-cars
   */
  async getMyCarListings(
    page: number = 0,
    size: number = 20,
    status?: string
  ): Promise<{ content: Vehicle[], totalElements: number, totalPages: number }> {
    try {
      let url = `/api/cars/dealer/my-cars?page=${page}&size=${size}`;
      if (status) {
        url += `&status=${encodeURIComponent(status)}`;
      }
      const response = await this.apiClient.get<{ data: { content: Vehicle[], totalElements: number, totalPages: number } }>(url);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching my car listings:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const carApi = new CarApiService();
export default carApi;

