/**
 * Edge Detection Studio - Main Application
 * Main application initialization
 */

// Global variables
let cv = null;
let currentZoom = 1;
let webcamStream = null;
let currentAlgorithm = 'canny';
let currentPreset = 'normal';
let isProcessing = false;
let batchFiles = [];
let currentBatchIndex = 0;

// OpenCV initialization
function onOpenCvReady() {
    console.log('OpenCV.js is ready');
    hideLoadingOverlay();
    cv = window.cv;

    // Initialize image processor
    window.imageProcessor.init(cv);

    // Initialize application
    initializeApp();
}

/**
 * Hide loading overlay after OpenCV loads
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Initialize application and event listeners
 */
function initializeApp() {
    // Check browser compatibility
    if (!window.checkBrowserCompatibility()) {
        window.Utils.showToast('Your browser does not support some features', 'warning', 5000);
    }

    // Load dark mode from localStorage
    loadDarkMode();

    // Initialize modules
    initializeModules();

    // Setup event listeners
    setupEventListeners();

    // Debug information
    if (window.AppConfig.CONFIG.DEBUG) {
        window.debugConfig();
    }

    console.log('Application initialized');
}

/**
 * Initialize modules
 */
function initializeModules() {
    // Basic initialization without external managers
    console.log('Modules initialized');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Image processor events
    document.addEventListener('imageProcessor:imageLoaded', handleImageLoaded);
    document.addEventListener('imageProcessor:imageProcessed', handleImageProcessed);

    // Preset buttons
    document.querySelectorAll('[data-preset]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const preset = e.target.dataset.preset;
            applyPreset(preset);
        });
    });

    // Algorithm buttons
    document.querySelectorAll('[data-algorithm]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const algorithm = e.target.dataset.algorithm;
            selectAlgorithm(algorithm);
        });
    });

    // File upload
    setupFileUpload();

    // Webcam
    setupWebcam();

    // Drag and drop
    setupDragAndDrop();

    // Keyboard shortcuts
    setupKeyboardShortcuts();

    // Download functionality
    setupDownloadButtons();

    // Control elements
    setupControlElements();
}

/**
 * Handle image loaded event
 */
function handleImageLoaded(event) {
    const { width, height } = event.detail;

    // Show UI sections
    showControlSections();

    // Display original image
    displayOriginalImage();

    // Automatic processing with default values
    processImage();

    window.Utils.showToast('Image loaded', 'success');
}

/**
 * Handle image processed event
 */
function handleImageProcessed(event) {
    const { algorithm, params } = event.detail;

    // Display result
    displayResult();
}

/**
 * Setup file upload functionality
 */
function setupFileUpload() {
    const imageInput = document.getElementById('imageInput');
    const fileBtn = document.getElementById('fileBtn');
    const dropZone = document.getElementById('dropZone');

    if (fileBtn) {
        fileBtn.addEventListener('click', () => {
            imageInput.click();
        });
    }

    if (dropZone) {
        dropZone.addEventListener('click', () => {
            imageInput.click();
        });
    }

    if (imageInput) {
        imageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                loadImageFromFile(file);
            }
        });
    }
}

/**
 * Load image from file
 */
async function loadImageFromFile(file) {
    try {
        await window.imageProcessor.loadImageFromFile(file);
    } catch (error) {
        console.error('Error loading file:', error);
        window.Utils.showToast(error.message, 'error');
    }
}

/**
 * Zpracování obrázku
 */
async function processImage() {
    if (!window.imageProcessor.hasImage() || isProcessing) {
        return;
    }

    isProcessing = true;

    try {
        const params = {
            minThreshold: parseInt(document.getElementById('minThreshold')?.value || 50),
            maxThreshold: parseInt(document.getElementById('maxThreshold')?.value || 150),
            algorithm: currentAlgorithm
        };

        await window.imageProcessor.processImage(params);

    } catch (error) {
        console.error('Processing error:', error);
        window.Utils.showToast('Image processing error', 'error');
    } finally {
        isProcessing = false;
    }
}

/**
 * Aplikace preset hodnot
 */
function applyPreset(presetName) {
    const preset = window.AppConfig.PRESETS[presetName];
    if (!preset) return;

    currentPreset = presetName;

    // Aktualizace UI
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

    // Aktualizace aktivního tlačítka
    document.querySelectorAll('.preset-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-preset="${presetName}"]`)?.classList.add('active');

    // Zpracování obrázku
    if (window.imageProcessor.hasImage()) {
        processImage();
    }
}

/**
 * Výběr algoritmu
 */
function selectAlgorithm(algorithm) {
    currentAlgorithm = algorithm;
    window.imageProcessor.setAlgorithm(algorithm);

    // Aktualizace UI
    document.querySelectorAll('.algorithm-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });

    const selectedBtn = document.querySelector(`[data-algorithm="${algorithm}"]`);
    if (selectedBtn) {
        selectedBtn.classList.remove('bg-gray-200', 'text-gray-700');
        selectedBtn.classList.add('active', 'bg-blue-600', 'text-white');
    }

    // Zobrazit/skrýt threshold kontroly podle algoritmu
    const thresholdControls = document.querySelector('.space-y-4');
    if (thresholdControls) {
        const algorithmInfo = window.AppConfig.ALGORITHMS[algorithm];
        if (algorithmInfo && algorithmInfo.requiresThresholds) {
            thresholdControls.style.display = 'block';
        } else {
            thresholdControls.style.display = 'none';
        }
    }

    // Zpracování obrázku
    if (window.imageProcessor.hasImage()) {
        processImage();
    }
}

/**
 * Zobrazení control sekcí
 */
function showControlSections() {
    const sections = [
        'controlsSection',
        'imageSection',
        'exportSection'
    ];

    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = 'block';
        }
    });
}

/**
 * Zobrazení původního obrázku
 */
function displayOriginalImage() {
    const canvas = document.getElementById('outputCanvas');
    const originalImage = window.imageProcessor.getOriginalImage();

    if (canvas && originalImage) {
        cv.imshow(canvas, originalImage);
        resetZoom();
    }
}

/**
 * Zobrazení výsledku
 */
function displayResult() {
    const canvas = document.getElementById('outputCanvas');
    const edgeImage = window.imageProcessor.getEdgeImage();
    const originalImage = window.imageProcessor.getOriginalImage();

    if (!canvas || !edgeImage || !originalImage) return;

    const grayscaleMode = document.getElementById('grayscaleMode')?.checked;
    const invertEdges = document.getElementById('invertEdges')?.checked;
    const compareView = document.getElementById('compareView')?.checked;
    const overlayMode = document.getElementById('overlayMode')?.checked;

    try {
        if (compareView) {
            displayCompareView(canvas, grayscaleMode, invertEdges);
        } else if (overlayMode) {
            displayOverlayView(canvas, grayscaleMode, invertEdges);
        } else {
            displaySingleView(canvas, grayscaleMode, invertEdges);
        }

        resetZoom();
    } catch (error) {
        console.error('Chyba při zobrazování výsledku:', error);
    }
}

/**
 * Zobrazení porovnávacího pohledu
 */
function displayCompareView(canvas, grayscaleMode, invertEdges) {
    const originalImage = window.imageProcessor.getOriginalImage();
    const edgeImage = window.imageProcessor.getEdgeImage();

    const combinedMat = new cv.Mat();
    const leftMat = new cv.Mat();
    const rightMat = new cv.Mat();

    try {
        // Příprava levého obrázku (původní)
        if (grayscaleMode) {
            cv.cvtColor(originalImage, leftMat, cv.COLOR_RGBA2GRAY);
            cv.cvtColor(leftMat, leftMat, cv.COLOR_GRAY2RGBA);
        } else {
            originalImage.copyTo(leftMat);
        }

        // Příprava pravého obrázku (hrany)
        prepareEdgeImage(rightMat, invertEdges);

        // Kombinování obrázků vedle sebe
        const leftROI = new cv.Rect(0, 0, leftMat.cols, leftMat.rows);
        const rightROI = new cv.Rect(leftMat.cols, 0, rightMat.cols, rightMat.rows);

        combinedMat.create(leftMat.rows, leftMat.cols * 2, leftMat.type());
        leftMat.copyTo(combinedMat.roi(leftROI));
        rightMat.copyTo(combinedMat.roi(rightROI));

        cv.imshow(canvas, combinedMat);

    } finally {
        // Vyčištění
        combinedMat.delete();
        leftMat.delete();
        rightMat.delete();
    }
}

/**
 * Zobrazení overlay pohledu
 */
function displayOverlayView(canvas, grayscaleMode, invertEdges) {
    const originalImage = window.imageProcessor.getOriginalImage();

    const overlayMat = new cv.Mat();
    const backgroundMat = new cv.Mat();
    const edgesMat = new cv.Mat();

    try {
        // Příprava pozadí
        if (grayscaleMode) {
            cv.cvtColor(originalImage, backgroundMat, cv.COLOR_RGBA2GRAY);
            cv.cvtColor(backgroundMat, backgroundMat, cv.COLOR_GRAY2RGBA);
        } else {
            originalImage.copyTo(backgroundMat);
        }

        // Příprava hran
        prepareEdgeImage(edgesMat, invertEdges);

        // Vytvoření overlay s transparentností
        const transparency = parseFloat(document.getElementById('transparency')?.value || 0.5);
        cv.addWeighted(backgroundMat, 1 - transparency, edgesMat, transparency, 0, overlayMat);

        cv.imshow(canvas, overlayMat);

    } finally {
        // Vyčištění
        overlayMat.delete();
        backgroundMat.delete();
        edgesMat.delete();
    }
}

/**
 * Zobrazení jednotlivého pohledu
 */
function displaySingleView(canvas, grayscaleMode, invertEdges) {
    const displayMat = new cv.Mat();

    try {
        prepareEdgeImage(displayMat, invertEdges);
        cv.imshow(canvas, displayMat);
    } finally {
        displayMat.delete();
    }
}

/**
 * Příprava obrázku hran
 */
function prepareEdgeImage(outputMat, invertEdges) {
    const edgeImage = window.imageProcessor.getEdgeImage();
    const tempMat = new cv.Mat();

    try {
        if (invertEdges) {
            cv.bitwise_not(edgeImage, tempMat);
        } else {
            edgeImage.copyTo(tempMat);
        }

        // Konverze na RGBA
        cv.cvtColor(tempMat, outputMat, cv.COLOR_GRAY2RGBA);

    } finally {
        tempMat.delete();
    }
}

/**
 * Reset zoom
 */
function resetZoom() {
    currentZoom = 1;
    const zoomLevel = document.getElementById('zoomLevel');
    if (zoomLevel) zoomLevel.textContent = '100%';

    const canvas = document.getElementById('outputCanvas');
    if (canvas) {
        canvas.style.transform = 'scale(1)';
    }
}

/**
 * Nastavení control elementů
 */
function setupControlElements() {
    // Threshold sliders
    const minThreshold = document.getElementById('minThreshold');
    const maxThreshold = document.getElementById('maxThreshold');
    const minThresholdInput = document.getElementById('minThresholdInput');
    const maxThresholdInput = document.getElementById('maxThresholdInput');
    const minThresholdValue = document.getElementById('minThresholdValue');
    const maxThresholdValue = document.getElementById('maxThresholdValue');

    // Min threshold slider
    if (minThreshold) {
        minThreshold.addEventListener('input', (e) => {
            const value = e.target.value;
            if (minThresholdValue) minThresholdValue.textContent = value;
            if (minThresholdInput) minThresholdInput.value = value;

            // Ensure min < max
            if (maxThreshold && parseInt(value) >= parseInt(maxThreshold.value)) {
                const newMax = parseInt(value) + 10;
                maxThreshold.value = newMax;
                if (maxThresholdValue) maxThresholdValue.textContent = newMax;
                if (maxThresholdInput) maxThresholdInput.value = newMax;
            }

            if (window.imageProcessor.hasImage()) {
                processImage();
            }
        });
    }

    // Max threshold slider
    if (maxThreshold) {
        maxThreshold.addEventListener('input', (e) => {
            const value = e.target.value;
            if (maxThresholdValue) maxThresholdValue.textContent = value;
            if (maxThresholdInput) maxThresholdInput.value = value;

            // Ensure max > min
            if (minThreshold && parseInt(value) <= parseInt(minThreshold.value)) {
                const newMin = parseInt(value) - 10;
                minThreshold.value = Math.max(0, newMin);
                if (minThresholdValue) minThresholdValue.textContent = Math.max(0, newMin);
                if (minThresholdInput) minThresholdInput.value = Math.max(0, newMin);
            }

            if (window.imageProcessor.hasImage()) {
                processImage();
            }
        });
    }

    // Min threshold input
    if (minThresholdInput) {
        minThresholdInput.addEventListener('change', (e) => {
            const value = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
            e.target.value = value;
            if (minThreshold) minThreshold.value = value;
            if (minThresholdValue) minThresholdValue.textContent = value;

            if (window.imageProcessor.hasImage()) {
                processImage();
            }
        });
    }

    // Max threshold input
    if (maxThresholdInput) {
        maxThresholdInput.addEventListener('change', (e) => {
            const value = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
            e.target.value = value;
            if (maxThreshold) maxThreshold.value = value;
            if (maxThresholdValue) maxThresholdValue.textContent = value;

            if (window.imageProcessor.hasImage()) {
                processImage();
            }
        });
    }

    // Display options checkboxes
    const grayscaleMode = document.getElementById('grayscaleMode');
    const invertEdges = document.getElementById('invertEdges');
    const compareView = document.getElementById('compareView');
    const overlayMode = document.getElementById('overlayMode');
    const transparency = document.getElementById('transparency');
    const transparencyValue = document.getElementById('transparencyValue');
    const transparencyControl = document.getElementById('transparencyControl');

    if (grayscaleMode) {
        grayscaleMode.addEventListener('change', () => {
            if (window.imageProcessor.hasImage()) {
                displayResult();
            }
        });
    }

    if (invertEdges) {
        invertEdges.addEventListener('change', () => {
            if (window.imageProcessor.hasImage()) {
                displayResult();
            }
        });
    }

    if (compareView) {
        compareView.addEventListener('change', (e) => {
            if (e.target.checked && overlayMode) {
                overlayMode.checked = false;
                if (transparencyControl) transparencyControl.style.display = 'none';
            }
            if (window.imageProcessor.hasImage()) {
                displayResult();
            }
        });
    }

    if (overlayMode) {
        overlayMode.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (compareView) compareView.checked = false;
                if (transparencyControl) transparencyControl.style.display = 'block';
            } else {
                if (transparencyControl) transparencyControl.style.display = 'none';
            }
            if (window.imageProcessor.hasImage()) {
                displayResult();
            }
        });
    }

    if (transparency) {
        transparency.addEventListener('input', (e) => {
            const value = e.target.value;
            if (transparencyValue) transparencyValue.textContent = value;
            if (window.imageProcessor.hasImage() && overlayMode?.checked) {
                displayResult();
            }
        });
    }

    // JPEG quality slider
    const jpegQuality = document.getElementById('jpegQuality');
    const jpegQualityValue = document.getElementById('jpegQualityValue');

    if (jpegQuality) {
        jpegQuality.addEventListener('input', (e) => {
            const value = e.target.value;
            if (jpegQualityValue) jpegQualityValue.textContent = value;
        });
    }

    // Process and Reset buttons
    const processBtn = document.getElementById('processBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (processBtn) {
        processBtn.addEventListener('click', () => {
            if (window.imageProcessor.hasImage()) {
                processImage();
            } else {
                window.Utils.showToast('Nejprve nahrajte obrázek', 'warning');
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // Reset to default values
            applyPreset('normal');
            selectAlgorithm('canny');

            // Reset checkboxes
            if (grayscaleMode) grayscaleMode.checked = false;
            if (invertEdges) invertEdges.checked = false;
            if (compareView) compareView.checked = false;
            if (overlayMode) overlayMode.checked = false;
            if (transparencyControl) transparencyControl.style.display = 'none';

            // Reset zoom
            resetZoom();

            if (window.imageProcessor.hasImage()) {
                processImage();
            }
        });
    }

    // Zoom controls
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const zoomReset = document.getElementById('zoomReset');

    if (zoomIn) {
        zoomIn.addEventListener('click', () => {
            currentZoom = Math.min(currentZoom * 1.2, 5);
            updateZoom();
        });
    }

    if (zoomOut) {
        zoomOut.addEventListener('click', () => {
            currentZoom = Math.max(currentZoom / 1.2, 0.1);
            updateZoom();
        });
    }

    if (zoomReset) {
        zoomReset.addEventListener('click', () => {
            resetZoom();
        });
    }

    // Batch processing modal controls
    const batchModal = document.getElementById('batchModal');
    const closeBatchBtn = document.getElementById('closeBatchBtn');
    const batchFileInput = document.getElementById('batchFileInput');
    const startBatchBtn = document.getElementById('startBatchBtn');
    const batchProcessingBtn = document.getElementById('batchProcessingBtn');

    if (batchProcessingBtn) {
        batchProcessingBtn.addEventListener('click', () => {
            if (batchModal) batchModal.style.display = 'flex';
        });
    }

    if (closeBatchBtn) {
        closeBatchBtn.addEventListener('click', () => {
            if (batchModal) batchModal.style.display = 'none';
        });
    }

    if (batchFileInput) {
        batchFileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            updateBatchFilesList(files);
        });
    }

    if (startBatchBtn) {
        startBatchBtn.addEventListener('click', () => {
            startBatchProcessing();
        });
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            const isDark = document.body.classList.contains('dark');
            localStorage.setItem('darkMode', isDark);
        });
    }
}

/**
 * Aktualizace zoom
 */
function updateZoom() {
    const canvas = document.getElementById('outputCanvas');
    const zoomLevel = document.getElementById('zoomLevel');

    if (canvas) {
        canvas.style.transform = `scale(${currentZoom})`;
    }

    if (zoomLevel) {
        zoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
    }
}

/**
 * Aktualizace seznamu batch souborů
 */
function updateBatchFilesList(files) {
    const batchFilesList = document.getElementById('batchFilesList');
    if (!batchFilesList) return;

    batchFiles = files.filter(file => file.type.startsWith('image/'));

    if (batchFiles.length === 0) {
        batchFilesList.innerHTML = '<p class="text-gray-500">No valid image files selected</p>';
        return;
    }

    const listHTML = batchFiles.map((file, index) => `
        <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span class="text-sm">${file.name}</span>
            <span class="text-xs text-gray-500">${window.Utils.formatFileSize(file.size)}</span>
        </div>
    `).join('');

    batchFilesList.innerHTML = `
        <div class="space-y-2">
            <p class="text-sm font-medium">Selected files (${batchFiles.length}):</p>
            ${listHTML}
        </div>
    `;
}

/**
 * Spuštění batch processingu
 */
async function startBatchProcessing() {
    if (batchFiles.length === 0) {
        window.Utils.showToast('No files selected for batch processing', 'warning');
        return;
    }

    const batchProgress = document.getElementById('batchProgress');
    const batchProgressBar = document.getElementById('batchProgressBar');
    const batchProgressText = document.getElementById('batchProgressText');
    const startBatchBtn = document.getElementById('startBatchBtn');

    if (batchProgress) batchProgress.style.display = 'block';
    if (startBatchBtn) startBatchBtn.disabled = true;

    const zip = new JSZip();
    const timestamp = Date.now();

    try {
        for (let i = 0; i < batchFiles.length; i++) {
            const file = batchFiles[i];

            // Update progress
            const progress = ((i + 1) / batchFiles.length) * 100;
            if (batchProgressBar) batchProgressBar.style.width = `${progress}%`;
            if (batchProgressText) batchProgressText.textContent = `${i + 1} / ${batchFiles.length}`;

            try {
                // Load and process image
                await window.imageProcessor.loadImageFromFile(file);
                await processImage();

                // Get processed image
                const canvas = document.createElement('canvas');
                const displayMat = new cv.Mat();
                const invertEdges = document.getElementById('invertEdges')?.checked;

                prepareEdgeImage(displayMat, invertEdges);
                canvas.width = displayMat.cols;
                canvas.height = displayMat.rows;
                cv.imshow(canvas, displayMat);

                const blob = await window.Utils.canvasToBlob(canvas, 'image/png');
                const filename = `${file.name.split('.')[0]}_edges_${currentAlgorithm}.png`;

                zip.file(filename, blob);
                displayMat.delete();

            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
            }
        }

        // Generate and download ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const filename = `batch_edge_detection_${timestamp}.zip`;

        window.Utils.downloadBlob(zipBlob, filename);
        window.Utils.showToast(`Batch processing completed: ${batchFiles.length} files processed`, 'success');

        // Close modal
        const batchModal = document.getElementById('batchModal');
        if (batchModal) batchModal.style.display = 'none';

    } catch (error) {
        console.error('Batch processing error:', error);
        window.Utils.showToast('Error during batch processing', 'error');
    } finally {
        if (batchProgress) batchProgress.style.display = 'none';
        if (startBatchBtn) startBatchBtn.disabled = false;
        if (batchProgressBar) batchProgressBar.style.width = '0%';
        if (batchProgressText) batchProgressText.textContent = '0 / 0';
    }
}

/**
 * Nastavení webkamery
 */
function setupWebcam() {
    const webcamBtn = document.getElementById('webcamBtn');
    const webcamModal = document.getElementById('webcamModal');
    const closeWebcamBtn = document.getElementById('closeWebcamBtn');
    const captureBtn = document.getElementById('captureBtn');
    const webcamVideo = document.getElementById('webcamVideo');

    if (webcamBtn) {
        webcamBtn.addEventListener('click', async () => {
            try {
                webcamStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 }
                });
                webcamVideo.srcObject = webcamStream;
                webcamModal.style.display = 'flex';
            } catch (error) {
                window.Utils.showToast('Nepodařilo se získat přístup k webkameře', 'error');
            }
        });
    }

    if (closeWebcamBtn) {
        closeWebcamBtn.addEventListener('click', () => {
            closeWebcam();
        });
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            captureFromWebcam();
        });
    }
}

/**
 * Zavření webkamery
 */
function closeWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    const webcamModal = document.getElementById('webcamModal');
    if (webcamModal) {
        webcamModal.style.display = 'none';
    }
}

/**
 * Zachycení obrázku z webkamery
 */
function captureFromWebcam() {
    const video = document.getElementById('webcamVideo');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Konverze na blob a načtení jako obrázek
    canvas.toBlob((blob) => {
        loadImageFromFile(blob);
        closeWebcam();
    });
}

/**
 * Nastavení drag and drop
 */
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-blue-500', 'bg-blue-50');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');

            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                loadImageFromFile(files[0]);
            }
        });
    }
}

/**
 * Načtení dark mode z localStorage
 */
function loadDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark');
    }
}

/**
 * Nastavení download tlačítek
 */
function setupDownloadButtons() {
    // Download original image
    const downloadOriginalBtn = document.getElementById('downloadOriginal');
    if (downloadOriginalBtn) {
        downloadOriginalBtn.addEventListener('click', () => downloadOriginalImage());
    }

    // Download edges PNG
    const downloadEdgesBtn = document.getElementById('downloadEdges');
    if (downloadEdgesBtn) {
        downloadEdgesBtn.addEventListener('click', () => downloadEdgesImage('png'));
    }

    // Download edges JPEG
    const downloadEdgesJPGBtn = document.getElementById('downloadEdgesJPG');
    if (downloadEdgesJPGBtn) {
        downloadEdgesJPGBtn.addEventListener('click', () => downloadEdgesImage('jpeg'));
    }

    // Download combined
    const downloadCombinedBtn = document.getElementById('downloadCombined');
    if (downloadCombinedBtn) {
        downloadCombinedBtn.addEventListener('click', () => downloadCombinedImage());
    }

    // Download PDF
    const downloadPDFBtn = document.getElementById('downloadPDF');
    if (downloadPDFBtn) {
        downloadPDFBtn.addEventListener('click', () => downloadPDF());
    }

    // Download SVG
    const downloadSVGBtn = document.getElementById('downloadSVG');
    if (downloadSVGBtn) {
        downloadSVGBtn.addEventListener('click', () => downloadSVG());
    }

    // Download all as ZIP
    const downloadAllBtn = document.getElementById('downloadAll');
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', () => downloadAllAsZip());
    }

    // Batch export
    const batchExportBtn = document.getElementById('batchExport');
    if (batchExportBtn) {
        batchExportBtn.addEventListener('click', () => openBatchExport());
    }
}

/**
 * Download původního obrázku
 */
async function downloadOriginalImage() {
    if (!window.imageProcessor.hasImage()) {
        window.Utils.showToast('Nejprve nahrajte obrázek', 'warning');
        return;
    }

    try {
        const canvas = document.createElement('canvas');
        const originalImage = window.imageProcessor.getOriginalImage();

        canvas.width = originalImage.cols;
        canvas.height = originalImage.rows;

        cv.imshow(canvas, originalImage);

        const blob = await window.Utils.canvasToBlob(canvas, 'image/png');
        const filename = `original_${Date.now()}.png`;

        window.Utils.downloadBlob(blob, filename);
        window.Utils.showToast('Původní obrázek stažen', 'success');

    } catch (error) {
        console.error('Download error:', error);
        window.Utils.showToast('Chyba při stahování', 'error');
    }
}

/**
 * Download obrázku hran
 */
async function downloadEdgesImage(format = 'png') {
    if (!window.imageProcessor.hasImage() || !window.imageProcessor.getEdgeImage()) {
        window.Utils.showToast('Nejprve zpracujte obrázek', 'warning');
        return;
    }

    try {
        const canvas = document.createElement('canvas');
        const edgeImage = window.imageProcessor.getEdgeImage();
        const displayMat = new cv.Mat();

        // Příprava obrázku podle nastavení
        const invertEdges = document.getElementById('invertEdges')?.checked;
        prepareEdgeImage(displayMat, invertEdges);

        canvas.width = displayMat.cols;
        canvas.height = displayMat.rows;

        cv.imshow(canvas, displayMat);

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpeg' ? parseFloat(document.getElementById('jpegQuality')?.value || 90) / 100 : 0.9;

        const blob = await window.Utils.canvasToBlob(canvas, mimeType, quality);
        const filename = `edges_${currentAlgorithm}_${Date.now()}.${format}`;

        window.Utils.downloadBlob(blob, filename);
        window.Utils.showToast(`Hrany staženy jako ${format.toUpperCase()}`, 'success');

        displayMat.delete();

    } catch (error) {
        console.error('Download error:', error);
        window.Utils.showToast('Chyba při stahování', 'error');
    }
}

/**
 * Download kombinovaného obrázku
 */
async function downloadCombinedImage() {
    if (!window.imageProcessor.hasImage() || !window.imageProcessor.getEdgeImage()) {
        window.Utils.showToast('Nejprve zpracujte obrázek', 'warning');
        return;
    }

    try {
        const canvas = document.createElement('canvas');
        const originalImage = window.imageProcessor.getOriginalImage();
        const edgeImage = window.imageProcessor.getEdgeImage();

        const grayscaleMode = document.getElementById('grayscaleMode')?.checked;
        const invertEdges = document.getElementById('invertEdges')?.checked;

        // Vytvoření kombinovaného obrázku (side by side)
        const combinedMat = new cv.Mat();
        const leftMat = new cv.Mat();
        const rightMat = new cv.Mat();

        try {
            // Příprava levého obrázku (původní)
            if (grayscaleMode) {
                cv.cvtColor(originalImage, leftMat, cv.COLOR_RGBA2GRAY);
                cv.cvtColor(leftMat, leftMat, cv.COLOR_GRAY2RGBA);
            } else {
                originalImage.copyTo(leftMat);
            }

            // Příprava pravého obrázku (hrany)
            prepareEdgeImage(rightMat, invertEdges);

            // Kombinování obrázků vedle sebe
            const leftROI = new cv.Rect(0, 0, leftMat.cols, leftMat.rows);
            const rightROI = new cv.Rect(leftMat.cols, 0, rightMat.cols, rightMat.rows);

            combinedMat.create(leftMat.rows, leftMat.cols * 2, leftMat.type());
            leftMat.copyTo(combinedMat.roi(leftROI));
            rightMat.copyTo(combinedMat.roi(rightROI));

            canvas.width = combinedMat.cols;
            canvas.height = combinedMat.rows;

            cv.imshow(canvas, combinedMat);

            const blob = await window.Utils.canvasToBlob(canvas, 'image/png');
            const filename = `combined_${currentAlgorithm}_${Date.now()}.png`;

            window.Utils.downloadBlob(blob, filename);
            window.Utils.showToast('Kombinovaný obrázek stažen', 'success');

        } finally {
            combinedMat.delete();
            leftMat.delete();
            rightMat.delete();
        }

    } catch (error) {
        console.error('Download error:', error);
        window.Utils.showToast('Chyba při stahování', 'error');
    }
}

/**
 * Download PDF
 */
async function downloadPDF() {
    if (!window.imageProcessor.hasImage() || !window.imageProcessor.getEdgeImage()) {
        window.Utils.showToast('Nejprve zpracujte obrázek', 'warning');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        // Přidání původního obrázku
        const originalCanvas = document.createElement('canvas');
        const originalImage = window.imageProcessor.getOriginalImage();

        originalCanvas.width = originalImage.cols;
        originalCanvas.height = originalImage.rows;
        cv.imshow(originalCanvas, originalImage);

        const originalDataUrl = originalCanvas.toDataURL('image/jpeg', 0.8);

        // Přidání obrázku hran
        const edgesCanvas = document.createElement('canvas');
        const displayMat = new cv.Mat();
        const invertEdges = document.getElementById('invertEdges')?.checked;

        prepareEdgeImage(displayMat, invertEdges);
        edgesCanvas.width = displayMat.cols;
        edgesCanvas.height = displayMat.rows;
        cv.imshow(edgesCanvas, displayMat);

        const edgesDataUrl = edgesCanvas.toDataURL('image/jpeg', 0.8);

        // Výpočet rozměrů pro PDF
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const availableWidth = pageWidth - 2 * margin;
        const availableHeight = (pageHeight - 3 * margin) / 2;

        const aspectRatio = originalImage.cols / originalImage.rows;
        let imgWidth = availableWidth;
        let imgHeight = imgWidth / aspectRatio;

        if (imgHeight > availableHeight) {
            imgHeight = availableHeight;
            imgWidth = imgHeight * aspectRatio;
        }

        // Přidání obrázků do PDF
        pdf.setFontSize(16);
        pdf.text('Canny Edge Detection Results', margin, margin);

        pdf.setFontSize(12);
        pdf.text('Original Image:', margin, margin + 20);
        pdf.addImage(originalDataUrl, 'JPEG', margin, margin + 25, imgWidth, imgHeight);

        pdf.text('Edge Detection Result:', margin, margin + 35 + imgHeight);
        pdf.addImage(edgesDataUrl, 'JPEG', margin, margin + 40 + imgHeight, imgWidth, imgHeight);

        // Přidání metadat
        const metadata = `Algorithm: ${currentAlgorithm}\nPreset: ${currentPreset}\nDate: ${new Date().toLocaleString()}`;
        pdf.setFontSize(10);
        pdf.text(metadata, margin, pageHeight - 30);

        const filename = `edge_detection_${currentAlgorithm}_${Date.now()}.pdf`;
        pdf.save(filename);

        window.Utils.showToast('PDF stažen', 'success');
        displayMat.delete();

    } catch (error) {
        console.error('PDF download error:', error);
        window.Utils.showToast('Chyba při vytváření PDF', 'error');
    }
}

/**
 * Download SVG
 */
async function downloadSVG() {
    if (!window.imageProcessor.hasImage() || !window.imageProcessor.getEdgeImage()) {
        window.Utils.showToast('Nejprve zpracujte obrázek', 'warning');
        return;
    }

    try {
        const edgeImage = window.imageProcessor.getEdgeImage();
        const width = edgeImage.cols;
        const height = edgeImage.rows;

        // Vytvoření SVG obsahu
        let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
<rect width="100%" height="100%" fill="white"/>
`;

        // Převod edge dat na SVG cesty (zjednodušená verze)
        const data = edgeImage.data;
        const paths = [];

        for (let y = 0; y < height; y += 2) {
            for (let x = 0; x < width; x += 2) {
                const idx = y * width + x;
                if (data[idx] > 128) {
                    paths.push(`M${x},${y}L${x + 1},${y}L${x + 1},${y + 1}L${x},${y + 1}Z`);
                }
            }
        }

        if (paths.length > 0) {
            svgContent += `<path d="${paths.join(' ')}" fill="black" stroke="none"/>`;
        }

        svgContent += '</svg>';

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const filename = `edges_${currentAlgorithm}_${Date.now()}.svg`;

        window.Utils.downloadBlob(blob, filename);
        window.Utils.showToast('SVG stažen', 'success');

    } catch (error) {
        console.error('SVG download error:', error);
        window.Utils.showToast('Chyba při vytváření SVG', 'error');
    }
}

/**
 * Download všech formátů jako ZIP
 */
async function downloadAllAsZip() {
    if (!window.imageProcessor.hasImage() || !window.imageProcessor.getEdgeImage()) {
        window.Utils.showToast('Nejprve zpracujte obrázek', 'warning');
        return;
    }

    try {
        const zip = new JSZip();
        const timestamp = Date.now();

        // Původní obrázek
        const originalCanvas = document.createElement('canvas');
        const originalImage = window.imageProcessor.getOriginalImage();
        originalCanvas.width = originalImage.cols;
        originalCanvas.height = originalImage.rows;
        cv.imshow(originalCanvas, originalImage);
        const originalBlob = await window.Utils.canvasToBlob(originalCanvas, 'image/png');
        zip.file(`original_${timestamp}.png`, originalBlob);

        // Hrany PNG
        const edgesCanvas = document.createElement('canvas');
        const displayMat = new cv.Mat();
        const invertEdges = document.getElementById('invertEdges')?.checked;
        prepareEdgeImage(displayMat, invertEdges);
        edgesCanvas.width = displayMat.cols;
        edgesCanvas.height = displayMat.rows;
        cv.imshow(edgesCanvas, displayMat);
        const edgesBlob = await window.Utils.canvasToBlob(edgesCanvas, 'image/png');
        zip.file(`edges_${currentAlgorithm}_${timestamp}.png`, edgesBlob);

        // Hrany JPEG
        const quality = parseFloat(document.getElementById('jpegQuality')?.value || 90) / 100;
        const edgesJpegBlob = await window.Utils.canvasToBlob(edgesCanvas, 'image/jpeg', quality);
        zip.file(`edges_${currentAlgorithm}_${timestamp}.jpg`, edgesJpegBlob);

        // Kombinovaný obrázek
        const combinedCanvas = document.createElement('canvas');
        const combinedMat = new cv.Mat();
        const leftMat = new cv.Mat();
        const rightMat = new cv.Mat();

        try {
            const grayscaleMode = document.getElementById('grayscaleMode')?.checked;

            if (grayscaleMode) {
                cv.cvtColor(originalImage, leftMat, cv.COLOR_RGBA2GRAY);
                cv.cvtColor(leftMat, leftMat, cv.COLOR_GRAY2RGBA);
            } else {
                originalImage.copyTo(leftMat);
            }

            prepareEdgeImage(rightMat, invertEdges);

            const leftROI = new cv.Rect(0, 0, leftMat.cols, leftMat.rows);
            const rightROI = new cv.Rect(leftMat.cols, 0, rightMat.cols, rightMat.rows);

            combinedMat.create(leftMat.rows, leftMat.cols * 2, leftMat.type());
            leftMat.copyTo(combinedMat.roi(leftROI));
            rightMat.copyTo(combinedMat.roi(rightROI));

            combinedCanvas.width = combinedMat.cols;
            combinedCanvas.height = combinedMat.rows;
            cv.imshow(combinedCanvas, combinedMat);

            const combinedBlob = await window.Utils.canvasToBlob(combinedCanvas, 'image/png');
            zip.file(`combined_${currentAlgorithm}_${timestamp}.png`, combinedBlob);

        } finally {
            combinedMat.delete();
            leftMat.delete();
            rightMat.delete();
        }

        // Metadata soubor
        const metadata = {
            algorithm: currentAlgorithm,
            preset: currentPreset,
            timestamp: new Date().toISOString(),
            settings: {
                minThreshold: document.getElementById('minThreshold')?.value,
                maxThreshold: document.getElementById('maxThreshold')?.value,
                grayscaleMode: document.getElementById('grayscaleMode')?.checked,
                invertEdges: document.getElementById('invertEdges')?.checked
            }
        };

        zip.file('metadata.json', JSON.stringify(metadata, null, 2));

        // Generování ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const filename = `edge_detection_${currentAlgorithm}_${timestamp}.zip`;

        window.Utils.downloadBlob(zipBlob, filename);
        window.Utils.showToast('ZIP archiv stažen', 'success');

        displayMat.delete();

    } catch (error) {
        console.error('ZIP download error:', error);
        window.Utils.showToast('Chyba při vytváření ZIP', 'error');
    }
}

/**
 * Otevření batch export
 */
function openBatchExport() {
    const batchModal = document.getElementById('batchModal');
    if (batchModal) {
        batchModal.style.display = 'flex';
    }
}

/**
 * Nastavení control elementů
 */
function setupControlElements() {
    // Threshold sliders
    const minThreshold = document.getElementById('minThreshold');
    const maxThreshold = document.getElementById('maxThreshold');
    const minThresholdInput = document.getElementById('minThresholdInput');
    const maxThresholdInput = document.getElementById('maxThresholdInput');
    const minThresholdValue = document.getElementById('minThresholdValue');
    const maxThresholdValue = document.getElementById('maxThresholdValue');

    // Min threshold slider
    if (minThreshold) {
        minThreshold.addEventListener('input', (e) => {
            const value = e.target.value;
            if (minThresholdValue) minThresholdValue.textContent = value;
            if (minThresholdInput) minThresholdInput.value = value;

            // Ensure min < max
            if (maxThreshold && parseInt(value) >= parseInt(maxThreshold.value)) {
                const newMax = parseInt(value) + 10;
                maxThreshold.value = newMax;
                if (maxThresholdValue) maxThresholdValue.textContent = newMax;
                if (maxThresholdInput) maxThresholdInput.value = newMax;
            }

            if (window.imageProcessor.hasImage()) {
                processImage();
            }
        });
    }

    // Max threshold slider
    if (maxThreshold) {
        maxThreshold.addEventListener('input', (e) => {
            const value = e.target.value;
            if (maxThresholdValue) maxThresholdValue.textContent = value;
            if (maxThresholdInput) maxThresholdInput.value = value;

            // Ensure max > min
            if (minThreshold && parseInt(value) <= parseInt(minThreshold.value)) {
                const newMin = parseInt(value) - 10;
                minThreshold.value = Math.max(0, newMin);
                if (minThresholdValue) minThresholdValue.textContent = Math.max(0, newMin);
                if (minThresholdInput) minThresholdInput.value = Math.max(0, newMin);
            }

            if (window.imageProcessor.hasImage()) {
                processImage();
            }
        });
    }

    // Min threshold input
    if (minThresholdInput) {
        minThresholdInput.addEventListener('change', (e) => {
            const value = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
            e.target.value = value;
            if (minThreshold) minThreshold.value = value;
            if (minThresholdValue) minThresholdValue.textContent = value;

            if (window.imageProcessor.hasImage()) {
                processImage();
            }
        });
    }

    // Max threshold input
    if (maxThresholdInput) {
        maxThresholdInput.addEventListener('change', (e) => {
            const value = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
            e.target.value = value;
            if (maxThreshold) maxThreshold.value = value;
            if (maxThresholdValue) maxThresholdValue.textContent = value;

            if (window.imageProcessor.hasImage()) {
                processImage();
            }
        });
    }

    // Display options checkboxes
    const grayscaleMode = document.getElementById('grayscaleMode');
    const invertEdges = document.getElementById('invertEdges');
    const compareView = document.getElementById('compareView');
    const overlayMode = document.getElementById('overlayMode');
    const transparency = document.getElementById('transparency');
    const transparencyValue = document.getElementById('transparencyValue');
    const transparencyControl = document.getElementById('transparencyControl');

    if (grayscaleMode) {
        grayscaleMode.addEventListener('change', () => {
            if (window.imageProcessor.hasImage()) {
                displayResult();
            }
        });
    }

    if (invertEdges) {
        invertEdges.addEventListener('change', () => {
            if (window.imageProcessor.hasImage()) {
                displayResult();
            }
        });
    }

    if (compareView) {
        compareView.addEventListener('change', (e) => {
            if (e.target.checked && overlayMode) {
                overlayMode.checked = false;
                if (transparencyControl) transparencyControl.style.display = 'none';
            }
            if (window.imageProcessor.hasImage()) {
                displayResult();
            }
        });
    }

    if (overlayMode) {
        overlayMode.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (compareView) compareView.checked = false;
                if (transparencyControl) transparencyControl.style.display = 'block';
            } else {
                if (transparencyControl) transparencyControl.style.display = 'none';
            }
            if (window.imageProcessor.hasImage()) {
                displayResult();
            }
        });
    }

    if (transparency) {
        transparency.addEventListener('input', (e) => {
            const value = e.target.value;
            if (transparencyValue) transparencyValue.textContent = value;
            if (window.imageProcessor.hasImage() && overlayMode?.checked) {
                displayResult();
            }
        });
    }

    // JPEG quality slider
    const jpegQuality = document.getElementById('jpegQuality');
    const jpegQualityValue = document.getElementById('jpegQualityValue');

    if (jpegQuality) {
        jpegQuality.addEventListener('input', (e) => {
            const value = e.target.value;
            if (jpegQualityValue) jpegQualityValue.textContent = value;
        });
    }

    // Process and Reset buttons
    const processBtn = document.getElementById('processBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (processBtn) {
        processBtn.addEventListener('click', () => {
            if (window.imageProcessor.hasImage()) {
                processImage();
            } else {
                window.Utils.showToast('Nejprve nahrajte obrázek', 'warning');
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // Reset to default values
            applyPreset('normal');
            selectAlgorithm('canny');

            // Reset checkboxes
            if (grayscaleMode) grayscaleMode.checked = false;
            if (invertEdges) invertEdges.checked = false;
            if (compareView) compareView.checked = false;
            if (overlayMode) overlayMode.checked = false;
            if (transparencyControl) transparencyControl.style.display = 'none';

            // Reset zoom
            resetZoom();

            if (window.imageProcessor.hasImage()) {
                processImage();
            }
        });
    }

    // Batch processing modal controls
    const batchModal = document.getElementById('batchModal');
    const closeBatchBtn = document.getElementById('closeBatchBtn');
    const batchFileInput = document.getElementById('batchFileInput');
    const startBatchBtn = document.getElementById('startBatchBtn');

    if (closeBatchBtn) {
        closeBatchBtn.addEventListener('click', () => {
            if (batchModal) batchModal.style.display = 'none';
        });
    }

    if (batchFileInput) {
        batchFileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            updateBatchFilesList(files);
        });
    }

    if (startBatchBtn) {
        startBatchBtn.addEventListener('click', () => {
            startBatchProcessing();
        });
    }
}

/**
 * Aktualizace seznamu batch souborů
 */
function updateBatchFilesList(files) {
    const batchFilesList = document.getElementById('batchFilesList');
    if (!batchFilesList) return;

    batchFiles = files.filter(file => file.type.startsWith('image/'));

    if (batchFiles.length === 0) {
        batchFilesList.innerHTML = '<p class="text-gray-500">No valid image files selected</p>';
        return;
    }

    const listHTML = batchFiles.map((file, index) => `
        <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span class="text-sm">${file.name}</span>
            <span class="text-xs text-gray-500">${window.Utils.formatFileSize(file.size)}</span>
        </div>
    `).join('');

    batchFilesList.innerHTML = `
        <div class="space-y-2">
            <p class="text-sm font-medium">Selected files (${batchFiles.length}):</p>
            ${listHTML}
        </div>
    `;
}

/**
 * Spuštění batch processingu
 */
async function startBatchProcessing() {
    if (batchFiles.length === 0) {
        window.Utils.showToast('No files selected for batch processing', 'warning');
        return;
    }

    const batchProgress = document.getElementById('batchProgress');
    const batchProgressBar = document.getElementById('batchProgressBar');
    const batchProgressText = document.getElementById('batchProgressText');
    const startBatchBtn = document.getElementById('startBatchBtn');

    if (batchProgress) batchProgress.style.display = 'block';
    if (startBatchBtn) startBatchBtn.disabled = true;

    const zip = new JSZip();
    const timestamp = Date.now();

    try {
        for (let i = 0; i < batchFiles.length; i++) {
            const file = batchFiles[i];

            // Update progress
            const progress = ((i + 1) / batchFiles.length) * 100;
            if (batchProgressBar) batchProgressBar.style.width = `${progress}%`;
            if (batchProgressText) batchProgressText.textContent = `${i + 1} / ${batchFiles.length}`;

            try {
                // Load and process image
                await window.imageProcessor.loadImageFromFile(file);
                await processImage();

                // Get processed image
                const canvas = document.createElement('canvas');
                const displayMat = new cv.Mat();
                const invertEdges = document.getElementById('invertEdges')?.checked;

                prepareEdgeImage(displayMat, invertEdges);
                canvas.width = displayMat.cols;
                canvas.height = displayMat.rows;
                cv.imshow(canvas, displayMat);

                const blob = await window.Utils.canvasToBlob(canvas, 'image/png');
                const filename = `${file.name.split('.')[0]}_edges_${currentAlgorithm}.png`;

                zip.file(filename, blob);
                displayMat.delete();

            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
            }
        }

        // Generate and download ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const filename = `batch_edge_detection_${timestamp}.zip`;

        window.Utils.downloadBlob(zipBlob, filename);
        window.Utils.showToast(`Batch processing completed: ${batchFiles.length} files processed`, 'success');

        // Close modal
        const batchModal = document.getElementById('batchModal');
        if (batchModal) batchModal.style.display = 'none';

    } catch (error) {
        console.error('Batch processing error:', error);
        window.Utils.showToast('Error during batch processing', 'error');
    } finally {
        if (batchProgress) batchProgress.style.display = 'none';
        if (startBatchBtn) startBatchBtn.disabled = false;
        if (batchProgressBar) batchProgressBar.style.width = '0%';
        if (batchProgressText) batchProgressText.textContent = '0 / 0';
    }
}

/**
 * Nastavení klávesových zkratek
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    if (window.historyManager) {
                        window.historyManager.undo();
                    }
                    break;
                case 'y':
                    e.preventDefault();
                    if (window.historyManager) {
                        window.historyManager.redo();
                    }
                    break;
                case 'r':
                    e.preventDefault();
                    location.reload();
                    break;
                case 'd':
                    e.preventDefault();
                    if (window.darkModeManager) {
                        window.darkModeManager.toggle();
                    }
                    break;
            }
        }
    });
}

/**
 * Vyčištění při unload
 */
window.addEventListener('beforeunload', () => {
    window.imageProcessor.cleanup();
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
    }
});

// Zobrazení loading overlay na začátku
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
});

// Debug informace
console.log('Main.js načten - čekání na OpenCV.js...'); 