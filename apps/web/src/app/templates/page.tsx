"use client";

import Link from "next/link";
import { useState } from "react";
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

interface Template {
  id: string;
  name: string;
  description: string;
  pageSize: keyof typeof PAGE_SIZES;
  orientation: "portrait" | "landscape";
  components: string[];
  highlights: string[];
}

const templates: Template[] = [
  {
    id: "invoice",
    name: "Invoice",
    description: "Professional invoice with line items, automatic totals, and company branding.",
    pageSize: "A4",
    orientation: "portrait",
    components: ["Document", "Page", "TableHeader", "PageNumber", "TotalPages"],
    highlights: ["Multi-page tables", "Repeating headers", "Local images"],
  },
  {
    id: "letter",
    name: "Business Letter",
    description: "Clean, professional letter format with letterhead and signature block.",
    pageSize: "Letter",
    orientation: "portrait",
    components: ["Document", "Page"],
    highlights: ["Single page", "Professional layout", "Print-ready"],
  },
  {
    id: "contract",
    name: "Contract",
    description: "Multi-page legal contract with watermark, headers, and footers.",
    pageSize: "Legal",
    orientation: "portrait",
    components: ["Document", "Page", "PageNumber", "TotalPages", "AvoidBreak"],
    highlights: ["Watermark", "Header/Footer", "Keep sections together"],
  },
  {
    id: "ticket",
    name: "Event Ticket",
    description: "Compact A5 event ticket with custom fonts and creative styling.",
    pageSize: "A5",
    orientation: "portrait",
    components: ["Document", "Page"],
    highlights: ["A5 size", "Custom fonts", "Creative design"],
  },
  {
    id: "poster",
    name: "Poster",
    description: "Large format tabloid poster with landscape orientation.",
    pageSize: "Tabloid",
    orientation: "landscape",
    components: ["Document", "Page"],
    highlights: ["Tabloid size", "Landscape", "Full-bleed design"],
  },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group inline-block">
      <button
        onClick={handleCopy}
        className="absolute top-1/2 -translate-y-1/2 right-3 z-10 flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
        aria-label="Copy command"
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
      <SyntaxHighlighter
        language="bash"
        style={nightOwl}
        customStyle={{
          margin: 0,
          padding: "0.75rem 3rem 0.75rem 1rem",
          background: "var(--surface-1)",
          fontSize: "0.875rem",
          lineHeight: "1.5",
          borderRadius: "0.5rem",
          border: "1px solid var(--border)",
        }}
        codeTagProps={{
          style: { fontFamily: "var(--font-geist-mono), ui-monospace, monospace" },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function TemplatesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCommand = (templateId: string) => {
    navigator.clipboard.writeText(`npx pdfn add ${templateId}`);
    setCopiedId(templateId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-text-muted">pdf</span>
            <span className="text-primary">n</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/components" className="text-text-secondary hover:text-text-primary transition-colors">
              Components
            </Link>
            <Link href="/templates" className="text-text-primary font-medium">
              Templates
            </Link>
            <Link href="/docs" className="text-text-secondary hover:text-text-primary transition-colors">
              Docs
            </Link>
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
      <section className="py-16 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Templates
          </h1>
          <p className="text-xl text-text-secondary mb-6">
            Production-ready PDF templates. Add to your project with a single command.
          </p>
          <CodeBlock code="npx pdfn add <template>" />
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {templates.map((template) => {
              const PT_TO_PX = 96 / 72;
              const size = PAGE_SIZES[template.pageSize];
              const pageW = (template.orientation === 'landscape' ? size.height : size.width) * PT_TO_PX;
              const pageH = (template.orientation === 'landscape' ? size.width : size.height) * PT_TO_PX;
              const thumbHeight = 320;
              const scale = thumbHeight / pageH;
              const thumbWidth = pageW * scale;

              return (
                <div key={template.id} className="bg-surface-1 border border-border rounded-xl overflow-hidden">
                  {/* Preview */}
                  <div className="relative bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center p-6" style={{ height: thumbHeight + 48 }}>
                    <div
                      className="bg-white rounded-lg shadow-2xl overflow-hidden flex-shrink-0 ring-1 ring-black/5"
                      style={{ width: thumbWidth, height: thumbHeight }}
                    >
                      <iframe
                        src={`/api/pdf?template=${template.id}&html=true`}
                        title={template.name}
                        style={{
                          width: pageW,
                          height: pageH,
                          transform: `scale(${scale})`,
                          transformOrigin: 'top left',
                          border: 'none',
                          pointerEvents: 'none',
                        }}
                      />
                    </div>
                    {/* Size badge */}
                    <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded font-mono">
                      {template.pageSize} · {template.orientation}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-text-primary">
                          {template.name}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    {/* Components Used */}
                    <div className="mb-4">
                      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                        Components
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {template.components.map((component) => (
                          <Link
                            key={component}
                            href={`/components#${component.toLowerCase()}`}
                            className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded hover:bg-primary/20 transition-colors"
                          >
                            {component}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mb-6">
                      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                        Features
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {template.highlights.map((highlight) => (
                          <span key={highlight} className="text-xs bg-surface-2 text-text-muted px-2 py-0.5 rounded">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCommand(template.id)}
                        className="flex-1 flex items-center justify-center gap-2 text-sm font-medium bg-primary hover:bg-primary-hover text-black px-4 py-2.5 rounded-lg transition-colors"
                      >
                        {copiedId === template.id ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add to project
                          </>
                        )}
                      </button>
                      <a
                        href={`/api/pdf?template=${template.id}&html=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2.5 rounded-lg border border-border hover:border-border-hover transition-colors"
                        title="Preview HTML"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                      </a>
                      <a
                        href={`/api/pdf?template=${template.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2.5 rounded-lg border border-border hover:border-border-hover transition-colors"
                        title="Download PDF"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        PDF
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 px-6 bg-surface-1">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Start with a template
          </h2>
          <p className="text-text-secondary mb-8">
            Templates are added to your <code className="text-primary bg-background px-1.5 py-0.5 rounded text-sm">pdf-templates/</code> directory. Customize them to match your needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-sm">
            <div className="bg-background border border-border rounded-lg px-4 py-2.5">
              npx pdfn add invoice
            </div>
            <span className="text-text-muted">→</span>
            <div className="bg-background border border-border rounded-lg px-4 py-2.5">
              npx pdfn dev
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-text-muted">
          <Link href="/">
            <span className="text-text-secondary">pdf</span>
            <span className="text-primary">n</span>
            {" "}— The React Framework for PDFs
          </Link>
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
