import { Command } from "commander";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join, resolve } from "path";
import type { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import chokidar from "chokidar";
import { createServer as createHttpServer } from "http";
import { createBaseServer } from "../server/base";
import { generatePdf } from "../server/pdf";
import { injectDebugSupport, type DebugOptions } from "../debug";
import chalk from "chalk";

interface TemplateInfo {
  id: string;
  name: string;
  file: string;
  path: string;
  sampleData?: Record<string, unknown>;
}

interface DevServerOptions {
  port: number;
  templatesDir: string;
  open: boolean;
}

async function scanTemplates(templatesDir: string): Promise<TemplateInfo[]> {
  if (!existsSync(templatesDir)) {
    return [];
  }

  // Try to load config file with sample data
  let configData: Record<string, Record<string, unknown>> = {};
  const configPaths = [
    join(process.cwd(), "src", "config", "templates.json"),
    join(process.cwd(), "templates.json"),
    join(templatesDir, "templates.json"),
  ];

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, "utf-8"));
        if (config.templates && Array.isArray(config.templates)) {
          for (const t of config.templates) {
            if (t.id && t.sampleData) {
              configData[t.id] = t.sampleData;
            }
          }
        }
        break;
      } catch {
        // Ignore config parse errors
      }
    }
  }

  const files = readdirSync(templatesDir).filter((f) => f.endsWith(".tsx"));

  // Filter to only include files that look like templates
  // (have "export default function" or similar patterns)
  const templates: TemplateInfo[] = [];

  for (const file of files) {
    const id = file.replace(".tsx", "");
    const filePath = join(templatesDir, file);

    // Quick check: read file and look for default export pattern
    try {
      const content = readFileSync(filePath, "utf-8");
      // Must have a default export that looks like a component
      if (!content.includes("export default") || !content.includes("function")) {
        continue;
      }
      // Skip files that are clearly not templates (no Document/Page imports)
      if (!content.includes("Document") && !content.includes("Page")) {
        continue;
      }
    } catch {
      continue;
    }

    // Convert kebab/snake case to Title Case
    const name = id
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    templates.push({
      id,
      name,
      file,
      path: filePath,
      sampleData: configData[id],
    });
  }

  return templates;
}

function createPreviewHTML(templates: TemplateInfo[], activeTemplate: string | null): string {
  const templateList = templates
    .map(
      (t) => `
      <button
        class="template-btn ${t.id === activeTemplate ? "active" : ""}"
        data-template="${t.id}"
        data-file="${t.file}"
      >
        <span class="template-name">${t.name}</span>
      </button>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDFX Dev Server</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --primary: #22d3ee;
      --primary-hover: #06b6d4;
      --bg: #0a0a0a;
      --surface-1: #111;
      --surface-2: #1a1a1a;
      --border: #222;
      --text: #fafafa;
      --text-muted: #666;
      --text-secondary: #888;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }

    .header {
      background: var(--surface-1);
      border-bottom: 1px solid var(--border);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .logo span { color: var(--primary); }

    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
    }

    .status-dot.disconnected { background: #ef4444; }

    .container {
      display: flex;
      height: calc(100vh - 57px);
    }

    .main-wrapper {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .sidebar {
      width: 200px;
      background: var(--surface-1);
      border-right: 1px solid var(--border);
      padding: 16px;
      overflow-y: auto;
    }

    .sidebar-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .template-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 12px;
      background: transparent;
      border: 1px solid #333;
      border-radius: 6px;
      color: #ccc;
      font-size: 13px;
      text-align: left;
      cursor: pointer;
      margin-bottom: 8px;
      transition: all 0.15s;
    }

    .template-btn:hover {
      background: var(--surface-2);
      border-color: #444;
    }

    .template-btn.active {
      background: rgba(34, 211, 238, 0.1);
      border-color: var(--primary);
      color: var(--primary);
    }

    .template-name { font-weight: 500; }

    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Context bar - top */
    .context-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: var(--surface-1);
      border-bottom: 1px solid var(--border);
    }

    .context-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .file-name {
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 13px;
      color: var(--text);
      font-weight: 500;
    }

    .file-name:empty::after {
      content: "Select a template";
      color: var(--text-muted);
      font-style: italic;
      font-family: inherit;
    }

    .page-info {
      font-size: 12px;
      color: var(--text-muted);
    }

    .context-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Preview area */
    .preview-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #27272a;
      overflow: hidden;
      padding: 24px;
    }

    .preview-frame {
      background: #fff;
      border-radius: 4px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      overflow: hidden;
      transition: opacity 0.2s;
    }

    .preview-frame.loading { opacity: 0.4; }

    .preview-frame iframe {
      display: block;
      border: none;
    }

    .empty-state {
      text-align: center;
      color: var(--text-muted);
    }

    .empty-state h2 {
      font-size: 18px;
      margin-bottom: 8px;
      color: var(--text-secondary);
    }

    .empty-state p {
      font-size: 14px;
      margin-bottom: 16px;
    }

    .empty-state code {
      background: var(--surface-2);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 13px;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--text-muted);
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid #333;
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Inspector panel - right side */
    .inspector-panel {
      width: 200px;
      background: var(--surface-1);
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .inspector-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text);
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }

    .inspector-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .inspector-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .inspector-section-title {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .metrics-note {
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 8px;
      font-style: italic;
    }

    /* Metrics display */
    .metrics-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .metric-label {
      font-size: 12px;
      color: var(--text-muted);
    }

    .metric-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary);
      font-variant-numeric: tabular-nums;
    }

    /* Overlay checkboxes */
    .overlay-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .overlay-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .overlay-checkbox:hover {
      color: var(--text);
    }

    .overlay-checkbox input {
      appearance: none;
      width: 16px;
      height: 16px;
      border: 1px solid #444;
      border-radius: 3px;
      background: var(--surface-2);
      cursor: pointer;
      position: relative;
      flex-shrink: 0;
    }

    .overlay-checkbox input:hover {
      border-color: #555;
    }

    .overlay-checkbox input:checked {
      background: var(--primary);
      border-color: var(--primary);
    }

    .overlay-checkbox input:checked::after {
      content: "";
      position: absolute;
      left: 5px;
      top: 2px;
      width: 4px;
      height: 8px;
      border: solid #000;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    .debug-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      font-size: 12px;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s;
    }

    .debug-link:hover {
      color: var(--primary);
    }

    .debug-link svg {
      opacity: 0.7;
    }

    /* Buttons */
    .btn {
      padding: 6px 10px;
      background: var(--surface-2);
      border: 1px solid #333;
      border-radius: 5px;
      color: #ccc;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .btn:hover { background: #333; border-color: #444; }

    .btn-primary {
      background: var(--primary);
      border-color: var(--primary);
      color: #000;
      font-weight: 600;
    }

    .btn-primary:hover { background: var(--primary-hover); border-color: var(--primary-hover); }
  </style>
</head>
<body>
  <header class="header">
    <div class="logo">pdf<span>x</span> <span style="font-weight: 400; color: var(--text-muted); font-size: 14px; margin-left: 8px;">dev</span></div>
    <div class="status">
      <div class="status-dot" id="status-dot"></div>
      <span id="status-text">Connected</span>
    </div>
  </header>

  <div class="container">
    <aside class="sidebar">
      <div class="sidebar-title">Templates</div>
      ${
        templates.length > 0
          ? templateList
          : '<div class="empty-state"><p>No templates found</p><code>pdfx add invoice</code></div>'
      }
    </aside>

    <div class="main-wrapper">
      <main class="main">
        <!-- Context bar: filename + page info + actions -->
        <div class="context-bar">
          <div class="context-left">
            <div class="file-name" id="file-name"></div>
            <div class="page-info" id="page-info"></div>
          </div>
          <div class="context-actions">
            <a class="btn" id="view-pdf" href="#" target="_blank" title="View PDF in browser">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              View PDF
            </a>
            <button class="btn btn-primary" id="download-pdf" title="Download PDF">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download
            </button>
          </div>
        </div>

        <!-- Preview area -->
        <div class="preview-area" id="preview-area">
          ${
            activeTemplate
              ? '<div class="loading-spinner"><div class="spinner"></div><span>Loading preview...</span></div>'
              : '<div class="empty-state"><h2>Select a template</h2><p>Choose a template from the sidebar to preview</p></div>'
          }
        </div>
      </main>

      <!-- Inspector panel: right side -->
      <aside class="inspector-panel" id="inspector-panel">
        <div class="inspector-title">Inspector</div>
        <div class="inspector-content">
          <div class="inspector-section">
            <div class="inspector-section-title">Performance</div>
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-label">Render</div>
                <div class="metric-value" id="metric-render">--</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Pagination</div>
                <div class="metric-value" id="metric-pagination">--</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Pages</div>
                <div class="metric-value" id="metric-pages">--</div>
              </div>
            </div>
            <div class="metrics-note">Measured in browser. Times vary on server.</div>
          </div>

          <div class="inspector-section">
            <div class="inspector-section-title">Debug</div>
            <div class="overlay-list">
              <label class="overlay-checkbox">
                <input type="checkbox" id="overlay-grid">
                Grid (1cm)
              </label>
              <label class="overlay-checkbox">
                <input type="checkbox" id="overlay-margins">
                Margins
              </label>
              <label class="overlay-checkbox">
                <input type="checkbox" id="overlay-headers">
                Headers/Footers
              </label>
              <label class="overlay-checkbox">
                <input type="checkbox" id="overlay-breaks">
                Page numbers
              </label>
            </div>
            <a class="debug-link" id="view-html" href="#" target="_blank">
              View HTML
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <script>
    // Page sizes in points (72 dpi)
    const PAGE_SIZES = {
      A4: { width: 595, height: 842 },
      A5: { width: 420, height: 595 },
      Letter: { width: 612, height: 792 },
      Legal: { width: 612, height: 1008 },
      Tabloid: { width: 792, height: 1224 },
    };

    const PT_TO_PX = 96 / 72;
    const STORAGE_KEY = 'pdfx-inspector';

    let ws;
    let currentTemplate = ${activeTemplate ? `"${activeTemplate}"` : "null"};
    let templateInfo = {};

    // Inspector state with defaults (all overlays off by default)
    let inspectorState = {
      overlays: {
        grid: false,
        margins: false,
        headers: false,
        breaks: false,
      }
    };

    // Load state from localStorage
    function loadState() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          inspectorState = { ...inspectorState, ...parsed };
        }
      } catch (e) {}
    }

    // Save state to localStorage
    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inspectorState));
      } catch (e) {}
    }

    // Apply state to UI
    function applyState() {
      // Overlay checkboxes
      document.getElementById('overlay-grid').checked = inspectorState.overlays.grid;
      document.getElementById('overlay-margins').checked = inspectorState.overlays.margins;
      document.getElementById('overlay-headers').checked = inspectorState.overlays.headers;
      document.getElementById('overlay-breaks').checked = inspectorState.overlays.breaks;
    }

    // Get debug query string from overlay state
    function getDebugQuery() {
      const { overlays } = inspectorState;
      const hasAny = Object.values(overlays).some(v => v);
      if (!hasAny) return '';

      const params = new URLSearchParams();
      if (overlays.grid) params.set('grid', '1');
      if (overlays.margins) params.set('margins', '1');
      if (overlays.headers) params.set('headers', '1');
      if (overlays.breaks) params.set('breaks', '1');

      return '?' + params.toString();
    }

    // Check if any overlay is enabled
    function hasAnyOverlay() {
      return Object.values(inspectorState.overlays).some(v => v);
    }

    loadState();

    function connect() {
      ws = new WebSocket('ws://' + location.host);

      ws.onopen = () => {
        document.getElementById('status-dot').classList.remove('disconnected');
        document.getElementById('status-text').textContent = 'Connected';
      };

      ws.onclose = () => {
        document.getElementById('status-dot').classList.add('disconnected');
        document.getElementById('status-text').textContent = 'Disconnected';
        setTimeout(connect, 2000);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'reload') {
          if (currentTemplate) loadPreview(currentTemplate);
        }
      };
    }

    connect();

    // Listen for metrics from iframe (postMessage from PDFX script)
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'pdfx:metrics') {
        const metrics = event.data.metrics;
        if (metrics.paginationTime !== undefined) {
          document.getElementById('metric-pagination').textContent = metrics.paginationTime + 'ms';
        }
        if (metrics.pages !== undefined) {
          document.getElementById('metric-pages').textContent = metrics.pages;
        }
      }
    });

    function detectPageInfo(html) {
      let pageSize = 'A4';
      let orientation = 'portrait';

      // Check for size attribute
      const sizeMatch = html.match(/size="([^"]+)"/i) || html.match(/data-page-size="([^"]+)"/i);
      if (sizeMatch) {
        const s = sizeMatch[1];
        if (PAGE_SIZES[s]) pageSize = s;
      }

      // Check for orientation attribute
      const orientMatch = html.match(/orientation="([^"]+)"/i);
      if (orientMatch && orientMatch[1] === 'landscape') {
        orientation = 'landscape';
      }

      // Special handling: Tabloid is typically landscape (posters)
      if (html.includes('Tabloid') || html.includes('tabloid')) {
        pageSize = 'Tabloid';
        // Default Tabloid to landscape unless explicitly portrait
        if (!html.includes('orientation="portrait"')) {
          orientation = 'landscape';
        }
      }

      return { pageSize, orientation };
    }

    function calculateScale(pageSize, orientation) {
      const container = document.getElementById('preview-area');
      const rect = container.getBoundingClientRect();
      const maxWidth = rect.width - 48;
      const maxHeight = rect.height - 48;

      const size = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
      const pageW = (orientation === 'landscape' ? size.height : size.width) * PT_TO_PX;
      const pageH = (orientation === 'landscape' ? size.width : size.height) * PT_TO_PX;

      const scale = Math.min(maxWidth / pageW, maxHeight / pageH, 1);
      return { pageW, pageH, scale };
    }

    async function loadPreview(templateId) {
      currentTemplate = templateId;

      // Get template file name from button
      const activeBtn = document.querySelector('.template-btn[data-template="' + templateId + '"]');
      const fileName = activeBtn ? activeBtn.dataset.file : templateId + '.tsx';

      document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.template === templateId);
      });

      // Update context bar
      document.getElementById('file-name').textContent = fileName;

      const previewArea = document.getElementById('preview-area');
      previewArea.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><span>Rendering...</span></div>';

      try {
        const debugQuery = getDebugQuery();
        const htmlRes = await fetch('/api/template/' + templateId + '/html' + debugQuery);
        const html = await htmlRes.text();

        templateInfo = detectPageInfo(html);
        document.getElementById('page-info').textContent =
          templateInfo.pageSize + ' · ' + templateInfo.orientation;

        // Update metrics (render time from server, pagination from iframe postMessage)
        const renderTime = htmlRes.headers.get('X-Render-Time');

        if (renderTime) {
          document.getElementById('metric-render').textContent = renderTime + 'ms';
        }

        // Reset pagination metrics (will be updated via postMessage from iframe)
        document.getElementById('metric-pagination').textContent = '--';
        document.getElementById('metric-pages').textContent = '--';

        const { pageW, pageH, scale } = calculateScale(templateInfo.pageSize, templateInfo.orientation);
        const displayW = pageW * scale;
        const displayH = pageH * scale;

        previewArea.innerHTML = '';
        const frame = document.createElement('div');
        frame.className = 'preview-frame';
        frame.style.width = displayW + 'px';
        frame.style.height = displayH + 'px';

        const iframe = document.createElement('iframe');
        iframe.style.width = pageW + 'px';
        iframe.style.height = pageH + 'px';
        iframe.style.transform = 'scale(' + scale + ')';
        iframe.style.transformOrigin = 'top left';
        iframe.srcdoc = html;

        frame.classList.add('loading');
        iframe.onload = () => frame.classList.remove('loading');

        frame.appendChild(iframe);
        previewArea.appendChild(frame);

        // Set up action buttons
        const pdfUrl = '/api/template/' + templateId + '/pdf' + debugQuery;
        const htmlUrl = '/api/template/' + templateId + '/html' + debugQuery;

        document.getElementById('view-pdf').href = pdfUrl;
        document.getElementById('view-html').href = htmlUrl;

        document.getElementById('download-pdf').onclick = () => {
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = templateId + '.pdf';
          link.click();
        };

      } catch (err) {
        previewArea.innerHTML = '<div class="empty-state"><h2>Error</h2><p>' + err.message + '</p></div>';
      }
    }

    document.querySelectorAll('.template-btn').forEach(btn => {
      btn.addEventListener('click', () => loadPreview(btn.dataset.template));
    });

    // Overlay checkbox handlers
    const overlayCheckboxes = ['grid', 'margins', 'headers', 'breaks'];
    overlayCheckboxes.forEach(name => {
      document.getElementById('overlay-' + name).onchange = (e) => {
        inspectorState.overlays[name] = e.target.checked;
        saveState();
        if (currentTemplate) loadPreview(currentTemplate);
      };
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (currentTemplate) loadPreview(currentTemplate);
      }, 150);
    });

    // Apply saved state and load first template
    applyState();
    ${activeTemplate ? `loadPreview("${activeTemplate}");` : ""}
  </script>
</body>
</html>`;
}

async function startDevServer(options: DevServerOptions) {
  const { port, templatesDir, open } = options;
  const absoluteTemplatesDir = resolve(process.cwd(), templatesDir);

  // Scan templates
  let templates = await scanTemplates(absoluteTemplatesDir);

  console.log(chalk.bold("\n  PDFX Dev Server\n"));
  console.log(chalk.dim(`  Templates: ${absoluteTemplatesDir}`));
  console.log(chalk.dim(`  Found: ${templates.length} template(s)\n`));

  // Create base server with shared /generate and /health endpoints
  const { app, browserManager } = createBaseServer({
    enableLogging: false, // Dev uses custom logging per route
    onSuccess: (result) => {
      const { metrics } = result;
      console.log(
        chalk.green("  ✓"),
        chalk.dim("/generate"),
        chalk.cyan(`${metrics.total}ms`),
        chalk.dim("•"),
        chalk.white(`${metrics.pageCount} page${metrics.pageCount > 1 ? "s" : ""}`),
        chalk.dim("•"),
        chalk.white(formatBytes(metrics.pdfSize))
      );
    },
    onError: (message) => {
      console.log(chalk.red("  ✗"), chalk.dim("/generate"), chalk.red(message));
    },
  });
  const server = createHttpServer(app);

  // Create WebSocket server for hot reload
  const wss = new WebSocketServer({ server });
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
  });

  function broadcast(message: object) {
    const data = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Create Vite server for template compilation
  // Custom logger to silence Vite's default output (we handle our own logging)
  const viteLogger = {
    info: () => {},
    warn: () => {},
    error: (msg: string) => console.error(chalk.red("  ✗ Vite:"), msg),
    warnOnce: () => {},
    hasWarned: false,
    clearScreen: () => {},
    hasErrorLogged: () => false,
  };

  const vite = await createViteServer({
    root: process.cwd(),
    server: { middlewareMode: true },
    appType: "custom",
    customLogger: viteLogger,
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
    esbuild: {
      jsx: "automatic",
    },
    ssr: {
      // Don't externalize these - we need to transform them
      noExternal: ["@pdfx-dev/react", "@pdfx-dev/tailwind", "server-only"],
    },
    plugins: [
      {
        name: "mock-server-only",
        enforce: "pre",
        resolveId(id) {
          if (id === "server-only") {
            return { id: "\0server-only-mock", moduleSideEffects: false };
          }
        },
        load(id) {
          if (id === "\0server-only-mock") {
            // Return empty module - we're in SSR context so server-only is fine
            return "export default {};";
          }
        },
      },
    ],
  });


  // Watch for template changes
  const watcher = chokidar.watch(absoluteTemplatesDir, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
  });

  // Helper to check if a file is a template (matches what we show in sidebar)
  function isTemplateFile(filePath: string): boolean {
    const fileName = filePath.split("/").pop() || "";
    // Must be a .tsx file in the root of templates dir (not in subdirectories)
    if (!fileName.endsWith(".tsx")) return false;
    // Check if it's a direct child of templates dir
    const relativePath = filePath.replace(absoluteTemplatesDir + "/", "");
    if (relativePath.includes("/")) return false;
    return true;
  }

  // Helper to check if file is a code file (tsx/ts/js/jsx)
  function isCodeFile(filePath: string): boolean {
    return /\.(tsx?|jsx?)$/.test(filePath);
  }

  // Suppress logging during initial scan
  let watcherReady = false;

  watcher.on("ready", () => {
    watcherReady = true;
  });

  watcher.on("change", async (filePath) => {
    if (!watcherReady) return;
    const fileName = filePath.split("/").pop() || filePath;
    // Log all code file changes (templates and components)
    if (isCodeFile(filePath)) {
      console.log(chalk.blue("  ↻"), chalk.white(fileName), chalk.dim("changed"));
    }
    templates = await scanTemplates(absoluteTemplatesDir);
    broadcast({ type: "reload" });
  });

  watcher.on("add", async (filePath) => {
    if (!watcherReady) return;
    const oldCount = templates.length;
    templates = await scanTemplates(absoluteTemplatesDir);
    // Only log if a new template was actually added (not components)
    if (templates.length > oldCount && isTemplateFile(filePath)) {
      const fileName = filePath.split("/").pop() || filePath;
      console.log(chalk.green("  +"), chalk.white(fileName), chalk.dim("added"));
    }
    broadcast({ type: "reload" });
  });

  watcher.on("unlink", async (filePath) => {
    if (!watcherReady) return;
    const oldCount = templates.length;
    const fileName = filePath.split("/").pop() || filePath;
    templates = await scanTemplates(absoluteTemplatesDir);
    // Only log if a template was actually removed (not components)
    if (templates.length < oldCount && isTemplateFile(filePath)) {
      console.log(chalk.red("  -"), chalk.white(fileName), chalk.dim("removed"));
    }
    broadcast({ type: "reload" });
  });

  // Serve preview UI
  app.get("/", (_req: Request, res: Response) => {
    const activeTemplate = templates.length > 0 ? templates[0].id : null;
    res.send(createPreviewHTML(templates, activeTemplate));
  });

  // API: Get template code
  app.get("/api/template/:id/code", (req: Request, res: Response) => {
    const template = templates.find((t) => t.id === req.params.id);
    if (!template) {
      res.status(404).send("Template not found");
      return;
    }

    try {
      const code = readFileSync(template.path, "utf-8");
      res.type("text/plain").send(code);
    } catch {
      res.status(500).send("Error reading template");
    }
  });

  // Helper: Render a template to HTML using Vite
  // Templates use default parameter values for sample data (React Email pattern)
  async function renderTemplate(
    template: TemplateInfo,
    debugOptions: boolean | DebugOptions = false
  ): Promise<string> {
    const mod = await vite.ssrLoadModule(template.path);
    const Component = mod.default;
    const { render } = await vite.ssrLoadModule("@pdfx-dev/react");
    // Call with empty props - component's default parameter values provide sample data
    const rawHtml = await render(Component({}));
    return injectDebugSupport(rawHtml, debugOptions);
  }

  // Parse debug options from query params
  function parseDebugOptions(query: Record<string, unknown>): DebugOptions | false {
    const options: DebugOptions = {
      grid: query.grid === "1",
      margins: query.margins === "1",
      headers: query.headers === "1",
      breaks: query.breaks === "1",
    };

    // Return false if no options enabled
    const hasAny = Object.values(options).some((v) => v);
    return hasAny ? options : false;
  }

  // API: Get rendered HTML
  app.get("/api/template/:id/html", async (req: Request, res: Response) => {
    const template = templates.find((t) => t.id === req.params.id);
    if (!template) {
      res.status(404).send("Template not found");
      return;
    }

    try {
      const start = performance.now();
      const debugOptions = parseDebugOptions(req.query as Record<string, unknown>);
      const html = await renderTemplate(template, debugOptions);
      const duration = Math.round(performance.now() - start);

      // Count pages from rendered HTML (look for pagedjs page markers)
      const pageMatches = html.match(/class="pagedjs_page"/g);
      const pageCount = pageMatches ? pageMatches.length : 1;

      // Log render
      console.log(
        chalk.green("  ✓"),
        chalk.white(template.file),
        chalk.dim("→ HTML"),
        chalk.cyan(`${duration}ms`)
      );

      res.setHeader("X-Render-Time", duration.toString());
      res.setHeader("X-Page-Count", pageCount.toString());
      // Note: Pagination time is measured client-side after Paged.js runs
      res.type("text/html").send(html);
    } catch (error) {
      console.log(chalk.red("  ✗"), chalk.white(template.file), chalk.red("render failed"));
      console.error(chalk.dim("   "), error);
      res.status(500).send(`Error rendering template: ${error}`);
    }
  });

  // Helper: Format bytes for display
  function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + "B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
    return (bytes / (1024 * 1024)).toFixed(2) + "MB";
  }

  // API: Generate PDF
  app.get("/api/template/:id/pdf", async (req: Request, res: Response) => {
    const template = templates.find((t) => t.id === req.params.id);
    if (!template) {
      res.status(404).send("Template not found");
      return;
    }

    try {
      const debugOptions = parseDebugOptions(req.query as Record<string, unknown>);
      const html = await renderTemplate(template, debugOptions);
      const result = await browserManager.withPage(async (page) => {
        return generatePdf(page, html, { timeout: 30000 });
      });

      // Log PDF generation
      const { metrics, warnings, assets } = result;
      console.log(
        chalk.green("  ✓"),
        chalk.white(template.file),
        chalk.dim("→ PDF"),
        chalk.cyan(`${metrics.total}ms`),
        chalk.dim("•"),
        chalk.white(`${metrics.pageCount} page${metrics.pageCount > 1 ? "s" : ""}`),
        chalk.dim("•"),
        chalk.white(formatBytes(metrics.pdfSize))
      );

      // Log timing breakdown
      console.log(
        chalk.dim("      load"),
        chalk.white(`${metrics.contentLoad}ms`),
        chalk.dim("→ paginate"),
        chalk.white(`${metrics.pagedJs}ms`),
        chalk.dim("→ capture"),
        chalk.white(`${metrics.pdfCapture}ms`)
      );

      // Log asset summary
      if (assets.length > 0) {
        const images = assets.filter((a) => a.type === "image");
        const fonts = assets.filter((a) => a.type === "font");
        const parts: string[] = [];
        if (images.length > 0) parts.push(`${images.length} image${images.length > 1 ? "s" : ""}`);
        if (fonts.length > 0) parts.push(`${fonts.length} font${fonts.length > 1 ? "s" : ""}`);
        if (parts.length > 0) {
          console.log(chalk.dim("      " + parts.join(" • ")));
        }
      }

      // Log warnings
      if (warnings.length > 0) {
        warnings.forEach((w) => {
          console.log(chalk.yellow("    ⚠"), chalk.yellow(w));
        });
      }

      // Add metrics headers
      res.setHeader("X-PDF-Total-Time", metrics.total.toString());
      res.setHeader("X-PDF-Pages", metrics.pageCount.toString());
      res.setHeader("X-PDF-Size", metrics.pdfSize.toString());
      res.setHeader("X-PDF-Capture-Time", metrics.pdfCapture.toString());
      res.setHeader("X-PDF-Assets", result.assets.length.toString());
      res.setHeader("X-PDF-Warnings", warnings.length.toString());

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${template.id}.pdf"`);
      res.send(result.buffer);
    } catch (error) {
      console.log(chalk.red("  ✗"), chalk.white(template.file), chalk.red("PDF generation failed"));
      console.error(chalk.dim("   "), error);
      res.status(500).send(`Error generating PDF: ${error}`);
    }
  });

  // API: Generate PDF and return metrics (JSON)
  app.get("/api/template/:id/pdf-metrics", async (req: Request, res: Response) => {
    const template = templates.find((t) => t.id === req.params.id);
    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    try {
      const debugOptions = parseDebugOptions(req.query as Record<string, unknown>);
      const html = await renderTemplate(template, debugOptions);
      const result = await browserManager.withPage(async (page) => {
        return generatePdf(page, html, { timeout: 30000 });
      });

      // Log (same as PDF endpoint)
      const { metrics, warnings, assets } = result;
      console.log(
        chalk.green("  ✓"),
        chalk.white(template.file),
        chalk.dim("→ PDF metrics"),
        chalk.cyan(`${metrics.total}ms`),
        chalk.dim("•"),
        chalk.white(`${metrics.pageCount} page${metrics.pageCount > 1 ? "s" : ""}`),
        chalk.dim("•"),
        chalk.white(formatBytes(metrics.pdfSize))
      );

      // Log timing breakdown
      console.log(
        chalk.dim("      load"),
        chalk.white(`${metrics.contentLoad}ms`),
        chalk.dim("→ paginate"),
        chalk.white(`${metrics.pagedJs}ms`),
        chalk.dim("→ capture"),
        chalk.white(`${metrics.pdfCapture}ms`)
      );

      // Log asset summary
      if (assets.length > 0) {
        const images = assets.filter((a) => a.type === "image");
        const fonts = assets.filter((a) => a.type === "font");
        const parts: string[] = [];
        if (images.length > 0) parts.push(`${images.length} image${images.length > 1 ? "s" : ""}`);
        if (fonts.length > 0) parts.push(`${fonts.length} font${fonts.length > 1 ? "s" : ""}`);
        if (parts.length > 0) {
          console.log(chalk.dim("      " + parts.join(" • ")));
        }
      }

      if (warnings.length > 0) {
        warnings.forEach((w) => {
          console.log(chalk.yellow("    ⚠"), chalk.yellow(w));
        });
      }

      res.json({
        metrics: result.metrics,
        assets: result.assets,
        warnings: result.warnings,
      });
    } catch (error) {
      console.log(chalk.red("  ✗"), chalk.white(template.file), chalk.red("PDF metrics failed"));
      console.error(chalk.dim("   "), error);
      res.status(500).json({ error: `Error generating PDF: ${error}` });
    }
  });

  // Start server
  await new Promise<void>((resolve) => {
    server.listen(port, () => resolve());
  });

  // Pre-launch browser
  console.log(chalk.dim("  Launching browser..."));
  await browserManager.getBrowser();

  console.log(chalk.green(`\n  ✓ Server running at http://localhost:${port}\n`));

  // Open browser
  if (open) {
    const { default: openBrowser } = await import("open");
    await openBrowser(`http://localhost:${port}`);
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log(chalk.dim("\n  Shutting down..."));
    watcher.close();
    await vite.close();
    await browserManager.close();
    server.close();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

export const devCommand = new Command("dev")
  .description("Start development server with live preview")
  .option("--port <number>", "Server port (env: PDFX_PORT)", process.env.PDFX_PORT ?? "3456")
  .option("--templates <path>", "Templates directory", "./pdf-templates")
  .option("--no-open", "Don't open browser automatically")
  .action(async (options) => {
    const port = parseInt(options.port, 10);

    await startDevServer({
      port,
      templatesDir: options.templates,
      open: options.open,
    });
  });
