import apiClient, {ApiSuccessResponse} from './ApiClient';

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
  async getMyChats(page: number = 0, size: number = 20): Promise<{
    content: Chat[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }> {
    const response = await apiClient.get<ApiSuccessResponse<{
      content: Chat[];
      totalElements: number;
      totalPages: number;
      page: number;
      size: number;
    }>>(`/api/chat/my-chats?page=${page}&size=${size}`);
    return response.data.data;
  }

  /**
   * Get chat details
   */
  async getChat(chatId: number): Promise<Chat> {
    const response = await apiClient.get<ApiSuccessResponse<Chat>>(
      `/api/chat/${chatId}`
    );
    return response.data.data;
  }

  /**
   * Create a private chat
   */
  async createPrivateChat(request: CreatePrivateChatRequest): Promise<Chat> {
    const response = await apiClient.post<ApiSuccessResponse<Chat>>(
      '/api/chat/private',
      request
    );
    return response.data.data;
  }

  /**
   * Create a group chat
   */
  async createGroupChat(request: CreateChatRequest): Promise<Chat> {
    const response = await apiClient.post<ApiSuccessResponse<Chat>>(
      '/api/chat/group',
      request
    );
    return response.data.data;
  }

  /**
   * Add participants to chat
   */
  async addParticipants(chatId: number, request: AddParticipantRequest): Promise<void> {
    await apiClient.post(
      `/api/chat/${chatId}/participants`,
      request
    );
  }

  /**
   * Remove participant from chat
   */
  async removeParticipant(chatId: number, userId: number): Promise<void> {
    await apiClient.delete(
      `/api/chat/${chatId}/participants/${userId}`
    );
  }

  /**
   * Leave chat
   */
  async leaveChat(chatId: number): Promise<void> {
    await apiClient.post(`/api/chat/${chatId}/leave`);
  }

  /**
   * Get chat participants
   */
  async getChatParticipants(chatId: number): Promise<ChatParticipant[]> {
    const response = await apiClient.get<ApiSuccessResponse<ChatParticipant[]>>(
      `/api/chat/${chatId}/participants`
    );
    return response.data.data;
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
  ): Promise<{
    content: Message[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }> {
    const response = await apiClient.get<ApiSuccessResponse<{
      content: Message[];
      totalElements: number;
      totalPages: number;
      page: number;
      size: number;
    }>>(`/api/chat/${chatId}/messages?page=${page}&size=${size}`);
    return response.data.data;
  }

  /**
   * Send message
   */
  async sendMessage(chatId: number, request: SendMessageRequest): Promise<Message> {
    const response = await apiClient.post<ApiSuccessResponse<Message>>(
      `/api/chat/${chatId}/messages`,
      request
    );
    return response.data.data;
  }

  /**
   * Edit message
   */
  async editMessage(messageId: number, request: EditMessageRequest): Promise<Message> {
    const response = await apiClient.put<ApiSuccessResponse<Message>>(
      `/api/chat/messages/${messageId}`,
      request
    );
    return response.data.data;
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: number): Promise<void> {
    await apiClient.delete(`/api/chat/messages/${messageId}`);
  }

  /**
   * Search messages in chat
   */
  async searchMessages(
    chatId: number, 
    query: string, 
    page: number = 0, 
    size: number = 20
  ): Promise<{
    content: Message[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await apiClient.get<ApiSuccessResponse<{
      content: Message[];
      totalElements: number;
      totalPages: number;
    }>>(
      `/api/chat/${chatId}/messages/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
    );
    return response.data.data;
  }

  /**
   * Get media messages in chat
   */
  async getMediaMessages(chatId: number, page: number = 0, size: number = 20): Promise<{
    content: Message[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await apiClient.get<ApiSuccessResponse<{
      content: Message[];
      totalElements: number;
      totalPages: number;
    }>>(`/api/chat/${chatId}/media?page=${page}&size=${size}`);
    return response.data.data;
  }

  // =====================================
  // Message Status & Delivery
  // =====================================

  /**
   * Mark messages as read
   */
  async markAsRead(chatId: number, messageIds?: number[]): Promise<void> {
    const body = messageIds ? { messageIds } : undefined;
    await apiClient.post(`/api/chat/${chatId}/mark-read`, body);
  }

  /**
   * Mark message as delivered
   */
  async markAsDelivered(messageId: number): Promise<void> {
    await apiClient.post(`/api/chat/messages/${messageId}/delivered`);
  }

  /**
   * Bulk mark messages as delivered
   */
  async bulkMarkAsDelivered(messageIds: number[]): Promise<void> {
    await apiClient.post('/api/chat/messages/bulk-delivered', {
      messageIds
    });
  }

  /**
   * Get message delivery statistics
   */
  async getDeliveryStats(messageId: number): Promise<DeliveryStats> {
    const response = await apiClient.get<ApiSuccessResponse<DeliveryStats>>(
      `/api/chat/messages/${messageId}/delivery-stats`
    );
    return response.data.data;
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId: number): Promise<{
    messageId: number;
    statuses: {
      userId: number;
      username: string;
      status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
      timestamp: string;
    }[];
  }> {
    const response = await apiClient.get<ApiSuccessResponse<{
      messageId: number;
      statuses: {
        userId: number;
        username: string;
        status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
        timestamp: string;
      }[];
    }>>(`/api/chat/messages/${messageId}/status`);
    return response.data.data;
  }

  // =====================================
  // Unread Count & Notifications
  // =====================================

  /**
   * Get total unread count
   */
  async getUnreadCount(): Promise<UnreadCount> {
    const response = await apiClient.get<ApiSuccessResponse<UnreadCount>>(
      '/api/chat/unread-count'
    );
    return response.data.data;
  }

  /**
   * Get unread count by chat
   */
  async getUnreadCountByChat(): Promise<{[chatId: string]: number}> {
    const response = await apiClient.get<ApiSuccessResponse<{[chatId: string]: number}>>(
      '/api/chat/unread-count/by-chat'
    );
    return response.data.data;
  }

  // =====================================
  // User Status & Presence
  // =====================================

  /**
   * Get online users in chat
   */
  async getOnlineUsers(chatId: number): Promise<UserStatus[]> {
    const response = await apiClient.get<ApiSuccessResponse<UserStatus[]>>(
      `/api/chat/${chatId}/online-users`
    );
    return response.data.data;
  }

  /**
   * Update user status
   */
  async updateUserStatus(status: 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE', customStatus?: string): Promise<void> {
    await apiClient.post('/api/chat/user-status', {
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
  async uploadFile(file: FormData): Promise<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }> {
    const response = await apiClient.post<ApiSuccessResponse<{
      fileUrl: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
    }>>('/api/chat/upload', file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // =====================================
  // Dealer & Seller Specific APIs
  // =====================================

  /**
   * Get dealer-only chats
   */
  async getDealerChats(): Promise<Chat[]> {
    const response = await apiClient.get<ApiSuccessResponse<Chat[]>>(
      '/api/dealer/chats'
    );
    return response.data.data;
  }

  /**
   * Get seller-specific chats
   */
  async getSellerChats(): Promise<Chat[]> {
    const response = await apiClient.get<ApiSuccessResponse<Chat[]>>(
      '/api/seller/chats'
    );
    return response.data.data;
  }

  /**
   * Create car inquiry chat
   */
  async createCarInquiryChat(carId: number, sellerId: number, message: string): Promise<Chat> {
    const response = await apiClient.post<ApiSuccessResponse<Chat>>(
      '/api/chat/car-inquiry',
      {
        carId,
        sellerId,
        message
      }
    );
    return response.data.data;
  }

  /**
   * Get car-related chats
   */
  async getCarChats(carId: number): Promise<Chat[]> {
    const response = await apiClient.get<ApiSuccessResponse<Chat[]>>(
      `/api/chat/car/${carId}`
    );
    return response.data.data;
  }

  // =====================================
  // Search & Discovery
  // =====================================

  /**
   * Search chats
   */
  async searchChats(query: string): Promise<Chat[]> {
    const response = await apiClient.get<ApiSuccessResponse<Chat[]>>(
      `/api/chat/search?query=${encodeURIComponent(query)}`
    );
    return response.data.data;
  }

  /**
   * Get popular/featured chats
   */
  async getPopularChats(): Promise<Chat[]> {
    const response = await apiClient.get<ApiSuccessResponse<Chat[]>>(
      '/api/chat/popular'
    );
    return response.data.data;
  }

  // =====================================
  // Analytics & Statistics
  // =====================================

  /**
   * Get chat statistics
   */
  async getChatStatistics(chatId: number): Promise<{
    totalMessages: number;
    totalParticipants: number;
    activeParticipants: number;
    messagesByType: {[type: string]: number};
    activityByDay: {[date: string]: number};
  }> {
    const response = await apiClient.get<ApiSuccessResponse<{
      totalMessages: number;
      totalParticipants: number;
      activeParticipants: number;
      messagesByType: {[type: string]: number};
      activityByDay: {[date: string]: number};
    }>>(`/api/chat/${chatId}/statistics`);
    return response.data.data;
  }
}

// Export singleton instance
export const chatApi = new ChatApi();
export default chatApi;
