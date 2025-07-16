/**
 * Laplacian Edge Detection Algorithm
 * Laplacian of Gaussian edge detector
 */

function applyLaplacian(src, dst, params) {
    const blurred = new cv.Mat();
    const laplacian = new cv.Mat();
    
    try {
        cv.GaussianBlur(src, blurred, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);
        cv.Laplacian(blurred, laplacian, cv.CV_64F, 1);
        cv.convertScaleAbs(laplacian, dst);
        
    } catch (error) {
        console.error('Chyba v Laplacian algoritmu:', error);
        throw error;
    } finally {
        if (blurred && !blurred.isDeleted()) blurred.delete();
        if (laplacian && !laplacian.isDeleted()) laplacian.delete();
    }
}

window.LaplacianAlgorithm = {
    apply: applyLaplacian,
    getInfo: () => ({
        name: 'Laplacian Edge Detection',
        description: 'Laplacian of Gaussian edge detector',
        requiresThresholds: false,
        category: 'edge-detection',
        performance: 'fast',
        quality: 'medium'
    })
}; 