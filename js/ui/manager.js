/**
 * UI Manager Module
 * Handles user interface operations and interactions
 */

class UIManager {
    constructor() {
        this.isInitialized = false;
        this.controlElements = {};
    }

    /**
     * Initialize UI Manager
     */
    init() {
        this.setupControlElements();
        this.isInitialized = true;
        console.log('UI Manager initialized');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        this.setupFileUpload();
        this.setupDragAndDrop();
        this.setupKeyboardShortcuts();
        this.setupZoomControls();
        this.setupBatchProcessing();
        this.setupDarkModeToggle();
        this.setupControlElements();
    }

    /**
     * Setup control elements
     */
    setupControlElements() {
        this.setupThresholdSliders();
        this.setupDisplayOptions();
        this.setupProcessingButtons();
        this.setupExportButtons();
    }

    /**
     * Setup threshold sliders
     */
    setupThresholdSliders() {
        const minThreshold = document.getElementById('minThreshold');
        const maxThreshold = document.getElementById('maxThreshold');
        const minThresholdInput = document.getElementById('minThresholdInput');
        const maxThresholdInput = document.getElementById('maxThresholdInput');
        const minThresholdValue = document.getElementById('minThresholdValue');
        const maxThresholdValue = document.getElementById('maxThresholdValue');

        // Min threshold slider
        if (minThreshold) {
            minThreshold.addEventListener('input', (e) => {
                const value = e.target.value;
                if (minThresholdValue) minThresholdValue.textContent = value;
                if (minThresholdInput) minThresholdInput.value = value;

                // Ensure min < max
                if (maxThreshold && parseInt(value) >= parseInt(maxThreshold.value)) {
                    const newMax = parseInt(value) + 10;
                    maxThreshold.value = newMax;
                    if (maxThresholdValue) maxThresholdValue.textContent = newMax;
                    if (maxThresholdInput) maxThresholdInput.value = newMax;
                }

                if (window.imageProcessor.hasImage()) {
                    window.ProcessingManager.processImage();
                }
            });
        }

        // Max threshold slider
        if (maxThreshold) {
            maxThreshold.addEventListener('input', (e) => {
                const value = e.target.value;
                if (maxThresholdValue) maxThresholdValue.textContent = value;
                if (maxThresholdInput) maxThresholdInput.value = value;

                // Ensure max > min
                if (minThreshold && parseInt(value) <= parseInt(minThreshold.value)) {
                    const newMin = parseInt(value) - 10;
                    minThreshold.value = Math.max(0, newMin);
                    if (minThresholdValue) minThresholdValue.textContent = Math.max(0, newMin);
                    if (minThresholdInput) minThresholdInput.value = Math.max(0, newMin);
                }

                if (window.imageProcessor.hasImage()) {
                    window.ProcessingManager.processImage();
                }
            });
        }

        // Min threshold input
        if (minThresholdInput) {
            minThresholdInput.addEventListener('change', (e) => {
                const value = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
                e.target.value = value;
                if (minThreshold) minThreshold.value = value;
                if (minThresholdValue) minThresholdValue.textContent = value;

                if (window.imageProcessor.hasImage()) {
                    window.ProcessingManager.processImage();
                }
            });
        }

        // Max threshold input
        if (maxThresholdInput) {
            maxThresholdInput.addEventListener('change', (e) => {
                const value = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
                e.target.value = value;
                if (maxThreshold) maxThreshold.value = value;
                if (maxThresholdValue) maxThresholdValue.textContent = value;

                if (window.imageProcessor.hasImage()) {
                    window.ProcessingManager.processImage();
                }
            });
        }
    }

    /**
     * Setup display options
     */
    setupDisplayOptions() {
        const grayscaleMode = document.getElementById('grayscaleMode');
        const invertEdges = document.getElementById('invertEdges');
        const compareView = document.getElementById('compareView');
        const overlayMode = document.getElementById('overlayMode');
        const transparency = document.getElementById('transparency');
        const transparencyValue = document.getElementById('transparencyValue');
        const transparencyControl = document.getElementById('transparencyControl');

        if (grayscaleMode) {
            grayscaleMode.addEventListener('change', () => {
                if (window.imageProcessor.hasImage()) {
                    window.DisplayManager.displayResult();
                }
            });
        }

        if (invertEdges) {
            invertEdges.addEventListener('change', () => {
                if (window.imageProcessor.hasImage()) {
                    window.DisplayManager.displayResult();
                }
            });
        }

        if (compareView) {
            compareView.addEventListener('change', (e) => {
                if (e.target.checked && overlayMode) {
                    overlayMode.checked = false;
                    if (transparencyControl) transparencyControl.style.display = 'none';
                }
                if (window.imageProcessor.hasImage()) {
                    window.DisplayManager.displayResult();
                }
            });
        }

        if (overlayMode) {
            overlayMode.addEventListener('change', (e) => {
                if (e.target.checked) {
                    if (compareView) compareView.checked = false;
                    if (transparencyControl) transparencyControl.style.display = 'block';
                } else {
                    if (transparencyControl) transparencyControl.style.display = 'none';
                }
                if (window.imageProcessor.hasImage()) {
                    window.DisplayManager.displayResult();
                }
            });
        }

        if (transparency) {
            transparency.addEventListener('input', (e) => {
                const value = e.target.value;
                if (transparencyValue) transparencyValue.textContent = value;
                if (window.imageProcessor.hasImage() && overlayMode?.checked) {
                    window.DisplayManager.displayResult();
                }
            });
        }
    }

    /**
     * Setup processing buttons
     */
    setupProcessingButtons() {
        const processBtn = document.getElementById('processBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (processBtn) {
            processBtn.addEventListener('click', () => {
                if (window.imageProcessor.hasImage()) {
                    window.ProcessingManager.processImage();
                } else {
                    window.Utils.showToast('Please upload an image first', 'warning');
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetToDefaults();
            });
        }
    }

    /**
     * Setup export buttons
     */
    setupExportButtons() {
        window.ExportService.setupButtons();
    }

    /**
     * Setup file upload
     */
    setupFileUpload() {
        window.FileService.setupFileUpload();
    }

    /**
     * Setup drag and drop
     */
    setupDragAndDrop() {
        window.FileService.setupDragAndDrop();
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'z':
                        e.preventDefault();
                        this.undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.resetToDefaults();
                        break;
                    case 'e':
                        e.preventDefault();
                        window.ExportService.exportPNG();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.toggleDarkMode();
                        break;
                }
            }
        });
    }

    /**
     * Setup zoom controls
     */
    setupZoomControls() {
        const zoomIn = document.getElementById('zoomIn');
        const zoomOut = document.getElementById('zoomOut');
        const zoomReset = document.getElementById('zoomReset');

        if (zoomIn) {
            zoomIn.addEventListener('click', () => {
                window.ZoomManager.zoomIn();
            });
        }

        if (zoomOut) {
            zoomOut.addEventListener('click', () => {
                window.ZoomManager.zoomOut();
            });
        }

        if (zoomReset) {
            zoomReset.addEventListener('click', () => {
                window.ZoomManager.resetZoom();
            });
        }
    }

    /**
     * Setup batch processing
     */
    setupBatchProcessing() {
        window.BatchService.setupBatchProcessing();
    }

    /**
     * Setup dark mode toggle
     */
    setupDarkModeToggle() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }
    }

    /**
     * Show control sections
     */
    showControlSections() {
        const sections = ['controlsSection', 'canvasSection', 'exportSection'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'block';
            }
        });
    }

    /**
     * Hide control sections
     */
    hideControlSections() {
        const sections = ['controlsSection', 'canvasSection', 'exportSection'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
    }

    /**
     * Update processing UI
     */
    updateProcessingUI() {
        const processBtn = document.getElementById('processBtn');
        const isProcessing = window.ProcessingManager.isProcessingActive();

        if (processBtn) {
            processBtn.disabled = isProcessing;
            processBtn.textContent = isProcessing ? 'Processing...' : 'Process Image';
        }
    }

    /**
     * Reset to default values
     */
    resetToDefaults() {
        // Reset preset and algorithm
        window.PresetManager.resetToDefault();
        window.AlgorithmManager.resetToDefault();

        // Reset checkboxes
        const checkboxes = ['grayscaleMode', 'invertEdges', 'compareView', 'overlayMode'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = false;
        });

        // Hide transparency control
        const transparencyControl = document.getElementById('transparencyControl');
        if (transparencyControl) transparencyControl.style.display = 'none';

        // Reset zoom
        window.ZoomManager.resetZoom();

        // Reprocess if image is available
        if (window.imageProcessor.hasImage()) {
            window.ProcessingManager.processImage();
        }
    }

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        const isDark = !window.AppState.getDarkMode();
        window.AppState.setDarkMode(isDark);
        
        if (isDark) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }

    /**
     * Undo last action
     */
    undo() {
        const state = window.AppState.undo();
        if (state) {
            this.restoreState(state);
        }
    }

    /**
     * Redo last undone action
     */
    redo() {
        const state = window.AppState.redo();
        if (state) {
            this.restoreState(state);
        }
    }

    /**
     * Restore state
     */
    restoreState(state) {
        // Implementation for state restoration
        console.log('Restoring state:', state);
    }

    /**
     * Get current UI state
     */
    getCurrentState() {
        return {
            algorithm: window.AppState.getAlgorithm(),
            preset: window.AppState.getPreset(),
            zoom: window.AppState.getZoom(),
            darkMode: window.AppState.getDarkMode()
        };
    }
}

// Create global instance
window.UIManager = new UIManager();
