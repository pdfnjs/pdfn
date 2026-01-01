import { Command } from "commander";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join, resolve } from "path";
import express from "express";
import type { Express, Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import chokidar from "chokidar";
import { createServer as createHttpServer } from "http";
import { BrowserManager } from "../server/browser";
import { generatePdf } from "../server/pdf";
import { injectDebugSupport } from "../debug";
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

    /* Control bar - bottom */
    .control-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: var(--surface-1);
      border-top: 1px solid var(--border);
    }

    .control-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .debug-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    .toggle-track {
      width: 32px;
      height: 16px;
      background: var(--surface-2);
      border: 1px solid #333;
      border-radius: 8px;
      position: relative;
      transition: all 0.2s;
    }

    .toggle-track:hover { border-color: #444; }
    .toggle-track.active { background: var(--primary); border-color: var(--primary); }

    .toggle-thumb {
      position: absolute;
      top: 1px;
      left: 2px;
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      transition: left 0.2s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .toggle-track.active .toggle-thumb { left: 16px; }

    .toggle-label {
      font-size: 12px;
      color: var(--text-muted);
    }

    .control-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .metrics {
      font-size: 12px;
      color: var(--text-muted);
    }

    .metrics span { color: var(--primary); font-weight: 600; }

    .btn {
      padding: 6px 12px;
      background: var(--surface-2);
      border: 1px solid #333;
      border-radius: 6px;
      color: #ccc;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
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

    <main class="main">
      <!-- Context bar: filename + page info -->
      <div class="context-bar">
        <div class="file-name" id="file-name"></div>
        <div class="page-info" id="page-info"></div>
      </div>

      <!-- Preview area -->
      <div class="preview-area" id="preview-area">
        ${
          activeTemplate
            ? '<div class="loading-spinner"><div class="spinner"></div><span>Loading preview...</span></div>'
            : '<div class="empty-state"><h2>Select a template</h2><p>Choose a template from the sidebar to preview</p></div>'
        }
      </div>

      <!-- Control bar: debug + metrics + download -->
      <div class="control-bar">
        <div class="control-left">
          <div class="debug-toggle" id="debug-toggle">
            <div class="toggle-track" id="toggle-track">
              <div class="toggle-thumb"></div>
            </div>
            <span class="toggle-label">Debug</span>
          </div>
        </div>
        <div class="control-right">
          <div class="metrics" id="metrics"></div>
          <button class="btn btn-primary" id="download-pdf">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download
          </button>
        </div>
      </div>
    </main>
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

    let ws;
    let currentTemplate = ${activeTemplate ? `"${activeTemplate}"` : "null"};
    let debug = false;
    let templateInfo = {};

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
        const htmlRes = await fetch('/api/template/' + templateId + '/html' + (debug ? '?debug=true' : ''));
        const html = await htmlRes.text();

        templateInfo = detectPageInfo(html);
        document.getElementById('page-info').textContent =
          templateInfo.pageSize + ' · ' + templateInfo.orientation;

        const renderTime = htmlRes.headers.get('X-Render-Time');
        if (renderTime) {
          document.getElementById('metrics').innerHTML = 'Rendered in <span>' + renderTime + 'ms</span>';
        }

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

        document.getElementById('download-pdf').onclick = () => {
          const link = document.createElement('a');
          link.href = '/api/template/' + templateId + '/pdf' + (debug ? '?debug=true' : '');
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

    document.getElementById('debug-toggle').onclick = () => {
      debug = !debug;
      document.getElementById('toggle-track').classList.toggle('active', debug);
      if (currentTemplate) loadPreview(currentTemplate);
    };

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (currentTemplate) loadPreview(currentTemplate);
      }, 150);
    });

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

  // Create Express app
  const app: Express = express();
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
  const vite = await createViteServer({
    root: process.cwd(),
    server: { middlewareMode: true },
    appType: "custom",
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

  // Browser manager for PDF generation
  const browserManager = new BrowserManager({ maxConcurrent: 2, timeout: 30000 });

  // Watch for template changes
  const watcher = chokidar.watch(absoluteTemplatesDir, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
  });

  watcher.on("change", async (path) => {
    console.log(chalk.dim(`  File changed: ${path}`));
    templates = await scanTemplates(absoluteTemplatesDir);
    broadcast({ type: "reload" });
  });

  watcher.on("add", async () => {
    templates = await scanTemplates(absoluteTemplatesDir);
    broadcast({ type: "reload" });
  });

  watcher.on("unlink", async () => {
    templates = await scanTemplates(absoluteTemplatesDir);
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
  async function renderTemplate(template: TemplateInfo, debug = false): Promise<string> {
    const mod = await vite.ssrLoadModule(template.path);
    const Component = mod.default;
    const { render } = await vite.ssrLoadModule("@pdfx-dev/react");
    // Call with empty props - component's default parameter values provide sample data
    const rawHtml = await render(Component({}));
    return injectDebugSupport(rawHtml, debug);
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
      const html = await renderTemplate(template, req.query.debug === "true");
      const duration = Math.round(performance.now() - start);

      res.setHeader("X-Render-Time", duration.toString());
      res.type("text/html").send(html);
    } catch (error) {
      console.error(chalk.red("  Render error:"), error);
      res.status(500).send(`Error rendering template: ${error}`);
    }
  });

  // API: Generate PDF
  app.get("/api/template/:id/pdf", async (req: Request, res: Response) => {
    const template = templates.find((t) => t.id === req.params.id);
    if (!template) {
      res.status(404).send("Template not found");
      return;
    }

    try {
      const html = await renderTemplate(template);
      const result = await browserManager.withPage(async (page) => {
        return generatePdf(page, html, { timeout: 30000 });
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${template.id}.pdf"`);
      res.send(result.buffer);
    } catch (error) {
      console.error(chalk.red("  PDF error:"), error);
      res.status(500).send(`Error generating PDF: ${error}`);
    }
  });

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", templates: templates.length });
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
  .option("--port <number>", "Server port", "3456")
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
