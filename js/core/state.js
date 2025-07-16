/**
 * State Management Module
 * Manages application state and global variables
 */

class AppState {
    constructor() {
        this.cv = null;
        this.currentZoom = 1;
        this.webcamStream = null;
        this.currentAlgorithm = 'canny';
        this.currentPreset = 'normal';
        this.isProcessing = false;
        this.batchFiles = [];
        this.currentBatchIndex = 0;
        this.darkMode = false;
        this.history = [];
        this.historyIndex = -1;
    }

    /**
     * Initialize OpenCV
     */
    setOpenCV(cv) {
        this.cv = cv;
    }

    /**
     * Get OpenCV instance
     */
    getOpenCV() {
        return this.cv;
    }

    /**
     * Set current zoom level
     */
    setZoom(zoom) {
        this.currentZoom = Math.max(0.1, Math.min(5, zoom));
    }

    /**
     * Get current zoom level
     */
    getZoom() {
        return this.currentZoom;
    }

    /**
     * Set current algorithm
     */
    setAlgorithm(algorithm) {
        this.currentAlgorithm = algorithm;
    }

    /**
     * Get current algorithm
     */
    getAlgorithm() {
        return this.currentAlgorithm;
    }

    /**
     * Set current preset
     */
    setPreset(preset) {
        this.currentPreset = preset;
    }

    /**
     * Get current preset
     */
    getPreset() {
        return this.currentPreset;
    }

    /**
     * Set processing state
     */
    setProcessing(isProcessing) {
        this.isProcessing = isProcessing;
    }

    /**
     * Check if processing
     */
    isProcessingActive() {
        return this.isProcessing;
    }

    /**
     * Set batch files
     */
    setBatchFiles(files) {
        this.batchFiles = files;
    }

    /**
     * Get batch files
     */
    getBatchFiles() {
        return this.batchFiles;
    }

    /**
     * Set webcam stream
     */
    setWebcamStream(stream) {
        this.webcamStream = stream;
    }

    /**
     * Get webcam stream
     */
    getWebcamStream() {
        return this.webcamStream;
    }

    /**
     * Set dark mode
     */
    setDarkMode(isDark) {
        this.darkMode = isDark;
        localStorage.setItem('darkMode', isDark);
    }

    /**
     * Get dark mode state
     */
    getDarkMode() {
        return this.darkMode;
    }

    /**
     * Add to history
     */
    addToHistory(state) {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(state);
        this.historyIndex++;
        
        // Limit history size
        if (this.history.length > window.AppConfig.CONFIG.HISTORY.MAX_ITEMS) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    /**
     * Can undo
     */
    canUndo() {
        return this.historyIndex > 0;
    }

    /**
     * Can redo
     */
    canRedo() {
        return this.historyIndex < this.history.length - 1;
    }

    /**
     * Undo
     */
    undo() {
        if (this.canUndo()) {
            this.historyIndex--;
            return this.history[this.historyIndex];
        }
        return null;
    }

    /**
     * Redo
     */
    redo() {
        if (this.canRedo()) {
            this.historyIndex++;
            return this.history[this.historyIndex];
        }
        return null;
    }

    /**
     * Reset state
     */
    reset() {
        this.currentZoom = 1;
        this.currentAlgorithm = 'canny';
        this.currentPreset = 'normal';
        this.isProcessing = false;
        this.batchFiles = [];
        this.currentBatchIndex = 0;
        this.history = [];
        this.historyIndex = -1;
    }
}

// Create global instance
window.AppState = new AppState();
