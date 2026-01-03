"use client";

import { useState, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
import { templateCode } from "@/lib/template-code";

// Page dimensions in points (72 dpi)
const PAGE_SIZES = {
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

const templates = [
  {
    id: "invoice",
    name: "Invoice",
    pageSize: "A4" as keyof typeof PAGE_SIZES,
    orientation: "portrait" as const,
  },
  {
    id: "letter",
    name: "Business Letter",
    pageSize: "Letter" as keyof typeof PAGE_SIZES,
    orientation: "portrait" as const,
  },
  {
    id: "contract",
    name: "Contract",
    pageSize: "Legal" as keyof typeof PAGE_SIZES,
    orientation: "portrait" as const,
  },
  {
    id: "ticket",
    name: "Ticket",
    pageSize: "A5" as keyof typeof PAGE_SIZES,
    orientation: "portrait" as const,
  },
  {
    id: "poster",
    name: "Poster",
    pageSize: "Tabloid" as keyof typeof PAGE_SIZES,
    orientation: "landscape" as const,
  },
];

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
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    render: number | null;
    pagination: number | null;
    pages: number | null;
  }>({ render: null, pagination: null, pages: null });
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  // Handle PDF download with error handling
  const handleDownload = async () => {
    setPdfError(null);
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        const text = await response.text();
        if (text.includes("pdfn server is not running")) {
          setPdfError("Start the server: npx pdfn serve");
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
    setActiveTab("preview"); // Reset to preview on template change
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

  const scrollToDemo = () => {
    const demo = document.getElementById("demo");
    if (demo) {
      // Demo section has py-20 (80px) top padding before the title
      // We want the title to appear ~32px from viewport top
      const sectionPadding = 80; // py-20
      const viewportOffset = 32; // desired space from viewport top
      const top = demo.offsetTop + sectionPadding - viewportOffset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-text-muted">pdf</span>
            <span className="text-primary">n</span>
          </span>
          <nav className="flex items-center gap-6">
            <a href="/components" className="text-text-secondary hover:text-text-primary transition-colors">
              Components
            </a>
            <a href="/templates" className="text-text-secondary hover:text-text-primary transition-colors">
              Templates
            </a>
            <a href="/docs" className="text-text-secondary hover:text-text-primary transition-colors">
              Docs
            </a>
            <div className="w-px h-5 bg-border" />
            <a href="https://github.com/pdfnjs/pdfn" target="_blank" rel="noopener noreferrer"
               className="text-text-secondary hover:text-text-primary transition-colors"
               aria-label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
              </svg>
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
            The React Framework<br />for PDFs
          </h1>
          <p className="text-xl text-text-secondary mb-4 max-w-2xl mx-auto">
            PDF generation with React and Tailwind. Preview locally. Generate the same output everywhere.
          </p>
          <p className="text-sm text-text-muted mb-10 max-w-2xl mx-auto">
            React → print-ready HTML → Headless Chromium (layout + pagination) → PDF
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToDemo}
              className="bg-primary hover:bg-primary-hover text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Try live demo
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText("npm i @pdfn/react");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="group bg-surface-1 border border-border hover:border-border-hover rounded-lg px-5 py-3 text-lg font-mono text-text-primary flex items-center gap-3 transition-colors"
            >
              <span>npm i @pdfn/react</span>
              <span className="text-text-muted group-hover:text-text-secondary transition-colors">
                {copied ? (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Simple, familiar API
            </h2>
            <p className="text-xl text-text-secondary">
              If you know React, you already know pdfn
            </p>
          </div>

          {/* Template Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {templates.map((t) => {
              const isActive = activeTemplate.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-border-hover bg-transparent"
                  }`}
                >
                  <span className={`font-medium ${isActive ? "text-text-primary" : "text-text-secondary"}`}>
                    {t.name}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    isActive ? "bg-primary/20 text-primary" : "bg-surface-2 text-text-muted"
                  }`}>
                    {t.pageSize}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Content: Preview + Inspector */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Preview/Code Panel */}
            <div className="flex-1 bg-surface-1 border border-border rounded-xl overflow-hidden min-w-0">
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
                <div className="text-xs text-text-muted font-mono">
                  {activeTemplate.pageSize} · {activeTemplate.orientation}
                </div>
              </div>

              {/* Content Area */}
              <div className="relative h-[600px]">
                {/* Preview */}
                {activeTab === "preview" && (
                  <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 p-6 flex items-center justify-center">
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {(() => {
                      const maxWidth = 800; // Wide enough for landscape pages
                      const maxHeight = 552; // 600 - 48px padding
                      const PT_TO_PX = 96 / 72;
                      const size = PAGE_SIZES[activeTemplate.pageSize];
                      const pageW = (activeTemplate.orientation === 'landscape' ? size.height : size.width) * PT_TO_PX;
                      const pageH = (activeTemplate.orientation === 'landscape' ? size.width : size.height) * PT_TO_PX;
                      const scale = Math.min(maxWidth / pageW, maxHeight / pageH);
                      const displayW = pageW * scale;
                      const displayH = pageH * scale;
                      const scalePercent = Math.round(scale * 100);

                      return (
                        <>
                          <div
                            className="bg-white rounded shadow-2xl overflow-hidden flex-shrink-0 transition-opacity duration-200"
                            style={{ width: displayW, height: displayH, opacity: isLoading ? 0.4 : 1 }}
                          >
                            <iframe
                              ref={iframeRef}
                              key={`${activeTemplate.id}-${debugParams}`}
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
                          {/* Scale indicator - positioned on container, not PDF */}
                          <div className="absolute bottom-3 right-3 bg-black/50 text-white/80 text-[10px] px-1.5 py-0.5 rounded font-mono">
                            {scalePercent}%
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Code */}
                {activeTab === "code" && (
                  <div className="absolute inset-0 overflow-auto">
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
              <div className="lg:hidden px-4 py-3 border-t border-border flex items-center justify-between">
                {activeTab === "preview" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">Debug:</span>
                      {["grid", "margins"].map((key) => (
                        <button
                          key={key}
                          onClick={() => setDebugOptions(prev => ({ ...prev, [key]: !prev[key as keyof DebugOptions] }))}
                          className={`text-xs px-2 py-1 rounded ${
                            debugOptions[key as keyof DebugOptions]
                              ? "bg-primary/20 text-primary"
                              : "bg-surface-2 text-text-muted"
                          }`}
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 text-xs font-medium bg-primary hover:bg-primary-hover text-black px-3 py-1.5 rounded-md transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-text-muted font-mono">{activeTemplate.id}.tsx</span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs font-medium bg-primary hover:bg-primary-hover text-black px-3 py-1.5 rounded-md transition-colors"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </>
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
                        <button
                          onClick={handleDownload}
                          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium bg-primary hover:bg-primary-hover text-black px-3 py-2 rounded-md transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download PDF
                        </button>
                        {pdfError && (
                          <div className="text-xs text-red-500 mt-1">{pdfError}</div>
                        )}
                      </div>
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
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-surface-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              How it works
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Write React → render to print-ready HTML → generate PDF via headless Chromium.<br />
              Same input, same output, every time.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
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
              <div className="font-medium text-text-primary mb-1">Generate PDF</div>
              <div className="text-sm text-text-muted">Headless Chromium (layout + pagination)</div>
            </div>
          </div>
          <p className="text-sm text-text-muted text-center mt-8">
            pdfn waits for layout and pagination to stabilize before generating the PDF.
          </p>
        </div>
      </section>

      {/* Why pdfn */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Why pdfn?
            </h2>
            <p className="text-xl text-text-secondary">
              Stop fighting your PDF toolchain
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                <div className="font-medium text-text-primary mb-1">Pagination that just works</div>
                <div className="text-sm text-text-muted">Tables with repeating headers, page breaks, keep-together blocks</div>
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
                <div className="text-sm text-text-muted">Preview matches output. No @media print surprises</div>
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
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 px-6 bg-surface-1">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Get started in seconds
          </h2>
          <p className="text-xl text-text-secondary mb-10">
            Three commands to your first PDF
          </p>
          <div className="flex flex-col gap-3 max-w-md mx-auto font-mono text-left">
            <div className="bg-background border border-border rounded-lg px-5 py-3 flex items-center justify-between group">
              <span className="text-text-primary">npm i @pdfn/react</span>
              <span className="text-text-muted text-sm"># Install</span>
            </div>
            <div className="bg-background border border-border rounded-lg px-5 py-3 flex items-center justify-between group">
              <span className="text-text-primary">npx pdfn add invoice</span>
              <span className="text-text-muted text-sm"># Add template</span>
            </div>
            <div className="bg-background border border-border rounded-lg px-5 py-3 flex items-center justify-between group">
              <span className="text-text-primary">npx pdfn dev</span>
              <span className="text-text-muted text-sm"># Start dev server</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Built for developers
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-3">
              Library + Dev Server + Your Production Setup
            </p>
            <p className="text-sm text-text-muted max-w-xl mx-auto mb-2">
              pdfn generates HTML. You choose how to render it to PDF.
            </p>
            <p className="text-xs text-text-muted max-w-xl mx-auto">
              There is no required runtime, service, or hosted component.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Library */}
            <div className="bg-background border border-border rounded-xl p-6">
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
                  <span>Headers, footers, watermarks, and more</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Automatic pagination</span>
                </li>
              </ul>
            </div>
            {/* Dev Server */}
            <div className="bg-background border border-border rounded-xl p-6">
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
            <div className="bg-background border border-border rounded-xl p-6">
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

      {/* Tradeoffs */}
      <section className="py-20 px-6 bg-surface-1">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Tradeoffs
            </h2>
            <p className="text-xl text-text-secondary">
              The cost of full CSS support
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chromium dependency */}
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary">Chromium dependency</h3>
              </div>
              <p className="text-sm text-text-secondary">
                PDF generation requires headless Chrome. For serverless, use @sparticuz/chromium or services like Browserless.
              </p>
            </div>
            {/* File size */}
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary">File size</h3>
              </div>
              <p className="text-sm text-text-secondary">
                Fonts are fully embedded, images are base64-encoded. Pre-compress assets for smaller PDFs.
              </p>
            </div>
          </div>
          <p className="text-sm text-text-muted text-center mt-8">
            No server? Try <span className="text-text-secondary">@react-pdf/renderer</span>. Generating 100k+ PDFs/hour? Consider <span className="text-text-secondary">PDFKit</span>.
          </p>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              What&apos;s next
            </h2>
            <p className="text-xl text-text-secondary">
              Actively working on these
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-surface-1 border border-border rounded-lg p-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <span className="text-text-primary font-medium">Font subsetting</span>
                <p className="text-sm text-text-muted">Smaller PDFs by stripping unused glyphs</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-surface-1 border border-border rounded-lg p-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <span className="text-text-primary font-medium">Image optimization</span>
                <p className="text-sm text-text-muted">Auto-compress images before embedding</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-surface-1 border border-border rounded-lg p-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <span className="text-text-primary font-medium">PDF/A support</span>
                <p className="text-sm text-text-muted">Archival compliance via post-processing</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-surface-1 border border-border rounded-lg p-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <span className="text-text-primary font-medium">More templates</span>
                <p className="text-sm text-text-muted">Complex tables, reports, certificates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OSS Credibility */}
      <section className="py-16 px-6 bg-surface-1">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 mb-4">
            <svg className="w-4 h-4 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
            </svg>
            <span className="text-sm text-text-secondary">Open Source</span>
            <span className="text-xs bg-surface-2 text-text-muted px-2 py-0.5 rounded">MIT</span>
          </div>
          <p className="text-text-muted">
            Designed to be self-hosted.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-text-muted">
          <span>
            <span className="text-text-secondary">pdf</span>
            <span className="text-primary">n</span>
            {" "}— The React Framework for PDFs
          </span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/pdfnjs/pdfn" target="_blank" rel="noopener noreferrer"
               className="hover:text-text-secondary transition-colors">
              GitHub
            </a>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
