/**
 * Webcam Service Module
 * Handles webcam functionality
 */

class WebcamService {
    constructor() {
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.isActive = false;
        this.constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            }
        };
    }

    /**
     * Initialize webcam service
     */
    init() {
        this.setupWebcamModal();
        console.log('Webcam Service initialized');
    }

    /**
     * Setup webcam modal
     */
    setupWebcamModal() {
        const webcamBtn = document.getElementById('webcamBtn');
        const webcamModal = document.getElementById('webcamModal');
        const closeWebcamBtn = document.getElementById('closeWebcamBtn');
        const captureBtn = document.getElementById('captureBtn');

        if (webcamBtn) {
            webcamBtn.addEventListener('click', () => this.openWebcam());
        }

        if (closeWebcamBtn) {
            closeWebcamBtn.addEventListener('click', () => this.closeWebcam());
        }

        if (captureBtn) {
            captureBtn.addEventListener('click', () => this.captureFromWebcam());
        }

        // Close modal when clicking outside
        if (webcamModal) {
            webcamModal.addEventListener('click', (e) => {
                if (e.target === webcamModal) {
                    this.closeWebcam();
                }
            });
        }
    }

    /**
     * Open webcam
     */
    async openWebcam() {
        try {
            // Check if webcam is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Webcam not supported in this browser');
            }

            // Request camera access
            this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
            
            // Setup video element
            this.video = document.getElementById('webcamVideo');
            if (this.video) {
                this.video.srcObject = this.stream;
                this.video.play();
            }

            // Show modal
            const webcamModal = document.getElementById('webcamModal');
            if (webcamModal) {
                webcamModal.style.display = 'flex';
            }

            // Update state
            this.isActive = true;
            window.AppState.setWebcamStream(this.stream);

            window.Utils.showToast('Webcam activated', 'success');

        } catch (error) {
            console.error('Webcam access error:', error);
            this.handleWebcamError(error);
        }
    }

    /**
     * Close webcam
     */
    closeWebcam() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.video) {
            this.video.srcObject = null;
        }

        // Hide modal
        const webcamModal = document.getElementById('webcamModal');
        if (webcamModal) {
            webcamModal.style.display = 'none';
        }

        // Update state
        this.isActive = false;
        window.AppState.setWebcamStream(null);

        console.log('Webcam closed');
    }

    /**
     * Capture image from webcam
     */
    async captureFromWebcam() {
        if (!this.video || !this.isActive) {
            window.Utils.showToast('Webcam not active', 'error');
            return;
        }

        try {
            // Create canvas for capture
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;

            const ctx = this.canvas.getContext('2d');
            ctx.drawImage(this.video, 0, 0);

            // Convert to blob
            const blob = await window.Utils.canvasToBlob(this.canvas, 'image/png');
            
            // Create file object
            const file = new File([blob], 'webcam_capture.png', { type: 'image/png' });
            
            // Load into image processor
            await window.imageProcessor.loadImageFromFile(file);

            // Close webcam
            this.closeWebcam();

            window.Utils.showToast('Image captured from webcam', 'success');

        } catch (error) {
            console.error('Webcam capture error:', error);
            window.Utils.showToast('Failed to capture image', 'error');
        }
    }

    /**
     * Handle webcam errors
     */
    handleWebcamError(error) {
        let message = 'Webcam access failed';

        if (error.name === 'NotAllowedError') {
            message = 'Webcam access denied. Please allow camera access.';
        } else if (error.name === 'NotFoundError') {
            message = 'No webcam found. Please connect a camera.';
        } else if (error.name === 'NotReadableError') {
            message = 'Webcam is being used by another application.';
        } else if (error.name === 'OverconstrainedError') {
            message = 'Webcam constraints not supported.';
        }

        window.Utils.showToast(message, 'error');
    }

    /**
     * Check if webcam is active
     */
    isWebcamActive() {
        return this.isActive;
    }

    /**
     * Get webcam stream
     */
    getStream() {
        return this.stream;
    }

    /**
     * Get video element
     */
    getVideo() {
        return this.video;
    }

    /**
     * Set webcam constraints
     */
    setConstraints(constraints) {
        this.constraints = { ...this.constraints, ...constraints };
    }

    /**
     * Get webcam constraints
     */
    getConstraints() {
        return this.constraints;
    }

    /**
     * Switch camera (front/back)
     */
    async switchCamera() {
        if (!this.isActive) return;

        try {
            // Toggle facing mode
            const currentFacing = this.constraints.video.facingMode;
            const newFacing = currentFacing === 'user' ? 'environment' : 'user';
            
            this.constraints.video.facingMode = newFacing;

            // Stop current stream
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }

            // Start new stream
            this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
            
            if (this.video) {
                this.video.srcObject = this.stream;
            }

            window.AppState.setWebcamStream(this.stream);
            window.Utils.showToast('Camera switched', 'success');

        } catch (error) {
            console.error('Camera switch error:', error);
            window.Utils.showToast('Failed to switch camera', 'error');
        }
    }

    /**
     * Get available cameras
     */
    async getAvailableCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'videoinput');
        } catch (error) {
            console.error('Error getting cameras:', error);
            return [];
        }
    }

    /**
     * Select specific camera
     */
    async selectCamera(deviceId) {
        if (!this.isActive) return;

        try {
            this.constraints.video.deviceId = { exact: deviceId };
            
            // Stop current stream
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }

            // Start new stream
            this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
            
            if (this.video) {
                this.video.srcObject = this.stream;
            }

            window.AppState.setWebcamStream(this.stream);
            window.Utils.showToast('Camera selected', 'success');

        } catch (error) {
            console.error('Camera selection error:', error);
            window.Utils.showToast('Failed to select camera', 'error');
        }
    }

    /**
     * Take photo and return as blob
     */
    async takePhoto() {
        if (!this.video || !this.isActive) {
            throw new Error('Webcam not active');
        }

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        const ctx = this.canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0);

        return await window.Utils.canvasToBlob(this.canvas, 'image/png');
    }
}

// Create global instance
window.WebcamService = new WebcamService();
