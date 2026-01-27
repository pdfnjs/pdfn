"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
import { templateCode } from "@/lib/template-code";
import { Header, Footer } from "@/components";

// Page dimensions in points (72 dpi)
const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  A5: { width: 420, height: 595 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
  Tabloid: { width: 792, height: 1224 },
};

type Orientation = "portrait" | "landscape";

// Templates ordered by user priority:
// 1. Invoice - most common PDF use case
// 2. Report - shows charts/data visualization (Recharts)
// 3. Contract - legal documents are high-value
// 4. Letter - simple business correspondence
// 5. Ticket - shows flexibility for different formats
const homepageTemplates: Array<{
  id: string;
  name: string;
  pageSize: keyof typeof PAGE_SIZES;
  orientation: Orientation;
}> = [
  { id: "invoice", name: "invoice.tsx", pageSize: "A4", orientation: "portrait" },
  { id: "report", name: "report.tsx", pageSize: "A4", orientation: "portrait" },
  { id: "contract", name: "contract.tsx", pageSize: "Legal", orientation: "portrait" },
  { id: "letter", name: "letter.tsx", pageSize: "Letter", orientation: "portrait" },
  { id: "ticket", name: "ticket.tsx", pageSize: "A5", orientation: "portrait" },
];

// Copy button component
function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-md transition-all ${copied ? "text-green-400" : "text-text-muted hover:text-text-primary hover:bg-surface-2"} ${className}`}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

// Terminal command component - minimal style
function TerminalCommand({ command, className = "" }: { command: string; className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-border bg-surface-1 font-mono text-sm ${className}`}>
      <div>
        <span className="text-text-muted">$</span>{" "}
        <span className="text-text-primary">{command}</span>
      </div>
      <CopyButton text={command} />
    </div>
  );
}

// TSX file icon component (similar to Resend's TS icon)
function TsxIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" fillOpacity="0.25" />
      {/* T */}
      <path
        d="M7.5 11.5H10.5M9 11.5V15.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* S */}
      <path
        d="M14 12C14 11.4477 14.4477 11 15 11H15.5C16.0523 11 16.5 11.4477 16.5 12C16.5 12.5523 16.0523 13 15.5 13H15C14.4477 13 14 13.4477 14 14C14 14.5523 14.4477 15 15 15H15.5C16.0523 15 16.5 14.5523 16.5 14"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  const [activeTemplate, setActiveTemplate] = useState(homepageTemplates[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewDimensions, setPreviewDimensions] = useState({ width: 400, height: 500 });
  const [previewZoom, setPreviewZoom] = useState<"fit" | "100">("fit");
  const [mobileView, setMobileView] = useState<"code" | "preview">("preview");
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const activeCode = templateCode[activeTemplate.id] || "// Template code not found";
  const previewUrl = `/api/pdf?template=${activeTemplate.id}&html=true`;

  // Measure preview container
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setPreviewDimensions({
          width: Math.max(width - 32, 200),
          height: Math.max(height - 32, 300),
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Scroll-triggered fade-in
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

  const handleTemplateChange = (template: typeof homepageTemplates[0]) => {
    if (template.id === activeTemplate.id) return;
    setIsLoading(true);
    setActiveTemplate(template);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Calculate preview dimensions
  const PT_TO_PX = 96 / 72;
  const size = PAGE_SIZES[activeTemplate.pageSize];
  const pageW = (activeTemplate.orientation === "landscape" ? size.height : size.width) * PT_TO_PX;
  const pageH = (activeTemplate.orientation === "landscape" ? size.width : size.height) * PT_TO_PX;
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-1 border border-border text-sm text-text-secondary mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            MIT licensed
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-[1.1] tracking-tight animate-fade-in">
            Reliable PDFs for{" "}
            <span className="text-primary">Next.js</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-fade-in-delay-1">
            Build invoices, contracts, and reports with React components.
            <br className="hidden sm:block" />
            Predictable output, every time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-2">
            <a
              href="https://pdfn.dev/docs/quickstart"
              className="group flex items-center gap-2 bg-primary hover:bg-primary-hover text-black font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]"
            >
              Get started
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="https://pdfn.dev/docs"
              className="flex items-center gap-2 bg-surface-1 border border-border hover:border-border-hover rounded-xl px-6 py-3 font-medium text-text-primary transition-all hover:bg-surface-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Documentation
            </a>
          </div>

          <p className="text-sm text-text-muted mt-8 animate-fade-in-delay-2">
            <a
              href="https://github.com/pdfnjs/pdfn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors underline underline-offset-4"
            >
              Star us on GitHub
            </a>
          </p>
        </div>
      </section>

      {/* How it works - Code + Preview */}
      <section className="py-20 md:py-28 px-6 bg-surface-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 fade-in-section">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Write React. Generate PDFs.
            </h2>
            <p className="text-lg text-text-secondary max-w-xl mx-auto">
              Build templates with built-in page numbers, headers, footers, and smart breaks.
            </p>
          </div>

          {/* Resend-style unified preview container */}
          <div className="rounded-2xl border border-border overflow-hidden fade-in-section">
            {/* Header with traffic lights */}
            <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-surface-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
              </div>
              <CopyButton text={activeCode} />
            </header>

            {/* Main content area */}
            <div className="flex flex-col md:flex-row">
              {/* Template sidebar - vertical on desktop, horizontal on mobile */}
              <aside className="flex-shrink-0 w-full md:w-[200px] overflow-auto border-b md:border-b-0 md:border-r border-border px-2 py-2.5 bg-surface-1/50">
                <div className="flex gap-1 md:flex-col" role="tablist">
                  {homepageTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateChange(t)}
                      role="tab"
                      aria-selected={activeTemplate.id === t.id}
                      className={`flex items-center gap-1.5 h-8 pl-1 pr-2 rounded-md text-sm transition-colors ${
                        activeTemplate.id === t.id
                          ? "text-primary"
                          : "text-text-muted hover:text-text-primary hover:bg-surface-2"
                      }`}
                    >
                      <TsxIcon className="w-6 h-6 flex-shrink-0" />
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </aside>

              {/* Code + Preview panels */}
              <div className="flex-1 flex flex-col lg:flex-row min-w-0">
                {/* Mobile view toggle */}
                <div className="md:hidden flex border-b border-border bg-surface-1">
                  <button
                    onClick={() => setMobileView("code")}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                      mobileView === "code"
                        ? "text-primary border-b-2 border-primary"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    Code
                  </button>
                  <button
                    onClick={() => setMobileView("preview")}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                      mobileView === "preview"
                        ? "text-primary border-b-2 border-primary"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    Preview
                  </button>
                </div>

                {/* Code Panel - visible on desktop, or mobile when code tab selected */}
                <div className={`flex-1 min-w-0 border-b lg:border-b-0 lg:border-r border-border bg-[#0d1117] ${
                  mobileView === "code" ? "block" : "hidden md:block"
                }`}>
                  <div className="h-[400px] md:h-[500px] overflow-auto">
                    <SyntaxHighlighter
                      language="tsx"
                      style={nightOwl}
                      showLineNumbers
                      customStyle={{
                        margin: 0,
                        padding: "1rem",
                        background: "transparent",
                        fontSize: "0.75rem",
                        lineHeight: "1.7",
                        minHeight: "100%",
                      }}
                      lineNumberStyle={{
                        minWidth: "2.5em",
                        paddingRight: "1em",
                        color: "#464a4d",
                        textAlign: "right",
                        userSelect: "none",
                      }}
                      codeTagProps={{
                        style: { fontFamily: "var(--font-geist-mono), ui-monospace, monospace" },
                      }}
                    >
                      {activeCode}
                    </SyntaxHighlighter>
                  </div>
                </div>

                {/* Preview Panel - visible on desktop, or mobile when preview tab selected */}
                <div className={`flex-1 min-w-0 relative ${
                  mobileView === "preview" ? "block" : "hidden md:block"
                }`}>
                  {/* Preview content */}
                  <div
                    ref={previewContainerRef}
                    className={`h-[300px] md:h-[500px] ${
                      previewZoom === "100"
                        ? "overflow-auto"
                        : "overflow-hidden flex items-center justify-center p-6"
                    }`}
                  >
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {(() => {
                      const fitScale = Math.min(
                        previewDimensions.width / pageW,
                        previewDimensions.height / pageH
                      );
                      const currentScale = previewZoom === "100" ? 1 : fitScale;
                      const currentDisplayW = pageW * currentScale;
                      const currentDisplayH = pageH * currentScale;

                      return (
                        <div
                          className={`bg-white rounded-lg shadow-xl overflow-hidden ring-1 ring-black/10 flex-shrink-0 transition-opacity duration-200 ${
                            previewZoom === "100" ? "m-6" : ""
                          }`}
                          style={{
                            width: currentDisplayW,
                            height: currentDisplayH,
                            opacity: isLoading ? 0.4 : 1,
                          }}
                        >
                          <iframe
                            key={`${activeTemplate.id}-${previewZoom}`}
                            src={previewUrl}
                            title="PDF Preview"
                            style={{
                              width: pageW,
                              height: pageH,
                              transform: `scale(${currentScale})`,
                              transformOrigin: "top left",
                              border: "none",
                            }}
                            onLoad={handleIframeLoad}
                          />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Zoom controls - positioned at bottom right */}
                  <div className="absolute bottom-3 right-3 flex items-center bg-black/60 rounded-md p-0.5">
                    <button
                      onClick={() => setPreviewZoom("fit")}
                      className={`w-10 py-1 text-[10px] font-medium rounded transition-colors ${
                        previewZoom === "fit"
                          ? "bg-white/20 text-white"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      Fit
                    </button>
                    <button
                      onClick={() => setPreviewZoom("100")}
                      className={`w-10 py-1 text-[10px] font-medium rounded transition-colors ${
                        previewZoom === "100"
                          ? "bg-white/20 text-white"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      100%
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 fade-in-section">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-text-secondary">
              From page layout to production deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-section">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                ),
                title: "Write with JSX",
                description: "Build PDFs using the components you already know",
              },
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  </svg>
                ),
                title: "Style with Tailwind",
                description: "Use your existing Tailwind classes and config",
              },
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                ),
                title: "Smart pagination",
                description: "Page breaks, headers, footers, and page numbers built in",
              },
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                title: "Type safe",
                description: "Full type safety for templates, props, and API",
              },
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                  </svg>
                ),
                title: "Custom assets",
                description: "Google Fonts, local fonts, and image embedding",
              },
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                  </svg>
                ),
                title: "Works everywhere",
                description: "Next.js, Vite, and Node.js supported",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-surface-1 p-6 transition-colors hover:border-border-hover"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Build with confidence */}
      <section className="py-20 md:py-28 px-6 bg-surface-1">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 fade-in-section">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Build with confidence
            </h2>
            <p className="text-lg text-text-secondary">
              Preview PDFs as you code. Changes appear instantly.
            </p>
          </div>

          <div className="max-w-md mx-auto mb-6 fade-in-section">
            <TerminalCommand command="npx pdfn dev" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-10 fade-in-section">
            {["Next.js", "Vite", "Node.js"].map((fw) => (
              <span
                key={fw}
                className="px-3 py-1 rounded-md bg-surface-2 border border-border text-xs font-medium text-text-secondary"
              >
                {fw}
              </span>
            ))}
          </div>

          <div className="text-center fade-in-section">
            <a
              href="https://pdfn.dev/docs/dev-workflow"
              className="inline-flex items-center gap-1.5 text-text-secondary hover:text-primary transition-colors"
            >
              Learn about the dev workflow
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Get started */}
      <section className="py-20 md:py-28 px-6 bg-background">
        <div className="max-w-4xl mx-auto fade-in-section">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 text-center">
            From development to production
          </h2>
          <p className="text-lg text-text-secondary text-center mb-12">
            Build locally, deploy with an API key. No code changes needed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Step 1: Install */}
            <div className="rounded-xl border border-border bg-surface-1 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
                <h3 className="text-base font-semibold text-text-primary">Install</h3>
              </div>
              <TerminalCommand command="npm install @pdfn/react @pdfn/tailwind @pdfn/next" className="mb-4" />
              <p className="text-sm text-text-secondary">
                Add pdfn to your Next.js project.
              </p>
            </div>

            {/* Step 2: Deploy */}
            <div className="rounded-xl border border-border bg-surface-1 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
                <h3 className="text-base font-semibold text-text-primary">Deploy to production</h3>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-border bg-surface-1 font-mono text-sm mb-4">
                <span className="text-text-secondary truncate">PDFN_API_KEY=pdfn_live_...</span>
              </div>
              <p className="text-sm text-text-secondary">
                No manual infra or Chromium management. Just add your API key.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://pdfn.dev/docs/quickstart"
              className="group flex items-center gap-2 bg-primary hover:bg-primary-hover text-black font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]"
            >
              View the quickstart
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="https://console.pdfn.dev"
              className="flex items-center gap-2 bg-surface-1 border border-border hover:border-border-hover rounded-xl px-6 py-3 font-medium text-text-primary transition-all hover:bg-surface-2"
            >
              Get your API key
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
