/**
 * Zoom Manager Module
 * Handles zoom functionality for canvas
 */

class ZoomManager {
    constructor() {
        this.currentZoom = 1;
        this.minZoom = 0.1;
        this.maxZoom = 5;
        this.zoomStep = 1.2;
        this.canvasWrapper = null;
        this.canvas = null;
    }

    /**
     * Initialize zoom manager
     */
    init() {
        this.canvasWrapper = document.getElementById('canvasWrapper');
        this.canvas = document.getElementById('outputCanvas');
        this.setupWheelZoom();
    }

    /**
     * Setup mouse wheel zoom
     */
    setupWheelZoom() {
        if (this.canvasWrapper) {
            this.canvasWrapper.addEventListener('wheel', (e) => {
                e.preventDefault();
                
                const delta = e.deltaY > 0 ? -1 : 1;
                const zoomFactor = 1 + (delta * 0.1);
                
                this.zoomBy(zoomFactor);
            });
        }
    }

    /**
     * Zoom in
     */
    zoomIn() {
        this.zoomBy(this.zoomStep);
    }

    /**
     * Zoom out
     */
    zoomOut() {
        this.zoomBy(1 / this.zoomStep);
    }

    /**
     * Zoom by factor
     */
    zoomBy(factor) {
        const newZoom = this.currentZoom * factor;
        this.setZoom(newZoom);
    }

    /**
     * Set zoom level
     */
    setZoom(zoom) {
        this.currentZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
        window.AppState.setZoom(this.currentZoom);
        this.updateZoom();
    }

    /**
     * Reset zoom to 1
     */
    resetZoom() {
        this.setZoom(1);
    }

    /**
     * Update zoom display
     */
    updateZoom() {
        if (this.canvas) {
            this.canvas.style.transform = `scale(${this.currentZoom})`;
            this.canvas.style.transformOrigin = 'center';
        }

        // Update zoom display
        const zoomDisplay = document.getElementById('zoomDisplay');
        if (zoomDisplay) {
            zoomDisplay.textContent = `${Math.round(this.currentZoom * 100)}%`;
        }

        // Update zoom buttons
        this.updateZoomButtons();
    }

    /**
     * Update zoom button states
     */
    updateZoomButtons() {
        const zoomIn = document.getElementById('zoomIn');
        const zoomOut = document.getElementById('zoomOut');

        if (zoomIn) {
            zoomIn.disabled = this.currentZoom >= this.maxZoom;
        }

        if (zoomOut) {
            zoomOut.disabled = this.currentZoom <= this.minZoom;
        }
    }

    /**
     * Get current zoom level
     */
    getCurrentZoom() {
        return this.currentZoom;
    }

    /**
     * Set zoom limits
     */
    setZoomLimits(min, max) {
        this.minZoom = min;
        this.maxZoom = max;
        
        // Adjust current zoom if needed
        if (this.currentZoom < min) {
            this.setZoom(min);
        } else if (this.currentZoom > max) {
            this.setZoom(max);
        }
    }

    /**
     * Fit to container
     */
    fitToContainer() {
        if (!this.canvas || !this.canvasWrapper) return;

        const containerWidth = this.canvasWrapper.clientWidth;
        const containerHeight = this.canvasWrapper.clientHeight;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        if (canvasWidth === 0 || canvasHeight === 0) return;

        const scaleX = containerWidth / canvasWidth;
        const scaleY = containerHeight / canvasHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in, only out

        this.setZoom(scale);
    }

    /**
     * Zoom to fit width
     */
    fitToWidth() {
        if (!this.canvas || !this.canvasWrapper) return;

        const containerWidth = this.canvasWrapper.clientWidth;
        const canvasWidth = this.canvas.width;

        if (canvasWidth === 0) return;

        const scale = Math.min(containerWidth / canvasWidth, 1);
        this.setZoom(scale);
    }

    /**
     * Zoom to fit height
     */
    fitToHeight() {
        if (!this.canvas || !this.canvasWrapper) return;

        const containerHeight = this.canvasWrapper.clientHeight;
        const canvasHeight = this.canvas.height;

        if (canvasHeight === 0) return;

        const scale = Math.min(containerHeight / canvasHeight, 1);
        this.setZoom(scale);
    }

    /**
     * Get zoom info
     */
    getZoomInfo() {
        return {
            current: this.currentZoom,
            min: this.minZoom,
            max: this.maxZoom,
            step: this.zoomStep,
            percentage: Math.round(this.currentZoom * 100)
        };
    }

    /**
     * Set zoom step
     */
    setZoomStep(step) {
        this.zoomStep = step;
    }

    /**
     * Pan canvas (if implementing pan functionality)
     */
    pan(deltaX, deltaY) {
        // Implementation for panning functionality
        // This would require additional state management for pan position
        console.log('Pan functionality not implemented yet');
    }
}

// Create global instance
window.ZoomManager = new ZoomManager();
