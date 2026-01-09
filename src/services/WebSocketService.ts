import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Message, UserStatus, TypingIndicator, UnreadCount, DeliveryStats } from './ChatApi';

// WebSocket message types
export interface WSMessage {
  type: 'MESSAGE' | 'MESSAGE_EDITED' | 'MESSAGE_DELETED' | 'MESSAGE_STATUS_UPDATE' |
  'TYPING_INDICATOR' | 'USER_STATUS_CHANGE' | 'UNREAD_COUNT_UPDATE' |
  'ERROR' | 'CONNECTION_STATUS' | 'DELIVERY_RECEIPT' | 'READ_RECEIPT';
  data: any;
  chatId?: number;
  userId?: number;
  timestamp: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  lastConnected?: Date;
  reconnectAttempts: number;
  error?: string;
}

export interface WebSocketConfig {
  reconnectDelay: number;
  maxReconnectAttempts: number;
  heartbeatIncoming: number;
  heartbeatOutgoing: number;
  debug: boolean;
}

type MessageHandler = (message: WSMessage) => void;
type ConnectionHandler = (status: ConnectionStatus) => void;
type ErrorHandler = (error: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private lastConnected?: Date;
  private reconnectTimer?: number;
  private pingInterval?: number;
  private subscriptions: Map<string, any> = new Map();

  private messageHandlers: MessageHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];

  private readonly config: WebSocketConfig = {
    reconnectDelay: 5000, // 5 seconds
    maxReconnectAttempts: 10,
    heartbeatIncoming: 10000, // 10 seconds
    heartbeatOutgoing: 10000, // 10 seconds
    debug: __DEV__,
  };

  // Base URL for WebSocket connection
  private readonly wsBaseUrl = __DEV__
    ? 'http://localhost:9000' : 'https://your-production-api.com';

  constructor() {
    // Defer client initialization until first connection attempt
    // This prevents WebSocket from being initialized before authentication
  }

  // =====================================
  // Connection Management
  // =====================================

  private async initializeClient(): Promise<void> {
    try {
      this.client = new Client({
        brokerURL: `${this.wsBaseUrl}/ws`,

        // Use SockJS as fallback for better compatibility
        webSocketFactory: () => {
          return new SockJS(`${this.wsBaseUrl}/ws`);
        },

        connectHeaders: await this.getConnectHeaders(),

        debug: (str: string) => {
          if (this.config.debug) {
            console.log('[WebSocket Debug]:', str);
          }
        },

        reconnectDelay: this.config.reconnectDelay,
        heartbeatIncoming: this.config.heartbeatIncoming,
        heartbeatOutgoing: this.config.heartbeatOutgoing,

        onConnect: this.onConnect.bind(this),
        onDisconnect: this.onDisconnect.bind(this),
        onStompError: this.onStompError.bind(this),
        onWebSocketError: this.onStompError.bind(this),
      });
    } catch (error) {
      console.error('Failed to initialize WebSocket client:', error);
      this.handleError(error);
    }
  }

  private async getConnectHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    try {
      const token = await AsyncStorage.getItem('@carworld_access_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token for WebSocket connection:', error);
    }

    // Add platform-specific headers
    if (Platform.OS === 'ios') {
      headers['User-Agent'] = 'CarWorld-iOS-WebSocket';
    } else if (Platform.OS === 'android') {
      headers['User-Agent'] = 'CarWorld-Android-WebSocket';
    }

    return headers;
  }

  async connect(): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    // Auth guard: Don't connect without a valid token
    // Retry token check up to 3 times with increasing delays
    let token = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      token = await AsyncStorage.getItem('@carworld_access_token');
      if (token) {
        break;
      }

      if (attempt < 3) {
        console.log(`[WebSocket] Token not found, retrying in ${attempt * 100}ms (attempt ${attempt}/3)`);
        await new Promise(resolve => setTimeout(resolve, attempt * 100));
      }
    }

    if (!token) {
      console.log('[WebSocket] Skipping connection - no auth token after 3 attempts');
      return;
    }

    this.isConnecting = true;
    this.notifyConnectionStatus();

    try {
      if (!this.client) {
        await this.initializeClient();
      }

      // Update connect headers with fresh token
      if (this.client) {
        this.client.connectHeaders = await this.getConnectHeaders();
        this.client.activate();
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnecting = false;
      this.handleError(error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.config.debug) {
      console.log('[WebSocket] Disconnecting...');
    }

    this.clearReconnectTimer();
    this.clearPingInterval();
    this.clearSubscriptions();

    if (this.client) {
      this.client.deactivate();
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.notifyConnectionStatus();
  }

  /**
   * Call this when access token is refreshed to update WebSocket connection
   */
  async onTokenRefresh(): Promise<void> {
    if (this.isConnected && this.client) {
      // Update headers with new token
      this.client.connectHeaders = await this.getConnectHeaders();
      console.log('[WebSocket] Token refreshed, headers updated');
    } else {
      // Try to reconnect with new token
      this.reconnectAttempts = 0;
      await this.connect();
    }
  }

  /**
   * Call this when authentication state changes
   * Only connects if user is authenticated and email is verified
   */
  async onAuthStateChange(isAuthenticated: boolean, emailVerified?: boolean): Promise<void> {
    if (this.config.debug) {
      console.log(`[WebSocket] Auth state changed - authenticated: ${isAuthenticated}, emailVerified: ${emailVerified}`);
    }

    if (isAuthenticated && emailVerified !== false) {
      // User is authenticated and email is verified (or verification status unknown)
      if (this.config.debug) {
        console.log('[WebSocket] User authenticated, connecting...');
      }

      // Add a small delay to ensure token is stored in AsyncStorage
      // This prevents race condition where WebSocket tries to connect before token is available
      setTimeout(async () => {
        await this.connect();
      }, 100);
    } else if (!isAuthenticated) {
      // User logged out or not authenticated - silently disconnect
      this.onLogout();
    } else if (emailVerified === false) {
      // User authenticated but email not verified - silently disconnect
      this.onLogout();
    }
  }

  /**
   * Call this on user logout to cleanup WebSocket
   */
  onLogout(): void {
    this.disconnect();
    this.client = null;
  }

  /**
   * Initialize WebSocket connection after successful login
   * This ensures WebSocket is only connected after auth is complete
   */
  async initializeAfterLogin(): Promise<void> {
    console.log('[WebSocket] Initializing after successful login...');

    // Wait a bit to ensure token is stored
    await new Promise(resolve => setTimeout(resolve, 200));

    // Check if we have a token before attempting connection
    const token = await AsyncStorage.getItem('@carworld_access_token');
    if (token) {
      console.log('[WebSocket] Token found, proceeding with connection');
      await this.connect();
    } else {
      console.warn('[WebSocket] No token found after login, skipping connection');
    }
  }

  // =====================================
  // Event Handlers
  // =====================================

  private onConnect(frame: any): void {
    console.log('WebSocket connected:', frame);

    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.lastConnected = new Date();

    this.clearReconnectTimer();
    this.startPingInterval();
    this.notifyConnectionStatus();

    // Re-subscribe to all active subscriptions
    this.resubscribeAll();
  }

  private onDisconnect(frame: any): void {
    console.log('WebSocket disconnected:', frame);

    this.isConnected = false;
    this.isConnecting = false;

    this.clearPingInterval();
    this.clearSubscriptions();
    this.notifyConnectionStatus();

    // Auto-reconnect if not intentionally disconnected
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private onStompError(error: any): void {
    console.error('WebSocket error:', error);

    this.isConnecting = false;
    this.handleError(error);

    if (!this.isConnected) {
      this.scheduleReconnect();
    }
  }

  // =====================================
  // Subscription Management
  // =====================================

  subscribeToChat(chatId: number): void {
    if (!this.isConnected || !this.client) {
      console.warn('Cannot subscribe to chat: WebSocket not connected');
      return;
    }

    const destination = `/topic/chat/${chatId}`;
    const subscriptionKey = `chat_${chatId}`;

    if (this.subscriptions.has(subscriptionKey)) {
      console.log(`Already subscribed to chat ${chatId}`);
      return;
    }

    try {
      const subscription = this.client.subscribe(destination, (message: any) => {
        this.handleChatMessage(chatId, message);
      });

      this.subscriptions.set(subscriptionKey, subscription);
      console.log(`Subscribed to chat ${chatId}`);
    } catch (error) {
      console.error(`Failed to subscribe to chat ${chatId}:`, error);
    }
  }

  unsubscribeFromChat(chatId: number): void {
    const subscriptionKey = `chat_${chatId}`;
    const subscription = this.subscriptions.get(subscriptionKey);

    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
      console.log(`Unsubscribed from chat ${chatId}`);
    }
  }

  subscribeToUserMessages(): void {
    if (!this.isConnected || !this.client) {
      console.warn('Cannot subscribe to user messages: WebSocket not connected');
      return;
    }

    const destination = '/user/queue/messages';
    const subscriptionKey = 'user_messages';

    if (this.subscriptions.has(subscriptionKey)) {
      return;
    }

    try {
      const subscription = this.client.subscribe(destination, (message: any) => {
        this.handleUserMessage(message);
      });

      this.subscriptions.set(subscriptionKey, subscription);
      console.log('Subscribed to user messages');
    } catch (error) {
      console.error('Failed to subscribe to user messages:', error);
    }
  }

  subscribeToUserStatus(): void {
    if (!this.isConnected || !this.client) {
      console.warn('Cannot subscribe to user status: WebSocket not connected');
      return;
    }

    const destination = '/topic/user-status';
    const subscriptionKey = 'user_status';

    if (this.subscriptions.has(subscriptionKey)) {
      return;
    }

    try {
      const subscription = this.client.subscribe(destination, (message: any) => {
        this.handleUserStatusUpdate(message);
      });

      this.subscriptions.set(subscriptionKey, subscription);
      console.log('Subscribed to user status updates');
    } catch (error) {
      console.error('Failed to subscribe to user status:', error);
    }
  }

  subscribeToTypingIndicators(chatId: number): void {
    if (!this.isConnected || !this.client) {
      console.warn('Cannot subscribe to typing indicators: WebSocket not connected');
      return;
    }

    const destination = `/topic/chat/${chatId}/typing`;
    const subscriptionKey = `typing_${chatId}`;

    if (this.subscriptions.has(subscriptionKey)) {
      return;
    }

    try {
      const subscription = this.client.subscribe(destination, (message: any) => {
        this.handleTypingIndicator(chatId, message);
      });

      this.subscriptions.set(subscriptionKey, subscription);
      console.log(`Subscribed to typing indicators for chat ${chatId}`);
    } catch (error) {
      console.error(`Failed to subscribe to typing indicators for chat ${chatId}:`, error);
    }
  }

  // =====================================
  // Message Sending
  // =====================================

  sendMessage(chatId: number, message: string, replyToId?: number): void {
    if (!this.isConnected || !this.client) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    try {
      this.client.publish({
        destination: `/app/chat/${chatId}/send`,
        body: JSON.stringify({
          content: message,
          messageType: 'TEXT',
          replyToId,
        }),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  editMessage(messageId: number, content: string): void {
    if (!this.isConnected || !this.client) {
      console.warn('Cannot edit message: WebSocket not connected');
      return;
    }

    try {
      this.client.publish({
        destination: `/app/message/${messageId}/edit`,
        body: JSON.stringify({
          content,
        }),
      });
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  }

  deleteMessage(messageId: number): void {
    if (!this.isConnected || !this.client) {
      console.warn('Cannot delete message: WebSocket not connected');
      return;
    }

    try {
      this.client.publish({
        destination: `/app/message/${messageId}/delete`,
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }

  markMessageAsRead(messageId: number): void {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      this.client.publish({
        destination: `/app/message/${messageId}/read`,
      });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }

  markMessageAsDelivered(messageId: number): void {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      this.client.publish({
        destination: `/app/message/${messageId}/delivered`,
      });
    } catch (error) {
      console.error('Failed to mark message as delivered:', error);
    }
  }

  markChatAsRead(chatId: number): void {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      this.client.publish({
        destination: `/app/chat/${chatId}/read`,
      });
    } catch (error) {
      console.error('Failed to mark chat as read:', error);
    }
  }

  sendTypingIndicator(chatId: number, isTyping: boolean): void {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      this.client.publish({
        destination: `/app/chat/${chatId}/typing`,
        body: JSON.stringify({
          isTyping,
        }),
      });
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  }

  // =====================================
  // Message Handlers
  // =====================================

  private handleChatMessage(chatId: number, stompMessage: any): void {
    try {
      const data = JSON.parse(stompMessage.body);

      const wsMessage: WSMessage = {
        type: 'MESSAGE',
        data,
        chatId,
        timestamp: new Date().toISOString(),
      };

      this.notifyMessageHandlers(wsMessage);
    } catch (error) {
      console.error('Failed to handle chat message:', error);
    }
  }

  private handleUserMessage(stompMessage: any): void {
    try {
      const data = JSON.parse(stompMessage.body);

      const wsMessage: WSMessage = {
        type: data.type || 'MESSAGE',
        data,
        timestamp: new Date().toISOString(),
      };

      this.notifyMessageHandlers(wsMessage);
    } catch (error) {
      console.error('Failed to handle user message:', error);
    }
  }

  private handleUserStatusUpdate(stompMessage: any): void {
    try {
      const data = JSON.parse(stompMessage.body);

      const wsMessage: WSMessage = {
        type: 'USER_STATUS_CHANGE',
        data,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };

      this.notifyMessageHandlers(wsMessage);
    } catch (error) {
      console.error('Failed to handle user status update:', error);
    }
  }

  private handleTypingIndicator(chatId: number, stompMessage: any): void {
    try {
      const data = JSON.parse(stompMessage.body);

      const wsMessage: WSMessage = {
        type: 'TYPING_INDICATOR',
        data,
        chatId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };

      this.notifyMessageHandlers(wsMessage);
    } catch (error) {
      console.error('Failed to handle typing indicator:', error);
    }
  }

  // =====================================
  // Event Handler Registration
  // =====================================

  onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  onConnectionChange(handler: ConnectionHandler): void {
    this.connectionHandlers.push(handler);
  }

  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  removeMessageHandler(handler: MessageHandler): void {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  removeConnectionHandler(handler: ConnectionHandler): void {
    const index = this.connectionHandlers.indexOf(handler);
    if (index > -1) {
      this.connectionHandlers.splice(index, 1);
    }
  }

  removeErrorHandler(handler: ErrorHandler): void {
    const index = this.errorHandlers.indexOf(handler);
    if (index > -1) {
      this.errorHandlers.splice(index, 1);
    }
  }

  // =====================================
  // Private Helper Methods
  // =====================================

  private notifyMessageHandlers(message: WSMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private notifyConnectionStatus(): void {
    const status: ConnectionStatus = {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      lastConnected: this.lastConnected,
      reconnectAttempts: this.reconnectAttempts,
    };

    this.connectionHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  private handleError(error: any): void {
    const status: ConnectionStatus = {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      lastConnected: this.lastConnected,
      reconnectAttempts: this.reconnectAttempts,
      error: error.message || 'Unknown WebSocket error',
    };

    this.connectionHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (handlerError) {
        console.error('Error in connection handler:', handlerError);
      }
    });

    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached. Giving up.');
      return;
    }

    this.clearReconnectTimer();

    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts); // Exponential backoff

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts + 1} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private startPingInterval(): void {
    this.clearPingInterval();

    // Send ping every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.client) {
        try {
          this.client.publish({
            destination: '/app/ping',
            body: JSON.stringify({ timestamp: Date.now() }),
          });
        } catch (error) {
          console.warn('Failed to send ping:', error);
        }
      }
    }, 30000);
  }

  private clearPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = undefined;
    }
  }

  private clearSubscriptions(): void {
    this.subscriptions.forEach(subscription => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing:', error);
      }
    });
    this.subscriptions.clear();
  }

  private resubscribeAll(): void {
    // This would typically be called after reconnection
    // to restore all active subscriptions
    console.log('WebSocket reconnected - subscriptions will be restored by components');
  }

  // =====================================
  // Public Getters
  // =====================================

  get connectionStatus(): ConnectionStatus {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      lastConnected: this.lastConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  get connected(): boolean {
    return this.isConnected;
  }

  // =====================================
  // Cleanup
  // =====================================

  destroy(): void {
    console.log('Destroying WebSocket service...');
    this.disconnect();
    this.messageHandlers.length = 0;
    this.connectionHandlers.length = 0;
    this.errorHandlers.length = 0;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;


