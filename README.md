# pdfn

Write React. Ship PDFs.

Build predictable, paginated PDFs with React and Tailwind. Preview locally, ship the same output everywhere.

```
React → render() → HTML → Chromium → PDF
```

pdfn prepares HTML designed for clean page breaks and waits until layout stabilizes before PDF generation.

## Quick Start

In your React project (Next.js, Vite, etc.):

```bash
npm i @pdfn/react @pdfn/tailwind
npx pdfn add invoice
npx pdfn dev --open
```

Opens a preview UI with a working invoice template. Edit `pdf-templates/invoice.tsx` and see changes instantly.

## How pdfn works

1. **React renders** to HTML styled for printing with page break hints
2. **pdfn injects** layout helpers and waits for stability
3. **Chromium executes** layout, pagination, and PDF capture

## Requirements

**Server-only** - pdfn uses Node.js APIs and cannot run in the browser.

Use in:
- Next.js API routes / Server Actions / Server Components
- Express, Fastify, Hono backends
- Node.js scripts

Do NOT use in `"use client"` components or browser code.

## Usage

Two ways to generate PDFs:

- **`render()`** → HTML string (use with Puppeteer/Playwright for full control)
- **`generate()`** → PDF buffer directly
  - Requires `npx pdfn serve` running (starts a local Chromium-backed PDF server)

### Basic (Inline Styles - Using Puppeteer)

```tsx
import puppeteer from 'puppeteer';
import { Document, Page, PageNumber, render } from '@pdfn/react';

// Define your PDF template
function Invoice({ data }: { data: { id: string; customer: string; total: number } }) {
  return (
    <Document title={`Invoice ${data.id}`}>
      <Page size="A4" margin="1in" footer={<PageNumber />}>
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>Invoice #{data.id}</h1>
        <p style={{ color: '#666' }}>Customer: {data.customer}</p>
        <p style={{ fontSize: 20, fontWeight: 'bold' }}>Total: ${data.total}</p>
      </Page>
    </Document>
  );
}

// Render React to HTML
const html = await render(<Invoice data={{ id: 'INV-001', customer: 'Acme Corp', total: 148 }} />);

// Launch browser and create PDF
const browser = await puppeteer.launch();
const page = await browser.newPage();

// Load HTML and wait for assets
await page.setContent(html, { waitUntil: 'networkidle0' });

// Wait for pdfn's pagination to complete
// PDFN.ready is set when Chromium layout + pagination stabilizes
await page.waitForFunction(() => (window as any).PDFN?.ready === true);

// Generate PDF with CSS page size support
const pdf = await page.pdf({
  preferCSSPageSize: true,  // Use size from <Page> component
  printBackground: true,    // Include background colors/images
});

await browser.close();

// Save to file
import { writeFileSync } from 'fs';
writeFileSync('invoice.pdf', pdf);
```

### Basic (Inline Styles - Using pdfn)

```tsx
import { Document, Page, PageNumber, generate } from '@pdfn/react';

// Define your PDF template as a React component
function Invoice({ data }: { data: { id: string; customer: string; total: number } }) {
  return (
    <Document title={`Invoice ${data.id}`}>
      <Page
        size="A4"
        margin="1in"
        footer={<PageNumber />}  // Shows "1", "2", etc. on each page
      >
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>Invoice #{data.id}</h1>
        <p style={{ color: '#666' }}>Customer: {data.customer}</p>
        <p style={{ fontSize: 20, fontWeight: 'bold' }}>Total: ${data.total}</p>
      </Page>
    </Document>
  );
}

// Generate the PDF
const pdf = await generate(<Invoice data={{ id: 'INV-001', customer: 'Acme Corp', total: 148 }} />);

// Save to file
import { writeFileSync } from 'fs';
writeFileSync('invoice.pdf', pdf);
```

### With Tailwind CSS

```tsx
import { Document, Page, PageNumber, generate } from '@pdfn/react';
import { Tailwind } from '@pdfn/tailwind';

// Wrap your template with <Tailwind> to enable class-based styling
function Invoice({ data }: { data: { id: string; customer: string; total: number } }) {
  return (
    <Tailwind>
      <Document title={`Invoice ${data.id}`}>
        <Page size="A4" margin="1in" footer={<PageNumber />}>
          <h1 className="text-2xl font-bold mb-4">Invoice #{data.id}</h1>
          <p className="text-gray-600">Customer: {data.customer}</p>
          <p className="text-xl font-bold">Total: ${data.total}</p>
        </Page>
      </Document>
    </Tailwind>
  );
}

// Generate the PDF
const pdf = await generate(<Invoice data={{ id: 'INV-001', customer: 'Acme Corp', total: 148 }} />);
```

### Next.js API Route

```tsx
// app/api/invoice/route.ts
import { Document, Page, PageNumber, generate } from '@pdfn/react';
import { Tailwind } from '@pdfn/tailwind';

// Define template as a separate component
function Invoice({ data }: { data: { id: string; customer: string; total: number } }) {
  return (
    <Tailwind>
      <Document title={`Invoice ${data.id}`}>
        <Page size="A4" margin="1in" footer={<PageNumber />}>
          <h1 className="text-2xl font-bold mb-4">Invoice #{data.id}</h1>
          <p className="text-gray-600">Customer: {data.customer}</p>
          <p className="text-xl font-bold">Total: ${data.total}</p>
        </Page>
      </Document>
    </Tailwind>
  );
}

// API route handler
export async function POST(req: Request) {
  const data = await req.json();

  // Generate PDF from the template
  const pdf = await generate(<Invoice data={data} />);

  // Return as downloadable PDF
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${data.id}.pdf"`,
    },
  });
}
```

## Features

### @pdfn/react (Library)

- 8 page sizes + custom dimensions
- Layout with clean page breaks, headers, footers, and watermarks
- Local and web fonts/images auto-embedded
- Tailwind support via `@pdfn/tailwind`

### pdfn (CLI)

- Dev server with live preview and hot reload
- Starter templates (invoice, letter, contract, ticket, poster)
- Debug overlays for grid, margins, and headers

## Components

| Component | Description |
|-----------|-------------|
| `<Document>` | Root wrapper with metadata (title, author, fonts) |
| `<Page>` | Page container with size, margins, header/footer |
| `<PageNumber>` | Current page number |
| `<TotalPages>` | Total page count |
| `<PageBreak>` | Force a page break |
| `<AvoidBreak>` | Keep content together on same page |
| `<Thead>` | Enhanced `<thead>` - add `repeat` to repeat across pages |
| `<Tr>` | Enhanced `<tr>` - add `keep` to prevent splitting |
| `<Tailwind>` | Enable Tailwind classes (from `@pdfn/tailwind`) |

## Packages

| Package | Description |
|---------|-------------|
| [@pdfn/react](./packages/react) | React components, `render()`, `generate()` |
| [@pdfn/tailwind](./packages/tailwind) | Tailwind CSS support (optional) |
| [@pdfn/next](./packages/next) | Next.js plugin for Tailwind pre-compilation |
| [@pdfn/vite](./packages/vite) | Vite plugin for Tailwind pre-compilation |
| [pdfn](./packages/cli) | CLI dev server and production server |

## CLI

### `pdfn dev`

Development server with live preview.

```bash
npx pdfn dev                    # Start on port 3456
npx pdfn dev --open             # Start and open browser
npx pdfn dev --port 4000        # Custom port
```

### `pdfn serve`

Production server (headless).

```bash
npx pdfn serve                          # Start server
npx pdfn serve --port 3456              # Custom port
npx pdfn serve --max-concurrent 10      # Concurrency limit
```

### `pdfn add`

Add starter templates.

```bash
npx pdfn add invoice    # Add invoice template
npx pdfn add letter     # Add business letter
npx pdfn add contract   # Add contract template
npx pdfn add ticket     # Add event ticket
npx pdfn add poster     # Add poster template
npx pdfn add --list     # Show all templates
```

## Tradeoffs

**Chromium dependency** - PDF generation requires headless Chrome. For serverless, use [@sparticuz/chromium](https://github.com/Sparticuz/chromium) or services like [Browserless](https://browserless.io).

**File size** - Fonts and images are embedded in the PDF. Pre-compress assets for smaller file sizes.

### Alternatives

- **Need client-side PDF generation?** → [@react-pdf/renderer](https://react-pdf.org)
- **High volume (100k+ PDFs/hour)?** → [PDFKit](http://pdfkit.org)
- **Fill existing PDFs?** → [pdf-lib](https://pdf-lib.js.org)

## Roadmap

**High priority:**
- [ ] Table primitives - Column definitions, row keep-together, auto sizing
- [ ] Font subsetting - Smaller PDFs by stripping unused glyphs
- [ ] Table of Contents - Auto-generated with page number resolution

**Medium priority:**
- [ ] Orphans & widows - Prevent single lines at page boundaries
- [ ] Footnotes - Page-local references for legal/academic docs
- [ ] Internal anchors - Cross-page references ("See page X")

**Low priority:**
- [ ] Image optimization - Auto-compress before embedding
- [ ] PDF/A support - Archival compliance

## Contributing

```bash
pnpm install    # Install dependencies
pnpm build      # Build all packages
pnpm test       # Run tests
pnpm dev        # Watch mode
```

## License

MIT

---

If pdfn saves you time, consider [starring it on GitHub](https://github.com/pdfnjs/pdfn).
