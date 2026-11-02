/**
 * Toolswa - QR Code Generator Tool
 * Generates custom QR codes for URLs, text, Wi-Fi networks, and contact info directly in browser.
 */

(function () {
  'use strict';

  let currentType = 'url';
  let qrInstance = null;

  // DOM Elements
  const typeTabs = document.querySelectorAll('.type-tab');
  const typeSections = document.querySelectorAll('.type-section');
  const qrColorInput = document.getElementById('qr-color');
  const bgColorInput = document.getElementById('qr-bg-color');
  const qrSizeSelect = document.getElementById('qr-size');
  const generateBtn = document.getElementById('generate-btn');
  const qrcodeContainer = document.getElementById('qrcode-container');
  const downloadPngBtn = document.getElementById('download-png-btn');
  const copyBtn = document.getElementById('copy-btn');

  // Switch content type tabs (URL, Text, Wi-Fi, Email, Phone)
  typeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      typeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentType = tab.getAttribute('data-type');

      typeSections.forEach(section => {
        section.style.display = section.id === `section-${currentType}` ? 'block' : 'none';
      });

      generateQRCode();
    });
  });

  // Collect payload based on active type
  function getPayload() {
    if (currentType === 'url') {
      const val = document.getElementById('input-url').value.trim();
      return val || 'https://toolswa.com';
    } else if (currentType === 'text') {
      const val = document.getElementById('input-text').value.trim();
      return val || 'Welcome to Toolswa Multi-Tools';
    } else if (currentType === 'wifi') {
      const ssid = document.getElementById('wifi-ssid').value.trim();
      const pass = document.getElementById('wifi-pass').value.trim();
      const auth = document.getElementById('wifi-auth').value;
      const hidden = document.getElementById('wifi-hidden').checked;
      
      if (!ssid) return 'WIFI:S:ToolswaGuest;T:WPA;P:password123;;';
      return `WIFI:S:${ssid};T:${auth};P:${pass};H:${hidden ? 'true' : 'false'};;`;
    } else if (currentType === 'email') {
      const email = document.getElementById('input-email').value.trim();
      const subject = document.getElementById('email-subject').value.trim();
      const body = document.getElementById('email-body').value.trim();
      if (!email) return 'mailto:support@toolswa.com';
      return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else if (currentType === 'phone') {
      const phone = document.getElementById('input-phone').value.trim();
      return phone ? `tel:${phone}` : 'tel:+1234567890';
    }
    return 'https://toolswa.com';
  }

  // Generate QR Code
  function generateQRCode() {
    if (!window.QRCode) {
      console.warn('QRCode library not ready yet');
      return;
    }

    const payload = getPayload();
    const size = parseInt(qrSizeSelect.value, 10) || 300;
    const colorDark = qrColorInput.value || '#6C3CE9';
    const colorLight = bgColorInput.value || '#FFFFFF';

    qrcodeContainer.innerHTML = '';

    qrInstance = new window.QRCode(qrcodeContainer, {
      text: payload,
      width: size,
      height: size,
      colorDark: colorDark,
      colorLight: colorLight,
      correctLevel: window.QRCode.CorrectLevel.H
    });
  }

  // Event Listeners
  if (generateBtn) {
    generateBtn.addEventListener('click', generateQRCode);
  }

  [qrColorInput, bgColorInput, qrSizeSelect].forEach(el => {
    if (el) el.addEventListener('change', generateQRCode);
  });

  // Real-time input updates
  document.querySelectorAll('.qr-input-field').forEach(input => {
    input.addEventListener('input', () => {
      // Debounce slightly
      clearTimeout(input._timeout);
      input._timeout = setTimeout(generateQRCode, 350);
    });
  });

  // Download as high-res PNG
  downloadPngBtn.addEventListener('click', () => {
    const canvas = qrcodeContainer.querySelector('canvas');
    const img = qrcodeContainer.querySelector('img');

    if (canvas) {
      canvas.toBlob((blob) => {
        window.ToolswaUtils.downloadBlob(blob, `toolswa-qr-${Date.now()}.png`);
        window.ToolswaUtils.showToast('QR Code downloaded as PNG!', 'success');
      });
    } else if (img && img.src) {
      const a = document.createElement('a');
      a.href = img.src;
      a.download = `toolswa-qr-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.ToolswaUtils.showToast('QR Code downloaded!', 'success');
    } else {
      window.ToolswaUtils.showToast('Please generate a QR code first.', 'error');
    }
  });

  // Copy to clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const canvas = qrcodeContainer.querySelector('canvas');
      if (canvas && navigator.clipboard && window.ClipboardItem) {
        try {
          canvas.toBlob(async (blob) => {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            window.ToolswaUtils.showToast('QR image copied to clipboard!', 'success');
          });
        } catch (err) {
          window.ToolswaUtils.showToast('Clipboard copy failed. Please use download.', 'error');
        }
      } else {
        window.ToolswaUtils.showToast('Copying images directly is not supported in this browser.', 'info');
      }
    });
  }

  // Initial generation on load
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(generateQRCode, 200);
  });

})();
