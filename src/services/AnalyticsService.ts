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
    sessionId: string; // Required by backend
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
const SESSION_AGGREGATION_INTERVAL_MS = 60000; // 1 minute for session aggregation

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
    private pendingEvents: Array<[AnalyticsEventType, TargetType | undefined, string | undefined, Record<string, any> | undefined]> = [];
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
    private retryCount: number = 0; // For exponential backoff
    private appStateTimer: ReturnType<typeof setTimeout> | null = null; // For debouncing app state

    // Session aggregation data
    private sessionAggregates: Map<string, number> = new Map();
    private lastAggregationTime: number = 0;

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

            // Process pending events
            if (this.pendingEvents.length > 0) {
                console.log(`[Analytics] Processing ${this.pendingEvents.length} pending events`);
                const pending = [...this.pendingEvents];
                this.pendingEvents = [];
                pending.forEach(([eventType, targetType, targetId, metadata]) => {
                    this.track(eventType, targetType, targetId, metadata);
                });
            }
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
        // Clear any pending state change timer
        if (this.appStateTimer) {
            clearTimeout(this.appStateTimer);
            this.appStateTimer = null;
        }

        // Debounce state changes (1s delay)
        this.appStateTimer = setTimeout(async () => {
            if (this.appState === 'active' && nextAppState.match(/inactive|background/)) {
                this.track('APP_BACKGROUND');

                // Stop the periodic flush timer when in background to save resources/network
                this.stopFlushTimer();

                // One final flush before sleeping
                await this.flush();
                await this.persistQueue();
            } else if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
                this.track('APP_FOREGROUND');

                // Restart only if we have events or previously failed
                if (this.eventQueue.length > 0) {
                    this.startFlushTimer();
                }
            }
            this.appState = nextAppState;
        }, 1000);
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
            this.pendingEvents.push([eventType, targetType, targetId, metadata]);
            return;
        }

        // Enhanced debouncing with 300-500ms window as requested
        const eventKey = `${eventType}_${targetType}_${targetId}`;
        const lastTime = this.recentEvents.get(eventKey);
        const now = Date.now();

        // Use 400ms as middle ground between 300-500ms requested
        const DEBOUNCE_WINDOW = 400;
        if (lastTime && now - lastTime < DEBOUNCE_WINDOW) {
            console.debug(`[Analytics] Debounced duplicate event: ${eventKey}`);
            return; // Skip duplicate
        }
        this.recentEvents.set(eventKey, now);

        // Clean old dedup entries
        if (this.recentEvents.size > 100) {
            const cutoff = now - 2000; // Keep entries for 2 seconds
            for (const [key, time] of this.recentEvents) {
                if (time < cutoff) this.recentEvents.delete(key);
            }
        }


        const event: AnalyticsEvent = {
            sessionId: this.sessionId, // Include sessionId in each event
            eventType,
            targetType,
            targetId,
            metadata: this.sanitizeMetadata(metadata),
            screenName: this.currentScreen,
            previousScreen: this.previousScreen,
            sessionDurationSeconds: Math.floor((now - this.sessionStart) / 1000),
            clientTimestamp: new Date().toISOString(),
        };

        // Apply session aggregation
        const aggregatedEvent = this.aggregateEvent(event);
        if (aggregatedEvent) {
            this.eventQueue.push(aggregatedEvent);

            // Enforce max queue size
            if (this.eventQueue.length > MAX_QUEUE_SIZE) {
                this.eventQueue = this.eventQueue.slice(-MAX_QUEUE_SIZE);
            }

            // Auto-flush if batch full
            // Auto-flush if batch full - ONLY if active or online
            if (this.eventQueue.length >= BATCH_SIZE && this.appState === 'active') {
                this.flush();
            } else if (this.eventQueue.length === 1 && this.appState === 'active') {
                // First event? Ensure timer is running
                this.startFlushTimer();
            }
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

    // =============== SESSION AGGREGATION ===============

    /**
     * Aggregate events within session to reduce server load
     * This implements session-based batching as requested
     */
    private aggregateEvent(event: AnalyticsEvent): AnalyticsEvent | null {
        const now = Date.now();
        const aggregateKey = `${event.eventType}_${event.targetType}_${event.targetId}`;

        // Check if we should aggregate this event type
        const shouldAggregate = [
            'CAR_VIEW', 'CAR_IMAGES_VIEW', 'CAR_IMAGES_SWIPE',
            'SEARCH_QUERY', 'SEARCH_SCROLL', 'SCREEN_VIEW'
        ].includes(event.eventType);

        if (!shouldAggregate) {
            return event; // Don't aggregate, send as-is
        }

        // Aggregate within 1-minute windows
        const timeWindow = Math.floor(now / SESSION_AGGREGATION_INTERVAL_MS);
        const windowKey = `${aggregateKey}_${timeWindow}`;

        const existingCount = this.sessionAggregates.get(windowKey) || 0;
        this.sessionAggregates.set(windowKey, existingCount + 1);

        // Clean old aggregates (older than 2 minutes)
        const cutoffWindow = Math.floor((now - 120000) / SESSION_AGGREGATION_INTERVAL_MS);
        for (const [key, count] of this.sessionAggregates) {
            const keyWindow = parseInt(key.split('_').pop() || '0');
            if (keyWindow < cutoffWindow) {
                this.sessionAggregates.delete(key);
            }
        }

        // Only send the first event of each type per window, with count
        if (existingCount === 0) {
            return {
                ...event,
                metadata: {
                    ...event.metadata,
                    aggregated: true,
                    count: 1
                }
            };
        }

        // Skip subsequent events in the same window
        console.debug(`[Analytics] Aggregated event: ${aggregateKey} (count: ${existingCount + 1})`);
        return null;
    }

    // =============== FLUSHING ===============

    async flush(): Promise<void> {
        // Guard against concurrent flushes
        if (this.isFlushing) return;

        // Throttle flushes
        const now = Date.now();
        if (now - this.lastFlushTime < MIN_FLUSH_INTERVAL_MS) return;

        if (this.eventQueue.length === 0) return;

        // Auth guard: Skip flush if no access token (user not logged in)
        const accessToken = await AsyncStorage.getItem('@carworld_access_token');
        if (!accessToken) {
            console.debug('[Analytics] Skipping flush - no auth token');
            await this.persistQueue(); // Save for later
            return;
        }

        if (!this.isOnline) {
            await this.persistQueue();
            return;
        }

        this.isFlushing = true;
        this.lastFlushTime = now;

        this.isFlushing = true;
        this.lastFlushTime = now;

        // Strict batch sizing to prevent backend overload
        const eventsToSend = this.eventQueue.slice(0, BATCH_SIZE);
        this.eventQueue = this.eventQueue.slice(BATCH_SIZE);

        try {
            await apiClient.post('/api/analytics/events', {
                sessionId: this.sessionId,
                ...this.deviceContext,
                events: eventsToSend,
            });

            console.log('[Analytics] Flushed', eventsToSend.length, 'events');

            // Reset retry count on success
            this.retryCount = 0;

            // Clear persisted queue on success
            await AsyncStorage.removeItem(STORAGE_QUEUE_KEY);

            // Chain flush if more events are pending
            if (this.eventQueue.length > 0) {
                setTimeout(() => this.flush(), 100);
            }
        } catch (error: any) {
            console.warn('[Analytics] Flush failed:', error?.message);

            // Re-queue events for retry
            this.eventQueue = [...eventsToSend, ...this.eventQueue].slice(-MAX_QUEUE_SIZE);
            await this.persistQueue();

            // Schedule retry with exponential backoff
            this.retryCount++;
            const backoffDelay = Math.min(RETRY_DELAY_MS * Math.pow(1.5, this.retryCount), 120000); // Max 2 min
            console.log(`[Analytics] Flush failed (attempt ${this.retryCount}), retrying in ${backoffDelay}ms`);

            setTimeout(() => this.flush(), backoffDelay);
        } finally {
            this.isFlushing = false;
            // Success? Reset retry count
            if (this.retryCount > 0 && this.eventQueue.length === 0) {
                this.retryCount = 0;
            }
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
                // Heal events with missing sessionId
                const healedEvents = events.map((e: AnalyticsEvent) => ({
                    ...e,
                    sessionId: e.sessionId || this.sessionId
                }));
                this.eventQueue = [...healedEvents, ...this.eventQueue].slice(-MAX_QUEUE_SIZE);
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

    getStats(): { queueSize: number; sessionAggregates: number; recentEvents: number; sessionId: string } {
        return {
            queueSize: this.eventQueue.length,
            sessionAggregates: this.sessionAggregates.size,
            recentEvents: this.recentEvents.size,
            sessionId: this.sessionId
        };
    }
}

export const AnalyticsService = new AnalyticsServiceClass();
