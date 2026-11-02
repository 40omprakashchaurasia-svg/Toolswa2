# Toolswa – Online Multi-Tools & PDF Utilities

A modern, fast, and privacy-first Multi-Tools web application inspired by the UI/UX layout of **iLovePDF.com**. Built strictly with **HTML5, CSS3, and Vanilla JavaScript**, running **100% in the user's browser** with zero server uploads, zero database requirements, and zero backend dependencies.

---

## 🚀 Live Functional Tools

### PDF Tools
1. **PDF Merge** (`/tools/pdf-merge.html`): Combine multiple PDF documents with drag-and-drop, visual file reordering (Move Up/Down), and instant download via PDF-Lib.
2. **PDF Compressor** (`/tools/pdf-compressor.html`): Optimize PDF file size with Smart Lossless stream compression or raster rendering via PDF.js, with live size comparison.
3. **PDF Split** (`/tools/pdf-split.html`): Extract custom page ranges (`1-3, 5`) or separate all pages into individual PDFs packaged into a ZIP archive.

### Image Tools
4. **Image Compressor** (`/tools/image-compressor.html`): Compress JPG, PNG, and WebP images with a live quality slider (10%–100%), format conversion, and side-by-side comparison.
5. **Image Resizer** (`/tools/image-resizer.html`): Resize images by exact pixel dimensions or presets (25%, 50%, 75%, 150%, 200%) with aspect ratio lock.
6. **QR Code Generator** (`/tools/qr-generator.html`): Generate custom colored QR codes for URLs, text, Wi-Fi networks (SSID, password, hidden network), email, and phone with high-res PNG export.

### Text & Finance Utilities
7. **Word Counter** (`/tools/word-counter.html`): Live metrics for word count, character count (with & without spaces), sentence count, paragraph count, reading time, speaking time, and keyword density.
8. **GST Calculator** (`/tools/gst-calculator.html`): Calculate Add GST (Exclusive) and Remove GST (Inclusive) with statutory slabs (0%, 5%, 12%, 18%, 28%) and CGST/SGST/IGST breakdown.

---

## 📁 Repository Structure

```text
toolswa/
├── index.html               <- Main Homepage at root
├── about.html               <- About Us & Privacy manifesto
├── contact.html             <- Contact form & support details
├── privacy-policy.html      <- Privacy policy (Zero server uploads)
├── terms.html               <- Terms of service
├── 404.html                 <- Custom 404 Page Not Found
├── sitemap.xml              <- SEO XML sitemap
├── robots.txt               <- Search engine crawling rules
├── netlify.toml             <- Netlify build & redirect configuration
├── _redirects               <- Clean URL rewrites & 404 fallback
├── README.md                <- Project documentation
├── README.txt               <- Shared hosting deployment guide
│
├── css/
│   ├── style.css            <- Purple (#6C3CE9) & White theme + dark mode
│   └── tools.css            <- Dropzones, controls panels & previews
│
├── js/
│   ├── main.js              <- Navigation, theme switcher, search, download handler
│   ├── pdf-merge.js         <- PDF merge controller
│   ├── pdf-compressor.js    <- PDF compressor controller
│   ├── pdf-split.js         <- PDF split controller
│   ├── image-compressor.js  <- Image compressor controller
│   ├── image-resizer.js     <- Image resizer controller
│   ├── qr-generator.js      <- QR code generator controller
│   ├── word-counter.js      <- Word counter analytics
│   └── gst-calculator.js    <- GST calculator math & invoice summary
│
├── tools/
│   ├── pdf-merge.html
│   ├── pdf-compressor.html
│   ├── pdf-split.html
│   ├── image-compressor.html
│   ├── image-resizer.html
│   ├── qr-generator.html
│   ├── word-counter.html
│   └── gst-calculator.html
│
└── assets/
    ├── logo.svg
    ├── logo.png
    └── icons/
        ├── pdf-merge.svg
        ├── pdf-compressor.svg
        ├── pdf-split.svg
        ├── image-compressor.svg
        ├── image-resizer.svg
        ├── qr-generator.svg
        ├── word-counter.svg
        └── gst-calculator.svg
```

---

## 🌐 Netlify Deployment Guide (2 Easy Steps)

### Step 1: Upload to GitHub

#### Option A: Using Git CLI (Recommended)
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Toolswa Multi-Tools Website"

# Rename branch to main
git branch -M main

# Add your GitHub remote repository URL
git remote add origin https://github.com/YOUR_USERNAME/toolswa.git

# Push to GitHub
git push -u origin main
```

#### Option B: Using GitHub Web UI
1. Create a new repository on GitHub named `toolswa` (Public or Private).
2. Click **Upload files**.
3. Drag and drop all the files from this folder directly into GitHub.
4. **Important**: Ensure `index.html` is at the root level of the repository (not inside an extra nested folder like `toolswa/toolswa/index.html`).
5. Click **Commit changes**.

---

### Step 2: Connect GitHub to Netlify & Deploy

1. Log in to [Netlify](https://app.netlify.com/).
2. Click **Add new site** → **Import an existing project**.
3. Select **GitHub** and authorize access to your `toolswa` repository.
4. Configure the **Build & deployment settings**:
   - **Base directory**: Leave **EMPTY** (do not type anything).
   - **Build command**: Leave **EMPTY** (static website, no build required).
   - **Publish directory**: `.` (or leave as root directory).
5. Click **Deploy Toolswa**.
6. Your website will be live in ~5 seconds with a custom URL like `https://toolswa.netlify.app`!

---

## 🛠️ Why This Configuration Fixes 404 Errors on Netlify

- **Root `index.html`**: Netlify serves `index.html` directly from the publish root directory.
- **Clean URLs via `_redirects` and `netlify.toml`**: Allows users to visit `/tools/pdf-merge` or `/about` directly in their browser without receiving 404 errors.
- **404 Fallback**: Any unknown route gracefully loads the custom branded `404.html`.
- **Zero Build Failures**: Because `build command` is left empty and `publish` is `.`, Netlify deploys instantly without failing on missing build steps.

---

## 📄 License & Privacy
100% Client-Side Computing. All file processing happens locally in the user's browser. No documents or images are ever uploaded to any remote server.
