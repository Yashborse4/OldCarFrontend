import apiClient from './ApiClient';

// Chat-related types
export interface ChatRoomDto {
  id: number;
  name: string;
  description?: string;
  type: 'PRIVATE' | 'GROUP' | 'CAR_INQUIRY';
  createdBy: {
    id: number;
    username: string;
    displayName: string;
    email: string;
  };
  isActive: boolean;
  carId?: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  participantCount?: number;
  unreadCount?: number;
  lastMessage?: ChatMessageDto;
  maxParticipants?: number;

  // Inquiry specific fields
  status?: string;
  leadScore?: number;
  buyerName?: string;
  buyerPhone?: string;
  carInfo?: {
    id: number;
    title: string;
    price: number;
    imageUrl?: string;
  };
}

export interface ChatMessageDto {
  id: number;
  chatRoomId: number;
  sender?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string; // Frontend addition
  };
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'VOICE' | 'LOCATION' | 'CAR_REFERENCE' | 'USER_REFERENCE';
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  replyTo?: {
    id: number;
    content: string;
    senderUsername: string;
    messageType: string;
  };
  fileAttachment?: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
  deliveryStatus?: 'SENT' | 'DELIVERED' | 'READ';
}

export interface ChatParticipantDto {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    displayName: string;
  };
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  lastActivityAt?: string;
  isActive: boolean;
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
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'LOCATION' | 'CAR_REFERENCE' | 'USER_REFERENCE';
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
  readBy: { username: string; readAt: string }[];
  deliveredTo: { username: string; deliveredAt: string }[];
}

export interface UnreadCount {
  totalUnread: number;
  unreadByChat: { [chatId: string]: number };
}

export class ChatApi {

  // =====================================
  // Chat Management
  // =====================================

  /**
   * Get user's chats
   */
  async getMyChats(page: number = 0, size: number = 20): Promise<any> {
    const response = await apiClient.get<any>(`/api/chat/rooms?page=${page}&size=${size}`);
    return response.data;
  }

  /**
   * Get chat details
   */
  async getChat(chatId: number): Promise<any> {
    const response = await apiClient.get<any>(
      `/api/chat/rooms/${chatId}`
    );
    return response.data;
  }

  /**
   * Create a private chat
   */
  async createPrivateChat(request: CreatePrivateChatRequest): Promise<any> {
    const response = await apiClient.post<any>(
      '/api/chat/private',
      request
    );
    return response.data;
  }

  /**
   * Create a group chat
   */
  async createGroupChat(request: CreateChatRequest): Promise<any> {
    const response = await apiClient.post<any>(
      '/api/chat/group',
      request
    );
    return response.data;
  }

  /**
   * Add participants to chat
   */
  async addParticipants(chatId: number, request: AddParticipantRequest): Promise<void> {
    await apiClient.post(
      `/api/chat/rooms/${chatId}/participants`,
      request
    );
  }

  /**
   * Remove participant from chat
   */
  async removeParticipant(chatId: number, userId: number): Promise<void> {
    await apiClient.delete(
      `/api/chat/rooms/${chatId}/participants/${userId}`
    );
  }

  /**
   * Leave chat
   */
  async leaveChat(chatId: number): Promise<void> {
    await apiClient.post(`/api/chat/rooms/${chatId}/leave`);
  }

  /**
   * Get chat participants
   */
  async getChatParticipants(chatId: number): Promise<any[]> {
    const response = await apiClient.get<any>(
      `/api/chat/rooms/${chatId}/participants`
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
    const response = await apiClient.get<any>(`/api/chat/rooms/${chatId}/messages?page=${page}&size=${size}`);
    return response.data;
  }

  /**
   * Send message
   */
  async sendMessage(chatId: number, request: SendMessageRequest): Promise<any> {
    const response = await apiClient.post<any>(
      `/api/chat/rooms/${chatId}/messages`,
      request
    );
    return response.data;
  }

  /**
   * Edit message
   */
  async editMessage(messageId: number, request: EditMessageRequest): Promise<any> {
    const response = await apiClient.put<any>(
      `/api/chat/messages/${messageId}`,
      request
    );
    return response.data;
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
  ): Promise<any> {
    const response = await apiClient.get<any>(
      `/api/chat/rooms/${chatId}/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
    );
    return response.data;
  }

  /**
   * Get media messages in chat
   */
  async getMediaMessages(chatId: number, page: number = 0, size: number = 20): Promise<any> {
    const response = await apiClient.get<any>(`/api/chat/rooms/${chatId}/media?page=${page}&size=${size}`);
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
    await apiClient.post(`/api/chat/rooms/${chatId}/messages/read`, body);
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
  async getDeliveryStats(messageId: number): Promise<any> {
    const response = await apiClient.get<any>(
      `/api/chat/messages/${messageId}/delivery-stats`
    );
    return response.data;
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId: number): Promise<any> {
    const response = await apiClient.get<any>(`/api/chat/messages/${messageId}/status`);
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
      '/api/chat/unread-count'
    );
    return response.data;
  }

  /**
   * Get unread count by chat
   */
  async getUnreadCountByChat(): Promise<any> {
    const response = await apiClient.get<any>(
      '/api/chat/rooms/unread-count'
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
      `/api/chat/${chatId}/online-users`
    );
    return response.data;
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
  async uploadFile(chatId: number, file: FormData): Promise<any> {
    const response = await apiClient.post<any>(`/api/chat/rooms/${chatId}/messages/upload`, file, {
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
    const response = await apiClient.get<any>(`/api/chat/dealer-groups?page=${page}&size=${size}`);
    return response.data;
  }

  /**
   * Create car inquiry chat
   */
  async createCarInquiryChat(carId: number, message: string): Promise<any> {
    const response = await apiClient.post<any>(
      '/api/chat/car-inquiry',
      {
        carId,
        message
      }
    );
    // Force update
    return response.data;
  }

  /**
   * Get car-related chats
   */
  async getCarChats(carId: number): Promise<any> {
    const response = await apiClient.get<any>(
      `/api/chat/car/${carId}`
    );
    return response.data;
  }

  /**
   * Get dealer inquiries
   */
  async getDealerInquiries(status: string = 'ALL', page: number = 0, size: number = 20, query: string = ''): Promise<any> {
    const queryParam = query ? `&query=${encodeURIComponent(query)}` : '';
    const response = await apiClient.get<any>(`/api/chat/dealer/inquiries?status=${status}&page=${page}&size=${size}${queryParam}`);
    return response.data;
  }

  /**
   * Update inquiry status
   */
  async updateInquiryStatus(chatId: number, status: string): Promise<any> {
    const response = await apiClient.patch<any>(`/api/chat/rooms/${chatId}/inquiry/status?status=${status}`);
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
      `/api/chat/search?query=${encodeURIComponent(query)}`
    );
    return response.data;
  }

  /**
   * Get popular/featured chats
   */
  async getPopularChats(): Promise<any> {
    const response = await apiClient.get<any>(
      '/api/chat/popular'
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
    const response = await apiClient.get<any>(`/api/chat/${chatId}/statistics`);
    return response.data;
  }
}

// Export singleton instance
export const chatApi = new ChatApi();
export default chatApi;
