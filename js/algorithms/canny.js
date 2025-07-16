/**
 * Canny Edge Detection Algorithm
 * Klasický Canny edge detector s Gaussian blur
 */

/**
 * Aplikace Canny edge detection
 * @param {cv.Mat} src - Vstupní obrázek (grayscale)
 * @param {cv.Mat} dst - Výstupní obrázek
 * @param {Object} params - Parametry algoritmu
 */
function applyCanny(src, dst, params) {
    const { minThreshold = 50, maxThreshold = 150, blurSize = 5 } = params;
    
    const blurred = new cv.Mat();
    const ksize = new cv.Size(blurSize, blurSize);
    
    try {
        // Aplikace Gaussian blur pro redukci šumu
        cv.GaussianBlur(src, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);
        
        // Canny edge detection
        cv.Canny(blurred, dst, minThreshold, maxThreshold);
        
    } catch (error) {
        console.error('Chyba v Canny algoritmu:', error);
        throw error;
    } finally {
        // Vyčištění dočasných objektů
        if (blurred && !blurred.isDeleted()) {
            blurred.delete();
        }
    }
}

/**
 * Pokročilá Canny edge detection s pre-processing
 * @param {cv.Mat} src - Vstupní obrázek
 * @param {cv.Mat} dst - Výstupní obrázek
 * @param {Object} params - Parametry algoritmu
 */
function applyAdvancedCanny(src, dst, params) {
    const {
        minThreshold = 50,
        maxThreshold = 150,
        blurSize = 5,
        useMedianFilter = false,
        medianKernel = 5,
        useBilateralFilter = false,
        bilateralD = 9,
        bilateralSigmaColor = 75,
        bilateralSigmaSpace = 75,
        aperture = 3,
        l2gradient = false
    } = params;
    
    const processed = new cv.Mat();
    const blurred = new cv.Mat();
    
    try {
        // Pre-processing filtry
        if (useMedianFilter) {
            cv.medianBlur(src, processed, medianKernel);
        } else if (useBilateralFilter) {
            cv.bilateralFilter(src, processed, bilateralD, bilateralSigmaColor, bilateralSigmaSpace);
        } else {
            src.copyTo(processed);
        }
        
        // Gaussian blur
        const ksize = new cv.Size(blurSize, blurSize);
        cv.GaussianBlur(processed, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);
        
        // Canny edge detection s pokročilými parametry
        cv.Canny(blurred, dst, minThreshold, maxThreshold, aperture, l2gradient);
        
    } catch (error) {
        console.error('Chyba v pokročilém Canny algoritmu:', error);
        throw error;
    } finally {
        // Vyčištění dočasných objektů
        if (processed && !processed.isDeleted()) {
            processed.delete();
        }
        if (blurred && !blurred.isDeleted()) {
            blurred.delete();
        }
    }
}

/**
 * Automatické určení prahových hodnot pro Canny
 * @param {cv.Mat} src - Vstupní obrázek (grayscale)
 * @returns {Object} - Doporučené prahové hodnoty
 */
function autoCannyThresholds(src) {
    try {
        // Výpočet mediánu
        const median = cv.mean(src)[0]; // Zjednodušený přístup
        
        // Sigma pro automatické prahování
        const sigma = 0.33;
        
        // Výpočet prahů
        const lower = Math.max(0, (1.0 - sigma) * median);
        const upper = Math.min(255, (1.0 + sigma) * median);
        
        return {
            minThreshold: Math.round(lower),
            maxThreshold: Math.round(upper)
        };
        
    } catch (error) {
        console.error('Chyba při automatickém výpočtu prahů:', error);
        return {
            minThreshold: 50,
            maxThreshold: 150
        };
    }
}

/**
 * Hystereze post-processing pro Canny výsledky
 * @param {cv.Mat} src - Výstup z Canny
 * @param {cv.Mat} dst - Výstupní obrázek
 * @param {Object} params - Parametry
 */
function applyHysteresis(src, dst, params) {
    const { 
        lowThreshold = 50,
        highThreshold = 150,
        connectivity = 8 
    } = params;
    
    const labels = new cv.Mat();
    const stats = new cv.Mat();
    const centroids = new cv.Mat();
    
    try {
        // Komponenty analýza
        const numComponents = cv.connectedComponentsWithStats(
            src, labels, stats, centroids, connectivity, cv.CV_32S
        );
        
        // Filtrace podle velikosti komponent
        const minArea = 10; // Minimální plocha komponenty
        
        dst.setTo(new cv.Scalar(0));
        
        for (let i = 1; i < numComponents; i++) {
            const area = stats.intPtr(i, cv.CC_STAT_AREA)[0];
            if (area >= minArea) {
                const mask = new cv.Mat();
                cv.compare(labels, new cv.Scalar(i), mask, cv.CMP_EQ);
                dst.setTo(new cv.Scalar(255), mask);
                mask.delete();
            }
        }
        
    } catch (error) {
        console.error('Chyba v hysterezi:', error);
        src.copyTo(dst);
    } finally {
        if (labels && !labels.isDeleted()) labels.delete();
        if (stats && !stats.isDeleted()) stats.delete();
        if (centroids && !centroids.isDeleted()) centroids.delete();
    }
}

/**
 * Získání informací o algoritmu
 * @returns {Object} - Informace o algoritmu
 */
function getCannyInfo() {
    return {
        name: 'Canny Edge Detection',
        description: 'Klasický Canny edge detector s Gaussian blur pre-processing',
        parameters: {
            minThreshold: {
                type: 'number',
                min: 0,
                max: 255,
                default: 50,
                description: 'Minimální prahová hodnota'
            },
            maxThreshold: {
                type: 'number',
                min: 0,
                max: 255,
                default: 150,
                description: 'Maximální prahová hodnota'
            },
            blurSize: {
                type: 'number',
                min: 1,
                max: 15,
                default: 5,
                description: 'Velikost Gaussian blur kernelu (liché číslo)'
            },
            aperture: {
                type: 'number',
                min: 3,
                max: 7,
                default: 3,
                description: 'Velikost Sobel kernelu (3, 5, nebo 7)'
            },
            l2gradient: {
                type: 'boolean',
                default: false,
                description: 'Použít L2 gradient místo L1'
            }
        },
        requiresThresholds: true,
        category: 'edge-detection',
        performance: 'fast',
        quality: 'high'
    };
}

// Export funkcí
window.CannyAlgorithm = {
    apply: applyCanny,
    applyAdvanced: applyAdvancedCanny,
    autoThresholds: autoCannyThresholds,
    applyHysteresis: applyHysteresis,
    getInfo: getCannyInfo
}; 