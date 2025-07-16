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
            // Vyčištění předchozích dat
            if (this.originalImage) this.originalImage.delete();
            if (this.edgeImage) this.edgeImage.delete();

            // Vytvoření OpenCV Mat z obrázku
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            this.originalImage = this.cv.imread(canvas);
            
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
        if (!this.originalImage || !this.cv || this.isProcessing) {
            return Promise.reject(new Error('Image not loaded or already processing'));
        }

        this.isProcessing = true;
        
        try {
            // Získání parametrů s defaultními hodnotami
            const defaultParams = {
                minThreshold: 50,
                maxThreshold: 150,
                algorithm: this.currentAlgorithm,
                ...params
            };

            // Zpracování na hlavním threadu
            const result = await this.processImageMainThread(defaultParams);
            
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
                // Vytvoření pracovních Mat objektů
                const gray = new this.cv.Mat();
                const edges = new this.cv.Mat();

                // Konverze na grayscale
                this.cv.cvtColor(this.originalImage, gray, this.cv.COLOR_RGBA2GRAY);

                // Aplikace algoritmu podle výběru
                switch (this.currentAlgorithm) {
                    case 'canny':
                        if (window.CannyAlgorithm) {
                            window.CannyAlgorithm.apply(gray, edges, params);
                        } else {
                            this.applyCanny(gray, edges, params);
                        }
                        break;
                    case 'sobel':
                        if (window.SobelAlgorithm) {
                            window.SobelAlgorithm.apply(gray, edges, params);
                        } else {
                            this.applySobel(gray, edges, params);
                        }
                        break;
                    case 'prewitt':
                        if (window.PrewittAlgorithm) {
                            window.PrewittAlgorithm.apply(gray, edges, params);
                        } else {
                            this.applyPrewitt(gray, edges, params);
                        }
                        break;
                    case 'laplacian':
                        if (window.LaplacianAlgorithm) {
                            window.LaplacianAlgorithm.apply(gray, edges, params);
                        } else {
                            this.applyLaplacian(gray, edges, params);
                        }
                        break;
                    case 'scharr':
                        if (window.ScharrAlgorithm) {
                            window.ScharrAlgorithm.apply(gray, edges, params);
                        } else {
                            this.applyScharr(gray, edges, params);
                        }
                        break;
                    default:
                        this.applyCanny(gray, edges, params);
                }

                // Uložení výsledku
                if (this.edgeImage) this.edgeImage.delete();
                this.edgeImage = edges.clone();

                // Vyčištění dočasných Mat objektů
                gray.delete();
                edges.delete();
                
                resolve(this.edgeImage);

            } catch (error) {
                console.error('Image processing error:', error);
                reject(error);
            }
        });
    }

    /**
     * Fallback Canny implementation
     */
    applyCanny(src, dst, params) {
        const blurred = new this.cv.Mat();
        const ksize = new this.cv.Size(5, 5);
        this.cv.GaussianBlur(src, blurred, ksize, 0, 0, this.cv.BORDER_DEFAULT);
        this.cv.Canny(blurred, dst, params.minThreshold, params.maxThreshold);
        blurred.delete();
    }

    /**
     * Fallback Sobel implementation
     */
    applySobel(src, dst, params) {
        const sobelX = new this.cv.Mat();
        const sobelY = new this.cv.Mat();
        const absX = new this.cv.Mat();
        const absY = new this.cv.Mat();
        
        this.cv.Sobel(src, sobelX, this.cv.CV_64F, 1, 0, 3);
        this.cv.Sobel(src, sobelY, this.cv.CV_64F, 0, 1, 3);
        
        this.cv.convertScaleAbs(sobelX, absX);
        this.cv.convertScaleAbs(sobelY, absY);
        
        this.cv.addWeighted(absX, 0.5, absY, 0.5, 0, dst);
        
        sobelX.delete();
        sobelY.delete();
        absX.delete();
        absY.delete();
    }

    /**
     * Fallback Prewitt implementation
     */
    applyPrewitt(src, dst, params) {
        const kernelX = this.cv.matFromArray(3, 3, this.cv.CV_32FC1, [-1, 0, 1, -1, 0, 1, -1, 0, 1]);
        const kernelY = this.cv.matFromArray(3, 3, this.cv.CV_32FC1, [-1, -1, -1, 0, 0, 0, 1, 1, 1]);
        
        const prewittX = new this.cv.Mat();
        const prewittY = new this.cv.Mat();
        const absX = new this.cv.Mat();
        const absY = new this.cv.Mat();
        
        this.cv.filter2D(src, prewittX, this.cv.CV_64F, kernelX);
        this.cv.filter2D(src, prewittY, this.cv.CV_64F, kernelY);
        
        this.cv.convertScaleAbs(prewittX, absX);
        this.cv.convertScaleAbs(prewittY, absY);
        
        this.cv.addWeighted(absX, 0.5, absY, 0.5, 0, dst);
        
        kernelX.delete();
        kernelY.delete();
        prewittX.delete();
        prewittY.delete();
        absX.delete();
        absY.delete();
    }

    /**
     * Fallback Laplacian implementation
     */
    applyLaplacian(src, dst, params) {
        const blurred = new this.cv.Mat();
        const laplacian = new this.cv.Mat();
        
        this.cv.GaussianBlur(src, blurred, new this.cv.Size(3, 3), 0, 0, this.cv.BORDER_DEFAULT);
        this.cv.Laplacian(blurred, laplacian, this.cv.CV_64F, 1);
        this.cv.convertScaleAbs(laplacian, dst);
        
        blurred.delete();
        laplacian.delete();
    }

    /**
     * Fallback Scharr implementation
     */
    applyScharr(src, dst, params) {
        const scharrX = new this.cv.Mat();
        const scharrY = new this.cv.Mat();
        const absX = new this.cv.Mat();
        const absY = new this.cv.Mat();
        
        this.cv.Scharr(src, scharrX, this.cv.CV_64F, 1, 0);
        this.cv.Scharr(src, scharrY, this.cv.CV_64F, 0, 1);
        
        this.cv.convertScaleAbs(scharrX, absX);
        this.cv.convertScaleAbs(scharrY, absY);
        
        this.cv.addWeighted(absX, 0.5, absY, 0.5, 0, dst);
        
        scharrX.delete();
        scharrY.delete();
        absX.delete();
        absY.delete();
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
     * Získání zpracovaného obrázku
     * @returns {cv.Mat} - Zpracovaný obrázek
     */
    getEdgeImage() {
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
     * Vyčištění zdrojů
     */
    cleanup() {
        if (this.originalImage) {
            this.originalImage.delete();
            this.originalImage = null;
        }
        if (this.edgeImage) {
            this.edgeImage.delete();
            this.edgeImage = null;
        }
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