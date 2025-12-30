"use client";

import { useState, useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";

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
    code: `import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";

export default function Invoice({ data }: { data: InvoiceData }) {
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
                <div className="text-xl font-bold">{data.company.name}</div>
                <div className="text-xs text-gray-500">{data.company.address}</div>
              </div>
            </div>
            <div className="text-3xl font-bold">INVOICE</div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6">
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
                  <td className="text-right">\${(item.qty * item.price).toFixed(2)}</td>
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
  {
    id: "letter",
    name: "Letter",
    pageSize: "Letter" as keyof typeof PAGE_SIZES,
    orientation: "portrait" as const,
    code: `import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";

export default function Letter({ data }: { data: LetterData }) {
  return (
    <Document title={\`Letter - \${data.subject}\`}>
      <Tailwind>
        <Page size="Letter" margin="1in">
          {/* Letterhead */}
          <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-gray-900">
            <div>
              <div className="text-xl font-bold">{data.sender.company}</div>
              <div className="text-xs text-gray-500 mt-1">{data.sender.address}</div>
            </div>
            <div className="text-right text-xs text-gray-500">
              <div>{data.sender.email}</div>
              <div>{data.sender.phone}</div>
            </div>
          </div>

          {/* Date & Recipient */}
          <div className="text-sm text-gray-700 mb-8">{data.date}</div>
          <div className="mb-8">
            <div className="text-sm font-semibold">{data.recipient.name}</div>
            <div className="text-sm text-gray-600">{data.recipient.company}</div>
          </div>

          {/* Subject with accent border */}
          <div className="mb-6 py-2 border-l-4 border-gray-900 pl-4">
            <span className="text-sm font-bold uppercase">Re: </span>
            <span className="text-sm font-medium">{data.subject}</span>
          </div>

          {/* Body */}
          <div className="text-sm mb-6">Dear {data.recipient.name},</div>
          <div className="space-y-4 mb-10">
            {data.body.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed">{p}</p>
            ))}
          </div>

          {/* Signature */}
          <div className="text-sm mb-10">{data.closing},</div>
          <div className="border-b border-gray-300 w-48 mb-2"></div>
          <div className="text-sm font-bold">{data.signature}</div>
        </Page>
      </Tailwind>
    </Document>
  );
}`,
  },
  {
    id: "contract",
    name: "Contract",
    pageSize: "Legal" as keyof typeof PAGE_SIZES,
    orientation: "portrait" as const,
    code: `import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";

export default function Contract({ data }: { data: ContractData }) {
  return (
    <Document title={data.title}>
      <Tailwind>
        <Page size="Legal" margin="1in">
          {/* Title Block */}
          <div className="text-center mb-10 pb-6 border-b-2 border-gray-900">
            <h1 className="text-2xl font-black uppercase tracking-widest">{data.title}</h1>
            <div className="text-xs text-gray-500 mt-4">
              Effective Date: {data.effectiveDate}
            </div>
          </div>

          {/* Parties - Side by side */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-bold text-cyan-600 uppercase mb-2">Provider</div>
              <div className="text-sm font-bold">{data.parties.provider.name}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-bold text-gray-500 uppercase mb-2">Client</div>
              <div className="text-sm font-bold">{data.parties.client.name}</div>
            </div>
          </div>

          {/* Terms with numbered circles */}
          <div className="space-y-5 mb-8">
            {data.terms.map((term, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1">{term.title}</h3>
                  <p className="text-sm text-gray-600">{term.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 mt-12">
            <div>
              <div className="border-b-2 border-gray-900 mb-3 h-12"></div>
              <div className="text-sm font-bold">{data.signatures.provider.name}</div>
            </div>
            <div>
              <div className="border-b-2 border-gray-900 mb-3 h-12"></div>
              <div className="text-sm font-bold">{data.signatures.client.name}</div>
            </div>
          </div>
        </Page>
      </Tailwind>
    </Document>
  );
}`,
  },
  {
    id: "ticket",
    name: "Ticket",
    pageSize: "A5" as keyof typeof PAGE_SIZES,
    orientation: "portrait" as const,
    code: `import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";

export default function Ticket({ data }: { data: TicketData }) {
  return (
    <Document title={\`Ticket - \${data.event}\`}>
      <Tailwind>
        <Page size="A5" margin="0">
          {/* Dark Header Banner */}
          <div className="bg-gray-900 px-6 py-8 text-center">
            <div className="text-3xl font-black text-white">{data.event}</div>
            <div className="text-sm text-cyan-400 mt-2">{data.tagline}</div>
          </div>

          <div className="px-6 py-6">
            {/* Floating Badge */}
            <div className="flex justify-center -mt-10 mb-6">
              <div className="bg-cyan-500 text-white text-xs font-bold uppercase px-5 py-2 rounded-full shadow-lg">
                {data.ticketType}
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 uppercase">Date</div>
                <div className="text-base font-bold mt-1">{data.date}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 uppercase">Time</div>
                <div className="text-base font-bold mt-1">{data.time}</div>
              </div>
            </div>

            {/* Attendee with tear line */}
            <div className="border-t-2 border-dashed border-gray-300 my-6 pt-6 text-center">
              <div className="text-xs text-gray-500 uppercase">Admit One</div>
              <div className="text-2xl font-black">{data.attendee}</div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t-2 border-gray-900 pt-4">
              <div className="font-mono text-xs">{data.ticketNumber}</div>
              <div className="font-bold text-lg">{data.price}</div>
            </div>
          </div>
        </Page>
      </Tailwind>
    </Document>
  );
}`,
  },
  {
    id: "poster",
    name: "Poster",
    pageSize: "Tabloid" as keyof typeof PAGE_SIZES,
    orientation: "landscape" as const,
    code: `import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";

export default function Poster({ data }: { data: PosterData }) {
  return (
    <Document title={\`Poster - \${data.headline}\`}>
      <Tailwind>
        <Page size="Tabloid" orientation="landscape" margin="0">
          {/* Full bleed dark background with explicit page height */}
          <div className="bg-gray-900 text-white p-12 flex flex-col" style={{ height: "792pt" }}>
            {/* Accent lines */}
            <div className="flex gap-2">
              <div className="h-1.5 w-32 bg-cyan-500 rounded-full"></div>
              <div className="h-1.5 w-16 bg-cyan-500/50 rounded-full"></div>
            </div>

            {/* Main Content - fills available space */}
            <div className="flex-1 flex flex-col justify-center py-8">
              <h1 className="text-8xl font-black tracking-tight mb-6">{data.headline}</h1>
              <p className="text-3xl text-gray-400 font-light">{data.subheadline}</p>

              <div className="flex gap-16 mt-16">
                <div>
                  <div className="text-sm text-cyan-500 uppercase font-bold mb-3">Date</div>
                  <div className="text-4xl font-bold">{data.date}</div>
                </div>
                <div>
                  <div className="text-sm text-cyan-500 uppercase font-bold mb-3">Venue</div>
                  <div className="text-4xl font-bold">{data.venue}</div>
                </div>
              </div>
            </div>

            {/* Bottom: Highlights + CTA */}
            <div className="flex items-end justify-between">
              <div className="flex gap-4">
                {data.highlights.map((h, i) => (
                  <div key={i} className="border-2 border-gray-600 px-6 py-3 rounded-full text-base font-semibold">
                    {h}
                  </div>
                ))}
              </div>
              <div className="bg-cyan-500 text-gray-900 text-2xl font-black px-10 py-5 rounded-xl">
                {data.cta}
              </div>
            </div>

            {/* Bottom accent */}
            <div className="flex justify-end gap-2 mt-8">
              <div className="h-1.5 w-16 bg-cyan-500/50 rounded-full"></div>
              <div className="h-1.5 w-32 bg-cyan-500 rounded-full"></div>
            </div>
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTemplate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 p-6 flex items-center justify-center overflow-auto">
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
                      maxWidth: activeTemplate.orientation === 'landscape' ? 500 : 380,
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
                    {activeTemplate.code}
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
                      className="flex items-center justify-center gap-1.5 text-xs font-medium bg-primary hover:bg-primary-hover text-black px-3 py-1.5 rounded-md transition-colors min-w-[90px]"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
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
