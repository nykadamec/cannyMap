/**
 * Debug Script for CannyMap Application
 * Monitor console output and check module loading
 */

// Debug configuration
const DEBUG_CONFIG = {
    logLevel: 'debug',
    monitorModules: true,
    monitorEvents: true,
    monitorErrors: true
};

// Enhanced console logging
const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
};

// Override console methods to capture output
console.log = function(...args) {
    originalConsole.log('[DEBUG]', new Date().toISOString(), ...args);
};

console.error = function(...args) {
    originalConsole.error('[ERROR]', new Date().toISOString(), ...args);
};

console.warn = function(...args) {
    originalConsole.warn('[WARN]', new Date().toISOString(), ...args);
};

console.info = function(...args) {
    originalConsole.info('[INFO]', new Date().toISOString(), ...args);
};

// Module loading checker
function checkModuleLoading() {
    const modules = [
        'window.AppConfig',
        'window.Utils',
        'window.AppState',
        'window.AppInitializer',
        'window.ProcessingManager',
        'window.PresetManager',
        'window.AlgorithmManager',
        'window.UIManager',
        'window.DisplayManager',
        'window.ZoomManager',
        'window.FileService',
        'window.ExportService',
        'window.WebcamService',
        'window.BatchService',
        'window.ImageProcessor',
        'window.imageProcessor',
        'window.CannyAlgorithm',
        'window.SobelAlgorithm',
        'window.PrewittAlgorithm',
        'window.LaplacianAlgorithm',
        'window.ScharrAlgorithm',
        'window.cv'
    ];

    console.log('=== MODULE LOADING CHECK ===');
    modules.forEach(module => {
        const obj = eval(`typeof ${module}`);
        const status = obj !== 'undefined' ? '✅ LOADED' : '❌ NOT LOADED';
        console.log(`${module}: ${status}`);
    });
    console.log('=============================');
}

// Error monitoring
window.addEventListener('error', (event) => {
    console.error('JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack
    });
});

// Unhandled promise rejection monitoring
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
});

// OpenCV loading monitoring
window.addEventListener('load', () => {
    console.log('Page loaded, checking modules...');
    setTimeout(checkModuleLoading, 1000);
    
    // Monitor OpenCV loading
    const checkOpenCV = setInterval(() => {
        if (typeof window.cv !== 'undefined') {
            console.log('✅ OpenCV.js loaded successfully');
            clearInterval(checkOpenCV);
            setTimeout(checkModuleLoading, 2000);
        }
    }, 500);
    
    // Timeout after 10 seconds
    setTimeout(() => {
        if (typeof window.cv === 'undefined') {
            console.error('❌ OpenCV.js failed to load within 10 seconds');
        }
        clearInterval(checkOpenCV);
    }, 10000);
});

// Custom event monitoring
document.addEventListener('imageProcessor:imageLoaded', (event) => {
    console.log('🖼️ Image loaded:', event.detail);
});

document.addEventListener('imageProcessor:imageProcessed', (event) => {
    console.log('⚡ Image processed:', event.detail);
});

// Memory usage monitoring
function logMemoryUsage() {
    if (performance.memory) {
        const memory = performance.memory;
        console.log('Memory Usage:', {
            used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
            total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
            limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
        });
    }
}

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        console.log('Performance:', entry.name, `${entry.duration.toFixed(2)}ms`);
    }
});

// Monitor navigation and resource loading
performanceObserver.observe({entryTypes: ['navigation', 'resource']});

// Periodic memory monitoring
setInterval(logMemoryUsage, 10000);

console.log('🚀 Debug mode activated');
