# Canny Edge Detection Tool

Professional web application for edge detection in images using OpenCV.js with modular architecture and advanced features.

## 🚀 Features

### Basic Features
- ✅ **Image Upload** - Supports drag & drop and classic file selection
- ✅ **Webcam** - Capture image directly from webcam
- ✅ **Live Preview** - Instant display of changes when adjusting parameters
- ✅ **Canny Edge Detection** - Professional edge detection algorithm
- ✅ **Interactive Controls** - Sliders and input fields for threshold values

### Advanced Features
- 🎨 **Various Display Modes**:
  - Black and white background
  - Edge inversion (black on white vs white on black)
  - Comparison view (original next to result)
  - Edge overlay with adjustable transparency

- 🔍 **Zoom and Pan**:
  - Zoom in/out up to 500%
  - Mouse pan when zoomed in
  - Reset to original size

- 💾 **Export Options**:
  - Download original image (PNG)
  - Download edges (PNG/JPEG)
  - Download combined result

- 🎯 **Advanced Algorithms**:
  - Canny (classic with Gaussian blur)
  - Sobel (edge detection operator)
  - Prewitt (similar to Sobel)
  - Laplacian (Laplacian of Gaussian)
  - Scharr (more precise than Sobel)

- 📊 **Histogram Display**:
  - Original image histogram
  - Edge count visualization
  - Real-time updates

- 🔄 **Undo/Redo**:
  - History management
  - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  - Visual state indicator

- 🌙 **Dark Mode**:
  - Toggle between light and dark themes
  - Persistent settings in localStorage

- 📦 **Batch Processing**:
  - Process multiple images at once
  - Progress tracking
  - Batch export options

## 🛠️ Technologies

- **Core**: HTML5, CSS3, JavaScript (ES6+)
- **Image Processing**: OpenCV.js
- **Styling**: TailwindCSS
- **Export**: jsPDF, JSZip

## 📁 Project Structure

```
/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Styles and themes
├── js/
│   ├── config.js           # Configuration and constants
│   ├── main.js             # Main application logic
│   ├── modules/
│   │   ├── utils.js        # Utility functions
│   │   └── imageProcessing.js # Image processing
│   └── algorithms/
│       ├── canny.js        # Canny algorithm
│       ├── sobel.js        # Sobel algorithm
│       ├── prewitt.js      # Prewitt algorithm
│       ├── laplacian.js    # Laplacian algorithm
│       └── scharr.js       # Scharr algorithm
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Load Image
- **Upload**: Click the upload area or drag an image
- **Webcam**: Use webcam button to capture image
- **Drag & Drop**: Drag image to designated area
- **Supported formats**: JPG, PNG, GIF, WEBP

### 2. Parameter Settings
- **Min Threshold**: Lower threshold for edge detection (0-255)
- **Max Threshold**: Upper threshold for edge detection (0-255)
- **Blur**: Gaussian blur strength (0-10)
- **Algorithm**: Choose detection algorithm (Canny, Sobel, Prewitt, Laplacian, Scharr)

### 3. Real-time Preview
- Changes are applied immediately
- **Edge Overlay**: Edges over original image with adjustable transparency
- **Comparison View**: Original and result side by side
- **Invert**: Switch between black/white edge colors

### 4. Zoom and Navigation
- **Zoom**: Mouse wheel or zoom buttons
- **Pan**: Click and drag when zoomed in
- **Reset**: Double-click to return to original size

### 5. Export
- **Single Export**: PNG, JPEG, PDF, SVG
- **Batch Export**: Process multiple images and export as ZIP
- **Metadata**: Include processing parameters in export

## ⚙️ Canny Algorithm Parameters

- **Min Threshold (30-100)**: Lower threshold for edge detection. Lower values = more edges
- **Max Threshold (100-200)**: Upper threshold for edge detection. Higher values = fewer edges
- **Blur (1-5)**: Gaussian blur strength before edge detection. Higher values = smoother edges
- **Auto-thresholding**: Automatic threshold calculation based on image statistics

## 🎨 Presets

- **Soft**: Soft edges - suitable for low contrast photos
- **Normal**: Normal detection - balanced settings for most images
- **Sharp**: Sharp edges - highlights strong contrasts
- **Artistic**: Artistic effect - creates more details

## 🔧 Advanced Features

### Web Workers
- Image processing in background thread
- Non-blocking user interface
- Better performance for large images

### Memory Management
- Automatic memory cleanup
- OpenCV.js Mat object management
- Optimized for long-term use

### Responsive Design
- Mobile-friendly interface
- Touch gesture support
- Adaptive layout for different screen sizes

### Keyboard Shortcuts
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Ctrl+R**: Reset
- **Ctrl+E**: Export
- **Ctrl+D**: Toggle dark mode

## 🐛 Troubleshooting

### Slow Processing
- Try smaller image (recommended up to 2000x2000 px)
- Enable Web Workers if available
- Close other browser tabs

### Export Not Working
- Check that image is processed
- Verify browser support for download
- Try different export format

### Memory Issues
- Refresh page to clear memory
- Process smaller images
- Close unnecessary browser tabs

## 🔮 Future Enhancements

- Additional edge detection algorithms
- Batch processing improvements
- Cloud processing integration
- Advanced export formats
- Performance optimizations

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or suggestions, please create an issue in the project repository. 