/**
 * Export Service Module
 * Handles image export functionality
 */

class ExportService {
    constructor() {
        this.supportedFormats = ['png', 'jpeg', 'pdf', 'svg', 'zip'];
        this.defaultQuality = 0.9;
    }

    /**
     * Initialize export service
     */
    init() {
        this.setupButtons();
        console.log('Export Service initialized');
    }

    /**
     * Setup export buttons
     */
    setupButtons() {
        // Download PNG
        const downloadPNGBtn = document.getElementById('downloadPNG');
        if (downloadPNGBtn) {
            downloadPNGBtn.addEventListener('click', () => this.exportPNG());
        }

        // Download JPEG
        const downloadJPEGBtn = document.getElementById('downloadJPEG');
        if (downloadJPEGBtn) {
            downloadJPEGBtn.addEventListener('click', () => this.exportJPEG());
        }

        // Download original
        const downloadOriginalBtn = document.getElementById('downloadOriginal');
        if (downloadOriginalBtn) {
            downloadOriginalBtn.addEventListener('click', () => this.exportOriginal());
        }

        // Download combined
        const downloadCombinedBtn = document.getElementById('downloadCombined');
        if (downloadCombinedBtn) {
            downloadCombinedBtn.addEventListener('click', () => this.exportCombined());
        }

        // Download PDF
        const downloadPDFBtn = document.getElementById('downloadPDF');
        if (downloadPDFBtn) {
            downloadPDFBtn.addEventListener('click', () => this.exportPDF());
        }

        // Download SVG
        const downloadSVGBtn = document.getElementById('downloadSVG');
        if (downloadSVGBtn) {
            downloadSVGBtn.addEventListener('click', () => this.exportSVG());
        }

        // Download all as ZIP
        const downloadAllBtn = document.getElementById('downloadAll');
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', () => this.exportAllAsZip());
        }

        // Batch export
        const batchExportBtn = document.getElementById('batchExport');
        if (batchExportBtn) {
            batchExportBtn.addEventListener('click', () => this.openBatchExport());
        }
    }

    /**
     * Export as PNG
     */
    async exportPNG() {
        try {
            const canvas = window.DisplayManager.getCanvas();
            if (!canvas) {
                throw new Error('No image to export');
            }

            const blob = await window.Utils.canvasToBlob(canvas, 'image/png');
            const filename = this.generateFilename('png');
            
            window.Utils.downloadBlob(blob, filename);
            window.Utils.showToast('PNG exported successfully', 'success');

        } catch (error) {
            console.error('PNG export error:', error);
            window.Utils.showToast('Failed to export PNG', 'error');
        }
    }

    /**
     * Export as JPEG
     */
    async exportJPEG() {
        try {
            const canvas = window.DisplayManager.getCanvas();
            if (!canvas) {
                throw new Error('No image to export');
            }

            const quality = parseFloat(document.getElementById('jpegQuality')?.value || this.defaultQuality);
            const blob = await window.Utils.canvasToBlob(canvas, 'image/jpeg', quality);
            const filename = this.generateFilename('jpeg');
            
            window.Utils.downloadBlob(blob, filename);
            window.Utils.showToast('JPEG exported successfully', 'success');

        } catch (error) {
            console.error('JPEG export error:', error);
            window.Utils.showToast('Failed to export JPEG', 'error');
        }
    }

    /**
     * Export original image
     */
    async exportOriginal() {
        try {
            const originalMat = window.imageProcessor.getOriginalMat();
            if (!originalMat) {
                throw new Error('No original image available');
            }

            const canvas = document.createElement('canvas');
            canvas.width = originalMat.cols;
            canvas.height = originalMat.rows;
            
            window.cv.imshow(canvas, originalMat);
            
            const blob = await window.Utils.canvasToBlob(canvas, 'image/png');
            const filename = this.generateFilename('original', 'png');
            
            window.Utils.downloadBlob(blob, filename);
            window.Utils.showToast('Original image exported successfully', 'success');

        } catch (error) {
            console.error('Original export error:', error);
            window.Utils.showToast('Failed to export original image', 'error');
        }
    }

    /**
     * Export combined image (original + edges)
     */
    async exportCombined() {
        try {
            const originalMat = window.imageProcessor.getOriginalMat();
            const edgesMat = window.imageProcessor.getEdgesMat();
            
            if (!originalMat || !edgesMat) {
                throw new Error('No processed image available');
            }

            const canvas = document.createElement('canvas');
            canvas.width = originalMat.cols * 2;
            canvas.height = originalMat.rows;

            const ctx = canvas.getContext('2d');
            
            // Create temporary canvases
            const tempCanvas1 = document.createElement('canvas');
            const tempCanvas2 = document.createElement('canvas');
            tempCanvas1.width = originalMat.cols;
            tempCanvas1.height = originalMat.rows;
            tempCanvas2.width = edgesMat.cols;
            tempCanvas2.height = edgesMat.rows;

            // Draw original and edges
            window.cv.imshow(tempCanvas1, originalMat);
            window.cv.imshow(tempCanvas2, edgesMat);

            // Combine
            ctx.drawImage(tempCanvas1, 0, 0);
            ctx.drawImage(tempCanvas2, originalMat.cols, 0);

            const blob = await window.Utils.canvasToBlob(canvas, 'image/png');
            const filename = this.generateFilename('combined', 'png');
            
            window.Utils.downloadBlob(blob, filename);
            window.Utils.showToast('Combined image exported successfully', 'success');

        } catch (error) {
            console.error('Combined export error:', error);
            window.Utils.showToast('Failed to export combined image', 'error');
        }
    }

    /**
     * Export as PDF
     */
    async exportPDF() {
        try {
            const canvas = window.DisplayManager.getCanvas();
            if (!canvas) {
                throw new Error('No image to export');
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();

            // Calculate dimensions
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Scale to fit
            const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const scaledWidth = imgWidth * scale;
            const scaledHeight = imgHeight * scale;

            // Center the image
            const x = (pdfWidth - scaledWidth) / 2;
            const y = (pdfHeight - scaledHeight) / 2;

            // Add image to PDF
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

            // Add metadata
            pdf.setProperties({
                title: 'Edge Detection Result',
                subject: 'Edge Detection',
                author: 'Edge Detection Studio',
                creator: 'Edge Detection Studio'
            });

            const filename = this.generateFilename('pdf');
            pdf.save(filename);
            
            window.Utils.showToast('PDF exported successfully', 'success');

        } catch (error) {
            console.error('PDF export error:', error);
            window.Utils.showToast('Failed to export PDF', 'error');
        }
    }

    /**
     * Export as SVG
     */
    async exportSVG() {
        try {
            const edgesMat = window.imageProcessor.getEdgesMat();
            if (!edgesMat) {
                throw new Error('No processed image available');
            }

            const svg = this.createSVGFromEdges(edgesMat);
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const filename = this.generateFilename('svg');
            
            window.Utils.downloadBlob(blob, filename);
            window.Utils.showToast('SVG exported successfully', 'success');

        } catch (error) {
            console.error('SVG export error:', error);
            window.Utils.showToast('Failed to export SVG', 'error');
        }
    }

    /**
     * Export all formats as ZIP
     */
    async exportAllAsZip() {
        try {
            const zip = new JSZip();
            const timestamp = Date.now();

            // Add PNG
            const pngBlob = await window.Utils.canvasToBlob(window.DisplayManager.getCanvas(), 'image/png');
            zip.file(`edges_${timestamp}.png`, pngBlob);

            // Add JPEG
            const jpegBlob = await window.Utils.canvasToBlob(window.DisplayManager.getCanvas(), 'image/jpeg', 0.9);
            zip.file(`edges_${timestamp}.jpeg`, jpegBlob);

            // Add original
            const originalCanvas = document.createElement('canvas');
            const originalMat = window.imageProcessor.getOriginalMat();
            if (originalMat) {
                originalCanvas.width = originalMat.cols;
                originalCanvas.height = originalMat.rows;
                window.cv.imshow(originalCanvas, originalMat);
                const originalBlob = await window.Utils.canvasToBlob(originalCanvas, 'image/png');
                zip.file(`original_${timestamp}.png`, originalBlob);
            }

            // Generate ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const filename = `edge_detection_${timestamp}.zip`;
            
            window.Utils.downloadBlob(zipBlob, filename);
            window.Utils.showToast('All formats exported as ZIP', 'success');

        } catch (error) {
            console.error('ZIP export error:', error);
            window.Utils.showToast('Failed to export ZIP', 'error');
        }
    }

    /**
     * Create SVG from edges
     */
    createSVGFromEdges(edgesMat) {
        const width = edgesMat.cols;
        const height = edgesMat.rows;
        const data = edgesMat.data;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
        svg += '<g fill="none" stroke="black" stroke-width="1">';

        // Sample edges and create paths
        const step = 2; // Sample every 2nd pixel
        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const idx = y * width + x;
                if (data[idx] > 128) { // Edge pixel
                    svg += `<circle cx="${x}" cy="${y}" r="0.5"/>`;
                }
            }
        }

        svg += '</g></svg>';
        return svg;
    }

    /**
     * Generate filename
     */
    generateFilename(type, extension = null) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const algorithm = window.AppState.getAlgorithm();
        const ext = extension || type;
        
        return `${type}_${algorithm}_${timestamp}.${ext}`;
    }

    /**
     * Open batch export modal
     */
    openBatchExport() {
        const batchModal = document.getElementById('batchModal');
        if (batchModal) {
            batchModal.style.display = 'flex';
        }
    }

    /**
     * Check if format is supported
     */
    isFormatSupported(format) {
        return this.supportedFormats.includes(format.toLowerCase());
    }

    /**
     * Get supported formats
     */
    getSupportedFormats() {
        return [...this.supportedFormats];
    }

    /**
     * Set default quality
     */
    setDefaultQuality(quality) {
        this.defaultQuality = Math.max(0.1, Math.min(1, quality));
    }

    /**
     * Get default quality
     */
    getDefaultQuality() {
        return this.defaultQuality;
    }
}

// Create global instance
window.ExportService = new ExportService();
