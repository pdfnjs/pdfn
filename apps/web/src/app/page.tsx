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

const features = [
  {
    title: "React Components",
    description: "Build PDFs with familiar React patterns. Props, mapping, conditionals.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: "Tailwind Support",
    description: "Style with Tailwind classes. JIT compilation built-in.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    title: "Pixel Perfect",
    description: "What you see in the browser is what you get in the PDF.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Multiple Sizes",
    description: "A4, Letter, Legal, Tabloid, A5, and custom dimensions.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
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
        if (text.includes("PDFN server is not running")) {
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
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-text-muted">pdf</span>
            <span className="text-primary">n</span>
          </span>
          <div className="flex items-center gap-6">
            <button onClick={scrollToDemo} className="text-text-secondary hover:text-text-primary transition-colors">
              Demo
            </button>
            <a href="https://github.com/pdfnjs/pdfn" target="_blank" rel="noopener noreferrer"
               className="text-text-secondary hover:text-text-primary transition-colors">
              GitHub
            </a>
            <a href="https://pdfn.dev/docs" target="_blank" rel="noopener noreferrer"
               className="text-text-secondary hover:text-text-primary transition-colors">
              Docs
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
            The React Framework<br />for PDFs
          </h1>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
            Build beautiful, pixel-perfect PDFs using React components and Tailwind CSS.
            What you see is what you ship.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <code className="bg-surface-1 border border-border rounded-lg px-5 py-3 text-lg font-mono text-text-primary">
              npm i @pdfn/react
            </code>
            <button
              onClick={scrollToDemo}
              className="bg-primary hover:bg-primary-hover text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              See it in action
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-surface-1">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-background border border-border rounded-xl p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
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
              If you know React, you already know PDFN
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
              <div className="px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-text-primary">
                  {activeTab === "preview" ? "Inspector" : "File"}
                </span>
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
                        Measured in browser. Times vary on server.
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

      {/* CTA */}
      <section className="py-20 px-6 bg-surface-1">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Ready to build better PDFs?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Get started in minutes
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <code className="bg-background border border-border rounded-lg px-5 py-3 font-mono text-text-primary">
              npx pdfn dev
            </code>
            <a
              href="https://pdfn.dev/docs/getting-started"
              className="bg-primary hover:bg-primary-hover text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Read the docs
            </a>
          </div>
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
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  );
}
