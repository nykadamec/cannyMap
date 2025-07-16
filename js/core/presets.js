/**
 * Preset Manager Module
 * Handles preset configurations for edge detection
 */

class PresetManager {
    constructor() {
        this.presets = window.AppConfig.PRESETS;
        this.currentPreset = 'normal';
    }

    /**
     * Apply preset values
     */
    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) {
            console.warn('Preset not found:', presetName);
            return;
        }

        // Update UI elements
        this.updatePresetUI(preset);

        // Update state
        window.AppState.setPreset(presetName);
        this.currentPreset = presetName;

        // Update preset buttons
        this.updatePresetButtons(presetName);

        // Reprocess image if available
        if (window.imageProcessor.hasImage()) {
            window.ProcessingManager.processImage();
        }

        console.log('Preset applied:', presetName);
    }

    /**
     * Update UI elements with preset values
     */
    updatePresetUI(preset) {
        const minThreshold = document.getElementById('minThreshold');
        const maxThreshold = document.getElementById('maxThreshold');
        const minThresholdInput = document.getElementById('minThresholdInput');
        const maxThresholdInput = document.getElementById('maxThresholdInput');
        const minThresholdValue = document.getElementById('minThresholdValue');
        const maxThresholdValue = document.getElementById('maxThresholdValue');

        if (minThreshold) minThreshold.value = preset.minThreshold;
        if (maxThreshold) maxThreshold.value = preset.maxThreshold;
        if (minThresholdInput) minThresholdInput.value = preset.minThreshold;
        if (maxThresholdInput) maxThresholdInput.value = preset.maxThreshold;
        if (minThresholdValue) minThresholdValue.textContent = preset.minThreshold;
        if (maxThresholdValue) maxThresholdValue.textContent = preset.maxThreshold;
    }

    /**
     * Update preset button states
     */
    updatePresetButtons(activePreset) {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-gradient-to-r', 'from-blue-500', 'to-indigo-500', 'text-white', 'shadow-lg');
            btn.classList.add('bg-slate-100', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-300');
        });

        const activeBtn = document.querySelector(`[data-preset="${activePreset}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-slate-100', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-300');
            activeBtn.classList.add('active', 'bg-gradient-to-r', 'from-blue-500', 'to-indigo-500', 'text-white', 'shadow-lg');
        }
    }

    /**
     * Get current preset
     */
    getCurrentPreset() {
        return this.currentPreset;
    }

    /**
     * Get preset configuration
     */
    getPreset(presetName) {
        return this.presets[presetName];
    }

    /**
     * Get all presets
     */
    getAllPresets() {
        return this.presets;
    }

    /**
     * Create custom preset
     */
    createCustomPreset(name, config) {
        this.presets[name] = config;
        return this.presets[name];
    }

    /**
     * Remove custom preset
     */
    removeCustomPreset(name) {
        if (this.presets[name] && !['soft', 'normal', 'sharp', 'artistic'].includes(name)) {
            delete this.presets[name];
            return true;
        }
        return false;
    }

    /**
     * Reset to default preset
     */
    resetToDefault() {
        this.applyPreset('normal');
    }

    /**
     * Get current preset values from UI
     */
    getCurrentPresetValues() {
        const minThreshold = parseInt(document.getElementById('minThreshold')?.value || 50);
        const maxThreshold = parseInt(document.getElementById('maxThreshold')?.value || 150);

        return {
            minThreshold,
            maxThreshold,
            description: 'Custom preset'
        };
    }

    /**
     * Save current settings as preset
     */
    saveCurrentAsPreset(name) {
        const config = this.getCurrentPresetValues();
        return this.createCustomPreset(name, config);
    }
}

// Create global instance
window.PresetManager = new PresetManager();
