"use client";

import Link from "next/link";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Header, Footer, StylingBadge } from "@/components";

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
  // FIXME: plainCss not yet fully supported - @imports in plain CSS files not resolved
  styling: "tailwind" | "inline" | "cssProp" | "plainCss";
}

const templates: Template[] = [
  {
    id: "invoice",
    name: "Invoice",
    description: "Professional invoice with line items, automatic totals, and company branding.",
    pageSize: "A4",
    orientation: "portrait",
    components: ["Document", "Page", "Thead", "PageNumber", "TotalPages"],
    highlights: ["Multi-page tables", "Repeating headers", "Local images"],
    styling: "tailwind",
  },
  {
    id: "letter",
    name: "Business Letter",
    description: "Clean, professional letter format with letterhead and signature block.",
    pageSize: "Letter",
    orientation: "portrait",
    components: ["Document", "Page"],
    highlights: ["Single page", "Professional layout", "Print-ready"],
    styling: "inline",
  },
  {
    id: "contract",
    name: "Contract",
    description: "Multi-page legal contract with watermark, headers, and footers.",
    pageSize: "Legal",
    orientation: "portrait",
    components: ["Document", "Page", "PageNumber", "TotalPages", "AvoidBreak"],
    highlights: ["Watermark", "Header/Footer", "Keep sections together"],
    styling: "tailwind",
  },
  {
    id: "ticket",
    name: "Event Ticket",
    description: "Compact A5 event ticket with custom fonts and creative styling.",
    pageSize: "A5",
    orientation: "portrait",
    components: ["Document", "Page"],
    highlights: ["A5 size", "Custom fonts", "Creative design"],
    styling: "tailwind",
  },
  {
    id: "poster",
    name: "Poster",
    description: "Large format tabloid poster with landscape orientation.",
    pageSize: "Tabloid",
    orientation: "landscape",
    components: ["Document", "Page"],
    highlights: ["Tabloid size", "Landscape", "Full-bleed design"],
    styling: "cssProp",
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
      <Header />

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
                    {/* Size and styling badges */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className="bg-black/60 text-white text-xs px-2 py-1 rounded font-mono">
                        {template.pageSize} · {template.orientation}
                      </div>
                      <StylingBadge styling={template.styling} size="small" />
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

                    {/* Styling Method */}
                    <div className="mb-4">
                      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                        Styling
                      </div>
                      <div className="flex items-center gap-2">
                        <StylingBadge styling={template.styling} />
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
            Templates are added to your <code className="text-primary bg-background px-1.5 py-0.5 rounded text-sm">pdfn-templates/</code> directory. Customize them to match your needs.
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

      <Footer />
    </div>
  );
}
