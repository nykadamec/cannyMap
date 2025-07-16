/**
 * Image Processing Module
 * Main module for image processing
 */

class ImageProcessor {
    constructor() {
        this.cv = null;
        this.originalImage = null;
        this.edgeImage = null;
        this.currentAlgorithm = 'canny';
        this.isProcessing = false;
        this.isCleanedUp = false;
    }

    /**
     * Inicializace s OpenCV objektem
     * @param {Object} cv - OpenCV objekt
     */
    init(cv) {
        this.cv = cv;
        console.log('ImageProcessor inicializován');
    }

    /**
     * Načtení obrázku ze souboru
     * @param {File} file - Soubor obrázku
     * @returns {Promise} - Promise s výsledkem načtení
     */
    async loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const validation = window.Utils.validateFile(file);
            if (!validation.isValid) {
                reject(new Error(validation.error));
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    this.processLoadedImage(img);
                    resolve(img);
                };
                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };
                img.src = event.target.result;
            };
            reader.onerror = () => {
                reject(new Error('Nepodařilo se načíst soubor'));
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Zpracování načteného obrázku
     * @param {Image} img - HTML Image element
     */
    processLoadedImage(img) {
        try {
            // Reset cleanup flag
            this.isCleanedUp = false;
            
            // Vyčištění předchozích dat
            this.safeDeleteMat(this.originalImage, 'Previous Original Image');
            this.safeDeleteMat(this.edgeImage, 'Previous Edge Image');

            // Vytvoření OpenCV Mat z obrázku
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            this.originalImage = this.cv.imread(canvas);
            this.edgeImage = null; // Reset edge image
            
            // Trigger events
            this.dispatchEvent('imageLoaded', {
                image: this.originalImage,
                width: img.width,
                height: img.height
            });
            
        } catch (error) {
            console.error('Image processing error:', error);
            throw error;
        }
    }

    /**
     * Process image with selected algorithm
     * @param {Object} params - Algorithm parameters
     * @returns {Promise} - Promise with processing result
     */
    async processImage(params = {}) {
        if (!this.originalImage || !this.cv) {
            return Promise.reject(new Error('Image not loaded or OpenCV not ready'));
        }

        if (this.isProcessing) {
            console.warn('Image processing already in progress');
            return Promise.reject(new Error('Image processing already in progress'));
        }

        this.isProcessing = true;
        console.log('Starting image processing...');
        
        try {
            // Získání parametrů s defaultními hodnotami
            const defaultParams = {
                minThreshold: 50,
                maxThreshold: 150,
                algorithm: this.currentAlgorithm,
                ...params
            };

            console.log('Processing with params:', defaultParams);

            // Zpracování na hlavním threadu
            const result = await this.processImageMainThread(defaultParams);
            
            console.log('Image processing completed successfully');
            
            // Trigger events
            this.dispatchEvent('imageProcessed', {
                algorithm: this.currentAlgorithm,
                params: defaultParams,
                result: result
            });
            
            return result;
            
        } catch (error) {
            console.error('Image processing error:', error);
            throw error;
        } finally {
            this.isProcessing = false;
            console.log('Processing flag reset');
        }
    }

    /**
     * Zpracování obrázku na hlavním threadu
     * @param {Object} params - Parametry algoritmu
     * @returns {Promise} - Promise s výsledkem
     */
    async processImageMainThread(params) {
        return new Promise((resolve, reject) => {
            try {
                console.log('Starting processImageMainThread with params:', params);
                
                // Vytvoření pracovních Mat objektů
                const gray = new this.cv.Mat();
                const edges = new this.cv.Mat();
                console.log('Created temporary Mat objects');

                // Konverze na grayscale
                this.cv.cvtColor(this.originalImage, gray, this.cv.COLOR_RGBA2GRAY);
                console.log('Converted to grayscale');

                // Aplikace algoritmu podle výběru
                console.log('Applying algorithm:', this.currentAlgorithm);
                switch (this.currentAlgorithm) {
                    case 'canny':
                        if (window.CannyAlgorithm) {
                            console.log('Using CannyAlgorithm');
                            window.CannyAlgorithm.apply(gray, edges, params);
                        } else {
                            throw new Error('Canny algorithm not loaded');
                        }
                        break;
                    case 'sobel':
                        if (window.SobelAlgorithm) {
                            console.log('Using SobelAlgorithm');
                            window.SobelAlgorithm.apply(gray, edges, params);
                        } else {
                            throw new Error('Sobel algorithm not loaded');
                        }
                        break;
                    case 'prewitt':
                        if (window.PrewittAlgorithm) {
                            console.log('Using PrewittAlgorithm');
                            window.PrewittAlgorithm.apply(gray, edges, params);
                        } else {
                            throw new Error('Prewitt algorithm not loaded');
                        }
                        break;
                    case 'laplacian':
                        if (window.LaplacianAlgorithm) {
                            console.log('Using LaplacianAlgorithm');
                            window.LaplacianAlgorithm.apply(gray, edges, params);
                        } else {
                            throw new Error('Laplacian algorithm not loaded');
                        }
                        break;
                    case 'scharr':
                        if (window.ScharrAlgorithm) {
                            console.log('Using ScharrAlgorithm');
                            window.ScharrAlgorithm.apply(gray, edges, params);
                        } else {
                            throw new Error('Scharr algorithm not loaded');
                        }
                        break;
                    default:
                        if (window.CannyAlgorithm) {
                            console.log('Using default CannyAlgorithm');
                            window.CannyAlgorithm.apply(gray, edges, params);
                        } else {
                            throw new Error('Default Canny algorithm not loaded');
                        }
                }

                console.log('Algorithm applied successfully');

                // Uložení výsledku
                this.safeDeleteMat(this.edgeImage, 'Previous Edge Image');
                this.edgeImage = edges.clone();
                console.log('Edge image cloned and saved');

                // Vyčištění dočasných Mat objektů
                this.safeDeleteMat(gray, 'Temporary Gray Mat');
                this.safeDeleteMat(edges, 'Temporary Edges Mat');
                console.log('Temporary Mat objects cleaned up');
                
                resolve(this.edgeImage);
                console.log('processImageMainThread completed successfully');

            } catch (error) {
                console.error('Error in processImageMainThread:', error);
                
                // Vyčištění při chybě
                this.safeDeleteMat(gray, 'Gray Mat (error cleanup)');
                this.safeDeleteMat(edges, 'Edges Mat (error cleanup)');
                
                reject(error);
            }
        });
    }

    /**
     * Nastavení algoritmu
     * @param {string} algorithm - Název algoritmu
     */
    setAlgorithm(algorithm) {
        this.currentAlgorithm = algorithm;
    }

    /**
     * Získání aktuálního algoritmu
     * @returns {string} - Název algoritmu
     */
    getAlgorithm() {
        return this.currentAlgorithm;
    }

    /**
     * Získání původního obrázku
     * @returns {cv.Mat} - Původní obrázek
     */
    getOriginalImage() {
        return this.originalImage;
    }

    /**
     * Získání původního obrázku (alias pro getOriginalImage)
     * @returns {cv.Mat} - Původní obrázek
     */
    getOriginalMat() {
        return this.originalImage;
    }

    /**
     * Získání zpracovaného obrázku
     * @returns {cv.Mat} - Zpracovaný obrázek
     */
    getEdgeImage() {
        return this.edgeImage;
    }

    /**
     * Získání zpracovaného obrázku (alias pro getEdgeImage)
     * @returns {cv.Mat} - Zpracovaný obrázek
     */
    getEdgesMat() {
        return this.edgeImage;
    }

    /**
     * Kontrola, zda je obrázek načten
     * @returns {boolean} - Je obrázek načten?
     */
    hasImage() {
        return this.originalImage !== null;
    }

    /**
     * Kontrola, zda probíhá zpracování
     * @returns {boolean} - Probíhá zpracování?
     */
    isProcessingImage() {
        return this.isProcessing;
    }

    /**
     * Reset processing state (use only if stuck)
     */
    resetProcessingState() {
        console.warn('Resetting processing state');
        this.isProcessing = false;
    }

    /**
     * Safely delete OpenCV Mat object
     * @param {cv.Mat} mat - Mat object to delete
     * @param {string} name - Name for debugging
     */
    safeDeleteMat(mat, name = 'Mat') {
        try {
            if (mat && typeof mat === 'object' && typeof mat.delete === 'function') {
                // Check if the Mat is already deleted by calling isDeleted()
                if (typeof mat.isDeleted === 'function' && !mat.isDeleted()) {
                    mat.delete();
                    console.log(`${name} deleted successfully`);
                } else if (typeof mat.isDeleted !== 'function') {
                    // If isDeleted() is not available, try to delete anyway
                    mat.delete();
                    console.log(`${name} deleted successfully (no isDeleted check)`);
                }
            }
        } catch (error) {
            // Only log error if it's not the expected "already deleted" error
            if (error.message && !error.message.includes('already deleted')) {
                console.error(`Error deleting ${name}:`, error);
            }
        }
    }

    /**
     * Vyčištění zdrojů
     */
    cleanup() {
        if (this.isProcessing) {
            console.warn('Cleanup called while processing - deferring cleanup');
            // Defer cleanup until processing is complete
            setTimeout(() => this.cleanup(), 100);
            return;
        }

        if (this.isCleanedUp) {
            console.warn('Cleanup already called - skipping');
            return;
        }

        this.isCleanedUp = true;

        // Safely delete original image
        this.safeDeleteMat(this.originalImage, 'Original Image');
        this.originalImage = null;
        
        // Safely delete edge image
        this.safeDeleteMat(this.edgeImage, 'Edge Image');
        this.edgeImage = null;

        console.log('ImageProcessor cleanup completed');
    }

    /**
     * Dispatch custom event
     * @param {string} eventName - Název události
     * @param {Object} data - Data události
     */
    dispatchEvent(eventName, data) {
        const event = new CustomEvent(`imageProcessor:${eventName}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }
}

// Vytvoření globální instance
window.ImageProcessor = ImageProcessor;
window.imageProcessor = new ImageProcessor();

// Debug helper functions
window.debugImageProcessor = {
    getStatus: () => ({
        isProcessing: window.imageProcessor.isProcessing,
        hasImage: window.imageProcessor.hasImage(),
        algorithm: window.imageProcessor.getAlgorithm(),
        isCleanedUp: window.imageProcessor.isCleanedUp
    }),
    resetProcessing: () => window.imageProcessor.resetProcessingState(),
    cleanup: () => window.imageProcessor.cleanup()
}; 