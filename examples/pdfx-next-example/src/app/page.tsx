"use client";

import { useState } from "react";
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
  const [debug, setDebug] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Get code from build-time generated static data
  const activeCode = templateCode[activeTemplate.id] || "// Template code not found";

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // URLs with debug param when enabled
  const previewUrl = `/api/pdf?template=${activeTemplate.id}&html=true${debug ? "&debug=true" : ""}`;
  const pdfUrl = `/api/pdf?template=${activeTemplate.id}${debug ? "&debug=true" : ""}`;

  // Handle PDF download with error handling
  const handleDownload = async () => {
    setPdfError(null);
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        const text = await response.text();
        if (text.includes("PDFX server is not running")) {
          setPdfError("Start the server: npx pdfx serve");
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
    setActiveTab("preview"); // Reset to preview on template change
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
            <span className="text-primary">x</span>
          </span>
          <div className="flex items-center gap-6">
            <button onClick={scrollToDemo} className="text-text-secondary hover:text-text-primary transition-colors">
              Demo
            </button>
            <a href="https://github.com/pdfx-dev/pdfx" target="_blank" rel="noopener noreferrer"
               className="text-text-secondary hover:text-text-primary transition-colors">
              GitHub
            </a>
            <a href="https://pdfx.dev/docs" target="_blank" rel="noopener noreferrer"
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
              npm i @pdfx-dev/react
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Simple, familiar API
            </h2>
            <p className="text-xl text-text-secondary">
              If you know React, you already know PDFX
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

          {/* Preview Card */}
          <div className="bg-surface-1 border border-border rounded-xl overflow-hidden">
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

            {/* Content Area - Fixed height to prevent layout shift */}
            <div className="relative h-[520px]">
              {/* Preview */}
              {activeTab === "preview" && (
                <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 p-6 flex items-center justify-center">
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {(() => {
                    // Container constraints (520px - 48px padding = 472px available height)
                    const maxWidth = 600;
                    const maxHeight = 472;

                    // Get page dimensions in points, convert to pixels (1pt = 96/72 px)
                    const PT_TO_PX = 96 / 72;
                    const size = PAGE_SIZES[activeTemplate.pageSize];
                    const pageW = (activeTemplate.orientation === 'landscape' ? size.height : size.width) * PT_TO_PX;
                    const pageH = (activeTemplate.orientation === 'landscape' ? size.width : size.height) * PT_TO_PX;

                    // Scale to fit within both width and height bounds
                    const scale = Math.min(maxWidth / pageW, maxHeight / pageH);
                    const displayW = pageW * scale;
                    const displayH = pageH * scale;

                    return (
                      <div
                        className="bg-white rounded shadow-2xl overflow-hidden flex-shrink-0 transition-opacity duration-200"
                        style={{
                          width: displayW,
                          height: displayH,
                          opacity: isLoading ? 0.4 : 1,
                        }}
                      >
                        <iframe
                          key={`${activeTemplate.id}-${debug}`}
                          src={previewUrl}
                          title="Preview"
                          style={{
                            width: pageW,
                            height: pageH,
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                            border: 'none',
                          }}
                          onLoad={() => setIsLoading(false)}
                        />
                      </div>
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
                      style: {
                        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                      },
                    }}
                  >
                    {activeCode}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>

            {/* Control Bar - Contextual controls based on active tab */}
            <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-surface-1">
              {activeTab === "preview" ? (
                <>
                  {/* Preview mode: Debug toggle + actions */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <button
                        onClick={() => setDebug(!debug)}
                        className="w-8 h-4 rounded-full transition-colors relative"
                        style={{ backgroundColor: debug ? "var(--primary)" : "var(--surface-2)" }}
                      >
                        <span
                          className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all"
                          style={{ left: debug ? 17 : 2 }}
                        />
                      </button>
                      <span className="text-xs text-text-muted">Debug</span>
                    </label>
                    {pdfError && (
                      <span className="text-xs text-red-500 ml-2">{pdfError}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                    >
                      Expand
                    </a>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                    >
                      View PDF
                    </a>
                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-1.5 text-xs font-medium bg-primary hover:bg-primary-hover text-black px-3 py-1.5 rounded-md transition-colors min-w-[90px]"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Code mode: Filename + copy button */}
                  <div className="text-xs text-text-muted font-mono">
                    {activeTemplate.id}.tsx
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium bg-primary hover:bg-primary-hover text-black px-3 py-1.5 rounded-md transition-colors min-w-[90px]"
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
                        Copy
                      </>
                    )}
                  </button>
                </>
              )}
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
              npx @pdfx-dev/cli dev
            </code>
            <a
              href="https://pdfx.dev/docs/getting-started"
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
            <span className="text-primary">x</span>
            {" "}— The React Framework for PDFs
          </span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  );
}
