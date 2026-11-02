/**
 * Toolswa - PDF Compressor Tool
 * Compresses PDF files directly inside the browser using stream optimization and intelligent canvas rasterization.
 */

(function () {
  'use strict';

  let originalFile = null;
  let originalBuffer = null;
  let compressedPdfBytes = null;
  let compressionLevel = 'medium'; // 'lossless', 'medium', 'extreme'

  // DOM Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const configPanel = document.getElementById('config-panel');
  const fileDetails = document.getElementById('file-details');
  const compressBtn = document.getElementById('compress-btn');
  const progressCard = document.getElementById('progress-card');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text');
  const resultCard = document.getElementById('result-card');
  const origSizeVal = document.getElementById('orig-size-val');
  const compSizeVal = document.getElementById('comp-size-val');
  const savingsVal = document.getElementById('savings-val');
  const downloadBtn = document.getElementById('download-btn');
  const resetBtn = document.getElementById('reset-btn');
  const optionCards = document.querySelectorAll('.option-card');

  // Option selection
  optionCards.forEach(card => {
    card.addEventListener('click', () => {
      optionCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      compressionLevel = card.getAttribute('data-level');
    });
  });

  // Drag and Drop
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
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (files.length === 0) {
      window.ToolswaUtils.showToast('Please select a valid PDF file.', 'error');
      return;
    }
    loadFile(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      loadFile(e.target.files[0]);
    }
  });

  async function loadFile(file) {
    originalFile = file;
    dropzone.style.display = 'none';
    configPanel.style.display = 'block';

    try {
      originalBuffer = await file.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(originalBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPageCount();

      fileDetails.innerHTML = `
        <strong>${file.name}</strong> · ${pages} page${pages > 1 ? 's' : ''} · Original Size: <strong>${window.ToolswaUtils.formatBytes(file.size)}</strong>
      `;
    } catch (err) {
      console.error(err);
      window.ToolswaUtils.showToast('Failed to parse PDF document.', 'error');
    }
  }

  // Compress Process
  compressBtn.addEventListener('click', async () => {
    if (!originalBuffer) return;

    configPanel.style.display = 'none';
    progressCard.style.display = 'block';
    progressText.textContent = 'Analyzing PDF structure...';
    progressBarFill.style.width = '15%';

    try {
      if (compressionLevel === 'lossless') {
        // Mode 1: PDF-Lib structural & object streams compression
        progressText.textContent = 'Optimizing object streams and stripping metadata...';
        progressBarFill.style.width = '50%';
        const pdfDoc = await window.PDFLib.PDFDocument.load(originalBuffer);
        
        // Remove metadata
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');

        progressText.textContent = 'Compressing stream dictionaries...';
        progressBarFill.style.width = '80%';
        compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });

      } else {
        // Mode 2 & 3: Render pages via PDF.js to optimized JPEG and rebuild PDF
        if (!window.pdfjsLib) {
          throw new Error('PDF.js rendering engine is not loaded');
        }

        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(originalBuffer) });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        const newPdfDoc = await window.PDFLib.PDFDocument.create();

        const scale = compressionLevel === 'extreme' ? 1.0 : 1.35;
        const quality = compressionLevel === 'extreme' ? 0.50 : 0.72;

        for (let i = 1; i <= numPages; i++) {
          progressText.textContent = `Optimizing page ${i} of ${numPages}...`;
          const percent = 20 + Math.round((i / numPages) * 70);
          progressBarFill.style.width = `${percent}%`;

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: scale });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
          const jpegImage = await newPdfDoc.embedJpg(jpegDataUrl);

          const newPage = newPdfDoc.addPage([viewport.width / scale, viewport.height / scale]);
          newPage.drawImage(jpegImage, {
            x: 0,
            y: 0,
            width: viewport.width / scale,
            height: viewport.height / scale
          });
        }

        progressText.textContent = 'Packaging compressed PDF...';
        progressBarFill.style.width = '95%';
        compressedPdfBytes = await newPdfDoc.save({ useObjectStreams: true });
      }

      progressBarFill.style.width = '100%';

      setTimeout(() => {
        progressCard.style.display = 'none';
        resultCard.style.display = 'block';

        const origSize = originalFile.size;
        const compSize = compressedPdfBytes.length;
        origSizeVal.textContent = window.ToolswaUtils.formatBytes(origSize);
        compSizeVal.textContent = window.ToolswaUtils.formatBytes(compSize);

        if (compSize < origSize) {
          const savings = Math.round(((origSize - compSize) / origSize) * 100);
          savingsVal.textContent = `-${savings}%`;
          savingsVal.className = 'savings-pill';
        } else {
          savingsVal.textContent = `Already Optimized`;
          savingsVal.className = 'savings-pill';
          savingsVal.style.background = '#F3F4F6';
          savingsVal.style.color = '#4B5563';
        }

        window.ToolswaUtils.showToast('Compression complete!', 'success');
      }, 400);

    } catch (err) {
      console.error('Compression error:', err);
      progressCard.style.display = 'none';
      configPanel.style.display = 'block';
      window.ToolswaUtils.showToast(`Error: ${err.message}`, 'error');
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!compressedPdfBytes) return;
    const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
    const filename = `toolswa-compressed-${originalFile.name}`;
    window.ToolswaUtils.downloadBlob(blob, filename);
  });

  resetBtn.addEventListener('click', () => {
    originalFile = null;
    originalBuffer = null;
    compressedPdfBytes = null;
    resultCard.style.display = 'none';
    progressCard.style.display = 'none';
    configPanel.style.display = 'none';
    dropzone.style.display = 'block';
    fileInput.value = '';
  });

})();
