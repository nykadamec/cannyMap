/**
 * Application Initialization Module
 * Handles app startup and OpenCV initialization
 */

class AppInitializer {
    constructor() {
        this.initialized = false;
    }

    /**
     * OpenCV initialization callback
     */
    onOpenCvReady() {
        console.log('OpenCV.js is ready');
        this.hideLoadingOverlay();
        
        // Set OpenCV in state
        window.AppState.setOpenCV(window.cv);

        // Initialize image processor
        window.imageProcessor.init(window.cv);

        // Initialize application
        this.initializeApp();
    }

    /**
     * Hide loading overlay after OpenCV loads
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * Initialize application and event listeners
     */
    initializeApp() {
        // Check browser compatibility
        if (!window.checkBrowserCompatibility()) {
            window.Utils.showToast('Your browser does not support some features', 'warning', 5000);
        }

        // Load dark mode from localStorage
        this.loadDarkMode();

        // Initialize modules
        this.initializeModules();

        // Setup event listeners
        this.setupEventListeners();

        // Debug information
        if (window.AppConfig.CONFIG.DEBUG) {
            window.debugConfig();
        }

        this.initialized = true;
        console.log('Application initialized');
    }

    /**
     * Initialize modules
     */
    initializeModules() {
        // Initialize UI components
        if (window.UIManager) window.UIManager.init();
        
        // Initialize services
        if (window.FileService) window.FileService.init();
        if (window.WebcamService) window.WebcamService.init();
        if (window.ExportService) window.ExportService.init();
        
        console.log('Modules initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Image processor events
        document.addEventListener('imageProcessor:imageLoaded', this.handleImageLoaded.bind(this));
        document.addEventListener('imageProcessor:imageProcessed', this.handleImageProcessed.bind(this));

        // Preset buttons
        document.querySelectorAll('[data-preset]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                if (window.PresetManager) window.PresetManager.applyPreset(preset);
            });
        });

        // Algorithm buttons
        document.querySelectorAll('[data-algorithm]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const algorithm = e.target.dataset.algorithm;
                if (window.AlgorithmManager) window.AlgorithmManager.selectAlgorithm(algorithm);
            });
        });

        // Setup all UI event listeners
        if (window.UIManager) window.UIManager.setupEventListeners();
    }

    /**
     * Handle image loaded event
     */
    handleImageLoaded(event) {
        const { width, height } = event.detail;

        // Show UI sections
        if (window.UIManager) window.UIManager.showControlSections();

        // Display original image
        if (window.DisplayManager) window.DisplayManager.displayOriginalImage();

        // Automatic processing with default values
        if (window.ProcessingManager) window.ProcessingManager.processImage();

        if (window.Utils) window.Utils.showToast('Image loaded', 'success');
    }

    /**
     * Handle image processed event
     */
    handleImageProcessed(event) {
        const { algorithm, params } = event.detail;

        // Display result
        if (window.DisplayManager) window.DisplayManager.displayResult();
    }

    /**
     * Load dark mode from localStorage
     */
    loadDarkMode() {
        const savedMode = localStorage.getItem('darkMode');
        const isDark = savedMode === 'true';
        
        window.AppState.setDarkMode(isDark);
        
        if (isDark) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }

    /**
     * Check if app is initialized
     */
    isInitialized() {
        return this.initialized;
    }
}

// Create global instance
window.AppInitializer = new AppInitializer();

// Global OpenCV ready callback
function onOpenCvReady() {
    window.AppInitializer.onOpenCvReady();
}
