/**
 * Prewitt Edge Detection Algorithm
 * Prewitt operator podobný Sobel
 */

function applyPrewitt(src, dst, params) {
    const kernelX = cv.matFromArray(3, 3, cv.CV_32FC1, [-1, 0, 1, -1, 0, 1, -1, 0, 1]);
    const kernelY = cv.matFromArray(3, 3, cv.CV_32FC1, [-1, -1, -1, 0, 0, 0, 1, 1, 1]);
    
    const prewittX = new cv.Mat();
    const prewittY = new cv.Mat();
    const absX = new cv.Mat();
    const absY = new cv.Mat();
    
    try {
        cv.filter2D(src, prewittX, cv.CV_64F, kernelX);
        cv.filter2D(src, prewittY, cv.CV_64F, kernelY);
        
        cv.convertScaleAbs(prewittX, absX);
        cv.convertScaleAbs(prewittY, absY);
        
        cv.addWeighted(absX, 0.5, absY, 0.5, 0, dst);
        
    } catch (error) {
        console.error('Chyba v Prewitt algoritmu:', error);
        throw error;
    } finally {
        if (kernelX && !kernelX.isDeleted()) kernelX.delete();
        if (kernelY && !kernelY.isDeleted()) kernelY.delete();
        if (prewittX && !prewittX.isDeleted()) prewittX.delete();
        if (prewittY && !prewittY.isDeleted()) prewittY.delete();
        if (absX && !absX.isDeleted()) absX.delete();
        if (absY && !absY.isDeleted()) absY.delete();
    }
}

window.PrewittAlgorithm = {
    apply: applyPrewitt,
    getInfo: () => ({
        name: 'Prewitt Edge Detection',
        description: 'Prewitt operator podobný Sobel',
        requiresThresholds: false,
        category: 'edge-detection',
        performance: 'fast',
        quality: 'medium'
    })
}; 