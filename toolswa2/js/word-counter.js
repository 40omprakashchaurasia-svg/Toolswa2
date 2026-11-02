/**
 * Toolswa - Word Counter Tool
 * Real-time text statistics: words, characters, sentences, paragraphs, reading time, and keyword density.
 */

(function () {
  'use strict';

  // DOM Elements
  const textInput = document.getElementById('text-input');
  const countWords = document.getElementById('count-words');
  const countChars = document.getElementById('count-chars');
  const countCharsNoSpace = document.getElementById('count-chars-no-space');
  const countSentences = document.getElementById('count-sentences');
  const countParagraphs = document.getElementById('count-paragraphs');
  const readTime = document.getElementById('read-time');
  const speakTime = document.getElementById('speak-time');
  const keywordTableBody = document.getElementById('keyword-table-body');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');

  // Case Conversion Buttons
  const btnUppercase = document.getElementById('btn-uppercase');
  const btnLowercase = document.getElementById('btn-lowercase');
  const btnTitlecase = document.getElementById('btn-titlecase');
  const btnSentencecase = document.getElementById('btn-sentencecase');
  const btnCleanSpaces = document.getElementById('btn-clean-spaces');

  function analyzeText() {
    const text = textInput.value;

    // 1. Characters with spaces
    const totalChars = text.length;
    countChars.textContent = totalChars.toLocaleString();

    // 2. Characters without spaces
    const charsNoSpace = text.replace(/\s/g, '').length;
    countCharsNoSpace.textContent = charsNoSpace.toLocaleString();

    // 3. Words
    const trimmed = text.trim();
    const wordsArray = trimmed === '' ? [] : trimmed.split(/\s+/).filter(w => w.length > 0);
    const totalWords = wordsArray.length;
    countWords.textContent = totalWords.toLocaleString();

    // 4. Sentences
    const sentencesArray = trimmed === '' ? [] : trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const totalSentences = sentencesArray.length;
    countSentences.textContent = totalSentences.toLocaleString();

    // 5. Paragraphs
    const paragraphsArray = trimmed === '' ? [] : text.split(/\n+/).filter(p => p.trim().length > 0);
    const totalParagraphs = paragraphsArray.length;
    countParagraphs.textContent = totalParagraphs.toLocaleString();

    // 6. Reading time (average 225 words per minute)
    const readingMinutes = totalWords / 225;
    if (readingMinutes < 1) {
      const sec = Math.ceil(readingMinutes * 60);
      readTime.textContent = totalWords === 0 ? '0s' : `${sec}s`;
    } else {
      const min = Math.floor(readingMinutes);
      const sec = Math.round((readingMinutes - min) * 60);
      readTime.textContent = `${min}m ${sec}s`;
    }

    // 7. Speaking time (average 130 words per minute)
    const speakingMinutes = totalWords / 130;
    if (speakingMinutes < 1) {
      const sec = Math.ceil(speakingMinutes * 60);
      speakTime.textContent = totalWords === 0 ? '0s' : `${sec}s`;
    } else {
      const min = Math.floor(speakingMinutes);
      const sec = Math.round((speakingMinutes - min) * 60);
      speakTime.textContent = `${min}m ${sec}s`;
    }

    // 8. Keyword density
    updateKeywordDensity(wordsArray);
  }

  function updateKeywordDensity(words) {
    if (!keywordTableBody) return;

    if (words.length === 0) {
      keywordTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-light); padding:20px;">Enter or paste text to view top keywords</td></tr>`;
      return;
    }

    // Common stop words to exclude
    const stopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he',
      'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
      'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about',
      'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
      'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
      'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our',
      'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were'
    ]);

    const frequencyMap = {};
    words.forEach(rawWord => {
      const clean = rawWord.toLowerCase().replace(/[^a-z0-9]/gi, '');
      if (clean.length > 2 && !stopWords.has(clean)) {
        frequencyMap[clean] = (frequencyMap[clean] || 0) + 1;
      }
    });

    const sortedKeywords = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sortedKeywords.length === 0) {
      keywordTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-light); padding:16px;">No significant repeating keywords detected</td></tr>`;
      return;
    }

    keywordTableBody.innerHTML = sortedKeywords.map(([word, count]) => {
      const density = ((count / words.length) * 100).toFixed(1);
      return `
        <tr>
          <td style="font-weight:600; text-transform:capitalize;">${word}</td>
          <td style="font-family:var(--font-mono); text-align:center;">${count}</td>
          <td style="font-family:var(--font-mono); text-align:right; color:var(--primary); font-weight:700;">${density}%</td>
        </tr>
      `;
    }).join('');
  }

  // Event Listeners
  textInput.addEventListener('input', analyzeText);

  clearBtn.addEventListener('click', () => {
    textInput.value = '';
    analyzeText();
    textInput.focus();
  });

  copyBtn.addEventListener('click', () => {
    if (!textInput.value) {
      window.ToolswaUtils.showToast('Text box is empty.', 'info');
      return;
    }
    navigator.clipboard.writeText(textInput.value).then(() => {
      window.ToolswaUtils.showToast('Text copied to clipboard!', 'success');
    });
  });

  // Case transforms
  btnUppercase.addEventListener('click', () => {
    textInput.value = textInput.value.toUpperCase();
    analyzeText();
  });

  btnLowercase.addEventListener('click', () => {
    textInput.value = textInput.value.toLowerCase();
    analyzeText();
  });

  btnTitlecase.addEventListener('click', () => {
    textInput.value = textInput.value.replace(
      /\w\S*/g,
      txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    analyzeText();
  });

  btnSentencecase.addEventListener('click', () => {
    textInput.value = textInput.value.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
    analyzeText();
  });

  btnCleanSpaces.addEventListener('click', () => {
    textInput.value = textInput.value.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
    analyzeText();
  });

  // Sample placeholder analysis on load
  document.addEventListener('DOMContentLoaded', analyzeText);

})();
