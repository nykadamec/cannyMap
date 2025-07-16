/**
 * Display Manager Module
 * Handles image display and canvas operations
 */

class DisplayManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.originalImageData = null;
        this.processedImageData = null;
    }

    /**
     * Initialize display manager
     */
    init() {
        this.canvas = document.getElementById('outputCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
    }

    /**
     * Display original image
     */
    displayOriginalImage() {
        if (!window.imageProcessor.hasImage()) return;

        const originalMat = window.imageProcessor.getOriginalMat();
        if (!originalMat) return;

        // Create canvas if not exists
        if (!this.canvas) {
            this.init();
        }

        // Set canvas size
        this.canvas.width = originalMat.cols;
        this.canvas.height = originalMat.rows;

        // Display image
        window.cv.imshow(this.canvas, originalMat);

        // Update zoom
        window.ZoomManager.updateZoom();
    }

    /**
     * Display processing result
     */
    displayResult() {
        if (!window.imageProcessor.hasImage()) return;

        const compareView = document.getElementById('compareView')?.checked;
        const overlayMode = document.getElementById('overlayMode')?.checked;
        const grayscaleMode = document.getElementById('grayscaleMode')?.checked;
        const invertEdges = document.getElementById('invertEdges')?.checked;

        if (compareView) {
            this.displayCompareView(this.canvas, grayscaleMode, invertEdges);
        } else if (overlayMode) {
            this.displayOverlayView(this.canvas, grayscaleMode, invertEdges);
        } else {
            this.displaySingleView(this.canvas, grayscaleMode, invertEdges);
        }

        // Update zoom
        window.ZoomManager.updateZoom();
    }

    /**
     * Display compare view (side by side)
     */
    displayCompareView(canvas, grayscaleMode, invertEdges) {
        const originalMat = window.imageProcessor.getOriginalMat();
        const edgesMat = window.imageProcessor.getEdgesMat();
        
        if (!originalMat || !edgesMat) return;

        const width = originalMat.cols;
        const height = originalMat.rows;

        // Create combined canvas
        canvas.width = width * 2;
        canvas.height = height;

        // Create temporary canvases
        const tempCanvas1 = document.createElement('canvas');
        const tempCanvas2 = document.createElement('canvas');
        tempCanvas1.width = width;
        tempCanvas1.height = height;
        tempCanvas2.width = width;
        tempCanvas2.height = height;

        // Display original on left
        let displayMat = originalMat;
        if (grayscaleMode && originalMat.channels() === 3) {
            displayMat = new window.cv.Mat();
            window.cv.cvtColor(originalMat, displayMat, window.cv.COLOR_BGR2GRAY);
        }
        window.cv.imshow(tempCanvas1, displayMat);

        // Display edges on right
        const edgeDisplayMat = new window.cv.Mat();
        this.prepareEdgeImage(edgeDisplayMat, invertEdges);
        window.cv.imshow(tempCanvas2, edgeDisplayMat);

        // Combine on main canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(tempCanvas1, 0, 0);
        ctx.drawImage(tempCanvas2, width, 0);

        // Add separator line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width, 0);
        ctx.lineTo(width, height);
        ctx.stroke();

        // Cleanup
        if (displayMat !== originalMat) displayMat.delete();
        edgeDisplayMat.delete();
    }

    /**
     * Display overlay view
     */
    displayOverlayView(canvas, grayscaleMode, invertEdges) {
        const originalMat = window.imageProcessor.getOriginalMat();
        const edgesMat = window.imageProcessor.getEdgesMat();
        
        if (!originalMat || !edgesMat) return;

        const transparency = parseFloat(document.getElementById('transparency')?.value || 0.5);

        // Set canvas size
        canvas.width = originalMat.cols;
        canvas.height = originalMat.rows;

        // Create overlay
        const overlayMat = new window.cv.Mat();
        const edgeDisplayMat = new window.cv.Mat();

        this.prepareEdgeImage(edgeDisplayMat, invertEdges);

        // Convert edge image to 3 channels if needed
        if (edgeDisplayMat.channels() === 1) {
            window.cv.cvtColor(edgeDisplayMat, edgeDisplayMat, window.cv.COLOR_GRAY2BGR);
        }

        // Create overlay
        window.cv.addWeighted(originalMat, 1 - transparency, edgeDisplayMat, transparency, 0, overlayMat);

        // Display result
        window.cv.imshow(canvas, overlayMat);

        // Cleanup
        overlayMat.delete();
        edgeDisplayMat.delete();
    }

    /**
     * Display single view
     */
    displaySingleView(canvas, grayscaleMode, invertEdges) {
        const edgesMat = window.imageProcessor.getEdgesMat();
        if (!edgesMat) return;

        // Set canvas size
        canvas.width = edgesMat.cols;
        canvas.height = edgesMat.rows;

        // Prepare edge image
        const displayMat = new window.cv.Mat();
        this.prepareEdgeImage(displayMat, invertEdges);

        // Display result
        window.cv.imshow(canvas, displayMat);

        // Cleanup
        displayMat.delete();
    }

    /**
     * Prepare edge image for display
     */
    prepareEdgeImage(outputMat, invertEdges) {
        const edgesMat = window.imageProcessor.getEdgesMat();
        if (!edgesMat) return;

        // Copy edges
        edgesMat.copyTo(outputMat);

        // Invert if needed
        if (invertEdges) {
            window.cv.bitwise_not(outputMat, outputMat);
        }
    }

    /**
     * Get canvas element
     */
    getCanvas() {
        return this.canvas;
    }

    /**
     * Get canvas context
     */
    getContext() {
        return this.ctx;
    }

    /**
     * Clear canvas
     */
    clearCanvas() {
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Resize canvas
     */
    resizeCanvas(width, height) {
        if (this.canvas) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
    }

    /**
     * Get current display mode
     */
    getCurrentDisplayMode() {
        const compareView = document.getElementById('compareView')?.checked;
        const overlayMode = document.getElementById('overlayMode')?.checked;
        
        if (compareView) return 'compare';
        if (overlayMode) return 'overlay';
        return 'single';
    }

    /**
     * Set display mode
     */
    setDisplayMode(mode) {
        const compareView = document.getElementById('compareView');
        const overlayMode = document.getElementById('overlayMode');

        if (compareView) compareView.checked = mode === 'compare';
        if (overlayMode) overlayMode.checked = mode === 'overlay';

        if (window.imageProcessor.hasImage()) {
            this.displayResult();
        }
    }

    /**
     * Take screenshot of current canvas
     */
    takeScreenshot() {
        if (!this.canvas) return null;
        
        return this.canvas.toDataURL('image/png');
    }

    /**
     * Export canvas as blob
     */
    exportAsBlob(format = 'image/png', quality = 0.9) {
        if (!this.canvas) return null;

        return new Promise((resolve) => {
            this.canvas.toBlob(resolve, format, quality);
        });
    }
}

// Create global instance
window.DisplayManager = new DisplayManager();
