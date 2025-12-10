import apiClient from './ApiClient';

// Chat-related types
export interface Chat {
  id: number;
  name: string;
  description?: string;
  type: 'PRIVATE' | 'GROUP' | 'DEALER_ONLY' | 'SELLER_ONLY' | 'SUPPORT' | 'CAR_INQUIRY';
  createdBy: {
    id: number;
    username: string;
  };
  isActive: boolean;
  maxParticipants?: number;
  carId?: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  participantCount?: number;
  unreadCount?: number;
  lastMessage?: Message;
}

export interface Message {
  id: number;
  chatId: number;
  sender?: {
    id: number;
    username: string;
  };
  content?: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'VOICE' | 'LOCATION' | 'CAR_REFERENCE' | 'USER_REFERENCE';
  replyTo?: {
    id: number;
    content: string;
    sender?: {
      id: number;
      username: string;
    };
  };
  isEdited: boolean;
  isDeleted: boolean;
  editedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  deliveryStatus?: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
}

export interface ChatParticipant {
  id: number;
  chatId: number;
  user: {
    id: number;
    username: string;
    role: string;
  };
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  isActive: boolean;
  joinedAt: string;
  leftAt?: string;
  lastReadAt?: string;
  notificationsEnabled: boolean;
  isMuted: boolean;
}

export interface UserStatus {
  userId: number;
  username: string;
  status: 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE';
  customStatus?: string;
  lastActiveAt: string;
  isTypingInChatId?: number;
}

export interface CreateChatRequest {
  name: string;
  description?: string;
  type: 'PRIVATE' | 'GROUP' | 'DEALER_ONLY' | 'SELLER_ONLY' | 'SUPPORT' | 'CAR_INQUIRY';
  maxParticipants?: number;
  carId?: number;
  participantIds?: number[];
}

export interface CreatePrivateChatRequest {
  otherUserId: number;
  name?: string;
}

export interface SendMessageRequest {
  content?: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'LOCATION';
  replyToId?: number;
  metadata?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface EditMessageRequest {
  content: string;
}

export interface AddParticipantRequest {
  userIds: number[];
}

export interface MessageStatusUpdate {
  messageId: number;
  status: 'DELIVERED' | 'READ';
}

export interface TypingIndicator {
  chatId: number;
  isTyping: boolean;
}

export interface DeliveryStats {
  messageId: number;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  readBy: {username: string; readAt: string}[];
  deliveredTo: {username: string; deliveredAt: string}[];
}

export interface UnreadCount {
  totalUnread: number;
  unreadByChat: {[chatId: string]: number};
}

export class ChatApi {
  
  // =====================================
  // Chat Management
  // =====================================
  
  /**
   * Get user's chats
   */
  async getMyChats(page: number = 0, size: number = 20): Promise<any> {
    const response = await apiClient.get<any>(`/api/v2/chat/rooms?page=${page}&size=${size}`);
    return response.data;
  }

  /**
   * Get chat details
   */
  async getChat(chatId: number): Promise<any> {
    const response = await apiClient.get<any>(
      `/api/v2/chat/rooms/${chatId}`
    );
    return response.data;
  }

  /**
   * Create a private chat
   */
  async createPrivateChat(request: CreatePrivateChatRequest): Promise<any> {
    const response = await apiClient.post<any>(
      '/api/v2/chat/private',
      request
    );
    return response.data;
  }

  /**
   * Create a group chat
   */
  async createGroupChat(request: CreateChatRequest): Promise<any> {
    const response = await apiClient.post<any>(
      '/api/v2/chat/group',
      request
    );
    return response.data;
  }

  /**
   * Add participants to chat
   */
  async addParticipants(chatId: number, request: AddParticipantRequest): Promise<void> {
    await apiClient.post(
      `/api/v2/chat/rooms/${chatId}/participants`,
      request
    );
  }

  /**
   * Remove participant from chat
   */
  async removeParticipant(chatId: number, userId: number): Promise<void> {
    await apiClient.delete(
      `/api/v2/chat/rooms/${chatId}/participants/${userId}`
    );
  }

  /**
   * Leave chat
   */
  async leaveChat(chatId: number): Promise<void> {
    await apiClient.post(`/api/v2/chat/rooms/${chatId}/leave`);
  }

  /**
   * Get chat participants
   */
  async getChatParticipants(chatId: number): Promise<any[]> {
    const response = await apiClient.get<any>(
      `/api/v2/chat/rooms/${chatId}/participants`
    );
    return response.data;
  }

  // =====================================
  // Message Management
  // =====================================

  /**
   * Get messages in chat with pagination
   */
  async getMessages(
    chatId: number, 
    page: number = 0, 
    size: number = 50
  ): Promise<any> {
    const response = await apiClient.get<any>(`/api/v2/chat/rooms/${chatId}/messages?page=${page}&size=${size}`);
    return response.data;
  }

  /**
   * Send message
   */
  async sendMessage(chatId: number, request: SendMessageRequest): Promise<any> {
    const response = await apiClient.post<any>(
      `/api/v2/chat/rooms/${chatId}/messages`,
      request
    );
    return response.data;
  }

  /**
   * Edit message
   */
  async editMessage(messageId: number, request: EditMessageRequest): Promise<any> {
    const response = await apiClient.put<any>(
      `/api/v2/chat/messages/${messageId}`,
      request
    );
    return response.data;
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: number): Promise<void> {
    await apiClient.delete(`/api/v2/chat/messages/${messageId}`);
  }

  /**
   * Search messages in chat
   */
  async searchMessages(
    chatId: number, 
    query: string, 
    page: number = 0, 
    size: number = 20
  ): Promise<any> {
    const response = await apiClient.get<any>(
      `/api/v2/chat/rooms/${chatId}/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
    );
    return response.data;
  }

  /**
   * Get media messages in chat
   */
  async getMediaMessages(chatId: number, page: number = 0, size: number = 20): Promise<any> {
    const response = await apiClient.get<any>(`/api/v2/chat/rooms/${chatId}/media?page=${page}&size=${size}`);
    return response.data;
  }

  // =====================================
  // Message Status & Delivery
  // =====================================

  /**
   * Mark messages as read
   */
  async markAsRead(chatId: number, messageIds?: number[]): Promise<void> {
    const body = messageIds ? { messageIds } : undefined;
    await apiClient.post(`/api/v2/chat/rooms/${chatId}/messages/read`, body);
  }

  /**
   * Mark message as delivered
   */
  async markAsDelivered(messageId: number): Promise<void> {
    await apiClient.post(`/api/v2/chat/messages/${messageId}/delivered`);
  }

  /**
   * Bulk mark messages as delivered
   */
  async bulkMarkAsDelivered(messageIds: number[]): Promise<void> {
    await apiClient.post('/api/v2/chat/messages/bulk-delivered', {
      messageIds
    });
  }

  /**
   * Get message delivery statistics
   */
  async getDeliveryStats(messageId: number): Promise<any> {
    const response = await apiClient.get<any>(
      `/api/v2/chat/messages/${messageId}/delivery-stats`
    );
    return response.data;
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId: number): Promise<any> {
    const response = await apiClient.get<any>(`/api/v2/chat/messages/${messageId}/status`);
    return response.data;
  }

  // =====================================
  // Unread Count & Notifications
  // =====================================

  /**
   * Get total unread count
   */
  async getUnreadCount(): Promise<any> {
    const response = await apiClient.get<any>(
      '/api/v2/chat/unread-count'
    );
    return response.data;
  }

  /**
   * Get unread count by chat
   */
  async getUnreadCountByChat(): Promise<any> {
    const response = await apiClient.get<any>(
      '/api/v2/chat/rooms/unread-count'
    );
    return response.data;
  }

  // =====================================
  // User Status & Presence
  // =====================================

  /**
   * Get online users in chat
   */
  async getOnlineUsers(chatId: number): Promise<any> {
    const response = await apiClient.get<any>(
      `/api/v2/chat/${chatId}/online-users`
    );
    return response.data;
  }

  /**
   * Update user status
   */
  async updateUserStatus(status: 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE', customStatus?: string): Promise<void> {
    await apiClient.post('/api/v2/chat/user-status', {
      status,
      customStatus
    });
  }

  // =====================================
  // File Upload (if needed)
  // =====================================

  /**
   * Upload file for message
   */
  async uploadFile(chatId: number, file: FormData): Promise<any> {
    const response = await apiClient.post<any>(`/api/v2/chat/rooms/${chatId}/messages/upload`, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // =====================================
  // Dealer & Seller Specific APIs
  // =====================================

  /**
   * Get dealer-only chats
   */
  async getDealerGroups(page: number = 0, size: number = 20): Promise<any> {
    const response = await apiClient.get<any>(`/api/v2/chat/dealer-groups?page=${page}&size=${size}`);
    return response.data;
  }

  /**
   * Create car inquiry chat
   */
  async createCarInquiryChat(carId: number, sellerId: number, message: string): Promise<any> {
    const response = await apiClient.post<any>(
      '/api/v2/chat/car-inquiry',
      {
        carId,
        sellerId,
        message
      }
    );
    return response.data;
  }

  /**
   * Get car-related chats
   */
  async getCarChats(carId: number): Promise<any> {
    const response = await apiClient.get<any>(
      `/api/v2/chat/car/${carId}`
    );
    return response.data;
  }

  // =====================================
  // Search & Discovery
  // =====================================

  /**
   * Search chats
   */
  async searchChats(query: string): Promise<any> {
    const response = await apiClient.get<any>(
      `/api/v2/chat/search?query=${encodeURIComponent(query)}`
    );
    return response.data;
  }

  /**
   * Get popular/featured chats
   */
  async getPopularChats(): Promise<any> {
    const response = await apiClient.get<any>(
      '/api/v2/chat/popular'
    );
    return response.data;
  }

  // =====================================
  // Analytics & Statistics
  // =====================================

  /**
   * Get chat statistics
   */
  async getChatStatistics(chatId: number): Promise<any> {
    const response = await apiClient.get<any>(`/api/v2/chat/${chatId}/statistics`);
    return response.data;
  }
}

// Export singleton instance
export const chatApi = new ChatApi();
export default chatApi;


