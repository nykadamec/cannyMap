/**
 * Algorithm Manager Module
 * Handles algorithm selection and configuration
 */

class AlgorithmManager {
    constructor() {
        this.algorithms = window.AppConfig.ALGORITHMS;
        this.currentAlgorithm = 'canny';
    }

    /**
     * Select algorithm
     */
    selectAlgorithm(algorithm) {
        if (!this.algorithms[algorithm]) {
            console.warn('Algorithm not found:', algorithm);
            return;
        }

        // Update state
        window.AppState.setAlgorithm(algorithm);
        this.currentAlgorithm = algorithm;

        // Update UI
        this.updateAlgorithmUI(algorithm);

        // Update threshold visibility
        this.updateThresholdVisibility(algorithm);

        // Reprocess image if available
        if (window.imageProcessor.hasImage()) {
            window.ProcessingManager.processImage();
        }

        console.log('Algorithm selected:', algorithm);
    }

    /**
     * Update algorithm UI
     */
    updateAlgorithmUI(algorithm) {
        // Update algorithm buttons
        document.querySelectorAll('.algorithm-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-gradient-to-r', 'from-blue-500', 'to-indigo-500', 'text-white', 'shadow-lg');
            btn.classList.add('bg-slate-100', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-300');
        });

        const activeBtn = document.querySelector(`[data-algorithm="${algorithm}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-slate-100', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-300');
            activeBtn.classList.add('active', 'bg-gradient-to-r', 'from-blue-500', 'to-indigo-500', 'text-white', 'shadow-lg');
        }
    }

    /**
     * Update threshold controls visibility
     */
    updateThresholdVisibility(algorithm) {
        const thresholdSection = document.getElementById('thresholdSection');
        const algorithmConfig = this.algorithms[algorithm];

        if (thresholdSection) {
            if (algorithmConfig.requiresThresholds) {
                thresholdSection.style.display = 'block';
            } else {
                thresholdSection.style.display = 'none';
            }
        }
    }

    /**
     * Get current algorithm
     */
    getCurrentAlgorithm() {
        return this.currentAlgorithm;
    }

    /**
     * Get algorithm configuration
     */
    getAlgorithm(algorithmName) {
        return this.algorithms[algorithmName];
    }

    /**
     * Get all algorithms
     */
    getAllAlgorithms() {
        return this.algorithms;
    }

    /**
     * Check if algorithm requires thresholds
     */
    requiresThresholds(algorithm = this.currentAlgorithm) {
        return this.algorithms[algorithm]?.requiresThresholds || false;
    }

    /**
     * Get algorithm parameters
     */
    getAlgorithmParams(algorithm = this.currentAlgorithm) {
        const config = this.algorithms[algorithm];
        if (!config) return {};

        const params = {
            algorithm,
            name: config.name,
            description: config.description
        };

        // Add specific parameters based on algorithm
        if (config.requiresThresholds) {
            params.minThreshold = parseInt(document.getElementById('minThreshold')?.value || 50);
            params.maxThreshold = parseInt(document.getElementById('maxThreshold')?.value || 150);
        }

        return params;
    }

    /**
     * Reset to default algorithm
     */
    resetToDefault() {
        this.selectAlgorithm('canny');
    }

    /**
     * Get supported algorithms list
     */
    getSupportedAlgorithms() {
        return Object.keys(this.algorithms);
    }

    /**
     * Validate algorithm parameters
     */
    validateParams(params) {
        const algorithm = params.algorithm || this.currentAlgorithm;
        const config = this.algorithms[algorithm];

        if (!config) {
            throw new Error(`Unsupported algorithm: ${algorithm}`);
        }

        if (config.requiresThresholds) {
            if (!params.minThreshold || !params.maxThreshold) {
                throw new Error('Threshold parameters are required for this algorithm');
            }

            if (params.minThreshold >= params.maxThreshold) {
                throw new Error('Minimum threshold must be less than maximum threshold');
            }
        }

        return true;
    }
}

// Create global instance
window.AlgorithmManager = new AlgorithmManager();
