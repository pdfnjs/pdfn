"use client";

import { useState, useRef, useEffect } from "react";

// Page dimensions in points (72 dpi)
const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
};

const templates = [
  {
    id: "invoice",
    name: "Invoice",
    style: "inline-css" as const,
    description: "Professional invoice with inline styles",
    pageSize: "A4" as keyof typeof PAGE_SIZES,
    orientation: "portrait" as "portrait" | "landscape",
    code: `import { Document, Page } from "@pdfx-dev/react";

export default function Invoice({ data }: { data: InvoiceData }) {
  const subtotal = data.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <Document title={\`Invoice \${data.number}\`}>
      <Page size="A4" margin="1in">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <img src={data.company.logo} style={{ width: "44px", height: "44px" }} />
            <div>
              <div style={{ fontSize: "20px", fontWeight: "700" }}>{data.company.name}</div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>{data.company.address}</div>
            </div>
          </div>
          <div style={{ fontSize: "32px", fontWeight: "700" }}>INVOICE</div>
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              <th style={{ textAlign: "left", padding: "10px 12px" }}>Description</th>
              <th style={{ textAlign: "right", padding: "10px 12px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i}>
                <td style={{ padding: "12px" }}>{item.name}</td>
                <td style={{ textAlign: "right" }}>\${(item.qty * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div style={{ textAlign: "right", marginTop: "24px" }}>
          <strong style={{ fontSize: "15px" }}>Total: \${total.toFixed(2)}</strong>
        </div>
      </Page>
    </Document>
  );
}`,
  },
  {
    id: "invoice-tailwind",
    name: "Invoice",
    style: "tailwind" as const,
    description: "Same invoice using Tailwind CSS",
    pageSize: "A4" as keyof typeof PAGE_SIZES,
    orientation: "portrait" as "portrait" | "landscape",
    code: `import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";

export default function InvoiceTailwind({ data }: { data: InvoiceData }) {
  const subtotal = data.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <Document title={\`Invoice \${data.number}\`}>
      <Tailwind>
        <Page size="A4" margin="1in">
          {/* Header */}
          <div className="flex justify-between mb-8">
            <div className="flex items-start gap-3">
              <img src={data.company.logo} className="w-11 h-11" />
              <div>
                <div className="text-xl font-bold text-gray-900">{data.company.name}</div>
                <div className="text-xs text-gray-500">{data.company.address}</div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">INVOICE</div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2.5 px-3 text-xs font-semibold">Description</th>
                <th className="text-right py-2.5 px-3 text-xs font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 px-3">{item.name}</td>
                  <td className="text-right py-3 px-3">\${(item.qty * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="text-right">
            <strong className="text-base">Total: \${total.toFixed(2)}</strong>
          </div>
        </Page>
      </Tailwind>
    </Document>
  );
}`,
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
    title: "Headers & Footers",
    description: "Page numbers, headers, footers, repeating table headers.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function Home() {
  const [activeTemplate, setActiveTemplate] = useState(templates[0]);
  const [debug, setDebug] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Preview URL doesn't include debug - we toggle it via postMessage
  const previewUrl = `/api/pdf?template=${activeTemplate.id}&html=true`;
  const pdfUrl = `/api/pdf?template=${activeTemplate.id}${debug ? "&debug=true" : ""}`;

  // Send debug toggle to iframe via postMessage (no reload needed)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: "pdfx:debug", enabled: debug }, "*");
    }
  }, [debug]);

  // Handle template switch with fade transition
  const handleTemplateChange = (template: typeof templates[0]) => {
    if (template.id === activeTemplate.id) return;
    setIsLoading(true);
    setActiveTemplate(template);
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Simple, familiar API
            </h2>
            <p className="text-xl text-text-secondary">
              If you know React, you already know PDFX
            </p>
          </div>

          {/* Template Tabs */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {templates.map((t) => {
              const isActive = activeTemplate.id === t.id;
              const color = t.style === "tailwind" ? "var(--style-tailwind)" : "var(--style-inline)";
              const bg = t.style === "tailwind" ? "var(--style-tailwind-bg)" : "var(--style-inline-bg)";

              return (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t)}
                  className="flex items-center gap-3 px-5 py-3 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: isActive ? color : "var(--border)",
                    backgroundColor: isActive ? bg : "transparent",
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="text-left">
                    <div className="font-medium text-text-primary">{t.name}</div>
                    <div className="text-xs text-text-muted">
                      {t.style === "tailwind" ? "Tailwind CSS" : "Inline CSS"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code */}
            <div className="bg-surface-1 border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-sm text-text-muted font-mono">
                  {activeTemplate.id}.tsx
                </span>
              </div>
              <pre className="p-5 text-sm overflow-auto max-h-[500px]">
                <code className="text-text-secondary font-mono whitespace-pre leading-relaxed">
                  {activeTemplate.code}
                </code>
              </pre>
            </div>

            {/* Preview - Zoomed Out */}
            <div className="bg-surface-1 border border-border rounded-xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-muted">Preview</span>
                  {/* Debug Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-text-muted">Debug</span>
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
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                  >
                    Full size
                  </a>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Open PDF
                  </a>
                  <a
                    href={pdfUrl}
                    download
                    className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    Download
                  </a>
                </div>
              </div>

              {/* Preview container - fits page to available space */}
              <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 p-4 flex items-start justify-center overflow-auto relative">
                {/* Loading indicator */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <div
                  className="bg-white rounded shadow-2xl overflow-hidden flex-shrink-0 transition-opacity duration-200"
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    aspectRatio: (() => {
                      const size = PAGE_SIZES[activeTemplate.pageSize];
                      const w = activeTemplate.orientation === 'landscape' ? size.height : size.width;
                      const h = activeTemplate.orientation === 'landscape' ? size.width : size.height;
                      return `${w} / ${h}`;
                    })(),
                    opacity: isLoading ? 0.4 : 1,
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    key={activeTemplate.id}
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Preview"
                    onLoad={() => {
                      setIsLoading(false);
                      // Send debug state after iframe loads
                      if (debug && iframeRef.current?.contentWindow) {
                        iframeRef.current.contentWindow.postMessage({ type: "pdfx:debug", enabled: true }, "*");
                      }
                    }}
                  />
                </div>
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
