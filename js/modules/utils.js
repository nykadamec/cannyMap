/**
 * Canny Edge Detection Tool - Utility Functions
 * Pomocné funkce pro celou aplikaci
 */

/**
 * Debounce function pro omezení četnosti volání
 * @param {Function} func - Funkce k debounce
 * @param {number} wait - Čekací doba v ms
 * @returns {Function} - Debounced funkce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function pro omezení frekvence volání
 * @param {Function} func - Funkce k throttle
 * @param {number} limit - Limit v ms
 * @returns {Function} - Throttled funkce
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Validace souboru
 * @param {File} file - Soubor k validaci
 * @returns {Object} - Výsledek validace
 */
function validateFile(file) {
    const { VALIDATION, ERROR_MESSAGES } = window.AppConfig;
    
    const result = {
        isValid: true,
        error: null,
        warnings: []
    };
    
    // Kontrola velikosti
    if (file.size > VALIDATION.IMAGE_MAX_SIZE) {
        result.isValid = false;
        result.error = ERROR_MESSAGES.FILE_TOO_LARGE;
        return result;
    }
    
    if (file.size < VALIDATION.IMAGE_MIN_SIZE) {
        result.isValid = false;
        result.error = 'Soubor je příliš malý';
        return result;
    }
    
    // Kontrola typu
    if (!file.type.startsWith('image/')) {
        result.isValid = false;
        result.error = ERROR_MESSAGES.UNSUPPORTED_FORMAT;
        return result;
    }
    
    // Kontrola názvu souboru
    if (file.name.length > VALIDATION.FILENAME_MAX_LENGTH) {
        result.warnings.push('Název souboru je příliš dlouhý');
    }
    
    // Varování pro velké soubory
    if (file.size > 10 * 1024 * 1024) { // 10MB
        result.warnings.push('Velký soubor může být pomalu zpracován');
    }
    
    return result;
}

/**
 * Formátování velikosti souboru
 * @param {number} bytes - Velikost v bytech
 * @returns {string} - Formátovaná velikost
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generování jedinečného ID
 * @returns {string} - Jedinečné ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Hlubké kopírování objektu
 * @param {Object} obj - Objekt k kopírování
 * @returns {Object} - Kopie objektu
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = deepClone(obj[key]);
        });
        return copy;
    }
}

/**
 * Kontrola, zda je element viditelný
 * @param {HTMLElement} element - Element k kontrole
 * @returns {boolean} - Je viditelný?
 */
function isElementVisible(element) {
    return element.offsetParent !== null;
}

/**
 * Animace hodnoty
 * @param {number} start - Počáteční hodnota
 * @param {number} end - Konečná hodnota
 * @param {number} duration - Délka animace v ms
 * @param {Function} callback - Callback funkce
 */
function animateValue(start, end, duration, callback) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * easeOut;
        
        callback(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Vytvoření toast notifikace
 * @param {string} message - Zpráva
 * @param {string} type - Typ (success, error, warning, info)
 * @param {number} duration - Délka zobrazení v ms
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Styly
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '6px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    // Barvy podle typu
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(toast);
    
    // Animace příchodu
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Automatické odstranění
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

/**
 * Získání rozměrů obrázku
 * @param {File} file - Soubor obrázku
 * @returns {Promise<Object>} - Rozměry obrázku
 */
function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: img.width,
                height: img.height,
                aspectRatio: img.width / img.height
            });
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
                            reject(new Error('Failed to load image'));
        };
        
        img.src = url;
    });
}

/**
 * Stažení souboru
 * @param {Blob} blob - Data k stažení
 * @param {string} filename - Název souboru
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Kontrola podpory funkcí prohlížeče
 * @param {string} feature - Název funkce
 * @returns {boolean} - Je podporována?
 */
function isFeatureSupported(feature) {
    const features = {
        canvas: !!document.createElement('canvas').getContext,
        webgl: !!document.createElement('canvas').getContext('webgl'),
        localStorage: typeof Storage !== 'undefined',
        fileReader: typeof FileReader !== 'undefined',
        webWorkers: typeof Worker !== 'undefined',
        fullscreen: document.fullscreenEnabled,
        geolocation: 'geolocation' in navigator,
        notifications: 'Notification' in window,
        serviceWorker: 'serviceWorker' in navigator
    };
    
    return features[feature] || false;
}

/**
 * Převod canvas na blob
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} mimeType - MIME typ
 * @param {number} quality - Kvalita (0-1)
 * @returns {Promise<Blob>} - Blob data
 */
function canvasToBlob(canvas, mimeType = 'image/png', quality = 0.9) {
    return new Promise((resolve) => {
        canvas.toBlob(resolve, mimeType, quality);
    });
}

/**
 * Výpočet kontrastního poměru
 * @param {string} color1 - První barva (hex)
 * @param {string} color2 - Druhá barva (hex)
 * @returns {number} - Kontrastní poměr
 */
function calculateContrastRatio(color1, color2) {
    const getLuminance = (color) => {
        const rgb = parseInt(color.substring(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

/**
 * Kopírování textu do schránky
 * @param {string} text - Text k kopírování
 * @returns {Promise<boolean>} - Úspěch operace
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // Fallback pro starší prohlížeče
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    }
}

/**
 * Formátování času
 * @param {number} ms - Čas v ms
 * @returns {string} - Formátovaný čas
 */
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

// Export funkcí
window.Utils = {
    debounce,
    throttle,
    validateFile,
    formatFileSize,
    generateId,
    deepClone,
    isElementVisible,
    animateValue,
    showToast,
    getImageDimensions,
    downloadBlob,
    isFeatureSupported,
    canvasToBlob,
    calculateContrastRatio,
    copyToClipboard,
    formatTime
}; 