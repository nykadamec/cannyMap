/**
 * Sobel Edge Detection Algorithm
 * Sobel operator pro detekci hran
 */

function applySobel(src, dst, params) {
    const sobelX = new cv.Mat();
    const sobelY = new cv.Mat();
    const absX = new cv.Mat();
    const absY = new cv.Mat();
    
    try {
        cv.Sobel(src, sobelX, cv.CV_64F, 1, 0, 3);
        cv.Sobel(src, sobelY, cv.CV_64F, 0, 1, 3);
        
        cv.convertScaleAbs(sobelX, absX);
        cv.convertScaleAbs(sobelY, absY);
        
        cv.addWeighted(absX, 0.5, absY, 0.5, 0, dst);
        
    } catch (error) {
        console.error('Chyba v Sobel algoritmu:', error);
        throw error;
    } finally {
        if (sobelX && !sobelX.isDeleted()) sobelX.delete();
        if (sobelY && !sobelY.isDeleted()) sobelY.delete();
        if (absX && !absX.isDeleted()) absX.delete();
        if (absY && !absY.isDeleted()) absY.delete();
    }
}

window.SobelAlgorithm = {
    apply: applySobel,
    getInfo: () => ({
        name: 'Sobel Edge Detection',
        description: 'Sobel operator pro detekci hran',
        requiresThresholds: false,
        category: 'edge-detection',
        performance: 'fast',
        quality: 'medium'
    })
}; 