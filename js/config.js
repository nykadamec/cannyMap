/**
 * Canny Edge Detection Tool - Configuration
 * Global configuration and constants
 */

// Aplikační konfigurace
const CONFIG = {
    // OpenCV.js URL
    OPENCV_URL: 'https://docs.opencv.org/4.8.0/opencv.js',
    
    // CDN linky
    CDN: {
        TAILWIND: 'https://cdn.tailwindcss.com',
        JSPDF: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        JSZIP: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
    },
    
    // Debounce timing
    DEBOUNCE: {
        REALTIME_PROCESSING: 150,
        HISTOGRAM_UPDATE: 100,
        ZOOM_UPDATE: 50
    },
    
    // Zoom configuration
    ZOOM: {
        MIN: 0.1,
        MAX: 5.0,
        STEP: 1.2,
        WHEEL_SENSITIVITY: 0.1
    },
    
    // History configuration
    HISTORY: {
        MAX_ITEMS: 20
    },
    
    // Export configuration
    EXPORT: {
        DEFAULT_JPEG_QUALITY: 0.9,
        PDF_MAX_WIDTH: 180,
        PDF_MAX_HEIGHT: 250,
        SVG_STEP: 2
    },
    
    // Batch processing
    BATCH: {
        MAX_FILES: 50,
        SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    },
    
    // Canvas konfigurace
    CANVAS: {
        MAX_WIDTH: 1920,
        MAX_HEIGHT: 1080,
        HISTOGRAM_WIDTH: 200,
        HISTOGRAM_HEIGHT: 150
    },
    
    // Animace
    ANIMATION: {
        FADE_DURATION: 300,
        SLIDE_DURATION: 300,
        MODAL_DURATION: 200
    },
    
    // Lokalizace
    LOCALE: 'cs',
    
    // Debug mode
    DEBUG: false
};

// Preset configuration for edge detection
const PRESETS = {
    soft: { 
        minThreshold: 30, 
        maxThreshold: 100,
        description: 'Soft edges - suitable for low contrast photos'
    },
    normal: { 
        minThreshold: 50, 
        maxThreshold: 150,
        description: 'Normal detection - balanced settings for most images'
    },
    sharp: { 
        minThreshold: 80, 
        maxThreshold: 200,
        description: 'Sharp edges - highlights strong contrasts'
    },
    artistic: { 
        minThreshold: 20, 
        maxThreshold: 80,
        description: 'Artistic effect - creates more details'
    }
};

// Algorithms for edge detection
const ALGORITHMS = {
    canny: {
        name: 'Canny',
        description: 'Classic Canny edge detector with Gaussian blur',
        requiresThresholds: true,
        icon: '🔍'
    },
    sobel: {
        name: 'Sobel',
        description: 'Sobel operator for edge detection',
        requiresThresholds: false,
        icon: '📐'
    },
    prewitt: {
        name: 'Prewitt',
        description: 'Prewitt operator similar to Sobel',
        requiresThresholds: false,
        icon: '🔷'
    },
    laplacian: {
        name: 'Laplacian',
        description: 'Laplacian of Gaussian edge detector',
        requiresThresholds: false,
        icon: '⚡'
    },
    scharr: {
        name: 'Scharr',
        description: 'Scharr operator - more precise than Sobel',
        requiresThresholds: false,
        icon: '🎯'
    }
};

// Export formats
const EXPORT_FORMATS = {
    PNG: {
        extension: 'png',
        mimeType: 'image/png',
        quality: null,
        description: 'Lossless format, suitable for edges'
    },
    JPEG: {
        extension: 'jpeg',
        mimeType: 'image/jpeg',
        quality: 0.9,
        description: 'Compressed format, smaller size'
    },
    PDF: {
        extension: 'pdf',
        mimeType: 'application/pdf',
        quality: null,
        description: 'Multi-page document with metadata'
    },
    SVG: {
        extension: 'svg',
        mimeType: 'image/svg+xml',
        quality: null,
        description: 'Vector format, scalable'
    },
    ZIP: {
        extension: 'zip',
        mimeType: 'application/zip',
        quality: null,
        description: 'Archive with all formats'
    }
};

// Error messages
const ERROR_MESSAGES = {
    OPENCV_LOAD_FAILED: 'Failed to load OpenCV.js',
    FILE_TOO_LARGE: 'File is too large',
    UNSUPPORTED_FORMAT: 'Unsupported file format',
    PROCESSING_FAILED: 'Image processing failed',
    EXPORT_FAILED: 'Export failed',
    WEBCAM_ACCESS_DENIED: 'Webcam access denied',
    BATCH_PROCESSING_FAILED: 'Batch processing failed',
    MEMORY_ERROR: 'Out of memory'
};

// Success messages
const SUCCESS_MESSAGES = {
    IMAGE_PROCESSED: 'Image processed successfully',
    EXPORT_COMPLETE: 'Export completed',
    BATCH_COMPLETE: 'Batch processing completed',
    SETTINGS_SAVED: 'Settings saved'
};

// Validation rules
const VALIDATION = {
    IMAGE_MAX_SIZE: 50 * 1024 * 1024, // 50MB
    IMAGE_MIN_SIZE: 100, // 100 bytes
    THRESHOLD_MIN: 0,
    THRESHOLD_MAX: 255,
    FILENAME_MAX_LENGTH: 100
};

// Keyboard shortcuts
const KEYBOARD_SHORTCUTS = {
    UNDO: 'Ctrl+Z',
    REDO: 'Ctrl+Y',
    RESET: 'Ctrl+R',
    EXPORT: 'Ctrl+E',
    DARK_MODE: 'Ctrl+D',
    ZOOM_IN: 'Ctrl++',
    ZOOM_OUT: 'Ctrl+-',
    ZOOM_RESET: 'Ctrl+0'
};

// Save to global object
window.AppConfig = {
    CONFIG,
    PRESETS,
    ALGORITHMS,
    EXPORT_FORMATS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    VALIDATION,
    KEYBOARD_SHORTCUTS
};

// Debug function
window.debugConfig = function() {
    if (CONFIG.DEBUG) {
        console.log('App Configuration:', window.AppConfig);
    }
};

// Browser compatibility check
window.checkBrowserCompatibility = function() {
    const features = {
        canvas: !!document.createElement('canvas').getContext,
        localStorage: typeof Storage !== 'undefined',
        webWorkers: typeof Worker !== 'undefined',
        fileReader: typeof FileReader !== 'undefined',
        blob: typeof Blob !== 'undefined',
        webgl: !!document.createElement('canvas').getContext('webgl')
    };
    
    const incompatible = Object.keys(features).filter(key => !features[key]);
    
    if (incompatible.length > 0) {
        console.warn('Unsupported features:', incompatible);
        return false;
    }
    
    return true;
}; 