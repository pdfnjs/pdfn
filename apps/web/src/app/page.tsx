"use client";

import { useState, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
import { templateCode } from "@/lib/template-code";
import { Header, Footer, StylingBadge, getStylingLabel } from "@/components";
import { templates, type PageSize } from "@/config/templates";

// Page dimensions in points (72 dpi)
const PAGE_SIZES: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 595, height: 842 },
  A5: { width: 420, height: 595 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
  Tabloid: { width: 792, height: 1224 },
};

// Debug overlay options
interface DebugOptions {
  grid: boolean;
  margins: boolean;
  headers: boolean;
  breaks: boolean;
}

export default function Home() {
  const [activeTemplate, setActiveTemplate] = useState(templates[0]);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [debugOptions, setDebugOptions] = useState<DebugOptions>({
    grid: false,
    margins: false,
    headers: false,
    breaks: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    render: number | null;
    pagination: number | null;
    pages: number | null;
  }>({ render: null, pagination: null, pages: null });
  const [consoleExpanded, setConsoleExpanded] = useState(true);
  const [consoleMessages, setConsoleMessages] = useState<Array<{ type: "error" | "warning"; message: string }>>([]);
  const [zoomMode, setZoomMode] = useState<"fit" | "actual">("fit");
  const [previewDimensions, setPreviewDimensions] = useState({ width: 800, height: 500 });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Get code from build-time generated static data
  const activeCode = templateCode[activeTemplate.id] || "// Template code not found";

  // Check if any debug option is enabled
  const hasDebug = Object.values(debugOptions).some(v => v);

  // Listen for metrics from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "pdfn:metrics") {
        setMetrics(prev => ({
          ...prev,
          pagination: event.data.metrics.paginationTime ?? prev.pagination,
          pages: event.data.metrics.pages ?? prev.pages,
        }));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Scroll-triggered fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".fade-in-section").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  // Build debug query params
  const debugParams = hasDebug
    ? `&debug=${Object.entries(debugOptions)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(",")}`
    : "";

  // URLs with debug param when enabled
  const previewUrl = `/api/pdf?template=${activeTemplate.id}&html=true${debugParams}`;
  const pdfUrl = `/api/pdf?template=${activeTemplate.id}${debugParams}`;

  // FIXME: When DevTools panel is opened, the template rendered shrinks incorrectly
  // Measure preview container dimensions using ResizeObserver
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        // contentRect is the content box (already excludes padding)
        const { width, height } = entry.contentRect;
        setPreviewDimensions({
          width: Math.max(width, 300),
          height: Math.max(height, 300),
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [activeTab]);

  // Handle PDF download with error handling
  const handleDownload = async () => {
    setPdfError(null);
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        const text = await response.text();
        if (text.includes("API key")) {
          setPdfError("API key not configured");
        } else {
          setPdfError("PDF generation failed");
        }
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTemplate.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError("Cannot connect to server");
    }
  };

  // Handle template switch with fade transition
  const handleTemplateChange = (template: typeof templates[0]) => {
    if (template.id === activeTemplate.id) return;
    setIsLoading(true);
    setActiveTemplate(template);
    setPdfError(null);
    setMetrics({ render: null, pagination: null, pages: null });
    setActiveTab("preview");
    setZoomMode("fit");
  };

  // Handle iframe load - capture render time from response header
  const handleIframeLoad = async () => {
    setIsLoading(false);
    // Try to get render time from a HEAD request
    try {
      const response = await fetch(previewUrl, { method: "HEAD" });
      const renderTime = response.headers.get("X-Render-Time");
      if (renderTime) {
        setMetrics(prev => ({ ...prev, render: parseInt(renderTime, 10) }));
      }
    } catch {
      // Ignore errors
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="py-24 px-6 hero-glow overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-4 leading-tight animate-fade-in">
            Write PDF templates as React components.
          </h1>
          <h2 className="text-2xl md:text-3xl font-medium text-primary mb-8 animate-fade-in-delay-1">
            Ship consistent PDFs.
          </h2>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto animate-fade-in-delay-2">
            React-first, Chromium-based PDF generation with predictable pagination and Tailwind support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-2">
            <a
              href="#preview"
              className="bg-primary hover:bg-primary-hover text-black font-semibold px-6 py-3 rounded-lg transition-colors btn-glow"
            >
              Explore templates
            </a>
            <a
              href="#quickstart"
              className="bg-surface-1 border border-border hover:border-border-hover rounded-lg px-6 py-3 font-medium text-text-primary transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-6 bg-surface-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 fade-in-section">
            <h2 id="preview" className="text-3xl font-bold text-text-primary mb-4 scroll-mt-16">
              Write PDFs the same way you write React UIs
            </h2>
            <p className="text-xl text-text-secondary">
              Explore templates
            </p>
          </div>

          {/* Template Selector */}
          {/* Mobile: Full-width dropdown with info box */}
          <div className="md:hidden mb-6 space-y-2">
            <div className="relative">
              <select
                id="template-select"
                value={activeTemplate.id}
                onChange={(e) => {
                  const template = templates.find(t => t.id === e.target.value);
                  if (template) handleTemplateChange(template);
                }}
                className="w-full appearance-none bg-surface-1 border border-border rounded-lg px-4 py-3 pr-10 text-text-primary font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {/* Template info label */}
            <div className="text-xs text-text-muted text-center mt-1.5">
              {activeTemplate.pageSize} · {activeTemplate.orientation} · {getStylingLabel(activeTemplate.styling)}
            </div>
          </div>

          {/* Desktop: Button row */}
          <div className="hidden md:flex justify-center gap-2 mb-6">
            {templates.map((t) => {
              const isActive = activeTemplate.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-primary text-black"
                      : "bg-surface-1 text-text-secondary hover:text-text-primary hover:bg-surface-2"
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>

          {/* Main Content: Preview + Inspector */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Preview/Code Panel */}
            <div className="flex-1 bg-surface-1 border border-border rounded-xl min-w-0">
              {/* Tab Bar */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === "preview"
                        ? "bg-surface-2 text-text-primary"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab("code")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === "code"
                        ? "bg-surface-2 text-text-primary"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    Code
                  </button>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
                  <span className="font-mono">{activeTemplate.pageSize} · {activeTemplate.orientation}</span>
                  <span className="text-text-muted">·</span>
                  <StylingBadge styling={activeTemplate.styling} size="small" showTooltip />
                </div>
              </div>

              {/* Content Area */}
              <div className="relative h-[50vh] min-h-[360px] max-h-[500px] overflow-hidden rounded-b-xl">
                {/* Preview */}
                {activeTab === "preview" && (
                  <>
                    <div
                      ref={previewContainerRef}
                      className={`absolute inset-0 bg-zinc-200 dark:bg-zinc-800 ${
                        zoomMode === "actual"
                          ? "overflow-auto"
                          : "overflow-hidden flex items-center justify-center p-6"
                      }`}
                    >
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {(() => {
                        const maxWidth = previewDimensions.width;
                        const maxHeight = previewDimensions.height;
                        const PT_TO_PX = 96 / 72;
                        const size = PAGE_SIZES[activeTemplate.pageSize];
                        const pageW = (activeTemplate.orientation === 'landscape' ? size.height : size.width) * PT_TO_PX;
                        const pageH = (activeTemplate.orientation === 'landscape' ? size.width : size.height) * PT_TO_PX;
                        const fitScale = Math.min(maxWidth / pageW, maxHeight / pageH);
                        const scale = zoomMode === "actual" ? 1 : fitScale;
                        const displayW = pageW * scale;
                        const displayH = pageH * scale;

                        return (
                          <div
                            className={`bg-white rounded shadow-2xl overflow-hidden flex-shrink-0 transition-opacity duration-200 ${
                              zoomMode === "actual" ? "m-6" : ""
                            }`}
                            style={{ width: displayW, height: displayH, opacity: isLoading ? 0.4 : 1 }}
                          >
                            <iframe
                              ref={iframeRef}
                              key={`${activeTemplate.id}-${debugParams}-${zoomMode}`}
                              src={previewUrl}
                              title="Preview"
                              style={{
                                width: pageW,
                                height: pageH,
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                                border: 'none',
                              }}
                              onLoad={handleIframeLoad}
                            />
                          </div>
                        );
                      })()}
                    </div>
                    {/* Zoom controls */}
                    <div className="absolute bottom-3 right-3 flex items-center bg-black/60 rounded-md p-0.5">
                      <button
                        onClick={() => setZoomMode("fit")}
                        className={`w-10 py-1 text-[10px] font-medium rounded transition-colors ${
                          zoomMode === "fit"
                            ? "bg-white/20 text-white"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        Fit
                      </button>
                      <button
                        onClick={() => setZoomMode("actual")}
                        className={`w-10 py-1 text-[10px] font-medium rounded transition-colors ${
                          zoomMode === "actual"
                            ? "bg-white/20 text-white"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        100%
                      </button>
                    </div>
                  </>
                )}

                {/* Code */}
                {activeTab === "code" && (
                  <div className="absolute inset-0 overflow-auto select-text">
                    <SyntaxHighlighter
                      language="tsx"
                      style={nightOwl}
                      customStyle={{
                        margin: 0,
                        padding: "1.25rem",
                        background: "var(--surface-1)",
                        fontSize: "0.875rem",
                        lineHeight: "1.6",
                        minHeight: "100%",
                      }}
                      codeTagProps={{
                        style: { fontFamily: "var(--font-geist-mono), ui-monospace, monospace" },
                      }}
                    >
                      {activeCode}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>

              {/* Mobile Controls - Only visible on small screens */}
              <div className="lg:hidden px-4 py-3 border-t border-border">
                {activeTab === "preview" ? (
                  <div className="flex items-center justify-between">
                    {/* Debug toggles */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">Debug:</span>
                      <div className="flex gap-1">
                        {[
                          { key: "grid", label: "Grid" },
                          { key: "margins", label: "Margins" },
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => setDebugOptions(prev => ({ ...prev, [key]: !prev[key as keyof DebugOptions] }))}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              debugOptions[key as keyof DebugOptions]
                                ? "bg-primary/20 text-primary"
                                : "bg-surface-2 text-text-muted hover:text-text-secondary"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted font-mono">{activeTemplate.id}.tsx</span>
                      <StylingBadge styling={activeTemplate.styling} size="small" />
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Inspector Panel - Hidden on mobile */}
            <div className="hidden lg:flex w-52 bg-surface-1 border border-border rounded-xl overflow-hidden flex-col">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">
                  {activeTab === "preview" ? "Inspector" : "File"}
                </span>
                <span className="text-[10px] text-text-muted bg-surface-2 px-1.5 py-0.5 rounded">Dev tools</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {activeTab === "preview" ? (
                  <>
                    {/* Performance Section */}
                    <div>
                      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                        Performance
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-text-secondary">Render</span>
                          <span className="text-xs font-mono text-text-primary">
                            {metrics.render !== null ? `${metrics.render}ms` : "--"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-text-secondary">Pagination</span>
                          <span className="text-xs font-mono text-text-primary">
                            {metrics.pagination !== null ? `${metrics.pagination}ms` : "--"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-text-secondary">Pages</span>
                          <span className="text-xs font-mono text-text-primary">
                            {metrics.pages !== null ? metrics.pages : "--"}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-text-muted italic mt-2">
                        Measured in browser preview. Times vary in production.
                      </div>
                    </div>

                    {/* Debug Section */}
                    <div>
                      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                        Debug
                      </div>
                      <div className="space-y-2">
                        {[
                          { key: "grid", label: "Grid (1cm)" },
                          { key: "margins", label: "Margins" },
                          { key: "headers", label: "Headers/Footers" },
                          { key: "breaks", label: "Page numbers" },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={debugOptions[key as keyof DebugOptions]}
                              onChange={(e) =>
                                setDebugOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                              }
                              className="w-3.5 h-3.5 rounded border-border bg-surface-2 text-primary focus:ring-primary focus:ring-offset-0"
                            />
                            <span className="text-xs text-text-secondary">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div>
                      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                        Actions
                      </div>
                      <div className="space-y-2">
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open in new tab
                        </a>
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View PDF
                        </a>
                      </div>
                    </div>

                    {/* Console Section */}
                    <div>
                      <button
                        onClick={() => setConsoleExpanded(!consoleExpanded)}
                        className="flex items-center justify-between w-full text-xs font-medium text-text-muted uppercase tracking-wider mb-3"
                      >
                        <span>Console</span>
                        <svg
                          className={`w-3.5 h-3.5 transition-transform ${consoleExpanded ? "" : "-rotate-90"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {consoleExpanded && (
                        <div className="text-xs">
                          {consoleMessages.length === 0 ? (
                            <div className="flex items-center gap-2 text-text-muted">
                              <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              No issues
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {consoleMessages.map((msg, i) => (
                                <div
                                  key={i}
                                  className={`flex items-start gap-2 ${
                                    msg.type === "error" ? "text-error" : "text-warning"
                                  }`}
                                >
                                  <span className="flex-shrink-0">{msg.type === "error" ? "✗" : "⚠"}</span>
                                  <span className="break-all">{msg.message}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Disclaimer */}
                    <div className="pt-4 mt-auto border-t border-border">
                      <p className="text-[10px] text-text-muted italic">
                        Inspector is local-only and not included in production output.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Code mode: File info */}
                    <div>
                      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                        File
                      </div>
                      <div className="text-xs font-mono text-text-primary bg-surface-2 px-2 py-1.5 rounded">
                        {activeTemplate.id}.tsx
                      </div>
                    </div>

                    {/* Styling Section */}
                    <div>
                      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                        Styling
                      </div>
                      <StylingBadge styling={activeTemplate.styling} />
                    </div>

                    {/* Actions Section */}
                    <div>
                      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                        Actions
                      </div>
                      <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-medium bg-primary hover:bg-primary-hover text-black px-3 py-2 rounded-md transition-colors"
                      >
                        {copied ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Code
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CTA Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <a
              href="#quickstart"
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-black font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Get Started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-surface-1 border border-border hover:border-border-hover text-text-primary font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
          </div>
          {pdfError && (
            <div className="text-sm text-error text-center mt-2">{pdfError}</div>
          )}
          <p className="text-xs text-text-muted text-center mt-4 italic">
            Demo uses pre-generated PDFs rendered locally.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 fade-in-section">
            <h2 id="how-it-works" className="text-3xl font-bold text-text-primary mb-4 scroll-mt-16">
              How it works
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Write React → render to print-ready HTML → generate PDF via headless Chromium.<br />
              Same input, same output, every time.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 fade-in-section">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <div className="font-medium text-text-primary mb-1">Write React</div>
              <div className="text-sm text-text-muted">Components + Tailwind</div>
            </div>
            {/* Arrow */}
            <div className="hidden md:block text-text-muted">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="md:hidden text-text-muted">
              <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <div className="font-medium text-text-primary mb-1">Preview live</div>
              <div className="text-sm text-text-muted">Dev server with hot reload</div>
            </div>
            {/* Arrow */}
            <div className="hidden md:block text-text-muted">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="md:hidden text-text-muted">
              <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <div className="font-medium text-text-primary mb-1">Print to PDF</div>
              <div className="text-sm text-text-muted">Chromium prints the final document</div>
            </div>
          </div>
          <p className="text-sm text-text-muted text-center mt-12">
            pdfn waits for layout to stabilize before capturing — what you preview is what you get.
          </p>
        </div>
      </section>

      {/* Why pdfn */}
      <section className="py-20 px-6 bg-surface-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 fade-in-section">
            <h2 id="why-pdfn" className="text-3xl font-bold text-text-primary mb-4 scroll-mt-16">
              Why pdfn instead of Puppeteer scripts?
            </h2>
            <p className="text-xl text-text-secondary">
              Same Chromium engine, but with pagination primitives built in
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 fade-in-section">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-text-primary mb-1">React and Tailwind</div>
                <div className="text-sm text-text-muted">Write PDFs like you write web UIs. No new syntax to learn</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-text-primary mb-1">Predictable pagination helpers</div>
                <div className="text-sm text-text-muted">Table headers, keep-together, page breaks, running headers/footers</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-text-primary mb-1">What you see is what you get</div>
                <div className="text-sm text-text-muted">Preview matches output. No surprises in PDF</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-text-primary mb-1">Headless-friendly</div>
                <div className="text-sm text-text-muted">Works with Puppeteer, Playwright, Browserless, or your own setup</div>
              </div>
            </div>
          </div>
          <p className="text-sm text-text-muted text-center mt-10 fade-in-section">
            pdfn controls where pages break. Chromium renders the rest.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center fade-in-section">
          <h2 id="quickstart" className="text-3xl font-bold text-text-primary mb-4 scroll-mt-16">
            Get started in seconds
          </h2>
          <p className="text-xl text-text-secondary mb-12">
            Add to any React or Next.js project
          </p>
          <div className="flex flex-col gap-3 max-w-md mx-auto font-mono text-left">
            {[
              { cmd: "npm i @pdfn/react", label: "Install the library" },
              { cmd: "npx pdfn add invoice", label: "Add a starter template" },
              { cmd: "npx pdfn dev --open", label: "Start the preview server" },
            ].map(({ cmd, label }) => (
              <div key={cmd} className="flex flex-col gap-1">
                <span className="text-xs text-text-muted font-sans pl-1">{label}</span>
                <div
                  onClick={() => handleCopyCommand(cmd)}
                  className="bg-background border border-border hover:border-border-hover rounded-lg px-4 py-2.5 flex items-center justify-between group transition-colors text-left cursor-pointer select-text"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-text-muted select-none">$</span>
                    <span className="text-text-primary">{cmd}</span>
                  </span>
                {copiedCommand === cmd ? (
                  <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-surface-1">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 fade-in-section">
            <h2 id="features" className="text-3xl font-bold text-text-primary mb-4 scroll-mt-16">
              Built for developers
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-3">
              Library + Dev Server + Your Production Setup
            </p>
            <p className="text-sm text-text-muted max-w-xl mx-auto mb-2">
              pdfn prepares HTML for clean page breaks. Chromium handles layout and printing.
            </p>
            <p className="text-xs text-text-muted max-w-xl mx-auto">
              Designed to run entirely on your infrastructure.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in-section">
            {/* Library */}
            <div className="bg-background border border-border rounded-xl p-6 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-text-primary">@pdfn/react</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">library</span>
              </div>
              <p className="text-sm text-text-muted mb-4">Pure React components. No CLI required.</p>
              <ul className="space-y-2.5 text-text-secondary text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>TypeScript + Tailwind</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>8 page sizes + custom</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Headers, footers, watermarks</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="inline-flex items-center gap-1">
                    Edge runtime compatible
                    <span className="group relative">
                      <svg className="w-3.5 h-3.5 text-text-muted cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/90 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        HTML rendering only. PDF generation requires server.
                      </span>
                    </span>
                  </span>
                </li>
              </ul>
            </div>
            {/* Dev Server */}
            <div className="bg-background border border-border rounded-xl p-6 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-text-primary">pdfn dev</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">CLI</span>
              </div>
              <p className="text-sm text-text-muted mb-4">Local development with live preview.</p>
              <ul className="space-y-2.5 text-text-secondary text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Hot reload on save</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>One-click PDF download</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Debug overlays</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>PDF generation + performance metrics</span>
                </li>
              </ul>
            </div>
            {/* Production */}
            <div className="bg-background border border-border rounded-xl p-6 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-text-primary">Production</h3>
                <span className="text-xs bg-surface-2 text-text-muted px-2 py-0.5 rounded">flexible</span>
              </div>
              <p className="text-sm text-text-muted mb-4">Use any headless Chromium. Your infrastructure, your choice.</p>
              <ul className="space-y-2.5 text-text-secondary text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Puppeteer / Playwright</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Browserless, Gotenberg</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Docker, AWS Lambda</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Is pdfn Right for You? */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 fade-in-section">
            <h2 id="is-pdfn-right-for-you" className="text-3xl font-bold text-text-primary mb-4 scroll-mt-16">
              Is pdfn Right for You?
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              pdfn is a good fit if you need layout-correct, repeatable PDFs from React components.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in-section">
            {/* Requires Chromium */}
            <div className="bg-background border border-border rounded-xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary">Requires Chromium</h3>
              </div>
              <p className="text-sm text-text-secondary">
                PDF generation uses headless Chromium.
              </p>
            </div>
            {/* Not a publishing engine */}
            <div className="bg-background border border-border rounded-xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary">Not a publishing engine</h3>
              </div>
              <p className="text-sm text-text-secondary">
                Not designed for books or typographically complex publishing.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <h3 className="text-sm font-medium text-text-secondary mb-4">Different tools, different jobs</h3>
            <div className="text-sm text-text-muted flex flex-col gap-1">
              <p>Need client-side PDF generation? <span className="text-text-secondary">@react-pdf/renderer</span></p>
              <p>Generating 100k+ PDFs/hour? <span className="text-text-secondary">PDFKit</span></p>
              <p>Need to fill existing PDFs? <span className="text-text-secondary">pdf-lib</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 px-6 bg-surface-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 fade-in-section">
            <h2 id="roadmap" className="text-3xl font-bold text-text-primary mb-4 scroll-mt-16">
              What&apos;s next
            </h2>
            <p className="text-xl text-text-secondary">
              Prioritized based on real-world document needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 fade-in-section">
            <div className="bg-surface-1 border border-border rounded-lg p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text-primary">Table primitives</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-error/10 text-error">High</span>
              </div>
              <p className="text-sm text-text-muted">Column definitions, row keep-together, auto sizing</p>
            </div>

            <div className="bg-surface-1 border border-border rounded-lg p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text-primary">Font subsetting</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-error/10 text-error">High</span>
              </div>
              <p className="text-sm text-text-muted">Smaller PDFs by stripping unused glyphs</p>
            </div>

            <div className="bg-surface-1 border border-border rounded-lg p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text-primary">Orphans &amp; widows</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-error/10 text-error">High</span>
              </div>
              <p className="text-sm text-text-muted">Prevent single lines at page boundaries</p>
            </div>

            <div className="bg-surface-1 border border-border rounded-lg p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text-primary">Table of Contents</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning">Medium</span>
              </div>
              <p className="text-sm text-text-muted">Auto-generated with page number resolution</p>
            </div>

            <div className="bg-surface-1 border border-border rounded-lg p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text-primary">Footnotes</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning">Medium</span>
              </div>
              <p className="text-sm text-text-muted">Page-local references for legal/academic docs</p>
            </div>

            <div className="bg-surface-1 border border-border rounded-lg p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text-primary">Internal anchors</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning">Medium</span>
              </div>
              <p className="text-sm text-text-muted">Cross-page references (&quot;See page X&quot;)</p>
            </div>

            <div className="bg-surface-1 border border-border rounded-lg p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text-primary">Image optimization</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-2 text-text-muted">Low</span>
              </div>
              <p className="text-sm text-text-muted">Auto-compress before embedding</p>
            </div>

            <div className="bg-surface-1 border border-border rounded-lg p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text-primary">PDF/A support</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-2 text-text-muted">Low</span>
              </div>
              <p className="text-sm text-text-muted">Archival compliance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 bg-surface-2">
        <div className="max-w-2xl mx-auto text-center fade-in-section">
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            Ready to build better PDFs?
          </h2>
          <p className="text-text-secondary mb-8">
            Join the developers using React and Tailwind to ship predictable, paginated PDFs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/pdfnjs/pdfn#quick-start"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-lg transition-colors btn-glow"
            >
              Get started
            </a>
            <a
              href="https://github.com/pdfnjs/pdfn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
