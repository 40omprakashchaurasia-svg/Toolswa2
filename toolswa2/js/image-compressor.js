/**
 * Toolswa - Image Compressor Tool
 * Compresses JPG, PNG, and WebP images locally using the HTML5 Canvas API.
 */

(function () {
  'use strict';

  let currentImage = null;
  let originalFile = null;
  let compressedBlob = null;
  let originalImgObj = null;

  // DOM Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const configPanel = document.getElementById('config-panel');
  const fileDetails = document.getElementById('file-details');
  const qualitySlider = document.getElementById('quality-slider');
  const qualityVal = document.getElementById('quality-val');
  const formatSelect = document.getElementById('format-select');
  const maxDimSelect = document.getElementById('max-dim-select');
  const compressBtn = document.getElementById('compress-btn');
  const progressCard = document.getElementById('progress-card');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text');
  const resultCard = document.getElementById('result-card');
  const origPreview = document.getElementById('orig-preview');
  const compPreview = document.getElementById('comp-preview');
  const origSizeVal = document.getElementById('orig-size-val');
  const compSizeVal = document.getElementById('comp-size-val');
  const savingsVal = document.getElementById('savings-val');
  const downloadBtn = document.getElementById('download-btn');
  const resetBtn = document.getElementById('reset-btn');

  // Quality slider change
  qualitySlider.addEventListener('input', (e) => {
    qualityVal.textContent = `${e.target.value}%`;
  });

  // Drag and drop
  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) {
      window.ToolswaUtils.showToast('Please select a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }
    loadImage(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      loadImage(e.target.files[0]);
    }
  });

  function loadImage(file) {
    originalFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      originalImgObj = new Image();
      originalImgObj.onload = () => {
        dropzone.style.display = 'none';
        configPanel.style.display = 'block';

        fileDetails.innerHTML = `
          <strong>${file.name}</strong> · ${originalImgObj.naturalWidth}×${originalImgObj.naturalHeight}px · ${window.ToolswaUtils.formatBytes(file.size)}
        `;

        origPreview.src = e.target.result;
      };
      originalImgObj.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  // Compress process
  compressBtn.addEventListener('click', async () => {
    if (!originalImgObj) return;

    configPanel.style.display = 'none';
    progressCard.style.display = 'block';
    progressText.textContent = 'Processing and compressing image...';
    progressBarFill.style.width = '30%';

    setTimeout(() => {
      try {
        const quality = parseInt(qualitySlider.value, 10) / 100;
        let targetMime = formatSelect.value;
        if (targetMime === 'auto') {
          targetMime = originalFile.type || 'image/jpeg';
        }

        // Calculate dimensions
        let targetWidth = originalImgObj.naturalWidth;
        let targetHeight = originalImgObj.naturalHeight;
        const maxDim = parseInt(maxDimSelect.value, 10);

        if (maxDim > 0 && (targetWidth > maxDim || targetHeight > maxDim)) {
          if (targetWidth > targetHeight) {
            targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
            targetWidth = maxDim;
          } else {
            targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
            targetHeight = maxDim;
          }
        }

        progressBarFill.style.width = '60%';

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        // If target is JPEG, draw white background first to avoid transparent turning black
        if (targetMime === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(originalImgObj, 0, 0, targetWidth, targetHeight);

        progressBarFill.style.width = '85%';

        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Canvas toBlob conversion failed');
          }

          compressedBlob = blob;
          const compUrl = URL.createObjectURL(blob);
          compPreview.src = compUrl;

          progressBarFill.style.width = '100%';

          setTimeout(() => {
            progressCard.style.display = 'none';
            resultCard.style.display = 'block';

            const origSize = originalFile.size;
            const compSize = blob.size;

            origSizeVal.textContent = window.ToolswaUtils.formatBytes(origSize);
            compSizeVal.textContent = window.ToolswaUtils.formatBytes(compSize);

            if (compSize < origSize) {
              const savings = Math.round(((origSize - compSize) / origSize) * 100);
              savingsVal.textContent = `-${savings}%`;
              savingsVal.className = 'savings-pill';
            } else {
              savingsVal.textContent = `Optimized`;
              savingsVal.className = 'savings-pill';
              savingsVal.style.background = '#F3F4F6';
              savingsVal.style.color = '#4B5563';
            }

            window.ToolswaUtils.showToast('Image compressed successfully!', 'success');
          }, 300);

        }, targetMime, quality);

      } catch (err) {
        console.error(err);
        progressCard.style.display = 'none';
        configPanel.style.display = 'block';
        window.ToolswaUtils.showToast(`Compression error: ${err.message}`, 'error');
      }
    }, 250);
  });

  downloadBtn.addEventListener('click', () => {
    if (!compressedBlob) return;
    const ext = formatSelect.value === 'image/webp' ? 'webp' : formatSelect.value === 'image/png' ? 'png' : 'jpg';
    const baseName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || originalFile.name;
    const filename = `toolswa-compressed-${baseName}.${ext}`;
    window.ToolswaUtils.downloadBlob(compressedBlob, filename);
  });

  resetBtn.addEventListener('click', () => {
    originalFile = null;
    originalImgObj = null;
    compressedBlob = null;
    resultCard.style.display = 'none';
    progressCard.style.display = 'none';
    configPanel.style.display = 'none';
    dropzone.style.display = 'block';
    fileInput.value = '';
  });

})();
