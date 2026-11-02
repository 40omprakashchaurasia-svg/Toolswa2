/**
 * Toolswa - Image Resizer Tool
 * Resizes images by dimensions or percentage while optionally maintaining aspect ratio.
 */

(function () {
  'use strict';

  let originalFile = null;
  let originalImgObj = null;
  let resizedBlob = null;
  let originalWidth = 0;
  let originalHeight = 0;
  let aspectRatio = 1;

  // DOM Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const configPanel = document.getElementById('config-panel');
  const fileDetails = document.getElementById('file-details');
  const widthInput = document.getElementById('width-input');
  const heightInput = document.getElementById('height-input');
  const lockAspectCheckbox = document.getElementById('lock-aspect');
  const formatSelect = document.getElementById('format-select');
  const percentButtons = document.querySelectorAll('.btn-percent');
  const resizeBtn = document.getElementById('resize-btn');
  const progressCard = document.getElementById('progress-card');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text');
  const resultCard = document.getElementById('result-card');
  const resultPreview = document.getElementById('result-preview');
  const resultDimensions = document.getElementById('result-dimensions');
  const resultSize = document.getElementById('result-size');
  const downloadBtn = document.getElementById('download-btn');
  const resetBtn = document.getElementById('reset-btn');

  // Aspect ratio synchronization
  widthInput.addEventListener('input', () => {
    if (lockAspectCheckbox.checked && originalWidth > 0) {
      const w = parseInt(widthInput.value, 10);
      if (!isNaN(w) && w > 0) {
        heightInput.value = Math.round(w / aspectRatio);
      }
    }
  });

  heightInput.addEventListener('input', () => {
    if (lockAspectCheckbox.checked && originalHeight > 0) {
      const h = parseInt(heightInput.value, 10);
      if (!isNaN(h) && h > 0) {
        widthInput.value = Math.round(h * aspectRatio);
      }
    }
  });

  // Preset percentage buttons
  percentButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const pct = parseInt(btn.getAttribute('data-percent'), 10) / 100;
      widthInput.value = Math.round(originalWidth * pct);
      heightInput.value = Math.round(originalHeight * pct);
    });
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
      window.ToolswaUtils.showToast('Please select a valid image file.', 'error');
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
        originalWidth = originalImgObj.naturalWidth;
        originalHeight = originalImgObj.naturalHeight;
        aspectRatio = originalWidth / originalHeight;

        widthInput.value = originalWidth;
        heightInput.value = originalHeight;

        dropzone.style.display = 'none';
        configPanel.style.display = 'block';

        fileDetails.innerHTML = `
          <strong>${file.name}</strong> · Original: <strong>${originalWidth} × ${originalHeight} px</strong> · ${window.ToolswaUtils.formatBytes(file.size)}
        `;
      };
      originalImgObj.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  // Resize process
  resizeBtn.addEventListener('click', () => {
    const targetW = parseInt(widthInput.value, 10);
    const targetH = parseInt(heightInput.value, 10);

    if (isNaN(targetW) || isNaN(targetH) || targetW <= 0 || targetH <= 0) {
      window.ToolswaUtils.showToast('Please enter valid width and height values.', 'error');
      return;
    }

    configPanel.style.display = 'none';
    progressCard.style.display = 'block';
    progressText.textContent = `Resizing image to ${targetW} × ${targetH} px...`;
    progressBarFill.style.width = '40%';

    setTimeout(() => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');

        const targetMime = formatSelect.value === 'auto' ? (originalFile.type || 'image/png') : formatSelect.value;

        if (targetMime === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(originalImgObj, 0, 0, targetW, targetH);

        progressBarFill.style.width = '80%';

        canvas.toBlob((blob) => {
          resizedBlob = blob;
          const url = URL.createObjectURL(blob);
          resultPreview.src = url;

          progressBarFill.style.width = '100%';

          setTimeout(() => {
            progressCard.style.display = 'none';
            resultCard.style.display = 'block';

            resultDimensions.textContent = `${targetW} × ${targetH} px`;
            resultSize.textContent = window.ToolswaUtils.formatBytes(blob.size);

            window.ToolswaUtils.showToast('Image resized successfully!', 'success');
          }, 300);

        }, targetMime, 0.92);

      } catch (err) {
        console.error(err);
        progressCard.style.display = 'none';
        configPanel.style.display = 'block';
        window.ToolswaUtils.showToast(`Error resizing image: ${err.message}`, 'error');
      }
    }, 250);
  });

  downloadBtn.addEventListener('click', () => {
    if (!resizedBlob) return;
    const ext = formatSelect.value === 'image/webp' ? 'webp' : formatSelect.value === 'image/png' ? 'png' : 'jpg';
    const baseName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || originalFile.name;
    const filename = `toolswa-resized-${baseName}-${widthInput.value}x${heightInput.value}.${ext}`;
    window.ToolswaUtils.downloadBlob(resizedBlob, filename);
  });

  resetBtn.addEventListener('click', () => {
    originalFile = null;
    originalImgObj = null;
    resizedBlob = null;
    resultCard.style.display = 'none';
    progressCard.style.display = 'none';
    configPanel.style.display = 'none';
    dropzone.style.display = 'block';
    fileInput.value = '';
  });

})();
