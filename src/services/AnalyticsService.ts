import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import { apiClient } from './ApiClient';

// =============== TYPES ===============

export type AnalyticsEventType =
    | 'CAR_VIEW' | 'CAR_VIEW_DURATION' | 'CAR_SPECS_EXPAND' | 'CAR_IMAGES_VIEW'
    | 'CAR_IMAGES_SWIPE' | 'CAR_SAVE' | 'CAR_UNSAVE' | 'CAR_SHARE'
    | 'CAR_CONTACT_CLICK' | 'CAR_CHAT_OPEN' | 'CAR_CALL_CLICK' | 'CAR_WHATSAPP_CLICK'
    | 'CAR_COMPARE_ADD' | 'CAR_TEST_DRIVE_REQUEST'
    | 'SCREEN_VIEW' | 'SCREEN_EXIT' | 'NAV_BACK' | 'NAV_TAB_SWITCH'
    | 'APP_OPEN' | 'APP_CLOSE' | 'APP_BACKGROUND' | 'APP_FOREGROUND'
    | 'SEARCH_QUERY' | 'SEARCH_FILTER_APPLY' | 'SEARCH_FILTER_CLEAR'
    | 'SEARCH_RESULT_CLICK' | 'SEARCH_NO_RESULTS' | 'SEARCH_SCROLL'
    | 'LOGIN' | 'LOGOUT' | 'SIGNUP' | 'SIGNUP_STEP'
    | 'PROFILE_VIEW' | 'PROFILE_EDIT' | 'SETTINGS_CHANGE'
    | 'DEALER_VIEW' | 'DEALER_CONTACT' | 'DEALER_CARS_VIEW'
    | 'FUNNEL_START' | 'FUNNEL_STEP' | 'FUNNEL_DROP' | 'FUNNEL_COMPLETE'
    | 'ERROR' | 'CRASH';

export type TargetType = 'CAR' | 'DEALER' | 'USER' | 'SCREEN' | 'SEARCH' | 'NOTIFICATION' | 'CHAT' | 'FUNNEL' | 'OTHER';

interface AnalyticsEvent {
    eventType: AnalyticsEventType;
    targetType?: TargetType;
    targetId?: string;
    metadata?: Record<string, any>;
    screenName?: string;
    previousScreen?: string;
    sessionDurationSeconds?: number;
    actionDurationSeconds?: number;
    clientTimestamp: string;
}

interface DeviceContext {
    deviceType: string;
    deviceModel: string;
    appVersion: string;
    osVersion: string;
    city?: string;
}

// =============== CONSTANTS ===============

const STORAGE_QUEUE_KEY = '@analytics_queue';
const STORAGE_SESSION_KEY = '@analytics_session';
const BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 30000; // 30 seconds
const MIN_FLUSH_INTERVAL_MS = 5000; // Minimum 5 seconds between flushes
const MAX_QUEUE_SIZE = 500; // Maximum events to store offline
const RETRY_DELAY_MS = 10000; // 10 seconds retry delay

/**
 * Analytics Service - Optimized for low-load batch insertion
 * 
 * Features:
 * - Session-based tracking with UUID
 * - Intelligent batching (50 events or 30s)
 * - Offline support with persistence
 * - Network-aware flushing
 * - Deduplication of rapid events
 * - Silent background operation
 */
class AnalyticsServiceClass {
    private sessionId: string = '';
    private sessionStart: number = 0;
    private eventQueue: AnalyticsEvent[] = [];
    private deviceContext: DeviceContext | null = null;
    private currentScreen: string = '';
    private previousScreen: string = '';
    private flushTimer: ReturnType<typeof setInterval> | null = null;
    private isInitialized: boolean = false;
    private isFlushing: boolean = false;
    private lastFlushTime: number = 0;
    private appState: AppStateStatus = 'active';
    private isOnline: boolean = true;
    private recentEvents: Map<string, number> = new Map(); // For deduplication

    // =============== INITIALIZATION ===============

    async initialize(city?: string): Promise<void> {
        if (this.isInitialized) return;

        try {
            this.sessionId = this.generateSessionId();
            this.sessionStart = Date.now();

            // Get device context
            this.deviceContext = {
                deviceType: Platform.OS,
                deviceModel: await DeviceInfo.getModel(),
                appVersion: DeviceInfo.getVersion(),
                osVersion: Platform.Version.toString(),
                city: city,
            };

            // Load persisted queue
            await this.loadPersistedQueue();

            // Start session on backend (non-blocking)
            this.startSessionAsync();

            // Setup flush timer
            this.startFlushTimer();

            // Listen to app state
            AppState.addEventListener('change', this.handleAppStateChange);

            // Listen to network state
            NetInfo.addEventListener(state => {
                const wasOffline = !this.isOnline;
                this.isOnline = state.isConnected ?? false;

                // Flush when coming back online
                if (wasOffline && this.isOnline && this.eventQueue.length > 0) {
                    console.log('[Analytics] Back online, flushing queue');
                    this.flush();
                }
            });

            this.isInitialized = true;
            console.log('[Analytics] Initialized. Session:', this.sessionId);
        } catch (error) {
            console.error('[Analytics] Init error:', error);
        }
    }

    private generateSessionId(): string {
        return `ses_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private async startSessionAsync(): Promise<void> {
        try {
            await apiClient.post('/api/analytics/session/start', {
                sessionId: this.sessionId,
                ...this.deviceContext,
                entryScreen: this.currentScreen || 'Unknown',
            });
        } catch (error) {
            // Silent fail - session will be created on first event batch
            console.debug('[Analytics] Session start deferred');
        }
    }

    async endSession(): Promise<void> {
        if (!this.isInitialized) return;

        try {
            await this.flush();

            await apiClient.post('/api/analytics/session/end', null, {
                params: { sessionId: this.sessionId, exitScreen: this.currentScreen },
            });

            this.stopFlushTimer();
            this.isInitialized = false;
            console.log('[Analytics] Session ended');
        } catch (error) {
            console.debug('[Analytics] Session end error:', error);
        }
    }

    // =============== APP STATE ===============

    private handleAppStateChange = async (nextAppState: AppStateStatus) => {
        if (this.appState === 'active' && nextAppState.match(/inactive|background/)) {
            this.track('APP_BACKGROUND');
            await this.flush();
            await this.persistQueue();
        } else if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
            this.track('APP_FOREGROUND');
        }
        this.appState = nextAppState;
    };

    // =============== TRACKING ===============

    track(
        eventType: AnalyticsEventType,
        targetType?: TargetType,
        targetId?: string,
        metadata?: Record<string, any>
    ): void {
        if (!this.isInitialized) {
            console.debug('[Analytics] Not initialized, queuing:', eventType);
        }

        // Deduplicate rapid identical events (within 500ms)
        const eventKey = `${eventType}_${targetType}_${targetId}`;
        const lastTime = this.recentEvents.get(eventKey);
        const now = Date.now();

        if (lastTime && now - lastTime < 500) {
            return; // Skip duplicate
        }
        this.recentEvents.set(eventKey, now);

        // Clean old dedup entries
        if (this.recentEvents.size > 100) {
            const cutoff = now - 1000;
            for (const [key, time] of this.recentEvents) {
                if (time < cutoff) this.recentEvents.delete(key);
            }
        }

        const event: AnalyticsEvent = {
            eventType,
            targetType,
            targetId,
            metadata: this.sanitizeMetadata(metadata),
            screenName: this.currentScreen,
            previousScreen: this.previousScreen,
            sessionDurationSeconds: Math.floor((now - this.sessionStart) / 1000),
            clientTimestamp: new Date().toISOString(),
        };

        this.eventQueue.push(event);

        // Enforce max queue size
        if (this.eventQueue.length > MAX_QUEUE_SIZE) {
            this.eventQueue = this.eventQueue.slice(-MAX_QUEUE_SIZE);
        }

        // Auto-flush if batch full
        if (this.eventQueue.length >= BATCH_SIZE) {
            this.flush();
        }
    }

    // =============== CONVENIENCE METHODS ===============

    trackScreen(screenName: string): void {
        this.previousScreen = this.currentScreen;
        this.currentScreen = screenName;
        this.track('SCREEN_VIEW', 'SCREEN', screenName);
    }

    trackCarView(carId: string): void {
        this.track('CAR_VIEW', 'CAR', carId);
    }

    trackCarViewDuration(carId: string, durationSeconds: number): void {
        if (durationSeconds > 0) {
            this.track('CAR_VIEW_DURATION', 'CAR', carId, { durationSeconds });
        }
    }

    trackCarSave(carId: string, isSaved: boolean): void {
        this.track(isSaved ? 'CAR_SAVE' : 'CAR_UNSAVE', 'CAR', carId);
    }

    trackCarShare(carId: string, platform: string): void {
        this.track('CAR_SHARE', 'CAR', carId, { platform });
    }

    trackCarContact(carId: string, type: 'call' | 'whatsapp' | 'chat'): void {
        const eventMap = { call: 'CAR_CALL_CLICK', whatsapp: 'CAR_WHATSAPP_CLICK', chat: 'CAR_CHAT_OPEN' };
        this.track(eventMap[type] as AnalyticsEventType, 'CAR', carId);
    }

    trackSearch(query: string, resultCount: number): void {
        this.track(resultCount === 0 ? 'SEARCH_NO_RESULTS' : 'SEARCH_QUERY', 'SEARCH', undefined,
            { query: query.substring(0, 100), resultCount });
    }

    trackFilter(filters: Record<string, any>): void {
        this.track('SEARCH_FILTER_APPLY', 'SEARCH', undefined, { filterKeys: Object.keys(filters) });
    }

    trackError(errorCode: string, errorMessage: string): void {
        this.track('ERROR', 'OTHER', errorCode, { message: errorMessage.substring(0, 200) });
    }

    // =============== FLUSHING ===============

    async flush(): Promise<void> {
        // Guard against concurrent flushes
        if (this.isFlushing) return;

        // Throttle flushes
        const now = Date.now();
        if (now - this.lastFlushTime < MIN_FLUSH_INTERVAL_MS) return;

        if (this.eventQueue.length === 0) return;
        if (!this.isOnline) {
            await this.persistQueue();
            return;
        }

        this.isFlushing = true;
        this.lastFlushTime = now;

        const eventsToSend = [...this.eventQueue];
        this.eventQueue = [];

        try {
            await apiClient.post('/api/analytics/events', {
                sessionId: this.sessionId,
                ...this.deviceContext,
                events: eventsToSend,
            });

            console.log('[Analytics] Flushed', eventsToSend.length, 'events');

            // Clear persisted queue on success
            await AsyncStorage.removeItem(STORAGE_QUEUE_KEY);
        } catch (error: any) {
            console.warn('[Analytics] Flush failed:', error?.message);

            // Re-queue events for retry
            this.eventQueue = [...eventsToSend, ...this.eventQueue].slice(-MAX_QUEUE_SIZE);
            await this.persistQueue();

            // Schedule retry
            setTimeout(() => this.flush(), RETRY_DELAY_MS);
        } finally {
            this.isFlushing = false;
        }
    }

    private startFlushTimer(): void {
        this.stopFlushTimer();
        this.flushTimer = setInterval(() => {
            if (this.eventQueue.length > 0 && this.isOnline) {
                this.flush();
            }
        }, FLUSH_INTERVAL_MS);
    }

    private stopFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }

    // =============== PERSISTENCE ===============

    private async persistQueue(): Promise<void> {
        try {
            if (this.eventQueue.length > 0) {
                await AsyncStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(this.eventQueue));
            }
        } catch (error) {
            console.debug('[Analytics] Persist error:', error);
        }
    }

    private async loadPersistedQueue(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_QUEUE_KEY);
            if (stored) {
                const events = JSON.parse(stored);
                this.eventQueue = [...events, ...this.eventQueue].slice(-MAX_QUEUE_SIZE);
                console.log('[Analytics] Loaded', events.length, 'persisted events');
            }
        } catch (error) {
            console.debug('[Analytics] Load error:', error);
        }
    }

    // =============== HELPERS ===============

    private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
        if (!metadata) return undefined;

        const sanitized = { ...metadata };
        // Remove PII
        delete sanitized.email;
        delete sanitized.phone;
        delete sanitized.password;
        delete sanitized.token;
        delete sanitized.name;
        delete sanitized.address;

        return sanitized;
    }

    getSessionId(): string {
        return this.sessionId;
    }

    getCurrentScreen(): string {
        return this.currentScreen;
    }

    getQueueSize(): number {
        return this.eventQueue.length;
    }
}

export const AnalyticsService = new AnalyticsServiceClass();
