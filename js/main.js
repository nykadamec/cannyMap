/**
 * Edge Detection Studio - Main Application (Refactored)
 * Legacy compatibility layer and initialization
 */

// Legacy global variables for backward compatibility
let cv = null;
let currentZoom = 1;
let webcamStream = null;
let currentAlgorithm = 'canny';
let currentPreset = 'normal';
let isProcessing = false;
let batchFiles = [];
let currentBatchIndex = 0;

// Legacy functions for backward compatibility
function hideLoadingOverlay() {
    window.AppInitializer.hideLoadingOverlay();
}

function initializeApp() {
    window.AppInitializer.initializeApp();
}

function handleImageLoaded(event) {
    window.AppInitializer.handleImageLoaded(event);
}

function handleImageProcessed(event) {
    window.AppInitializer.handleImageProcessed(event);
}

function setupFileUpload() {
    window.FileService.setupFileUpload();
}

async function loadImageFromFile(file) {
    return await window.FileService.handleFileSelect(file);
}

async function processImage() {
    return await window.ProcessingManager.processImage();
}

function applyPreset(presetName) {
    window.PresetManager.applyPreset(presetName);
}

function selectAlgorithm(algorithm) {
    window.AlgorithmManager.selectAlgorithm(algorithm);
}

function showControlSections() {
    window.UIManager.showControlSections();
}

function displayOriginalImage() {
    window.DisplayManager.displayOriginalImage();
}

function displayResult() {
    window.DisplayManager.displayResult();
}

function displayCompareView(canvas, grayscaleMode, invertEdges) {
    window.DisplayManager.displayCompareView(canvas, grayscaleMode, invertEdges);
}

function displayOverlayView(canvas, grayscaleMode, invertEdges) {
    window.DisplayManager.displayOverlayView(canvas, grayscaleMode, invertEdges);
}

function displaySingleView(canvas, grayscaleMode, invertEdges) {
    window.DisplayManager.displaySingleView(canvas, grayscaleMode, invertEdges);
}

function prepareEdgeImage(outputMat, invertEdges) {
    window.DisplayManager.prepareEdgeImage(outputMat, invertEdges);
}

function resetZoom() {
    window.ZoomManager.resetZoom();
}

function updateZoom() {
    window.ZoomManager.updateZoom();
}

function setupWebcam() {
    // Webcam setup is now handled by WebcamService
    console.log('Webcam setup handled by WebcamService');
}

function closeWebcam() {
    window.WebcamService.closeWebcam();
}

function captureFromWebcam() {
    window.WebcamService.captureFromWebcam();
}

function setupDragAndDrop() {
    window.FileService.setupDragAndDrop();
}

function loadDarkMode() {
    window.AppInitializer.loadDarkMode();
}

function setupDownloadButtons() {
    window.ExportService.setupButtons();
}

async function downloadOriginalImage() {
    return await window.ExportService.exportOriginal();
}

async function downloadEdgesImage(format = 'png') {
    if (format === 'png') {
        return await window.ExportService.exportPNG();
    } else if (format === 'jpeg') {
        return await window.ExportService.exportJPEG();
    }
}

async function downloadCombinedImage() {
    return await window.ExportService.exportCombined();
}

async function downloadPDF() {
    return await window.ExportService.exportPDF();
}

async function downloadSVG() {
    return await window.ExportService.exportSVG();
}

async function downloadAllAsZip() {
    return await window.ExportService.exportAllAsZip();
}

function openBatchExport() {
    window.BatchService.openBatchModal();
}

function updateBatchFilesList(files) {
    window.BatchService.setBatchFiles(files);
}

async function startBatchProcessing() {
    return await window.BatchService.startBatchProcessing();
}

function setupKeyboardShortcuts() {
    // Keyboard shortcuts are now handled by UIManager
    console.log('Keyboard shortcuts handled by UIManager');
}

function setupControlElements() {
    window.UIManager.setupControlElements();
}

// Initialize modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    if (window.ZoomManager) window.ZoomManager.init();
    if (window.DisplayManager) window.DisplayManager.init();
    
    // Show loading overlay
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    console.log('Refactored application structure loaded');
    
    // Check if all modules are loaded
    console.log('Module availability check:', {
        AppState: !!window.AppState,
        AppInitializer: !!window.AppInitializer,
        ProcessingManager: !!window.ProcessingManager,
        PresetManager: !!window.PresetManager,
        AlgorithmManager: !!window.AlgorithmManager,
        UIManager: !!window.UIManager,
        DisplayManager: !!window.DisplayManager,
        ZoomManager: !!window.ZoomManager,
        FileService: !!window.FileService,
        ExportService: !!window.ExportService,
        WebcamService: !!window.WebcamService,
        BatchService: !!window.BatchService
    });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    try {
        if (window.imageProcessor && typeof window.imageProcessor.cleanup === 'function') {
            window.imageProcessor.cleanup();
        }
    } catch (error) {
        console.error('Error during imageProcessor cleanup:', error);
    }
    
    try {
        if (window.WebcamService && window.WebcamService.isWebcamActive()) {
            window.WebcamService.closeWebcam();
        }
    } catch (error) {
        console.error('Error during webcam cleanup:', error);
    }
});

// Sync legacy variables with new state
setInterval(() => {
    if (window.AppState) {
        cv = window.AppState.getOpenCV();
        currentZoom = window.AppState.getZoom();
        webcamStream = window.AppState.getWebcamStream();
        currentAlgorithm = window.AppState.getAlgorithm();
        currentPreset = window.AppState.getPreset();
        isProcessing = window.AppState.isProcessingActive();
        batchFiles = window.AppState.getBatchFiles();
    }
}, 100);

// Debug information
console.log('Main.js loaded - refactored modular structure');
console.log('Available modules:', {
    AppState: !!window.AppState,
    AppInitializer: !!window.AppInitializer,
    ProcessingManager: !!window.ProcessingManager,
    PresetManager: !!window.PresetManager,
    AlgorithmManager: !!window.AlgorithmManager,
    UIManager: !!window.UIManager,
    DisplayManager: !!window.DisplayManager,
    ZoomManager: !!window.ZoomManager,
    FileService: !!window.FileService,
    ExportService: !!window.ExportService,
    WebcamService: !!window.WebcamService,
    BatchService: !!window.BatchService
});
