/**
 * Toolswa - PDF Merge Tool
 * Combines multiple PDF documents into a single PDF directly inside the browser using PDF-Lib.
 */

(function () {
  'use strict';

  let pdfFiles = []; // Array of { id, file, name, size, pageCount, arrayBuffer }
  let mergedPdfBytes = null;

  // DOM Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const addMoreInput = document.getElementById('add-more-input');
  const addMoreBtn = document.getElementById('add-more-btn');
  const queueArea = document.getElementById('queue-area');
  const queueGrid = document.getElementById('queue-grid');
  const queueCount = document.getElementById('queue-count');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const mergeBtn = document.getElementById('merge-btn');
  const progressCard = document.getElementById('progress-card');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text');
  const resultCard = document.getElementById('result-card');
  const resultDesc = document.getElementById('result-desc');
  const downloadBtn = document.getElementById('download-btn');
  const resetBtn = document.getElementById('reset-btn');

  // Drag and Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (files.length === 0) {
      window.ToolswaUtils.showToast('Please drop valid PDF files.', 'error');
      return;
    }
    handleFiles(files);
  });

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  });

  if (addMoreBtn && addMoreInput) {
    addMoreBtn.addEventListener('click', () => addMoreInput.click());
    addMoreInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      handleFiles(files);
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      pdfFiles = [];
      updateQueueUI();
    });
  }

  // Handle incoming files
  async function handleFiles(files) {
    if (!window.PDFLib) {
      window.ToolswaUtils.showToast('PDF-lib is loading, please wait a moment.', 'info');
      return;
    }

    window.ToolswaUtils.showToast(`Loading ${files.length} PDF file(s)...`, 'info');

    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await window.PDFLib.PDFDocument.load(buffer, { ignoreEncryption: true });
        const pageCount = pdfDoc.getPageCount();

        pdfFiles.push({
          id: Math.random().toString(36).substring(2, 9),
          file: file,
          name: file.name,
          size: file.size,
          pageCount: pageCount,
          buffer: buffer
        });
      } catch (err) {
        console.error('Error reading PDF:', err);
        window.ToolswaUtils.showToast(`Failed to parse "${file.name}". It may be password-protected or corrupt.`, 'error');
      }
    }

    updateQueueUI();
  }

  // Render Queue UI
  function updateQueueUI() {
    if (pdfFiles.length === 0) {
      dropzone.style.display = 'block';
      queueArea.style.display = 'none';
      return;
    }

    dropzone.style.display = 'none';
    queueArea.style.display = 'block';
    resultCard.style.display = 'none';

    queueCount.textContent = `${pdfFiles.length} file${pdfFiles.length > 1 ? 's' : ''} ready to merge`;
    queueGrid.innerHTML = '';

    pdfFiles.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'queue-item';
      card.innerHTML = `
        <div class="queue-item-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="queue-item-name" title="${item.name}">${item.name}</div>
        <div class="queue-item-meta">${item.pageCount} page${item.pageCount > 1 ? 's' : ''} · ${window.ToolswaUtils.formatBytes(item.size)}</div>
        <div class="queue-item-controls">
          <span style="font-size:12px; font-weight:700; color:var(--text-light)">#${index + 1}</span>
          <div class="queue-reorder-btns">
            <button class="btn-mini" data-action="up" data-index="${index}" title="Move Up" ${index === 0 ? 'disabled' : ''}>▲</button>
            <button class="btn-mini" data-action="down" data-index="${index}" title="Move Down" ${index === pdfFiles.length - 1 ? 'disabled' : ''}>▼</button>
            <button class="btn-mini danger" data-action="delete" data-index="${index}" title="Remove file">✕</button>
          </div>
        </div>
      `;
      queueGrid.appendChild(card);
    });

    // Attach event listeners for reordering & delete
    queueGrid.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.getAttribute('data-action');
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (action === 'up' && idx > 0) {
          const temp = pdfFiles[idx];
          pdfFiles[idx] = pdfFiles[idx - 1];
          pdfFiles[idx - 1] = temp;
          updateQueueUI();
        } else if (action === 'down' && idx < pdfFiles.length - 1) {
          const temp = pdfFiles[idx];
          pdfFiles[idx] = pdfFiles[idx + 1];
          pdfFiles[idx + 1] = temp;
          updateQueueUI();
        } else if (action === 'delete') {
          pdfFiles.splice(idx, 1);
          updateQueueUI();
        }
      });
    });

    mergeBtn.disabled = pdfFiles.length < 2;
  }

  // Merge Action
  mergeBtn.addEventListener('click', async () => {
    if (pdfFiles.length < 2) {
      window.ToolswaUtils.showToast('Please add at least 2 PDF files to merge.', 'error');
      return;
    }

    queueArea.style.display = 'none';
    progressCard.style.display = 'block';
    progressText.textContent = 'Initializing PDF merge...';
    progressBarFill.style.width = '10%';

    try {
      const mergedPdf = await window.PDFLib.PDFDocument.create();
      let totalPages = 0;

      for (let i = 0; i < pdfFiles.length; i++) {
        const current = pdfFiles[i];
        progressText.textContent = `Merging file ${i + 1} of ${pdfFiles.length}: "${current.name}"...`;
        const percent = Math.round(((i + 1) / pdfFiles.length) * 80);
        progressBarFill.style.width = `${percent}%`;

        const srcDoc = await window.PDFLib.PDFDocument.load(current.buffer, { ignoreEncryption: true });
        const pageIndices = srcDoc.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(srcDoc, pageIndices);
        copiedPages.forEach(page => mergedPdf.addPage(page));
        totalPages += copiedPages.length;
      }

      progressText.textContent = 'Saving merged document...';
      progressBarFill.style.width = '95%';

      mergedPdfBytes = await mergedPdf.save();
      progressBarFill.style.width = '100%';

      setTimeout(() => {
        progressCard.style.display = 'none';
        resultCard.style.display = 'block';
        resultDesc.textContent = `Successfully merged ${pdfFiles.length} files into 1 PDF with ${totalPages} total pages (${window.ToolswaUtils.formatBytes(mergedPdfBytes.length)}).`;
        window.ToolswaUtils.showToast('PDFs merged successfully!', 'success');
      }, 400);

    } catch (err) {
      console.error('Merge error:', err);
      progressCard.style.display = 'none';
      queueArea.style.display = 'block';
      window.ToolswaUtils.showToast(`Error merging PDFs: ${err.message}`, 'error');
    }
  });

  // Download Action
  downloadBtn.addEventListener('click', () => {
    if (!mergedPdfBytes) return;
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const filename = `toolswa-merged-${Date.now()}.pdf`;
    window.ToolswaUtils.downloadBlob(blob, filename);
  });

  // Reset Action
  resetBtn.addEventListener('click', () => {
    pdfFiles = [];
    mergedPdfBytes = null;
    resultCard.style.display = 'none';
    progressCard.style.display = 'none';
    dropzone.style.display = 'block';
    fileInput.value = '';
    if (addMoreInput) addMoreInput.value = '';
  });

})();
