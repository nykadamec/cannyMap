/**
 * Scharr Edge Detection Algorithm
 * Scharr operator - přesnější než Sobel
 */

function applyScharr(src, dst, params) {
    const scharrX = new cv.Mat();
    const scharrY = new cv.Mat();
    const absX = new cv.Mat();
    const absY = new cv.Mat();
    
    try {
        cv.Scharr(src, scharrX, cv.CV_64F, 1, 0);
        cv.Scharr(src, scharrY, cv.CV_64F, 0, 1);
        
        cv.convertScaleAbs(scharrX, absX);
        cv.convertScaleAbs(scharrY, absY);
        
        cv.addWeighted(absX, 0.5, absY, 0.5, 0, dst);
        
    } catch (error) {
        console.error('Chyba v Scharr algoritmu:', error);
        throw error;
    } finally {
        if (scharrX && !scharrX.isDeleted()) scharrX.delete();
        if (scharrY && !scharrY.isDeleted()) scharrY.delete();
        if (absX && !absX.isDeleted()) absX.delete();
        if (absY && !absY.isDeleted()) absY.delete();
    }
}

window.ScharrAlgorithm = {
    apply: applyScharr,
    getInfo: () => ({
        name: 'Scharr Edge Detection',
        description: 'Scharr operator - přesnější než Sobel',
        requiresThresholds: false,
        category: 'edge-detection',
        performance: 'fast',
        quality: 'high'
    })
}; 