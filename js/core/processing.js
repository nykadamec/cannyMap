/**
 * Processing Manager Module
 * Handles image processing operations
 */

class ProcessingManager {
    constructor() {
        this.processingQueue = [];
        this.isProcessing = false;
    }

    /**
     * Process image with current settings
     */
    async processImage() {
        if (!window.imageProcessor.hasImage() || window.AppState.isProcessingActive()) {
            return;
        }

        window.AppState.setProcessing(true);

        try {
            const params = this.getProcessingParams();
            
            // Add to processing queue
            this.processingQueue.push({
                params,
                timestamp: Date.now()
            });

            // Process the image
            await window.imageProcessor.processImage(params);

            // Update UI
            window.UIManager.updateProcessingUI();

        } catch (error) {
            console.error('Processing error:', error);
            window.Utils.showToast('Processing failed: ' + error.message, 'error');
        } finally {
            window.AppState.setProcessing(false);
        }
    }

    /**
     * Get processing parameters from UI
     */
    getProcessingParams() {
        const minThreshold = parseInt(document.getElementById('minThreshold')?.value || 50);
        const maxThreshold = parseInt(document.getElementById('maxThreshold')?.value || 150);
        const algorithm = window.AppState.getAlgorithm();

        return {
            minThreshold,
            maxThreshold,
            algorithm,
            gaussianKernel: parseInt(document.getElementById('gaussianKernel')?.value || 3),
            L2Gradient: document.getElementById('L2Gradient')?.checked || false
        };
    }

    /**
     * Process image with specific parameters
     */
    async processImageWithParams(params) {
        if (!window.imageProcessor.hasImage()) {
            throw new Error('No image loaded');
        }

        try {
            await window.imageProcessor.processImage(params);
            return true;
        } catch (error) {
            console.error('Processing with params failed:', error);
            throw error;
        }
    }

    /**
     * Reprocess image with current settings
     */
    async reprocessImage() {
        if (!window.imageProcessor.hasImage()) {
            window.Utils.showToast('No image to reprocess', 'warning');
            return;
        }

        await this.processImage();
    }

    /**
     * Get processing queue
     */
    getProcessingQueue() {
        return this.processingQueue;
    }

    /**
     * Clear processing queue
     */
    clearProcessingQueue() {
        this.processingQueue = [];
    }

    /**
     * Cancel current processing
     */
    cancelProcessing() {
        window.AppState.setProcessing(false);
        this.clearProcessingQueue();
    }

    /**
     * Check if processing is active
     */
    isProcessingActive() {
        return window.AppState.isProcessingActive();
    }

    /**
     * Get processing statistics
     */
    getProcessingStats() {
        return {
            queueLength: this.processingQueue.length,
            isProcessing: this.isProcessingActive(),
            lastProcessed: this.processingQueue.length > 0 ? 
                this.processingQueue[this.processingQueue.length - 1].timestamp : null
        };
    }
}

// Create global instance
window.ProcessingManager = new ProcessingManager();
