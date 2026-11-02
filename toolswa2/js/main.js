/**
 * Toolswa - Main JavaScript
 * Handles dark mode, search filtering, category tabs, FAQs, mobile nav, and shared hosting download.
 */

(function () {
  'use strict';

  // 1. Dark Mode Initialization & Toggle
  const initTheme = () => {
    const savedTheme = localStorage.getItem('toolswa_theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('toolswa_theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
      });
      updateThemeIcon(document.documentElement.classList.contains('dark'));
    }
  };

  const updateThemeIcon = (isDark) => {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return;
    if (isDark) {
      // Sun icon for switching back to light
      themeIcon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
    } else {
      // Moon icon for switching to dark
      themeIcon.innerHTML = `<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    }
  };

  // 2. Mobile Menu Toggle
  const initMobileMenu = () => {
    const toggleBtn = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
      });
      // Close menu on link click
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
        });
      });
    }
  };

  // 3. Tool Search & Category Filter (for Homepage)
  const initToolSearch = () => {
    const searchInput = document.getElementById('tool-search');
    const clearBtn = document.getElementById('search-clear');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const toolCards = document.querySelectorAll('.tool-card');
    const noResults = document.getElementById('no-results');

    if (!searchInput || !toolCards.length) return;

    let currentCategory = 'all';

    const filterTools = () => {
      const query = searchInput.value.toLowerCase().trim();
      let visibleCount = 0;

      if (clearBtn) {
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
      }

      toolCards.forEach(card => {
        const title = card.getAttribute('data-title') || card.querySelector('.tool-card-title')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.tool-card-desc')?.textContent.toLowerCase() || '';
        const tags = card.getAttribute('data-tags') || '';
        const category = card.getAttribute('data-category') || 'all';

        const matchesQuery = !query || title.includes(query) || desc.includes(query) || tags.includes(query);
        const matchesCategory = currentCategory === 'all' || category === currentCategory;

        if (matchesQuery && matchesCategory) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    };

    searchInput.addEventListener('input', filterTools);

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterTools();
        searchInput.focus();
      });
    }

    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.getAttribute('data-category') || 'all';
        filterTools();
      });
    });
  };

  // 4. FAQ Accordion
  const initFaqAccordion = () => {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          // Close others
          faqItems.forEach(other => other.classList.remove('active'));
          if (!isActive) {
            item.classList.add('active');
          }
        });
      }
    });
  };

  // 5. Shared Hosting Deployment Guide Modal
  const initHostingModal = () => {
    const openBtns = document.querySelectorAll('.js-open-hosting-modal');
    const modal = document.getElementById('hosting-modal');
    const closeBtn = document.getElementById('close-hosting-modal');

    if (!modal) return;

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('open');
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });

    // Modal Guide Tab Switcher (Netlify vs cPanel)
    const tabNetlify = document.getElementById('tab-btn-netlify');
    const tabCpanel = document.getElementById('tab-btn-cpanel');
    const sectionNetlify = document.getElementById('guide-section-netlify');
    const sectionCpanel = document.getElementById('guide-section-cpanel');

    if (tabNetlify && tabCpanel && sectionNetlify && sectionCpanel) {
      tabNetlify.addEventListener('click', () => {
        tabNetlify.classList.add('active');
        tabCpanel.classList.remove('active');
        sectionNetlify.style.display = 'block';
        sectionCpanel.style.display = 'none';
      });

      tabCpanel.addEventListener('click', () => {
        tabCpanel.classList.add('active');
        tabNetlify.classList.remove('active');
        sectionCpanel.style.display = 'block';
        sectionNetlify.style.display = 'none';
      });
    }

    // Wire up reliable blob download for all zip download buttons
    const zipLinks = document.querySelectorAll('a[href*="toolswa-shared-hosting.zip"], a[download*="toolswa-shared-hosting.zip"]');
    zipLinks.forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        window.ToolswaUtils.showToast('Preparing ZIP package for download...', 'info');

        const tryUrls = [
          'toolswa-shared-hosting.zip',
          'assets/toolswa-shared-hosting.zip',
          '../toolswa-shared-hosting.zip',
          '../assets/toolswa-shared-hosting.zip',
          '/toolswa-shared-hosting.zip',
          '/assets/toolswa-shared-hosting.zip'
        ];

        let downloadedBlob = null;
        for (const url of tryUrls) {
          try {
            const resp = await fetch(url);
            if (resp.ok) {
              const blob = await resp.blob();
              if (blob.size > 10000) { // Verify not an empty or error response
                downloadedBlob = blob;
                break;
              }
            }
          } catch (err) {
            // continue to next URL
          }
        }

        if (downloadedBlob) {
          window.ToolswaUtils.downloadBlob(downloadedBlob, 'toolswa-shared-hosting.zip');
          window.ToolswaUtils.showToast(`ZIP Downloaded! (${window.ToolswaUtils.formatBytes(downloadedBlob.size)}) - Ready to extract on Windows & Shared Hosting`, 'success');
        } else {
          // Fallback to standard href navigation
          window.location.href = 'toolswa-shared-hosting.zip';
        }
      });
    });
  };

  // 6. Language Switcher (EN / HI)
  const initLanguage = () => {
    const langBtn = document.getElementById('lang-switch-btn');
    if (!langBtn) return;

    let currentLang = localStorage.getItem('toolswa_lang') || 'en';

    const translations = {
      en: {
        allTools: "All Tools",
        pdfTools: "PDF Tools",
        imageTools: "Image Tools",
        textCalc: "Text & Calculators",
        searchPlaceholder: "Search any tool (e.g., merge, compress, split, gst, qr)...",
        downloadZip: "Hosting Package (ZIP)"
      },
      hi: {
        allTools: "सभी टूल्स",
        pdfTools: "पीडीएफ टूल्स",
        imageTools: "इमेज टूल्स",
        textCalc: "टेक्स्ट और कैलकुलेटर",
        searchPlaceholder: "कोई भी टूल खोजें (जैसे मर्ज, कंप्रेस, स्प्लिट, जीएसटी)...",
        downloadZip: "होस्टिंग पैकेज (ZIP)"
      }
    };

    const applyLang = (lang) => {
      const t = translations[lang] || translations.en;
      langBtn.innerHTML = lang === 'hi' ? '🇮🇳 HI' : '🇬🇧 EN';
      
      const searchInput = document.getElementById('tool-search');
      if (searchInput) searchInput.placeholder = t.searchPlaceholder;

      localStorage.setItem('toolswa_lang', lang);
    };

    langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'hi' : 'en';
      applyLang(currentLang);
    });

    applyLang(currentLang);
  };

  // Execute on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initToolSearch();
    initFaqAccordion();
    initHostingModal();
    initLanguage();
  });

})();

// Global Helper Functions for all tools
window.ToolswaUtils = {
  formatBytes: (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  downloadBlob: (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },

  showToast: (message, type = 'info') => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const bg = type === 'error' ? '#C62828' : type === 'success' ? '#2E7D32' : '#6C3CE9';
    toast.style.cssText = `background:${bg};color:white;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:opacity 0.3s;opacity:0;`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; }, 10);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};
