/**
 * Toolswa - GST Calculator Tool
 * Calculates Add GST (Exclusive) and Remove GST (Inclusive) with standard slab rates (0%, 5%, 12%, 18%, 28%)
 * and Intra-State (CGST + SGST) / Inter-State (IGST) breakdowns.
 */

(function () {
  'use strict';

  let currentType = 'add'; // 'add' (exclusive) or 'remove' (inclusive)
  let currentRate = 18;
  let transactionType = 'intra'; // 'intra' (CGST+SGST) or 'inter' (IGST)

  // DOM Elements
  const amountInput = document.getElementById('amount-input');
  const typeRadios = document.querySelectorAll('input[name="gst-calc-type"]');
  const rateButtons = document.querySelectorAll('.btn-gst-rate');
  const customRateInput = document.getElementById('custom-rate-input');
  const txTypeSelect = document.getElementById('tx-type');
  
  // Results Elements
  const displayTaxable = document.getElementById('res-taxable');
  const displayCgstRow = document.getElementById('res-cgst-row');
  const displayCgst = document.getElementById('res-cgst');
  const displaySgstRow = document.getElementById('res-sgst-row');
  const displaySgst = document.getElementById('res-sgst');
  const displayIgstRow = document.getElementById('res-igst-row');
  const displayIgst = document.getElementById('res-igst');
  const displayTotalGst = document.getElementById('res-total-gst');
  const displayGrossTotal = document.getElementById('res-gross-total');
  const formulaExplanation = document.getElementById('formula-explanation');
  const copyBtn = document.getElementById('copy-gst-btn');
  const printBtn = document.getElementById('print-gst-btn');

  // Change Type (Add vs Remove)
  typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentType = e.target.value;
      calculateGST();
    });
  });

  // Rate Buttons
  rateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      rateButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRate = parseFloat(btn.getAttribute('data-rate'));
      customRateInput.value = '';
      calculateGST();
    });
  });

  // Custom Rate Input
  customRateInput.addEventListener('input', () => {
    const val = parseFloat(customRateInput.value);
    if (!isNaN(val) && val >= 0) {
      rateButtons.forEach(b => b.classList.remove('active'));
      currentRate = val;
      calculateGST();
    }
  });

  // Transaction type
  if (txTypeSelect) {
    txTypeSelect.addEventListener('change', (e) => {
      transactionType = e.target.value;
      calculateGST();
    });
  }

  // Amount input
  amountInput.addEventListener('input', calculateGST);

  function formatCurrency(num) {
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function calculateGST() {
    const rawAmount = parseFloat(amountInput.value) || 0;
    const rate = currentRate;

    let taxableAmount = 0;
    let gstAmount = 0;
    let grossTotal = 0;

    if (currentType === 'add') {
      // Exclusive: Amount is Taxable Base
      taxableAmount = rawAmount;
      gstAmount = (rawAmount * rate) / 100;
      grossTotal = taxableAmount + gstAmount;

      formulaExplanation.innerHTML = `
        <strong>Add GST Formula:</strong><br>
        GST Amount = (${formatCurrency(taxableAmount)} × ${rate}) / 100 = <strong>${formatCurrency(gstAmount)}</strong><br>
        Total Amount = ${formatCurrency(taxableAmount)} + ${formatCurrency(gstAmount)} = <strong>${formatCurrency(grossTotal)}</strong>
      `;
    } else {
      // Inclusive: Amount is Gross Total
      grossTotal = rawAmount;
      taxableAmount = rawAmount / (1 + (rate / 100));
      gstAmount = grossTotal - taxableAmount;

      formulaExplanation.innerHTML = `
        <strong>Remove GST Formula:</strong><br>
        Taxable Amount = ${formatCurrency(grossTotal)} / (1 + ${rate}/100) = <strong>${formatCurrency(taxableAmount)}</strong><br>
        GST Amount = ${formatCurrency(grossTotal)} - ${formatCurrency(taxableAmount)} = <strong>${formatCurrency(gstAmount)}</strong>
      `;
    }

    // Display numbers
    displayTaxable.textContent = formatCurrency(taxableAmount);
    displayTotalGst.textContent = formatCurrency(gstAmount);
    displayGrossTotal.textContent = formatCurrency(grossTotal);

    if (transactionType === 'intra') {
      // Intra-state: 50% CGST + 50% SGST
      const halfRate = (rate / 2).toFixed(2).replace(/\.00$/, '');
      const halfGst = gstAmount / 2;

      displayCgstRow.style.display = 'table-row';
      displaySgstRow.style.display = 'table-row';
      displayIgstRow.style.display = 'none';

      document.getElementById('label-cgst').textContent = `CGST (${halfRate}%):`;
      document.getElementById('label-sgst').textContent = `SGST (${halfRate}%):`;
      displayCgst.textContent = formatCurrency(halfGst);
      displaySgst.textContent = formatCurrency(halfGst);
    } else {
      // Inter-state: 100% IGST
      displayCgstRow.style.display = 'none';
      displaySgstRow.style.display = 'none';
      displayIgstRow.style.display = 'table-row';

      document.getElementById('label-igst').textContent = `IGST (${rate}%):`;
      displayIgst.textContent = formatCurrency(gstAmount);
    }
  }

  // Copy Summary
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const summary = `--- Toolswa GST Summary ---
Calculation: ${currentType === 'add' ? 'Add GST (Exclusive)' : 'Remove GST (Inclusive)'}
GST Rate: ${currentRate}%
Taxable (Net) Amount: ${displayTaxable.textContent}
Total GST Amount: ${displayTotalGst.textContent}
Gross Total Amount: ${displayGrossTotal.textContent}
Generated via Toolswa (https://toolswa.com)`;

      navigator.clipboard.writeText(summary).then(() => {
        window.ToolswaUtils.showToast('GST calculation copied to clipboard!', 'success');
      });
    });
  }

  // Print Summary
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Initial calculation on load
  document.addEventListener('DOMContentLoaded', calculateGST);

})();
