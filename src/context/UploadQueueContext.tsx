/**
 * UploadQueueContext
 * 
 * Manages background upload queue for car media (images/videos).
 * 
 * Features:
 * - Queue management for pending uploads
 * - Background compression and upload with fallback strategies
 * - Progress tracking with detailed status
 * - Retry logic with exponential backoff
 * - Security validation (MIME types, file sizes, path sanitization)
 * - Automatic cleanup of temporary files
 * - Partial success tracking for resume capability
 * 
 * @version 2.0.0
 */

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
    useRef,
    useEffect,
} from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'react-native-compressor';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import { carApi } from '../services/CarApi';
import apiClient from '../services/ApiClient';
import {
    validateImage,
    validateVideo,
    validateImageCount,
    validateCarId,
    sanitizePath,
    // escapePathForFFmpeg, // Not needed anymore
    categorizeError,
    getRetryDelay,
    withTimeout,
    getErrorMessage,
    MAX_IMAGES_PER_CAR,
    MAX_RETRIES,
    UPLOAD_TIMEOUT_MS,
    COMPRESSION_TIMEOUT_MS,

    MAX_COMPRESSED_IMAGE_SIZE,
    MAX_COMPRESSED_VIDEO_SIZE,
    UploadErrorType,
} from '../utils/uploadValidation';

// ==================== TYPES ====================

export interface SelectedImage {
    uri: string;
    fileName?: string;
    type?: string;
    fileSize?: number;
    width?: number;
    height?: number;
}

export interface VideoAsset {
    uri: string;
    fileName?: string;
    type?: string;
    fileSize?: number;
    duration?: number;
}

export type UploadStatus =
    | 'pending'
    | 'validating'
    | 'compressing'
    | 'uploading'
    | 'completed'
    | 'failed'
    | 'partial';

export interface UploadTask {
    carId: string;
    status: UploadStatus;
    progress: number; // 0-100
    error?: string;
    errorType?: UploadErrorType;
    images: SelectedImage[];
    video: VideoAsset | null;
    retryCount: number;
    // Partial success tracking
    uploadedImageUrls: string[];
    failedImageIndices: number[];
    videoUploaded: boolean;
    // Timestamps
    startedAt?: number;
    completedAt?: number;
}

interface UploadQueueContextType {
    uploads: Map<string, UploadTask>;
    addToQueue: (carId: string, images: SelectedImage[], video: VideoAsset | null) => Promise<boolean>;
    retryUpload: (carId: string) => void;
    cancelUpload: (carId: string) => void;
    getUploadStatus: (carId: string) => UploadTask | undefined;
    removeFromQueue: (carId: string) => void;
    getQueuedCount: () => number;
}

const UploadQueueContext = createContext<UploadQueueContextType | undefined>(undefined);

interface UploadQueueProviderProps {
    children: ReactNode;
}

// ==================== COMPRESSION QUALITY LEVELS ====================

/** Compression quality presets for fallback strategy */
const COMPRESSION_LEVELS = {
    high: { width: 1920, height: 1080, quality: 85 },
    medium: { width: 1280, height: 720, quality: 70 },
    low: { width: 1024, height: 576, quality: 60 },
};

// ==================== PROVIDER COMPONENT ====================

const PERSISTENCE_KEY = 'car_upload_queue_v2';

export const UploadQueueProvider: React.FC<UploadQueueProviderProps> = ({ children }) => {
    const [uploads, setUploads] = useState<Map<string, UploadTask>>(new Map());
    const [isLoaded, setIsLoaded] = useState(false);
    const processingRef = useRef<Set<string>>(new Set());
    const tempFilesRef = useRef<Map<string, string[]>>(new Map());
    const abortControllerRef = useRef<Map<string, AbortController>>(new Map());

    // Load queue on mount
    useEffect(() => {
        const loadQueue = async () => {
            try {
                const json = await AsyncStorage.getItem(PERSISTENCE_KEY);
                if (json) {
                    const entries = JSON.parse(json);
                    const map = new Map<string, UploadTask>(entries);

                    // Resume interrupted tasks
                    map.forEach((task, carId) => {
                        // If it was in an active state, reset to pending to auto-retry
                        if (['uploading', 'compressing', 'validating'].includes(task.status)) {
                            console.log(`Resuming interrupted upload for car ${carId}`);
                            task.status = 'pending';
                            // We will process it shortly, but first set state
                        }
                    });

                    setUploads(map);

                    // Trigger processing for pending tasks after state update
                    setTimeout(() => {
                        map.forEach((task, carId) => {
                            if (task.status === 'pending' && !processingRef.current.has(carId)) {
                                processUpload(task);
                            }
                        });
                    }, 1000);
                }
            } catch (error) {
                console.error('Failed to load upload queue:', error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadQueue();
    }, []);

    // Save queue on change
    useEffect(() => {
        if (!isLoaded) return;

        const saveQueue = async () => {
            try {
                const entries = Array.from(uploads.entries());
                await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(entries));
            } catch (error) {
                console.error('Failed to save upload queue:', error);
            }
        };

        // Debounce slightly? No, safety first.
        saveQueue();
    }, [uploads, isLoaded]);

    /**
     * Cleanup temporary files for a specific car upload
     */
    const cleanupTempFiles = useCallback(async (carId: string) => {
        const files = tempFilesRef.current.get(carId) || [];
        for (const filePath of files) {
            try {
                const cleanPath = filePath.replace(/^file:\/\//, '');
                const exists = await RNFS.exists(cleanPath);
                if (exists) {
                    await RNFS.unlink(cleanPath);
                    console.log('Cleaned up temp file:', cleanPath);
                }
            } catch (error) {
                console.warn('Failed to cleanup temp file:', filePath, error);
            }
        }
        tempFilesRef.current.delete(carId);
    }, []);

    /**
     * Track a temporary file for later cleanup
     */
    const trackTempFile = useCallback((carId: string, filePath: string) => {
        const existing = tempFilesRef.current.get(carId) || [];
        tempFilesRef.current.set(carId, [...existing, filePath]);
    }, []);

    /**
     * Update a single task in the uploads map
     */
    const updateTask = useCallback((carId: string, updates: Partial<UploadTask>) => {
        setUploads(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(carId);
            if (existing) {
                newMap.set(carId, { ...existing, ...updates });
            }
            return newMap;
        });
    }, []);

    /**
     * Compress a single image with fallback quality levels
     */
    const compressImageWithFallback = async (
        image: SelectedImage,
        index: number,
        carId: string,
    ): Promise<SelectedImage | null> => {
        const levels = ['high', 'medium', 'low'] as const;

        for (const level of levels) {
            const config = COMPRESSION_LEVELS[level];
            try {
                const sanitizedUri = sanitizePath(image.uri);

                const resized = await ImageResizer.createResizedImage(
                    sanitizedUri,
                    config.width,
                    config.height,
                    'JPEG',
                    config.quality,
                    0,
                    undefined,
                    false
                );

                // Verify the compressed file
                const cleanUri = resized.uri.replace(/^file:\/\//, '');
                const stat = await RNFS.stat(cleanUri);

                // Track for cleanup
                trackTempFile(carId, resized.uri);

                // Check if size is acceptable
                if (stat.size <= MAX_COMPRESSED_IMAGE_SIZE) {
                    console.log(`Image ${index} compressed at ${level} quality: ${(stat.size / 1024).toFixed(0)}KB`);
                    return {
                        uri: resized.uri,
                        fileName: resized.name || `image_${Date.now()}_${index}.jpg`,
                        type: 'image/jpeg',
                        fileSize: stat.size,
                        width: resized.width,
                        height: resized.height,
                    };
                }

                console.log(`Image ${index} at ${level} quality still too large (${(stat.size / 1024).toFixed(0)}KB), trying lower quality`);
            } catch (error) {
                console.warn(`Image ${index} compression at ${level} quality failed:`, error);
            }
        }

        console.error(`Image ${index} failed all compression attempts`);
        return null;
    };

    /**
     * Compress all images with progress tracking
     */
    const compressImages = async (
        images: SelectedImage[],
        carId: string,
        onProgress: (progress: number) => void
    ): Promise<{ compressed: SelectedImage[]; failedIndices: number[] }> => {
        const compressed: SelectedImage[] = [];
        const failedIndices: number[] = [];
        const totalImages = images.length;

        for (let i = 0; i < images.length; i++) {
            const image = images[i];

            // Validate image before compression
            const validation = validateImage(image);
            if (!validation.valid) {
                console.warn(`Skipping invalid image ${i}: ${validation.error}`);
                failedIndices.push(i);
                onProgress(((i + 1) / totalImages) * 100);
                continue;
            }

            const result = await compressImageWithFallback(image, i, carId);
            if (result) {
                compressed.push(result);
            } else {
                failedIndices.push(i);
            }

            onProgress(((i + 1) / totalImages) * 100);
        }

        return { compressed, failedIndices };
    };

    /**
     * Compress video with fallback strategy
     */
    const compressVideo = async (
        video: VideoAsset,
        carId: string,
        onProgress: (progress: number) => void
    ): Promise<VideoAsset | null> => {
        // Validate video first
        const validation = validateVideo(video);
        if (!validation.valid) {
            console.error('Video validation failed:', validation.error);
            throw new Error(validation.error);
        }


        const sanitizedUri = sanitizePath(video.uri);
        const timestamp = Date.now();

        // Try high quality first, then lower
        const qualityPresets = [
            { crf: 28, preset: 'fast', scale: 1280 },      // High quality
            { crf: 30, preset: 'veryfast', scale: 1024 },  // Medium quality
            { crf: 32, preset: 'ultrafast', scale: 854 },  // Low quality
        ];

        for (let i = 0; i < qualityPresets.length; i++) {
            const { crf, preset, scale } = qualityPresets[i];
            const outputPath = `${RNFS.CachesDirectoryPath}/video_${timestamp}_q${i}.mp4`;

            try {
                try {
                    // Map presets to react-native-compressor options
                    // High: 1080p, higher bitrate
                    // Medium: 720p, medium bitrate
                    // Low: 480p, lower bitrate

                    let compressConfig: any = {};

                    if (i === 0) { // High
                        compressConfig = {
                            compressionMethod: 'manual',
                            maxWidth: 1920,
                            maxHeight: 1080,
                            bitrate: 4000000, // 4Mbps
                        };
                    } else if (i === 1) { // Medium 
                        compressConfig = {
                            compressionMethod: 'manual',
                            maxWidth: 1280,
                            maxHeight: 720,
                            bitrate: 2000000, // 2Mbps
                        };
                    } else { // Low
                        compressConfig = {
                            compressionMethod: 'manual',
                            maxWidth: 854,
                            maxHeight: 480,
                            bitrate: 1000000, // 1Mbps
                        };
                    }

                    console.log(`Attempting video compression with preset ${i + 1}/${qualityPresets.length}`);

                    // react-native-compressor returns the file path on success
                    const compressedUri = await withTimeout(
                        Video.compress(
                            video.uri,
                            compressConfig,
                            (progress) => {
                                // progress is 0-1
                                onProgress(((i / qualityPresets.length) * 50) + (progress * (50 / qualityPresets.length)));
                            }
                        ),
                        COMPRESSION_TIMEOUT_MS,
                        'Video compression'
                    );

                    if (compressedUri) {
                        const cleanPath = compressedUri.replace('file://', '');
                        const stat = await RNFS.stat(cleanPath);

                        // STRICT VALIDATION: Check if compressed size is within limits (70MB)
                        if (stat.size > MAX_COMPRESSED_VIDEO_SIZE) {
                            console.log(`Video preset ${i + 1} produced ${stat.size} bytes, exceeding limit ${MAX_COMPRESSED_VIDEO_SIZE}. Trying lower quality.`);
                            await RNFS.unlink(cleanPath).catch(() => { });
                            onProgress(((i + 1) / qualityPresets.length) * 50);
                            continue;
                        }

                        const finalUri = `file://${cleanPath}`;

                        trackTempFile(carId, finalUri);
                        onProgress(100);

                        console.log(`Video compressed successfully at quality level ${i + 1}: ${(stat.size / (1024 * 1024)).toFixed(1)}MB`);

                        return {
                            uri: finalUri,
                            fileName: `video_${timestamp}.mp4`,
                            type: 'video/mp4',
                            fileSize: stat.size,
                            duration: video.duration,
                        };
                    }
                } catch (error) {
                    console.warn(`Video compression attempt ${i + 1} failed:`, error);

                }
            } catch (error) {
                console.warn(`Video compression attempt ${i + 1} failed:`, error);
                // Clean up failed output file
                try {
                    await RNFS.unlink(outputPath);
                } catch { }
            }

            onProgress(((i + 1) / qualityPresets.length) * 50);
        }

        console.error('Video compression failed at all quality levels');
        return null;
    };

    /**
     * Upload images to server with progress tracking
     */
    const uploadImages = async (
        images: SelectedImage[],
        carId: string,
        onProgress: (progress: number) => void
    ): Promise<string[]> => {
        if (images.length === 0) return [];

        const form = new FormData();
        images.forEach((image, index) => {
            const uri = Platform.OS === 'ios'
                ? image.uri.replace('file://', '')
                : image.uri;

            form.append('images', {
                uri: sanitizePath(uri),
                type: image.type || 'image/jpeg',
                name: image.fileName || `image_${index}_${Date.now()}.jpg`,
            } as any);
        });

        form.append('carId', carId);
        form.append('folder', `cars/${carId}/images`); // Kept for safety, though controller infers it

        const response = await withTimeout(
            apiClient.post<any>('/api/files/upload/car-images', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
            UPLOAD_TIMEOUT_MS * images.length,
            'Image upload'
        );

        onProgress(100);

        const responses = response.data.uploadedImages || response.data.data?.uploadedImages || [];
        return responses.map((r: any) => r.fileUrl || r.url);
    };

    /**
     * Upload video to server with progress tracking
     */
    const uploadVideo = async (
        video: VideoAsset,
        carId: string,
        onProgress: (progress: number) => void
    ): Promise<string> => {
        const form = new FormData();
        const uri = Platform.OS === 'ios'
            ? video.uri.replace('file://', '')
            : video.uri;

        form.append('file', {
            uri: sanitizePath(uri),
            type: video.type || 'video/mp4',
            name: video.fileName || `video_${Date.now()}.mp4`,
        } as any);
        form.append('folder', `cars/${carId}/videos`);

        const response = await withTimeout(
            apiClient.post<any>('/api/files/upload', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
            UPLOAD_TIMEOUT_MS * 2, // Videos get double timeout
            'Video upload'
        );

        onProgress(100);
        return response.data.fileUrl || response.data.data?.fileUrl;
    };

    /**
     * Upload a single file to a signed URL
     */
    const uploadFileToUrl = async (
        file: { uri: string; type: string; name?: string },
        url: string,
        onProgress: (progress: number) => void
    ): Promise<void> => {
        // Prepare token if needed (for backend URLs that aren't pre-signed S3/GCS)
        let authToken: string | null = null;

        // Check if URL is for our backend
        const isBackendUrl = url.startsWith('/') || url.includes(apiClient.getBaseUrl()) || !url.startsWith('http');

        if (isBackendUrl) {
            try {
                authToken = await AsyncStorage.getItem('@carworld_access_token');
            } catch (e) {
                console.warn('Failed to get token for upload', e);
            }
        }

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', url);
            xhr.setRequestHeader('Content-Type', file.type);

            // Attach token if needed
            if (authToken) {
                xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
            }

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    onProgress((event.loaded / event.total) * 100);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network error during upload'));
            xhr.ontimeout = () => reject(new Error('Upload timed out'));

            const uri = Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;
            xhr.send({ uri, type: file.type, name: file.name } as any);
        });
    };

    /**
     * Process a single upload task with comprehensive error handling
     */
    const processUpload = async (task: UploadTask) => {
        const { carId, images, video } = task;

        // Prevent duplicate processing
        if (processingRef.current.has(carId)) {
            console.log(`Task ${carId} is already being processed`);
            return;
        }
        processingRef.current.add(carId);

        // Create abort controller for this task
        const abortController = new AbortController();
        abortControllerRef.current.set(carId, abortController);

        try {
            // Phase 0: Validation (0-5%)
            updateTask(carId, { status: 'validating', progress: 0, startedAt: Date.now() });

            // Validate carId
            const carIdValidation = validateCarId(carId);
            if (!carIdValidation.valid) {
                throw new Error(carIdValidation.error);
            }

            // Validate image count
            const countValidation = validateImageCount(images.length);
            if (!countValidation.valid) {
                throw new Error(countValidation.error);
            }

            updateTask(carId, { progress: 5 });

            // Phase 1: Compression (5-50%)
            updateTask(carId, { status: 'compressing', progress: 5 });

            let compressedImages: SelectedImage[] = [];
            let failedImageIndices: number[] = [];
            let compressedVideo: VideoAsset | null = null;

            // Compress images (5-35%)
            if (images.length > 0) {
                const result = await compressImages(images, carId, (p) => {
                    updateTask(carId, { progress: 5 + Math.floor(p * 0.3) });
                });
                compressedImages = result.compressed;
                failedImageIndices = result.failedIndices;
            }

            // Compress video (35-50%)
            if (video) {
                try {
                    compressedVideo = await compressVideo(video, carId, (p) => {
                        updateTask(carId, { progress: 35 + Math.floor(p * 0.15) });
                    });
                } catch (videoError: any) {
                    console.error('Video compression failed:', videoError);
                    // Continue with images only - video is optional
                }
            }

            updateTask(carId, { progress: 50, failedImageIndices });

            // Check if we have anything to upload
            if (compressedImages.length === 0 && !compressedVideo) {
                throw new Error('No media could be processed successfully');
            }

            // Phase 2: Upload (50-95%)
            updateTask(carId, { status: 'uploading', progress: 50 });

            // Prepare for Async Upload V2
            const allFiles: { uri: string; type: string; name: string; isVideo: boolean }[] = [];

            // Add images
            compressedImages.forEach((img, idx) => {
                allFiles.push({
                    uri: img.uri,
                    type: img.type || 'image/jpeg',
                    name: img.fileName || `image_${idx}.jpg`,
                    isVideo: false
                });
            });

            // Add video
            if (compressedVideo) {
                allFiles.push({
                    uri: compressedVideo.uri,
                    type: compressedVideo.type || 'video/mp4',
                    name: compressedVideo.fileName || `video.mp4`,
                    isVideo: true
                });
            }

            // Init Upload Session
            const initResponse = await carApi.initMediaUpload({
                carId: Number(carId),
                fileNames: allFiles.map(f => f.name),
                contentTypes: allFiles.map(f => f.type)
            });

            const { sessionId, uploadUrls, filePaths } = initResponse;
            const uploadedFilePaths: string[] = [];
            const uploadedImageUrls: string[] = []; // We won't have real URLs yet, but we need them for local state?
            // Actually, for local state "uploadedImageUrls", we might not have them immediately if they are async processed.
            // But the UI might expect them.
            // For now, let's use the filePaths as "pending" URLs or empty. 
            // The UI should handle "Processing" status and reload later.

            // Upload Loop
            for (let i = 0; i < allFiles.length; i++) {
                const file = allFiles[i];
                const url = uploadUrls[i];
                const path = filePaths[i];

                try {
                    await uploadFileToUrl(file, url, (p) => {
                        // Calculate global progress: 50 + (i / total) * 45 + (p/100 * (45/total))
                        const itemShare = 45 / allFiles.length;
                        const globalProgress = 50 + (i * itemShare) + (p * (itemShare / 100));
                        updateTask(carId, { progress: Math.min(95, Math.floor(globalProgress)) });
                    });

                    uploadedFilePaths.push(path);
                    if (!file.isVideo) {
                        // Hack: Store path for now, or just empty?
                        // If we store path, make sure UI doesn't try to render it as image URI
                        // uploadedImageUrls.push(path);
                    } else {
                        updateTask(carId, { videoUploaded: true });
                    }

                } catch (err) {
                    console.error(`Failed to upload ${file.name}`, err);
                    if (!file.isVideo) {
                        // Find original index
                        // This is tricky if we flattened array.
                        // But compressedImages corresponds to first N items.
                        if (i < compressedImages.length) {
                            failedImageIndices.push(i); // This index matches 'compressedImages' index
                        }
                    }
                }
            }

            // Phase 3: Complete Processing (95-100%)
            const success = uploadedFilePaths.length > 0;

            await carApi.completeMediaProcessing({
                carId: Number(carId),
                sessionId,
                success,
                uploadedFilePaths
            });

            // Determine final status
            const hasFailures = failedImageIndices.length > 0 || (compressedVideo && !uploadedFilePaths.some(p => p.endsWith('.mp4') || p.endsWith('.mov'))); // Simple check
            const finalStatus: UploadStatus = hasFailures && success ? 'partial' : (success ? 'completed' : 'failed');

            updateTask(carId, {
                status: finalStatus,
                progress: 100,
                completedAt: Date.now(),
                uploadedImageUrls: [], // backend will set these
                videoUploaded: uploadedFilePaths.some(p => p.endsWith('.mp4')),
            });

            if (hasFailures) {
                console.log(`Upload completed with partial success.`);
            } else {
                console.log(`Upload completed successfully for car ${carId}`);
            }

        } catch (error: any) {
            console.error('Upload processing failed:', error);
            const errorType = categorizeError(error);
            const userMessage = getErrorMessage(errorType);

            updateTask(carId, {
                status: 'failed',
                error: error.message || userMessage,
                errorType,
                completedAt: Date.now(),
            });
        } finally {
            processingRef.current.delete(carId);
            abortControllerRef.current.delete(carId);

            // Cleanup temporary files
            await cleanupTempFiles(carId);
        }
    };

    /**
     * Add a new upload to the queue with validation
     */
    const addToQueue = useCallback(async (
        carId: string,
        images: SelectedImage[],
        video: VideoAsset | null
    ): Promise<boolean> => {
        // Pre-validation before adding to queue
        const carIdValidation = validateCarId(carId);
        if (!carIdValidation.valid) {
            Alert.alert('Invalid Car', carIdValidation.error);
            return false;
        }

        const countValidation = validateImageCount(images.length);
        if (!countValidation.valid) {
            Alert.alert('Too Many Images', countValidation.error);
            return false;
        }

        // Validate each image
        const invalidImages = images.filter((img, i) => {
            const result = validateImage(img);
            if (!result.valid) {
                console.warn(`Image ${i} validation failed:`, result.error);
            }
            return !result.valid;
        });

        if (invalidImages.length === images.length && !video) {
            Alert.alert('Invalid Files', 'None of the selected files are valid for upload.');
            return false;
        }

        // Validate video if present
        if (video) {
            const videoValidation = validateVideo(video);
            if (!videoValidation.valid) {
                Alert.alert('Invalid Video', videoValidation.error);
                // Continue with images only if video is invalid
                video = null;
            }
        }

        const task: UploadTask = {
            carId,
            status: 'pending',
            progress: 0,
            images,
            video,
            retryCount: 0,
            uploadedImageUrls: [],
            failedImageIndices: [],
            videoUploaded: false,
        };

        setUploads(prev => {
            const newMap = new Map(prev);
            newMap.set(carId, task);
            return newMap;
        });

        // Start processing with slight delay
        setTimeout(() => processUpload(task), 100);
        return true;
    }, []);

    /**
     * Retry a failed upload with exponential backoff
     */
    const retryUpload = useCallback((carId: string) => {
        const task = uploads.get(carId);
        if (!task || (task.status !== 'failed' && task.status !== 'partial')) {
            return;
        }

        if (task.retryCount >= MAX_RETRIES) {
            Alert.alert(
                'Max Retries Reached',
                'Please try submitting the car again or contact support.',
                [{ text: 'OK' }]
            );
            return;
        }

        const delay = getRetryDelay(task.retryCount);
        console.log(`Retrying upload ${carId} after ${delay}ms (attempt ${task.retryCount + 1}/${MAX_RETRIES})`);

        const updatedTask: UploadTask = {
            ...task,
            status: 'pending',
            progress: 0,
            error: undefined,
            errorType: undefined,
            retryCount: task.retryCount + 1,
        };

        setUploads(prev => {
            const newMap = new Map(prev);
            newMap.set(carId, updatedTask);
            return newMap;
        });

        setTimeout(() => processUpload(updatedTask), delay);
    }, [uploads]);

    /**
     * Cancel an in-progress upload
     */
    const cancelUpload = useCallback((carId: string) => {
        const abortController = abortControllerRef.current.get(carId);
        if (abortController) {
            abortController.abort();
        }

        processingRef.current.delete(carId);
        setUploads(prev => {
            const newMap = new Map(prev);
            newMap.delete(carId);
            return newMap;
        });

        // Cleanup any temp files
        cleanupTempFiles(carId);
    }, [cleanupTempFiles]);

    /**
     * Get upload status for a specific car
     */
    const getUploadStatus = useCallback((carId: string): UploadTask | undefined => {
        return uploads.get(carId);
    }, [uploads]);

    /**
     * Remove a completed/failed task from the queue
     */
    const removeFromQueue = useCallback((carId: string) => {
        setUploads(prev => {
            const newMap = new Map(prev);
            newMap.delete(carId);
            return newMap;
        });
        // Also cleanup any remaining temp files
        cleanupTempFiles(carId);
    }, [cleanupTempFiles]);

    /**
     * Get count of queued/in-progress uploads
     */
    const getQueuedCount = useCallback((): number => {
        let count = 0;
        uploads.forEach(task => {
            if (task.status === 'pending' || task.status === 'compressing' || task.status === 'uploading') {
                count++;
            }
        });
        return count;
    }, [uploads]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Cancel all pending operations
            abortControllerRef.current.forEach((controller, carId) => {
                controller.abort();
                cleanupTempFiles(carId);
            });
        };
    }, [cleanupTempFiles]);

    const value: UploadQueueContextType = {
        uploads,
        addToQueue,
        retryUpload,
        cancelUpload,
        getUploadStatus,
        removeFromQueue,
        getQueuedCount,
    };

    return (
        <UploadQueueContext.Provider value={value}>
            {children}
        </UploadQueueContext.Provider>
    );
};

/**
 * Custom hook to use upload queue context
 * @throws Error if used outside UploadQueueProvider
 */
export const useUploadQueue = (): UploadQueueContextType => {
    const context = useContext(UploadQueueContext);
    if (context === undefined) {
        throw new Error('useUploadQueue must be used within an UploadQueueProvider');
    }
    return context;
};

export default UploadQueueContext;
