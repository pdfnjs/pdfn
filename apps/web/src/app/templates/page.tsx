"use client";

import Link from "next/link";
import { useState } from "react";
import { Header, Footer, StylingBadge, PdfPreview } from "@/components";
import type { PageSize, Orientation } from "@/lib/page-sizes";

interface Template {
  id: string;
  name: string;
  description: string;
  pageSize: PageSize;
  orientation: Orientation;
  components: string[];
  highlights: string[];
  styling: "tailwind" | "inline" | "cssProp" | "plainCss";
}

const templates: Template[] = [
  {
    id: "invoice",
    name: "Invoice",
    description: "Professional invoice with line items, calculated totals, and tax.",
    pageSize: "A4",
    orientation: "portrait",
    components: ["Document", "Page", "PageNumber", "TotalPages"],
    highlights: ["Tailwind CSS", "Page numbers", "Auto totals"],
    styling: "tailwind",
  },
  {
    id: "report",
    name: "Report",
    description: "Sales report with Recharts integration for data visualization.",
    pageSize: "A4",
    orientation: "portrait",
    components: ["Document", "Page", "PageNumber", "TotalPages", "NoBreak"],
    highlights: ["Recharts", "Data tables", "Client component"],
    styling: "tailwind",
  },
  {
    id: "contract",
    name: "Contract",
    description: "Legal contract with watermark, headers, footers, and signature block.",
    pageSize: "Legal",
    orientation: "portrait",
    components: ["Document", "Page", "PageNumber", "TotalPages", "NoBreak"],
    highlights: ["Watermark", "Header/Footer", "NoBreak"],
    styling: "tailwind",
  },
  {
    id: "letter",
    name: "Letter",
    description: "Professional business letter with letterhead using inline styles.",
    pageSize: "Letter",
    orientation: "portrait",
    components: ["Document", "Page"],
    highlights: ["Inline styles", "Letterhead", "Single page"],
    styling: "inline",
  },
  {
    id: "ticket",
    name: "Ticket",
    description: "Compact event ticket with custom fonts and creative design.",
    pageSize: "A5",
    orientation: "portrait",
    components: ["Document", "Page"],
    highlights: ["A5 size", "Custom fonts", "QR placeholder"],
    styling: "tailwind",
  },
  {
    id: "poster",
    name: "Poster",
    description: "Large format poster with full-bleed design and bold typography.",
    pageSize: "Tabloid",
    orientation: "landscape",
    components: ["Document", "Page"],
    highlights: ["Tabloid", "Landscape", "Full-bleed"],
    styling: "cssProp",
  },
];

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
      className={`flex items-center gap-2 text-sm font-medium bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg transition-colors ${className}`}
    >
      {copied ? (
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
  );
}

export default function TemplatesPage() {
  const [activeTemplate, setActiveTemplate] = useState(templates[0]);

  const previewUrl = `/api/pdf?template=${activeTemplate.id}&html=true`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Main content - fills remaining height */}
      <main className="flex-1 flex flex-col min-h-0 px-6 py-6">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
          {/* Template tabs - horizontal, scrollable on mobile */}
          <div className="flex items-center justify-start lg:justify-center gap-2 mb-6 overflow-x-auto pb-2 -mx-6 px-6 lg:mx-0 lg:px-0">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTemplate.id === t.id
                    ? "bg-primary text-black"
                    : "bg-surface-1 text-text-secondary hover:text-text-primary hover:bg-surface-2 border border-border"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Preview + Info - stack on mobile, row on desktop */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
            {/* Preview panel */}
            <div className="flex-1 rounded-2xl border border-border overflow-hidden flex flex-col min-h-[400px] lg:min-h-0">
              {/* Window chrome header */}
              <header className="flex items-center justify-between h-10 px-4 border-b border-border bg-surface-1 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
                </div>
                <div className="text-xs text-text-muted font-mono">
                  {activeTemplate.id}.tsx — {activeTemplate.pageSize} {activeTemplate.orientation}
                </div>
              </header>

              {/* Preview area - fills remaining space */}
              <div className="flex-1 min-h-0">
                <PdfPreview
                  src={previewUrl}
                  size={activeTemplate.pageSize}
                  orientation={activeTemplate.orientation}
                  height="fill"
                  showZoomControls={true}
                  showOpenButton={true}
                />
              </div>
            </div>

            {/* Info panel - full width on mobile, fixed on desktop */}
            <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
              {/* Title & Description */}
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-1">
                  {activeTemplate.name}
                </h1>
                <p className="text-sm text-text-secondary">
                  {activeTemplate.description}
                </p>
              </div>

              {/* Add to project */}
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-surface-1 border border-border rounded-lg px-3 py-2 font-mono text-text-secondary truncate">
                  npx pdfn add {activeTemplate.id}
                </code>
                <CopyButton text={`npx pdfn add ${activeTemplate.id}`} />
              </div>

              {/* Details card */}
              <div className="p-5 rounded-xl border border-border bg-surface-1 space-y-5">
                {/* Components */}
                <div>
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Components
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTemplate.components.map((component) => (
                      <Link
                        key={component}
                        href={`/docs/components#${component.toLowerCase()}`}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                      >
                        {component}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Features
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTemplate.highlights.map((h) => (
                      <span key={h} className="text-xs bg-surface-2 text-text-muted px-2 py-1 rounded">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Styling */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    Styling
                  </span>
                  <StylingBadge styling={activeTemplate.styling} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
