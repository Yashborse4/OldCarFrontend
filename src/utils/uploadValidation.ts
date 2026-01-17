/**
 * uploadValidation.ts
 * 
 * Security utilities for validating and sanitizing upload files.
 * Features:
 * - MIME type validation
 * - File size validation
 * - Path sanitization to prevent traversal attacks
 * - CarId format validation
 */

// ==================== CONSTANTS ====================

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
] as const;

/** Allowed video MIME types */
export const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/quicktime',
    'video/x-m4v',
    'video/3gpp',
] as const;

/** Allowed image extensions */
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/** Allowed video extensions */
export const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.m4v', '.3gp'];

/** Maximum image size before compression (5MB) */
export const MAX_RAW_IMAGE_SIZE = 5 * 1024 * 1024;

/** Maximum image size after compression (1MB) */
export const MAX_COMPRESSED_IMAGE_SIZE = 1 * 1024 * 1024;

/** Maximum video size before compression (100MB) */
export const MAX_RAW_VIDEO_SIZE = 100 * 1024 * 1024;

/** Maximum video size after compression (70MB) */
export const MAX_COMPRESSED_VIDEO_SIZE = 70 * 1024 * 1024;

/** Maximum video duration (4.5 minutes in seconds) */
export const MAX_VIDEO_DURATION = 270;

/** Maximum number of images per car */
export const MAX_IMAGES_PER_CAR = 9;

/** Upload timeout per file (60 seconds) */
export const UPLOAD_TIMEOUT_MS = 60000;

/** Compression timeout for video (3 minutes) */
export const COMPRESSION_TIMEOUT_MS = 180000;

/** Maximum retries for failed uploads */
export const MAX_RETRIES = 3;

/** Base delay for exponential backoff (1 second) */
export const BASE_RETRY_DELAY_MS = 1000;

/** Maximum retry delay (30 seconds) */
export const MAX_RETRY_DELAY_MS = 30000;

// ==================== TYPES ====================

export interface ValidationResult {
    valid: boolean;
    error?: string;
    errorCode?: ValidationErrorCode;
}

export type ValidationErrorCode =
    | 'INVALID_MIME_TYPE'
    | 'INVALID_EXTENSION'
    | 'FILE_TOO_LARGE'
    | 'FILE_TOO_SMALL'
    | 'DURATION_TOO_LONG'
    | 'INVALID_PATH'
    | 'INVALID_CAR_ID'
    | 'TOO_MANY_FILES';

export type UploadErrorType =
    | 'validation'
    | 'compression'
    | 'network'
    | 'server'
    | 'timeout'
    | 'unknown';

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

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validates an image file for upload
 * @param image - The image asset to validate
 * @returns Validation result with error details if invalid
 */
export const validateImage = (image: SelectedImage): ValidationResult => {
    // Check if URI exists
    if (!image.uri || typeof image.uri !== 'string') {
        return {
            valid: false,
            error: 'Invalid image URI',
            errorCode: 'INVALID_PATH',
        };
    }

    // Validate MIME type if provided
    if (image.type) {
        const normalizedType = image.type.toLowerCase();
        if (!ALLOWED_IMAGE_TYPES.includes(normalizedType as any)) {
            return {
                valid: false,
                error: `Invalid image type: ${image.type}. Allowed: JPEG, PNG, WebP`,
                errorCode: 'INVALID_MIME_TYPE',
            };
        }
    }

    // Validate file extension from filename or URI
    const fileName = image.fileName || image.uri.split('/').pop() || '';
    const extension = getFileExtension(fileName).toLowerCase();
    if (extension && !ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
        return {
            valid: false,
            error: `Invalid image extension: ${extension}`,
            errorCode: 'INVALID_EXTENSION',
        };
    }

    // Validate file size if available
    if (image.fileSize !== undefined) {
        if (image.fileSize > MAX_RAW_IMAGE_SIZE) {
            const sizeMB = (image.fileSize / (1024 * 1024)).toFixed(1);
            return {
                valid: false,
                error: `Image too large (${sizeMB}MB). Maximum: 15MB`,
                errorCode: 'FILE_TOO_LARGE',
            };
        }
        if (image.fileSize < 1024) { // Less than 1KB
            return {
                valid: false,
                error: 'Image file appears to be empty or corrupted',
                errorCode: 'FILE_TOO_SMALL',
            };
        }
    }

    return { valid: true };
};

/**
 * Validates a video file for upload
 * @param video - The video asset to validate
 * @returns Validation result with error details if invalid
 */
export const validateVideo = (video: VideoAsset): ValidationResult => {
    // Check if URI exists
    if (!video.uri || typeof video.uri !== 'string') {
        return {
            valid: false,
            error: 'Invalid video URI',
            errorCode: 'INVALID_PATH',
        };
    }

    // Validate MIME type if provided
    if (video.type) {
        const normalizedType = video.type.toLowerCase();
        if (!ALLOWED_VIDEO_TYPES.includes(normalizedType as any)) {
            return {
                valid: false,
                error: `Invalid video type: ${video.type}. Allowed: MP4, MOV, M4V`,
                errorCode: 'INVALID_MIME_TYPE',
            };
        }
    }

    // Validate file extension from filename or URI
    const fileName = video.fileName || video.uri.split('/').pop() || '';
    const extension = getFileExtension(fileName).toLowerCase();
    if (extension && !ALLOWED_VIDEO_EXTENSIONS.includes(extension)) {
        return {
            valid: false,
            error: `Invalid video extension: ${extension}`,
            errorCode: 'INVALID_EXTENSION',
        };
    }

    // Validate file size if available
    if (video.fileSize !== undefined) {
        if (video.fileSize > MAX_RAW_VIDEO_SIZE) {
            const sizeMB = (video.fileSize / (1024 * 1024)).toFixed(0);
            return {
                valid: false,
                error: `Video too large (${sizeMB}MB). Maximum: 500MB`,
                errorCode: 'FILE_TOO_LARGE',
            };
        }
        if (video.fileSize < 1024) { // Less than 1KB
            return {
                valid: false,
                error: 'Video file appears to be empty or corrupted',
                errorCode: 'FILE_TOO_SMALL',
            };
        }
    }

    // Validate duration if available
    if (video.duration !== undefined && video.duration > MAX_VIDEO_DURATION) {
        const durationMin = (video.duration / 60).toFixed(1);
        return {
            valid: false,
            error: `Video too long (${durationMin} min). Maximum: 4.5 minutes`,
            errorCode: 'DURATION_TOO_LONG',
        };
    }

    return { valid: true };
};

/**
 * Validates the number of images
 * @param count - Number of images
 * @returns Validation result
 */
export const validateImageCount = (count: number): ValidationResult => {
    if (count > MAX_IMAGES_PER_CAR) {
        return {
            valid: false,
            error: `Too many images (${count}). Maximum: ${MAX_IMAGES_PER_CAR}`,
            errorCode: 'TOO_MANY_FILES',
        };
    }
    return { valid: true };
};

/**
 * Validates a car ID format (UUID or numeric)
 * @param carId - The car ID to validate
 * @returns Validation result
 */
export const validateCarId = (carId: string): ValidationResult => {
    if (!carId || typeof carId !== 'string') {
        return {
            valid: false,
            error: 'Invalid car ID',
            errorCode: 'INVALID_CAR_ID',
        };
    }

    // Allow UUID format or numeric IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const numericRegex = /^\d+$/;

    if (!uuidRegex.test(carId) && !numericRegex.test(carId)) {
        return {
            valid: false,
            error: 'Invalid car ID format',
            errorCode: 'INVALID_CAR_ID',
        };
    }

    return { valid: true };
};

// ==================== SANITIZATION FUNCTIONS ====================

/**
 * Sanitizes a file path to prevent path traversal attacks
 * @param uri - The file URI to sanitize
 * @returns Sanitized URI
 */
export const sanitizePath = (uri: string): string => {
    if (!uri || typeof uri !== 'string') {
        return '';
    }

    // Remove path traversal attempts
    let sanitized = uri
        .replace(/\.\.\//g, '')  // Remove ../
        .replace(/\.\.\\/g, '')  // Remove ..\
        .replace(/\.\.%2f/gi, '') // URL encoded ../
        .replace(/\.\.%5c/gi, ''); // URL encoded ..\

    // Validate URI scheme
    const validSchemes = ['file://', 'content://', 'ph://', 'assets-library://'];
    const hasValidScheme = validSchemes.some(scheme =>
        sanitized.toLowerCase().startsWith(scheme)
    );

    // If no valid scheme, assume it's a file path
    if (!hasValidScheme && !sanitized.startsWith('/')) {
        // Might be a relative path, which is suspicious
        console.warn('Suspicious path without valid scheme:', sanitized);
    }

    return sanitized;
};

/**
 * Escapes a path for use in FFmpeg command
 * @param path - The path to escape
 * @returns Escaped path safe for shell command
 */
export const escapePathForFFmpeg = (path: string): string => {
    // Remove file:// prefix if present
    let cleanPath = path.replace(/^file:\/\//, '');

    // Escape special characters for shell
    cleanPath = cleanPath
        .replace(/"/g, '\\"')
        .replace(/'/g, "\\'")
        .replace(/\$/g, '\\$')
        .replace(/`/g, '\\`');

    return cleanPath;
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Gets file extension from filename
 * @param fileName - The filename
 * @returns Extension with dot (e.g., ".jpg") or empty string
 */
export const getFileExtension = (fileName: string): string => {
    if (!fileName) return '';
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot === -1) return '';
    return fileName.substring(lastDot).toLowerCase();
};

/**
 * Calculates exponential backoff delay with jitter
 * @param retryCount - Current retry attempt (0-indexed)
 * @returns Delay in milliseconds
 */
export const getRetryDelay = (retryCount: number): number => {
    const delay = Math.min(
        BASE_RETRY_DELAY_MS * Math.pow(2, retryCount),
        MAX_RETRY_DELAY_MS
    );
    // Add jitter (0-1000ms)
    return delay + Math.random() * 1000;
};

/**
 * Categorizes an error into a known type
 * @param error - The error to categorize
 * @returns Error type for UI display
 */
export const categorizeError = (error: any): UploadErrorType => {
    if (!error) return 'unknown';

    const message = (error.message || '').toLowerCase();
    const name = (error.name || '').toLowerCase();

    // Timeout errors
    if (message.includes('timeout') || name.includes('timeout')) {
        return 'timeout';
    }

    // Network errors
    if (
        message.includes('network') ||
        message.includes('connection') ||
        message.includes('internet') ||
        name.includes('networkerror') ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENETUNREACH'
    ) {
        return 'network';
    }

    // Server errors (5xx)
    if (error.response?.status >= 500 || message.includes('server')) {
        return 'server';
    }

    // Validation errors
    if (
        message.includes('invalid') ||
        message.includes('too large') ||
        message.includes('too long') ||
        message.includes('not allowed')
    ) {
        return 'validation';
    }

    // Compression errors
    if (
        message.includes('compression') ||
        message.includes('ffmpeg') ||
        message.includes('encode')
    ) {
        return 'compression';
    }

    return 'unknown';
};

/**
 * Gets a user-friendly error message based on error type
 * @param errorType - The categorized error type
 * @returns User-friendly message
 */
export const getErrorMessage = (errorType: UploadErrorType): string => {
    switch (errorType) {
        case 'network':
            return 'Network connection failed. Please check your internet and try again.';
        case 'timeout':
            return 'Upload took too long. Please try again with a smaller file.';
        case 'server':
            return 'Server is temporarily unavailable. Please try again later.';
        case 'validation':
            return 'File validation failed. Please check file type and size.';
        case 'compression':
            return 'Failed to process media. Please try a different file.';
        default:
            return 'Upload failed. Please try again.';
    }
};

/**
 * Creates a timeout-wrapped promise
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param operation - Operation name for error message
 * @returns Promise that rejects on timeout
 */
export const withTimeout = <T>(
    promise: Promise<T>,
    timeoutMs: number,
    operation: string
): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) => {
            setTimeout(() => {
                const error = new Error(`${operation} timed out after ${timeoutMs}ms`);
                error.name = 'TimeoutError';
                reject(error);
            }, timeoutMs);
        }),
    ]);
};

export default {
    validateImage,
    validateVideo,
    validateImageCount,
    validateCarId,
    sanitizePath,
    escapePathForFFmpeg,
    getFileExtension,
    getRetryDelay,
    categorizeError,
    getErrorMessage,
    withTimeout,
};
