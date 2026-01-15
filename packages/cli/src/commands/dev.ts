import { Command } from "commander";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join, resolve } from "path";
import type { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import chokidar from "chokidar";
import { createServer as createHttpServer } from "http";
import { spawn } from "child_process";
import puppeteer from "puppeteer";
import multer from "multer";
import { createBaseServer } from "../server/base";
import { generatePdf } from "../server/pdf";
import type { DebugOptions } from "@pdfn/react";
import { pdfn } from "@pdfn/vite";
import chalk from "chalk";
import { loadEnv } from "../utils/env";
import React from "react";

interface TemplateInfo {
  id: string;
  name: string;
  file: string;
  path: string;
  sampleData?: Record<string, unknown>;
}

/**
 * Standardized templates directory (convention over configuration)
 */
const TEMPLATES_DIR = "./pdfn-templates";

interface DevServerOptions {
  port: number;
  open: boolean;
  mode: string;
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
  <title>PDFN Dev Server</title>
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

    /* Console section */
    .console-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }

    .console-header:hover {
      color: var(--text-secondary);
    }

    .console-toggle {
      transition: transform 0.2s;
    }

    .console-toggle.collapsed {
      transform: rotate(-90deg);
    }

    .console-content {
      font-size: 12px;
    }

    .console-empty {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
    }

    .console-empty svg {
      color: #22c55e;
    }

    .console-message {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      padding: 4px 0;
    }

    .console-message.error {
      color: #ef4444;
    }

    .console-message.warning {
      color: #eab308;
    }

    .console-message-icon {
      flex-shrink: 0;
    }

    .console-message-text {
      word-break: break-all;
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
    <div class="logo">pdf<span>n</span> <span style="font-weight: 400; color: var(--text-muted); font-size: 14px; margin-left: 8px;">dev</span></div>
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
          : '<div class="empty-state"><p>No templates found</p><code>pdfn add invoice</code></div>'
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

          <div class="inspector-section">
            <div class="inspector-section-title console-header" id="console-header">
              <span>Console</span>
              <svg class="console-toggle" id="console-toggle" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
            <div class="console-content" id="console-content">
              <div class="console-empty" id="console-empty">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                No issues
              </div>
              <div id="console-messages" style="display: none;"></div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <script>
    // Page sizes in points (72 dpi)
    const PAGE_SIZES = {
      A3: { width: 842, height: 1191 },
      A4: { width: 595, height: 842 },
      A5: { width: 420, height: 595 },
      B4: { width: 709, height: 1001 },
      B5: { width: 499, height: 709 },
      Letter: { width: 612, height: 792 },
      Legal: { width: 612, height: 1008 },
      Tabloid: { width: 792, height: 1224 },
    };

    const PT_TO_PX = 96 / 72;
    const STORAGE_KEY = 'pdfn-inspector';

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
      },
      consoleExpanded: true
    };

    // Console messages
    let consoleMessages = [];

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

      // Console state
      const consoleContent = document.getElementById('console-content');
      const consoleToggle = document.getElementById('console-toggle');
      if (inspectorState.consoleExpanded) {
        consoleContent.style.display = 'block';
        consoleToggle.classList.remove('collapsed');
      } else {
        consoleContent.style.display = 'none';
        consoleToggle.classList.add('collapsed');
      }
    }

    // Toggle console expanded state
    function toggleConsole() {
      inspectorState.consoleExpanded = !inspectorState.consoleExpanded;
      saveState();
      applyState();
    }

    // Add console message
    function addConsoleMessage(type, message) {
      consoleMessages.push({ type, message });
      renderConsoleMessages();
    }

    // Clear console messages
    function clearConsoleMessages() {
      consoleMessages = [];
      renderConsoleMessages();
    }

    // Render console messages
    function renderConsoleMessages() {
      const emptyEl = document.getElementById('console-empty');
      const messagesEl = document.getElementById('console-messages');

      if (consoleMessages.length === 0) {
        emptyEl.style.display = 'flex';
        messagesEl.style.display = 'none';
        messagesEl.innerHTML = '';
      } else {
        emptyEl.style.display = 'none';
        messagesEl.style.display = 'block';
        messagesEl.innerHTML = consoleMessages.map(msg =>
          \`<div class="console-message \${msg.type}">
            <span class="console-message-icon">\${msg.type === 'error' ? '✗' : '⚠'}</span>
            <span class="console-message-text">\${escapeHtml(msg.message)}</span>
          </div>\`
        ).join('');
      }
    }

    // Escape HTML
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
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
        } else if (data.type === 'templates') {
          updateTemplateList(data.templates);
        }
      };
    }

    connect();

    // Update template list in sidebar (called when templates are added/removed)
    function updateTemplateList(templates) {
      const sidebar = document.querySelector('.sidebar');
      const titleEl = sidebar.querySelector('.sidebar-title');

      // Clear existing buttons
      sidebar.innerHTML = '';
      sidebar.appendChild(titleEl);

      if (templates.length === 0) {
        sidebar.innerHTML += '<div class="empty-state"><p>No templates found</p><code>pdfn add invoice</code></div>';
        // Clear preview if no templates
        currentTemplate = null;
        document.getElementById('file-name').textContent = '';
        document.getElementById('page-info').textContent = '';
        document.getElementById('preview-area').innerHTML = '<div class="empty-state"><h2>No templates</h2><p>Add a template to get started</p><code>pdfn add invoice</code></div>';
        return;
      }

      // Add template buttons
      templates.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'template-btn' + (t.id === currentTemplate ? ' active' : '');
        btn.dataset.template = t.id;
        btn.dataset.file = t.file;
        btn.innerHTML = '<span class="template-name">' + t.name + '</span>';
        btn.addEventListener('click', () => loadPreview(t.id));
        sidebar.appendChild(btn);
      });

      // If current template was deleted, switch to first template
      const templateIds = templates.map(t => t.id);
      if (currentTemplate && !templateIds.includes(currentTemplate)) {
        loadPreview(templates[0].id);
      }
    }

    // Listen for metrics from iframe (postMessage from PDFN script)
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'pdfn:metrics') {
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

      // Check for data-pdfn-size attribute (e.g., "A4", "Letter Landscape", "Tabloid")
      const sizeMatch = html.match(/data-pdfn-size="([^"]+)"/i);
      if (sizeMatch) {
        const sizeStr = sizeMatch[1];
        // Check if it includes "Landscape"
        if (sizeStr.includes('Landscape')) {
          orientation = 'landscape';
        }
        // Extract base size name (remove " Landscape" suffix if present)
        const baseName = sizeStr.replace(' Landscape', '').replace(' Portrait', '');
        if (PAGE_SIZES[baseName]) {
          pageSize = baseName;
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

    // Console header click handler
    document.getElementById('console-header').onclick = toggleConsole;

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
  const { port, open, mode } = options;
  const absoluteTemplatesDir = resolve(process.cwd(), TEMPLATES_DIR);

  // Show header and initializing message
  console.log(chalk.bold("\n  pdfn dev\n"));
  console.log(chalk.dim("  Initializing..."));

  // Scan templates
  let templates = await scanTemplates(absoluteTemplatesDir);

  // Show relative path for cleaner output
  const displayPath = TEMPLATES_DIR;
  const templateCount = templates.length === 1 ? "1 template" : `${templates.length} templates`;

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
        `${metrics.pageCount} page${metrics.pageCount > 1 ? "s" : ""}`,
        chalk.dim("•"),
        formatBytes(metrics.pdfSize)
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

  wss.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      // Handled by server error handler
      return;
    }
    console.error(chalk.red("  ✗ WebSocket error:"), err.message);
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
    mode,
    server: {
      middlewareMode: true,
      hmr: { server }  // Use our HTTP server for Vite's WebSocket
    },
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
      noExternal: ["@pdfn/react", "@pdfn/tailwind", "@pdfn/client", "server-only"],
    },
    plugins: [
      // Unified pdfn plugin: Tailwind pre-compilation + client/template markers
      ...pdfn(),
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


  // Watch for template and CSS changes
  // Watch templates dir and styles.css + styles/ directory for CSS HMR
  const watchPaths = [
    absoluteTemplatesDir,
    join(absoluteTemplatesDir, "styles.css"),
    join(absoluteTemplatesDir, "styles"),
  ];
  const watcher = chokidar.watch(watchPaths, {
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

  // Helper to check if file is a CSS file in templates
  function isCssFile(filePath: string): boolean {
    return filePath.endsWith(".css");
  }

  // Suppress logging during initial scan
  let watcherReady = false;

  watcher.on("ready", () => {
    watcherReady = true;
  });

  watcher.on("change", async (filePath) => {
    if (!watcherReady) return;
    const fileName = filePath.split("/").pop() || filePath;

    // Handle CSS file changes (styles.css or styles/*.css)
    if (isCssFile(filePath)) {
      console.log(chalk.blue("  ↻"), fileName, chalk.dim("changed"));

      // Invalidate the virtual Tailwind CSS module to force recompilation
      const virtualMod = vite.moduleGraph.getModuleById("\0virtual:pdfn-tailwind-css");
      if (virtualMod) {
        vite.moduleGraph.invalidateModule(virtualMod);
        // Invalidate all modules that import the virtual module
        for (const importer of virtualMod.importers) {
          vite.moduleGraph.invalidateModule(importer);
        }
      }

      templates = await scanTemplates(absoluteTemplatesDir);
      broadcast({ type: "reload" });
      return;
    }

    // Log all code file changes (templates and components)
    if (isCodeFile(filePath)) {
      console.log(chalk.blue("  ↻"), fileName, chalk.dim("changed"));

      // Invalidate the changed module and its dependencies in Vite's SSR cache
      const mod = vite.moduleGraph.getModuleById(filePath);
      if (mod) {
        vite.moduleGraph.invalidateModule(mod);
      }

      // Also invalidate the virtual Tailwind CSS module to force recompilation
      const virtualMod = vite.moduleGraph.getModuleById("\0virtual:pdfn-tailwind-css");
      if (virtualMod) {
        vite.moduleGraph.invalidateModule(virtualMod);
        // Invalidate all modules that import the virtual module
        for (const importer of virtualMod.importers) {
          vite.moduleGraph.invalidateModule(importer);
        }
      }
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
      console.log(chalk.green("  +"), fileName, chalk.dim("added"));
    }
    // Send updated template list so sidebar can be refreshed
    broadcast({ type: "templates", templates: templates.map(t => ({ id: t.id, name: t.name, file: t.file })) });
  });

  watcher.on("unlink", async (filePath) => {
    if (!watcherReady) return;
    const oldCount = templates.length;
    const fileName = filePath.split("/").pop() || filePath;
    templates = await scanTemplates(absoluteTemplatesDir);
    // Only log if a template was actually removed (not components)
    if (templates.length < oldCount && isTemplateFile(filePath)) {
      console.log(chalk.red("  -"), fileName, chalk.dim("removed"));
    }
    // Send updated template list so sidebar can be refreshed
    broadcast({ type: "templates", templates: templates.map(t => ({ id: t.id, name: t.name, file: t.file })) });
  });

  // Serve preview UI
  app.get("/", (_req: Request, res: Response) => {
    const activeTemplate = templates[0]?.id ?? null;
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
    debugOptions: DebugOptions | false = false
  ): Promise<string> {
    const mod = await vite.ssrLoadModule(template.path);
    const Component = mod.default;
    const { render } = await vite.ssrLoadModule("@pdfn/react");
    // Use React.createElement so element.type === Component (preserves markers)
    // Empty props - component's default parameter values provide sample data
    return render(React.createElement(Component, {}), {
      debug: debugOptions || undefined,
    });
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
        template.file,
        chalk.dim("→ HTML"),
        chalk.cyan(`${duration}ms`)
      );

      res.setHeader("X-Render-Time", duration.toString());
      res.setHeader("X-Page-Count", pageCount.toString());
      // Note: Pagination time is measured client-side after Paged.js runs
      res.type("text/html").send(html);
    } catch (error) {
      console.log(chalk.red("  ✗"), template.file, chalk.red("render failed"));
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

      // Log PDF generation - first line: request summary
      const { metrics, warnings, assets } = result;
      console.log(
        chalk.green("  ✓"),
        template.file,
        chalk.dim("→ PDF •"),
        chalk.cyan(`${metrics.total}ms`),
        chalk.dim("•"),
        formatBytes(metrics.pdfSize)
      );

      // Second line: details (pages, assets, timing) - all separated by •
      const pageStr = `${metrics.pageCount} page${metrics.pageCount > 1 ? "s" : ""}`;
      const images = assets.filter((a) => a.type === "image");
      const fonts = assets.filter((a) => a.type === "font");
      const assetParts: string[] = [];
      if (images.length > 0) assetParts.push(`${images.length} image${images.length > 1 ? "s" : ""}`);
      if (fonts.length > 0) assetParts.push(`${fonts.length} font${fonts.length > 1 ? "s" : ""}`);
      const assetStr = assetParts.length > 0 ? assetParts.join(" • ") + " • " : "";
      const timingStr = `load ${metrics.contentLoad}ms • paginate ${metrics.pagedJs}ms • capture ${metrics.pdfCapture}ms`;
      console.log(chalk.dim(`    ${pageStr} • ${assetStr}${timingStr}`));

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
      console.log(chalk.red("  ✗"), template.file, chalk.red("PDF generation failed"));
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

      // Log PDF metrics - first line: request summary
      const { metrics, warnings, assets } = result;
      console.log(
        chalk.green("  ✓"),
        template.file,
        chalk.dim("→ PDF metrics •"),
        chalk.cyan(`${metrics.total}ms`),
        chalk.dim("•"),
        formatBytes(metrics.pdfSize)
      );

      // Second line: details (pages, assets, timing) - all separated by •
      {
        const pageStr = `${metrics.pageCount} page${metrics.pageCount > 1 ? "s" : ""}`;
        const images = assets.filter((a) => a.type === "image");
        const fonts = assets.filter((a) => a.type === "font");
        const assetParts: string[] = [];
        if (images.length > 0) assetParts.push(`${images.length} image${images.length > 1 ? "s" : ""}`);
        if (fonts.length > 0) assetParts.push(`${fonts.length} font${fonts.length > 1 ? "s" : ""}`);
        const assetStr = assetParts.length > 0 ? assetParts.join(" • ") + " • " : "";
        const timingStr = `load ${metrics.contentLoad}ms • paginate ${metrics.pagedJs}ms • capture ${metrics.pdfCapture}ms`;
        console.log(chalk.dim(`    ${pageStr} • ${assetStr}${timingStr}`));
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
      console.log(chalk.red("  ✗"), template.file, chalk.red("PDF metrics failed"));
      console.error(chalk.dim("   "), error);
      res.status(500).json({ error: `Error generating PDF: ${error}` });
    }
  });

  // Gotenberg-compatible API: Convert HTML to PDF
  // This allows generate() from @pdfn/react to work with pdfn dev
  const upload = multer({ storage: multer.memoryStorage() });

  app.post(
    "/forms/chromium/convert/html",
    upload.any(),
    async (req: Request, res: Response) => {
      try {
        // Extract HTML from multipart form
        const files = req.files as Express.Multer.File[] | undefined;
        const htmlFile = files?.find(
          (f) => f.originalname === "index.html" || f.fieldname === "files"
        );

        if (!htmlFile) {
          res.status(400).send("Missing index.html file");
          return;
        }

        const html = htmlFile.buffer.toString("utf-8");

        // Generate PDF using existing infrastructure
        const result = await browserManager.withPage(async (page) => {
          return generatePdf(page, html, { timeout: 30000 });
        });

        // Log the request
        const { metrics } = result;
        console.log(
          chalk.green("  ✓"),
          chalk.dim("API →"),
          "PDF",
          chalk.dim("•"),
          chalk.cyan(`${metrics.total}ms`),
          chalk.dim("•"),
          formatBytes(metrics.pdfSize),
          chalk.dim(`• ${metrics.pageCount} page${metrics.pageCount > 1 ? "s" : ""}`)
        );

        res.setHeader("Content-Type", "application/pdf");
        res.send(result.buffer);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(chalk.red("  ✗"), chalk.dim("API →"), chalk.red("PDF generation failed"));
        console.error(chalk.dim("   "), message);
        res.status(500).send(message);
      }
    }
  );

  // Start server
  await new Promise<void>((resolve, reject) => {
    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(chalk.red(`\n  ✗ Port ${port} is already in use.\n`));
        console.error(chalk.dim(`  Either stop the existing server or use a different port:`));
        console.error(chalk.dim(`  npx pdfn dev --port ${port + 1}\n`));
        process.exit(1);
      }
      reject(err);
    });
    server.listen(port, () => resolve());
  });

  // Pre-launch Chromium for PDF generation
  await browserManager.getBrowser();

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

  // Open Chromium (same browser used for PDF generation = true WYSIWYG)
  function openChromium() {
    const chromiumPath = puppeteer.executablePath();
    console.log(chalk.dim("  Opening in Chromium...\n"));
    spawn(chromiumPath, [`http://localhost:${port}`], {
      detached: true,
      stdio: "ignore",
    }).unref();
  }

  console.log(chalk.dim(`  Templates: ${displayPath} (${templateCount})`));
  console.log(chalk.green(`\n  ✓ Ready at ${chalk.cyan(`http://localhost:${port}`)}\n`));

  if (!open) {
    console.log(chalk.dim(`  Tip: PDFs are generated with Chromium. For accurate preview,`));
    console.log(chalk.dim(`       open in Chrome or Chromium-based browsers.\n`));
  }

  console.log(chalk.dim(`  Shortcuts`));
  console.log(chalk.dim(`  › ${chalk.white("o")} open in Chromium`));
  console.log(chalk.dim(`  › ${chalk.white("q")} quit\n`));

  if (open) {
    openChromium();
  }

  // Keyboard shortcuts
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (key: string) => {
      if (key === "o" || key === "O") {
        openChromium();
      } else if (key === "q" || key === "Q" || key === "\u0003") {
        // q or Ctrl+C
        shutdown();
      }
    });
  }
}

export const devCommand = new Command("dev")
  .description("Start development server with live preview")
  .option("--port <number>", "Server port (env: PDFN_PORT)", process.env.PDFN_PORT ?? "3456")
  .option("--open", "Open browser automatically")
  .option("--mode <mode>", "Environment mode (loads .env.[mode])", "development")
  .action(async (options) => {
    // Load environment variables based on mode (Vite pattern)
    loadEnv(options.mode);

    const port = parseInt(options.port, 10);

    await startDevServer({
      port,
      open: options.open ?? false,
      mode: options.mode,
    });
  });
