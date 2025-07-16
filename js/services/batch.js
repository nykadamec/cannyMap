/**
 * Batch Service Module
 * Handles batch processing functionality
 */

class BatchService {
    constructor() {
        this.batchFiles = [];
        this.currentBatchIndex = 0;
        this.isProcessing = false;
        this.maxFiles = 50;
    }

    /**
     * Initialize batch service
     */
    init() {
        this.setupBatchProcessing();
        console.log('Batch Service initialized');
    }

    /**
     * Setup batch processing
     */
    setupBatchProcessing() {
        const batchModal = document.getElementById('batchModal');
        const closeBatchBtn = document.getElementById('closeBatchBtn');
        const batchFileInput = document.getElementById('batchFileInput');
        const startBatchBtn = document.getElementById('startBatchBtn');
        const batchProcessingBtn = document.getElementById('batchProcessingBtn');

        if (batchProcessingBtn) {
            batchProcessingBtn.addEventListener('click', () => {
                this.openBatchModal();
            });
        }

        if (closeBatchBtn) {
            closeBatchBtn.addEventListener('click', () => {
                this.closeBatchModal();
            });
        }

        if (batchFileInput) {
            batchFileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                this.setBatchFiles(files);
            });
        }

        if (startBatchBtn) {
            startBatchBtn.addEventListener('click', () => {
                this.startBatchProcessing();
            });
        }

        // Close modal when clicking outside
        if (batchModal) {
            batchModal.addEventListener('click', (e) => {
                if (e.target === batchModal) {
                    this.closeBatchModal();
                }
            });
        }
    }

    /**
     * Open batch modal
     */
    openBatchModal() {
        const batchModal = document.getElementById('batchModal');
        if (batchModal) {
            batchModal.style.display = 'flex';
        }
    }

    /**
     * Close batch modal
     */
    closeBatchModal() {
        const batchModal = document.getElementById('batchModal');
        if (batchModal) {
            batchModal.style.display = 'none';
        }
    }

    /**
     * Set batch files
     */
    setBatchFiles(files) {
        // Validate files
        const validFiles = files.filter(file => {
            return window.FileService.isSupported(file) && file.size <= window.FileService.getMaxFileSize();
        });

        if (validFiles.length !== files.length) {
            const invalidCount = files.length - validFiles.length;
            window.Utils.showToast(`${invalidCount} files were rejected (unsupported format or too large)`, 'warning');
        }

        // Limit number of files
        if (validFiles.length > this.maxFiles) {
            validFiles.splice(this.maxFiles);
            window.Utils.showToast(`Only first ${this.maxFiles} files will be processed`, 'warning');
        }

        this.batchFiles = validFiles;
        window.AppState.setBatchFiles(this.batchFiles);
        
        this.updateBatchFilesList();
    }

    /**
     * Update batch files list UI
     */
    updateBatchFilesList() {
        const batchFilesList = document.getElementById('batchFilesList');
        if (!batchFilesList) return;

        if (this.batchFiles.length === 0) {
            batchFilesList.innerHTML = '<p class="text-slate-500 text-center">No files selected</p>';
            return;
        }

        const filesList = this.batchFiles.map((file, index) => {
            const fileInfo = window.FileService.getFileInfo(file);
            return `
                <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div class="flex-1">
                        <div class="font-medium text-slate-700 dark:text-slate-300">${fileInfo.name}</div>
                        <div class="text-sm text-slate-500 dark:text-slate-400">${fileInfo.formattedSize}</div>
                    </div>
                    <button onclick="window.BatchService.removeFile(${index})" class="text-red-500 hover:text-red-700 p-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        batchFilesList.innerHTML = filesList;
    }

    /**
     * Remove file from batch
     */
    removeFile(index) {
        this.batchFiles.splice(index, 1);
        window.AppState.setBatchFiles(this.batchFiles);
        this.updateBatchFilesList();
    }

    /**
     * Start batch processing
     */
    async startBatchProcessing() {
        if (this.batchFiles.length === 0) {
            window.Utils.showToast('No files selected for batch processing', 'warning');
            return;
        }

        if (this.isProcessing) {
            window.Utils.showToast('Batch processing already in progress', 'warning');
            return;
        }

        this.isProcessing = true;
        this.currentBatchIndex = 0;

        const batchProgress = document.getElementById('batchProgress');
        const batchProgressBar = document.getElementById('batchProgressBar');
        const batchProgressText = document.getElementById('batchProgressText');
        const startBatchBtn = document.getElementById('startBatchBtn');

        // Show progress
        if (batchProgress) batchProgress.style.display = 'block';
        if (startBatchBtn) startBatchBtn.disabled = true;

        const zip = new JSZip();
        const timestamp = Date.now();

        try {
            for (let i = 0; i < this.batchFiles.length; i++) {
                const file = this.batchFiles[i];
                this.currentBatchIndex = i;

                // Update progress
                const progress = ((i + 1) / this.batchFiles.length) * 100;
                if (batchProgressBar) batchProgressBar.style.width = `${progress}%`;
                if (batchProgressText) batchProgressText.textContent = `${i + 1} / ${this.batchFiles.length}`;

                try {
                    // Process file
                    const result = await this.processFile(file);
                    
                    // Add to zip
                    const filename = `${file.name.split('.')[0]}_edges_${window.AppState.getAlgorithm()}.png`;
                    zip.file(filename, result.blob);

                } catch (error) {
                    console.error(`Error processing ${file.name}:`, error);
                    // Continue with next file
                }
            }

            // Generate and download ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const filename = `batch_edge_detection_${timestamp}.zip`;

            window.Utils.downloadBlob(zipBlob, filename);
            window.Utils.showToast(`Batch processing completed: ${this.batchFiles.length} files processed`, 'success');

            // Close modal
            this.closeBatchModal();

        } catch (error) {
            console.error('Batch processing error:', error);
            window.Utils.showToast('Error during batch processing', 'error');
        } finally {
            this.isProcessing = false;
            if (batchProgress) batchProgress.style.display = 'none';
            if (startBatchBtn) startBatchBtn.disabled = false;
            if (batchProgressBar) batchProgressBar.style.width = '0%';
            if (batchProgressText) batchProgressText.textContent = '0 / 0';
        }
    }

    /**
     * Process single file
     */
    async processFile(file) {
        // Load image
        await window.imageProcessor.loadImageFromFile(file);

        // Process with current settings
        await window.ProcessingManager.processImage();

        // Get result
        const canvas = document.createElement('canvas');
        const edgesMat = window.imageProcessor.getEdgesMat();
        
        if (!edgesMat) {
            throw new Error('Processing failed');
        }

        const displayMat = new window.cv.Mat();
        const invertEdges = document.getElementById('invertEdges')?.checked;

        // Prepare edges
        edgesMat.copyTo(displayMat);
        if (invertEdges) {
            window.cv.bitwise_not(displayMat, displayMat);
        }

        // Draw to canvas
        canvas.width = displayMat.cols;
        canvas.height = displayMat.rows;
        window.cv.imshow(canvas, displayMat);

        // Convert to blob
        const blob = await window.Utils.canvasToBlob(canvas, 'image/png');

        // Cleanup
        displayMat.delete();

        return { blob, canvas };
    }

    /**
     * Cancel batch processing
     */
    cancelBatchProcessing() {
        this.isProcessing = false;
        
        const batchProgress = document.getElementById('batchProgress');
        const startBatchBtn = document.getElementById('startBatchBtn');
        
        if (batchProgress) batchProgress.style.display = 'none';
        if (startBatchBtn) startBatchBtn.disabled = false;
        
        window.Utils.showToast('Batch processing cancelled', 'info');
    }

    /**
     * Get batch files
     */
    getBatchFiles() {
        return this.batchFiles;
    }

    /**
     * Get current batch index
     */
    getCurrentBatchIndex() {
        return this.currentBatchIndex;
    }

    /**
     * Check if batch processing is active
     */
    isProcessingActive() {
        return this.isProcessing;
    }

    /**
     * Get batch progress
     */
    getBatchProgress() {
        if (this.batchFiles.length === 0) return 0;
        return (this.currentBatchIndex / this.batchFiles.length) * 100;
    }

    /**
     * Set max files limit
     */
    setMaxFiles(limit) {
        this.maxFiles = limit;
    }

    /**
     * Get max files limit
     */
    getMaxFiles() {
        return this.maxFiles;
    }

    /**
     * Clear batch files
     */
    clearBatchFiles() {
        this.batchFiles = [];
        window.AppState.setBatchFiles([]);
        this.updateBatchFilesList();
    }

    /**
     * Get batch statistics
     */
    getBatchStatistics() {
        return {
            totalFiles: this.batchFiles.length,
            currentIndex: this.currentBatchIndex,
            isProcessing: this.isProcessing,
            progress: this.getBatchProgress()
        };
    }
}

// Create global instance
window.BatchService = new BatchService();
