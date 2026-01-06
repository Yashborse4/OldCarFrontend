import { useEffect, useRef, useCallback } from 'react';
import { AnalyticsService, AnalyticsEventType, TargetType } from '../services/AnalyticsService';

/**
 * Hook for easy analytics tracking in components
 */
export function useAnalytics(screenName?: string) {
    const screenViewedRef = useRef(false);
    const viewStartTime = useRef<number>(0);

    // Track screen view on mount
    useEffect(() => {
        if (screenName && !screenViewedRef.current) {
            AnalyticsService.trackScreen(screenName);
            screenViewedRef.current = true;
        }
    }, [screenName]);

    /**
     * Track generic event
     */
    const track = useCallback((
        eventType: AnalyticsEventType,
        targetType?: TargetType,
        targetId?: string,
        metadata?: Record<string, any>
    ) => {
        AnalyticsService.track(eventType, targetType, targetId, metadata);
    }, []);

    /**
     * Track car view (call when entering car detail)
     */
    const trackCarView = useCallback((carId: string) => {
        viewStartTime.current = Date.now();
        AnalyticsService.trackCarView(carId);
    }, []);

    /**
     * Track car view end (call when leaving car detail)
     */
    const trackCarViewEnd = useCallback((carId: string) => {
        if (viewStartTime.current > 0) {
            const duration = Math.floor((Date.now() - viewStartTime.current) / 1000);
            AnalyticsService.trackCarViewDuration(carId, duration);
            viewStartTime.current = 0;
        }
    }, []);

    /**
     * Track car save/unsave
     */
    const trackCarSave = useCallback((carId: string, isSaved: boolean) => {
        AnalyticsService.trackCarSave(carId, isSaved);
    }, []);

    /**
     * Track car share
     */
    const trackCarShare = useCallback((carId: string, platform: string) => {
        AnalyticsService.trackCarShare(carId, platform);
    }, []);

    /**
     * Track contact click
     */
    const trackContactClick = useCallback((carId: string, type: 'call' | 'whatsapp' | 'chat') => {
        const eventType: AnalyticsEventType =
            type === 'call' ? 'CAR_CALL_CLICK' :
                type === 'whatsapp' ? 'CAR_WHATSAPP_CLICK' : 'CAR_CHAT_OPEN';
        AnalyticsService.track(eventType, 'CAR', carId);
    }, []);

    /**
     * Track search
     */
    const trackSearch = useCallback((query: string, resultCount: number) => {
        AnalyticsService.trackSearch(query, resultCount);
    }, []);

    /**
     * Track filter
     */
    const trackFilter = useCallback((filters: Record<string, any>) => {
        AnalyticsService.trackFilter(filters);
    }, []);

    /**
     * Track error
     */
    const trackError = useCallback((errorCode: string, errorMessage: string) => {
        AnalyticsService.trackError(errorCode, errorMessage);
    }, []);

    return {
        track,
        trackCarView,
        trackCarViewEnd,
        trackCarSave,
        trackCarShare,
        trackContactClick,
        trackSearch,
        trackFilter,
        trackError,
    };
}

/**
 * Hook for tracking car detail screen with automatic duration tracking
 */
export function useCarDetailAnalytics(carId: string) {
    const viewStartTime = useRef<number>(Date.now());

    useEffect(() => {
        // Track car view on mount
        AnalyticsService.trackCarView(carId);
        viewStartTime.current = Date.now();

        // Track duration on unmount
        return () => {
            const duration = Math.floor((Date.now() - viewStartTime.current) / 1000);
            AnalyticsService.trackCarViewDuration(carId, duration);
        };
    }, [carId]);

    const trackSpecsExpand = useCallback(() => {
        AnalyticsService.track('CAR_SPECS_EXPAND', 'CAR', carId);
    }, [carId]);

    const trackImagesView = useCallback((imageIndex: number) => {
        AnalyticsService.track('CAR_IMAGES_VIEW', 'CAR', carId, { imageIndex });
    }, [carId]);

    const trackSave = useCallback((isSaved: boolean) => {
        AnalyticsService.trackCarSave(carId, isSaved);
    }, [carId]);

    const trackShare = useCallback((platform: string) => {
        AnalyticsService.trackCarShare(carId, platform);
    }, [carId]);

    const trackCall = useCallback(() => {
        AnalyticsService.track('CAR_CALL_CLICK', 'CAR', carId);
    }, [carId]);

    const trackWhatsApp = useCallback(() => {
        AnalyticsService.track('CAR_WHATSAPP_CLICK', 'CAR', carId);
    }, [carId]);

    const trackChat = useCallback(() => {
        AnalyticsService.track('CAR_CHAT_OPEN', 'CAR', carId);
    }, [carId]);

    return {
        trackSpecsExpand,
        trackImagesView,
        trackSave,
        trackShare,
        trackCall,
        trackWhatsApp,
        trackChat,
    };
}
