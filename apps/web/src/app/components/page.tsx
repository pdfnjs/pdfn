"use client";

import { useState } from "react";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";

interface PropInfo {
  name: string;
  type: string;
  description: string;
  default?: string;
}

interface ComponentInfo {
  name: string;
  description: string;
  code: string;
  props: PropInfo[];
  category: "structure" | "pagination" | "content";
}

const components: ComponentInfo[] = [
  // Structure
  {
    name: "Document",
    category: "structure",
    description: "The root container for your PDF. Sets document metadata and loads fonts.",
    code: `import { Document, Page } from "@pdfn/react";

export default function Invoice() {
  return (
    <Document
      title="Invoice #001"
      fonts={[
        // Google Fonts (loaded from CDN)
        "Inter",
        { family: "Roboto Mono", weights: [400, 700] },
        // Local fonts (embedded as base64)
        { family: "CustomFont", src: "./fonts/custom.woff2", weight: 400 },
      ]}
    >
      <Page size="A4" margin="1in">
        {/* Your content */}
      </Page>
    </Document>
  );
}`,
    props: [
      { name: "title", type: "string", description: "PDF document title (shown in browser tab)" },
      { name: "author", type: "string", description: "PDF author metadata" },
      { name: "subject", type: "string", description: "PDF subject metadata" },
      { name: "keywords", type: "string[]", description: "PDF keywords metadata" },
      { name: "language", type: "string", description: "Document language", default: '"en"' },
      { name: "fonts", type: "(string | FontConfig)[]", description: "Google Fonts (by name) or local fonts (with src path)", default: "[]" },
      { name: "children", type: "ReactNode", description: "Page components" },
    ],
  },
  {
    name: "Page",
    category: "structure",
    description: "Defines a page with size, margins, and optional headers/footers. Content automatically flows across multiple pages.",
    code: `<Page
  size="A4"
  orientation="portrait"
  margin={{ top: "1in", right: "0.75in", bottom: "1in", left: "0.75in" }}
  background="#ffffff"
  header={<Header />}
  footer={<Footer />}
  watermark={{ text: "DRAFT", opacity: 0.1, rotation: -35 }}
>
  {/* Content flows automatically */}
</Page>`,
    props: [
      { name: "size", type: '"A4" | "A3" | "A5" | "Letter" | "Legal" | "Tabloid" | "B4" | "B5" | [w, h]', description: "Page size preset or custom dimensions", default: '"A4"' },
      { name: "orientation", type: '"portrait" | "landscape"', description: "Page orientation", default: '"portrait"' },
      { name: "margin", type: "string | { top, right, bottom, left }", description: "Page margins", default: '"1in"' },
      { name: "background", type: "string", description: "Background color", default: '"#ffffff"' },
      { name: "header", type: "ReactNode", description: "Content repeated at top of each page" },
      { name: "footer", type: "ReactNode", description: "Content repeated at bottom of each page" },
      { name: "watermark", type: "string | { text, opacity?, rotation? }", description: "Watermark text overlay on every page" },
      { name: "children", type: "ReactNode", description: "Page content" },
    ],
  },
  // Pagination
  {
    name: "PageNumber",
    category: "pagination",
    description: "Displays the current page number using CSS counters. Typically used in headers or footers.",
    code: `<Page
  footer={
    <div className="text-center text-sm text-gray-500">
      Page <PageNumber />
    </div>
  }
>
  {/* Content */}
</Page>`,
    props: [
      { name: "className", type: "string", description: "Additional CSS classes" },
    ],
  },
  {
    name: "TotalPages",
    category: "pagination",
    description: 'Displays the total page count using CSS counters. Combine with PageNumber for "Page 1 of 5" style footers.',
    code: `<Page
  footer={
    <div className="text-center text-sm text-gray-500">
      Page <PageNumber /> of <TotalPages />
    </div>
  }
>
  {/* Content */}
</Page>`,
    props: [
      { name: "className", type: "string", description: "Additional CSS classes" },
    ],
  },
  {
    name: "PageBreak",
    category: "pagination",
    description: "Forces a page break. Content after this element starts on a new page.",
    code: `<div>
  <section>
    <h2>Chapter 1</h2>
    <p>First chapter content...</p>
  </section>

  <PageBreak />

  <section>
    <h2>Chapter 2</h2>
    <p>Second chapter content...</p>
  </section>
</div>`,
    props: [],
  },
  // Content Control
  {
    name: "AvoidBreak",
    category: "content",
    description: "Keeps wrapped content together on the same page. Prevents awkward breaks in the middle of a section.",
    code: `{sections.map((section) => (
  <AvoidBreak key={section.id}>
    <h2 className="text-xl font-bold">{section.title}</h2>
    <p className="mt-2">{section.content}</p>
  </AvoidBreak>
))}`,
    props: [
      { name: "children", type: "ReactNode", description: "Content to keep together" },
      { name: "className", type: "string", description: "Additional CSS classes" },
    ],
  },
  {
    name: "TableHeader",
    category: "content",
    description: "Repeats table headers on each page when a table spans multiple pages. Essential for long data tables.",
    code: `<table className="w-full">
  <TableHeader>
    <tr className="border-b">
      <th className="text-left py-2">Item</th>
      <th className="text-right py-2">Qty</th>
      <th className="text-right py-2">Price</th>
    </tr>
  </TableHeader>
  <tbody>
    {items.map((item) => (
      <tr key={item.id} className="border-b">
        <td className="py-2">{item.name}</td>
        <td className="text-right py-2">{item.quantity}</td>
        <td className="text-right py-2">\${item.price}</td>
      </tr>
    ))}
  </tbody>
</table>`,
    props: [
      { name: "children", type: "ReactNode", description: "Table row(s) to repeat as header" },
      { name: "className", type: "string", description: "Additional CSS classes" },
    ],
  },
];

const categories = [
  { id: "structure", name: "Structure", description: "Core layout components" },
  { id: "pagination", name: "Pagination", description: "Page numbering and breaks" },
  { id: "content", name: "Content Control", description: "Control how content flows" },
] as const;

function CodeBlock({ code, language = "tsx" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-xs font-medium bg-surface-2 hover:bg-border text-text-secondary px-2.5 py-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied
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
      <SyntaxHighlighter
        language={language}
        style={nightOwl}
        customStyle={{
          margin: 0,
          padding: "1.25rem",
          background: "var(--surface-1)",
          fontSize: "0.8125rem",
          lineHeight: "1.6",
          borderRadius: "0.75rem",
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

export default function ComponentsPage() {
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
            <Link href="/components" className="text-text-primary font-medium">
              Components
            </Link>
            <Link href="/templates" className="text-text-secondary hover:text-text-primary transition-colors">
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Components
          </h1>
          <p className="text-xl text-text-secondary mb-6">
            React components for building structured, paginated PDFs.
          </p>
          <CodeBlock
            code={`import { Document, Page, PageNumber, TotalPages, PageBreak, AvoidBreak, TableHeader } from "@pdfn/react";`}
            language="typescript"
          />
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 flex gap-12">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-48 flex-shrink-0">
          <nav className="sticky top-8 space-y-6">
            {categories.map((category) => (
              <div key={category.id}>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                  {category.name}
                </div>
                <ul className="space-y-1">
                  {components
                    .filter((c) => c.category === category.id)
                    .map((component) => (
                      <li key={component.name}>
                        <a
                          href={`#${component.name.toLowerCase()}`}
                          className="block text-sm text-text-secondary hover:text-text-primary transition-colors py-1"
                        >
                          {component.name}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 space-y-20">
          {categories.map((category) => {
            const categoryComponents = components.filter((c) => c.category === category.id);
            return (
              <section key={category.id}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-text-primary mb-2">
                    {category.name}
                  </h2>
                  <p className="text-text-muted">{category.description}</p>
                </div>

                <div className="space-y-16">
                  {categoryComponents.map((component) => (
                    <div key={component.name} id={component.name.toLowerCase()} className="scroll-mt-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-text-primary">
                          {component.name}
                        </h3>
                        <code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {"<"}{component.name}{" />"}
                        </code>
                      </div>
                      <p className="text-text-secondary mb-6">
                        {component.description}
                      </p>

                      {/* Code Example */}
                      <CodeBlock code={component.code} />

                      {/* Props Table */}
                      {component.props.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
                            Props
                          </h4>
                          <div className="border border-border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-surface-1 border-b border-border">
                                  <th className="text-left px-4 py-2.5 font-medium text-text-muted">Name</th>
                                  <th className="text-left px-4 py-2.5 font-medium text-text-muted">Type</th>
                                  <th className="text-left px-4 py-2.5 font-medium text-text-muted">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {component.props.map((prop, i) => (
                                  <tr key={prop.name} className={i !== component.props.length - 1 ? "border-b border-border" : ""}>
                                    <td className="px-4 py-2.5">
                                      <code className="text-primary text-xs">{prop.name}</code>
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <code className="text-text-muted text-xs">{prop.type}</code>
                                    </td>
                                    <td className="px-4 py-2.5 text-text-secondary">
                                      {prop.description}
                                      {prop.default && (
                                        <span className="text-text-muted ml-2">
                                          (default: <code className="text-xs">{prop.default}</code>)
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      </div>

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
