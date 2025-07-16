/**
 * File Service Module
 * Handles file upload and drag-and-drop functionality
 */

class FileService {
    constructor() {
        this.supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
    }

    /**
     * Initialize file service
     */
    init() {
        this.setupFileUpload();
        this.setupDragAndDrop();
        console.log('File Service initialized');
    }

    /**
     * Setup file upload functionality
     */
    setupFileUpload() {
        const imageInput = document.getElementById('imageInput');
        const fileBtn = document.getElementById('fileBtn');
        const dropZone = document.getElementById('dropZone');

        if (fileBtn) {
            fileBtn.addEventListener('click', () => {
                imageInput.click();
            });
        }

        if (dropZone) {
            dropZone.addEventListener('click', () => {
                imageInput.click();
            });
        }

        if (imageInput) {
            imageInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    this.handleFileSelect(file);
                }
            });
        }
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        const dropZone = document.getElementById('dropZone');
        
        if (!dropZone) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => this.highlight(dropZone), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => this.unhighlight(dropZone), false);
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        }, false);
    }

    /**
     * Prevent default drag behaviors
     */
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Highlight drop zone
     */
    highlight(element) {
        element.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
    }

    /**
     * Remove highlight from drop zone
     */
    unhighlight(element) {
        element.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
    }

    /**
     * Handle file selection
     */
    async handleFileSelect(file) {
        try {
            // Process file using central validation
            await this.handleFile(file);

        } catch (error) {
            console.error('Error handling file:', error);
            window.Utils.showToast(error.message, 'error');
        }
    }

    /**
     * Handle file processing
     */
    async handleFile(file) {
        // Use the central validation from Utils
        const validation = window.Utils.validateFile(file);
        if (!validation.isValid) {
            throw new Error(validation.error);
        }

        // Process the validated file
        return await window.imageProcessor.loadImageFromFile(file);
    }

    /**
     * Load image from file
     */
    async loadImageFromFile(file) {
        try {
            await window.imageProcessor.loadImageFromFile(file);
            window.Utils.showToast(`Image loaded: ${file.name}`, 'success');
        } catch (error) {
            console.error('Error loading file:', error);
            throw new Error(`Failed to load image: ${error.message}`);
        }
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get file info
     */
    getFileInfo(file) {
        return {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified),
            formattedSize: this.formatFileSize(file.size)
        };
    }

    /**
     * Check if file type is supported
     */
    isSupported(file) {
        return this.supportedTypes.includes(file.type);
    }

    /**
     * Get supported file types
     */
    getSupportedTypes() {
        return [...this.supportedTypes];
    }

    /**
     * Set max file size
     */
    setMaxFileSize(size) {
        this.maxFileSize = size;
    }

    /**
     * Get max file size
     */
    getMaxFileSize() {
        return this.maxFileSize;
    }

    /**
     * Add supported file type
     */
    addSupportedType(type) {
        if (!this.supportedTypes.includes(type)) {
            this.supportedTypes.push(type);
        }
    }

    /**
     * Remove supported file type
     */
    removeSupportedType(type) {
        const index = this.supportedTypes.indexOf(type);
        if (index > -1) {
            this.supportedTypes.splice(index, 1);
        }
    }

    /**
     * Create file input element
     */
    createFileInput(multiple = false) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = this.supportedTypes.join(',');
        input.multiple = multiple;
        return input;
    }

    /**
     * Open file picker
     */
    openFilePicker(multiple = false) {
        return new Promise((resolve, reject) => {
            const input = this.createFileInput(multiple);
            
            input.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                resolve(files);
            });

            input.addEventListener('cancel', () => {
                reject(new Error('File selection cancelled'));
            });

            input.click();
        });
    }
}

// Create global instance
window.FileService = new FileService();
