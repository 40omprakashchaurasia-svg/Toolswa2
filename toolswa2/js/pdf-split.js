/**
 * Toolswa - PDF Split Tool
 * Extract individual pages or page ranges from a PDF document inside the browser.
 */

(function () {
  'use strict';

  let originalFile = null;
  let originalBuffer = null;
  let pdfDoc = null;
  let totalPages = 0;
  let selectedPages = new Set();
  let splitMode = 'range'; // 'range' or 'all'
  let splitResultBlob = null;
  let splitFilename = '';

  // DOM Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const configPanel = document.getElementById('config-panel');
  const fileDetails = document.getElementById('file-details');
  const pageGrid = document.getElementById('page-grid');
  const rangeInput = document.getElementById('range-input');
  const selectAllBtn = document.getElementById('select-all-btn');
  const deselectAllBtn = document.getElementById('deselect-all-btn');
  const splitBtn = document.getElementById('split-btn');
  const progressCard = document.getElementById('progress-card');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text');
  const resultCard = document.getElementById('result-card');
  const resultDesc = document.getElementById('result-desc');
  const downloadBtn = document.getElementById('download-btn');
  const resetBtn = document.getElementById('reset-btn');
  const modeRadios = document.querySelectorAll('input[name="split-mode"]');

  // Mode radio change
  modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      splitMode = e.target.value;
      const rangeContainer = document.getElementById('range-selection-container');
      if (rangeContainer) {
        rangeContainer.style.display = splitMode === 'range' ? 'block' : 'none';
      }
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
      pdfDoc = await window.PDFLib.PDFDocument.load(originalBuffer, { ignoreEncryption: true });
      totalPages = pdfDoc.getPageCount();

      fileDetails.innerHTML = `
        <strong>${file.name}</strong> · ${totalPages} page${totalPages > 1 ? 's' : ''} · ${window.ToolswaUtils.formatBytes(file.size)}
      `;

      // Pre-select all pages by default
      selectedPages.clear();
      for (let i = 1; i <= totalPages; i++) {
        selectedPages.add(i);
      }

      renderPageGrid();
      updateRangeInputFromSet();

    } catch (err) {
      console.error(err);
      window.ToolswaUtils.showToast('Failed to load PDF.', 'error');
    }
  }

  function renderPageGrid() {
    pageGrid.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const card = document.createElement('div');
      card.className = `split-page-card ${selectedPages.has(i) ? 'selected' : ''}`;
      card.setAttribute('data-page', i);
      card.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin:0 auto 6px; display:block; color:var(--primary);">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <div class="page-num">Page ${i}</div>
      `;

      card.addEventListener('click', () => {
        if (selectedPages.has(i)) {
          selectedPages.delete(i);
          card.classList.remove('selected');
        } else {
          selectedPages.add(i);
          card.classList.add('selected');
        }
        updateRangeInputFromSet();
      });

      pageGrid.appendChild(card);
    }
  }

  function updateRangeInputFromSet() {
    const sorted = Array.from(selectedPages).sort((a, b) => a - b);
    rangeInput.value = formatPageRanges(sorted);
  }

  function formatPageRanges(pages) {
    if (pages.length === 0) return '';
    const ranges = [];
    let start = pages[0];
    let end = pages[0];

    for (let i = 1; i < pages.length; i++) {
      if (pages[i] === end + 1) {
        end = pages[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = pages[i];
        end = pages[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return ranges.join(', ');
  }

  function parsePageRanges(str) {
    const pages = new Set();
    const parts = str.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let p = Math.max(1, start); p <= Math.min(totalPages, end); p++) {
            pages.add(p);
          }
        }
      } else {
        const p = parseInt(trimmed, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          pages.add(p);
        }
      }
    }
    return pages;
  }

  rangeInput.addEventListener('input', () => {
    selectedPages = parsePageRanges(rangeInput.value);
    document.querySelectorAll('.split-page-card').forEach(card => {
      const p = parseInt(card.getAttribute('data-page'), 10);
      if (selectedPages.has(p)) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  });

  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      for (let i = 1; i <= totalPages; i++) selectedPages.add(i);
      renderPageGrid();
      updateRangeInputFromSet();
    });
  }

  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', () => {
      selectedPages.clear();
      renderPageGrid();
      updateRangeInputFromSet();
    });
  }

  // Split Action
  splitBtn.addEventListener('click', async () => {
    if (splitMode === 'range' && selectedPages.size === 0) {
      window.ToolswaUtils.showToast('Please select at least one page to extract.', 'error');
      return;
    }

    configPanel.style.display = 'none';
    progressCard.style.display = 'block';
    progressText.textContent = 'Processing PDF split...';
    progressBarFill.style.width = '20%';

    try {
      if (splitMode === 'range') {
        const newPdf = await window.PDFLib.PDFDocument.create();
        const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
        const indices = sortedPages.map(p => p - 1);

        progressText.textContent = `Extracting ${indices.length} pages...`;
        progressBarFill.style.width = '60%';

        const copiedPages = await newPdf.copyPages(pdfDoc, indices);
        copiedPages.forEach(page => newPdf.addPage(page));

        const bytes = await newPdf.save();
        splitResultBlob = new Blob([bytes], { type: 'application/pdf' });
        splitFilename = `toolswa-extracted-${originalFile.name}`;

        progressBarFill.style.width = '100%';

        setTimeout(() => {
          progressCard.style.display = 'none';
          resultCard.style.display = 'block';
          resultDesc.textContent = `Extracted ${indices.length} pages into a single PDF (${window.ToolswaUtils.formatBytes(bytes.length)}).`;
          window.ToolswaUtils.showToast('Split completed!', 'success');
        }, 300);

      } else {
        // Mode 'all': Extract every single page into separate PDF files inside a ZIP
        if (!window.JSZip) {
          throw new Error('JSZip library is required to package multiple files');
        }

        const zip = new window.JSZip();
        for (let i = 0; i < totalPages; i++) {
          progressText.textContent = `Extracting page ${i + 1} of ${totalPages}...`;
          const pct = Math.round(((i + 1) / totalPages) * 85);
          progressBarFill.style.width = `${pct}%`;

          const singlePdf = await window.PDFLib.PDFDocument.create();
          const [copiedPage] = await singlePdf.copyPages(pdfDoc, [i]);
          singlePdf.addPage(copiedPage);

          const bytes = await singlePdf.save();
          const pageNumStr = String(i + 1).padStart(2, '0');
          zip.file(`Page-${pageNumStr}.pdf`, bytes);
        }

        progressText.textContent = 'Generating ZIP archive...';
        progressBarFill.style.width = '95%';

        splitResultBlob = await zip.generateAsync({ type: 'blob' });
        splitFilename = `toolswa-split-pages-${Date.now()}.zip`;
        progressBarFill.style.width = '100%';

        setTimeout(() => {
          progressCard.style.display = 'none';
          resultCard.style.display = 'block';
          resultDesc.textContent = `Extracted all ${totalPages} pages as individual PDFs inside a ZIP archive (${window.ToolswaUtils.formatBytes(splitResultBlob.size)}).`;
          window.ToolswaUtils.showToast('All pages separated successfully!', 'success');
        }, 300);
      }

    } catch (err) {
      console.error(err);
      progressCard.style.display = 'none';
      configPanel.style.display = 'block';
      window.ToolswaUtils.showToast(`Split failed: ${err.message}`, 'error');
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!splitResultBlob) return;
    window.ToolswaUtils.downloadBlob(splitResultBlob, splitFilename);
  });

  resetBtn.addEventListener('click', () => {
    originalFile = null;
    originalBuffer = null;
    pdfDoc = null;
    totalPages = 0;
    selectedPages.clear();
    splitResultBlob = null;
    resultCard.style.display = 'none';
    progressCard.style.display = 'none';
    configPanel.style.display = 'none';
    dropzone.style.display = 'block';
    fileInput.value = '';
  });

})();
