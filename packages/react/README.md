# @pdfn/react

### Write PDF templates as React components.

React components for building PDFs with predictable pagination, headers, footers, and Tailwind support.

> **Server-only** — runs in Node.js and Edge runtimes, not in browsers.

## Why pdfn?

- **React & Tailwind** — Write PDFs like you write web UIs. No new syntax to learn.
- **Predictable pagination** — Table headers repeat, sections stay together, page numbers just work.
- **What you see is what you get** — Preview matches output. No surprises in PDF.
- **Use any Chromium** — Works with Puppeteer, Playwright, Browserless, or your own setup.

## Installation

```bash
npm install @pdfn/react
```

## Quick Start

```tsx
import { Document, Page, PageNumber, render } from '@pdfn/react';

function Invoice() {
  return (
    <Document title="Invoice #123">
      <Page size="A4" margin="1in" footer={<PageNumber />}>
        <h1>Invoice #123</h1>
        <p>Total: $148.00</p>
      </Page>
    </Document>
  );
}

const html = await render(<Invoice />);
// → Self-contained HTML ready for Chromium
```

## See It in Action

**[pdfn.dev](https://pdfn.dev/#preview)** — Interactive preview with example templates:

- **Invoice** — Multi-page tables with repeating headers, automatic pagination
- **Contract** — Legal documents with watermarks and signature blocks
- **Poster** — Single-page layouts with custom fonts and backgrounds

Or run locally: `npx pdfn dev`

## render() vs generate()

| | `render()` | `generate()` |
|---|---|---|
| **Returns** | HTML string | PDF buffer |
| **Requires** | Nothing | `npx pdfn serve` running |
| **Use when** | You have your own Puppeteer/Playwright setup | You want an all-in-one solution |

### render() + Puppeteer

```tsx
import puppeteer from 'puppeteer';
import { Document, Page, PageNumber, render } from '@pdfn/react';

function Invoice() {
  return (
    <Document title="Invoice #123">
      <Page size="A4" margin="1in" footer={<PageNumber />}>
        <h1>Invoice #123</h1>
        <p>Total: $148.00</p>
      </Page>
    </Document>
  );
}

// Render to HTML
const html = await render(<Invoice />);

// Generate PDF with Puppeteer
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });

// Wait for pdfn's pagination to complete
// PDFN.ready is set when Chromium layout + pagination stabilizes
await page.waitForFunction(() => (window as any).PDFN?.ready === true);

const pdf = await page.pdf({
  preferCSSPageSize: true,
  printBackground: true,
});
await browser.close();
```

### Using generate()

```tsx
import { Document, Page, PageNumber, generate } from '@pdfn/react';

function Invoice() {
  return (
    <Document title="Invoice #123">
      <Page size="A4" margin="1in" footer={<PageNumber />}>
        <h1>Invoice #123</h1>
        <p>Total: $148.00</p>
      </Page>
    </Document>
  );
}

const pdf = await generate(<Invoice />);
// pdf is a Buffer
```

## Components

| Component | Props | Description |
|-----------|-------|-------------|
| `<Document>` | `title`, `author`, `fonts` | Root wrapper with PDF metadata |
| `<Page>` | `size`, `margin`, `header`, `footer`, `watermark` | Page container with layout options |
| `<PageNumber>` | — | Current page number (use in header/footer) |
| `<TotalPages>` | — | Total page count (use in header/footer) |
| `<PageBreak>` | — | Force a page break |
| `<AvoidBreak>` | — | Keep content together on the same page |
| `<Thead>` | **`repeat`** | Table header that repeats on every page |
| `<Tr>` | `keep` | Table row that won't split across pages |

> **Killer feature:** `<Thead repeat>` automatically repeats table headers on every page — no more "what column is this?" on page 5 of your invoice.

## API

### Document Props

```tsx
<Document
  title="Invoice"              // PDF title metadata
  author="ACME Corp"           // PDF author metadata
  subject="Invoice for Q4"     // PDF subject metadata
  keywords={['invoice', 'q4']} // PDF keywords metadata
  language="en"                // Document language (default: "en")
  fonts={['Inter', 'Roboto Mono']}  // Google Fonts to load
  css={`...`}                  // Custom CSS string
>
  {children}
</Document>
```

### Page Props

```tsx
<Page
  size="A4"              // "A4" | "A3" | "A5" | "Letter" | "Legal" | "Tabloid" | "B4" | "B5" | [width, height]
  orientation="portrait" // "portrait" | "landscape"
  margin="1in"           // string or { top, right, bottom, left }
  background="#f5f5f5"   // Page background color
  header={<div>Header</div>}
  footer={<PageNumber />}
  watermark="DRAFT"      // string or WatermarkConfig
>
  {children}
</Page>
```

### Page Sizes

| Size | Dimensions (portrait) |
|------|----------------------|
| A3 | 297mm × 420mm |
| A4 | 210mm × 297mm |
| A5 | 148mm × 210mm |
| Letter | 8.5in × 11in |
| Legal | 8.5in × 14in |
| Tabloid | 11in × 17in |
| B4 | 250mm × 353mm |
| B5 | 176mm × 250mm |
| Custom | `[width, height]` e.g. `['6in', '9in']` |

## Examples

### Multi-page with Headers/Footers

```tsx
<Document>
  <Page
    size="A4"
    header={<div>Company Name</div>}
    footer={<div>Page <PageNumber /> of <TotalPages /></div>}
  >
    <h1>Report</h1>
    <p>Content that spans multiple pages...</p>
  </Page>
</Document>
```

### Page Breaks

```tsx
<Document>
  <Page size="A4">
    <h1>Chapter 1</h1>
    <p>Content...</p>

    <PageBreak />

    <h1>Chapter 2</h1>
    <p>More content...</p>
  </Page>
</Document>
```

### Keep Content Together

```tsx
<Document>
  <Page size="A4">
    <AvoidBreak>
      <h2>Section Title</h2>
      <p>This paragraph stays with its heading.</p>
    </AvoidBreak>
  </Page>
</Document>
```

### Table with Repeating Headers

```tsx
<Document>
  <Page size="A4">
    <table>
      <Thead repeat>
        <tr>
          <th>Item</th>
          <th>Price</th>
        </tr>
      </Thead>
      <tbody>
        {items.map(item => (
          <Tr key={item.id} keep>
            <td>{item.name}</td>
            <td>${item.price}</td>
          </Tr>
        ))}
      </tbody>
    </table>
  </Page>
</Document>
```

- `<Thead repeat>` repeats the header on each page
- `<Tr keep>` prevents the row from splitting across pages

### Fonts

```tsx
// Google Fonts
<Document fonts={['Playfair Display', 'Roboto Mono']}>
  ...
</Document>

// Google Fonts with weights
<Document fonts={[{ family: 'Inter', weights: [400, 500, 700] }]}>
  ...
</Document>

// Local fonts (embedded as base64)
<Document fonts={[
  { family: 'CustomFont', src: './fonts/custom.woff2', weight: 400 },
  { family: 'CustomFont', src: './fonts/custom-bold.woff2', weight: 700 },
]}>
  ...
</Document>
```

### Custom CSS

Add custom styles using the `css` prop:

```tsx
<Document
  title="Invoice"
  css={`
    .invoice-header {
      border-bottom: 2px solid #007bff;
      padding-bottom: 1rem;
    }
    .total-row {
      font-weight: bold;
      background: #f5f5f5;
    }
  `}
>
  <Page>
    <h1 className="invoice-header">Invoice</h1>
  </Page>
</Document>
```

For Tailwind users, create `pdfn-templates/styles.css` with your theme:

```css
/* pdfn-templates/styles.css */
@import "tailwindcss";

@theme {
  --color-brand: #007bff;
}

/* Plain CSS is also supported */
@import "./styles/invoice.css";
```

**CSS Cascade Order:**
1. Base styles (pdfn framework)
2. Tailwind CSS / styles.css (if using `<Tailwind>`)
3. Document CSS (`css` prop)
4. Inline styles (`style={}`)

Document CSS comes after Tailwind, so you can override Tailwind utilities.

## Debug Overlays

Add visual debug overlays to help with layout development:

```tsx
import { render, generate } from '@pdfn/react';

// Enable all debug overlays
const html = await render(<Invoice />, { debug: true });

// Or enable specific overlays
const html = await render(<Invoice />, {
  debug: { grid: true, margins: true }
});

// Works with generate() too
const pdf = await generate(<Invoice />, { debug: true });
```

| Option | Description |
|--------|-------------|
| `grid` | 1cm grid overlay |
| `margins` | Page and content boundaries |
| `headers` | Header/footer region highlights |
| `breaks` | Page number badges |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PDFN_HOST` | `http://localhost:3456` | Server URL for `generate()` |
| `DEBUG` | - | Set to `pdfn:react` or `pdfn:*` to enable logging |

## Tailwind CSS

Wrap your content with `<Tailwind>` to use Tailwind classes:

```tsx
import { Document, Page } from '@pdfn/react';
import { Tailwind } from '@pdfn/tailwind';

<Document>
  <Tailwind>
    <Page size="A4">
      <h1 className="text-2xl font-bold text-gray-900">Styled PDF</h1>
    </Page>
  </Tailwind>
</Document>
```

### Which Tailwind package do I need?

| Deployment | Package | Why |
|------------|---------|-----|
| Node.js (local, Vercel, any server) | `@pdfn/tailwind` | Runtime processing works |
| Vercel Edge | `@pdfn/tailwind` + `@pdfn/next` | Edge has no filesystem |
| Cloudflare Workers | `@pdfn/tailwind` + `@pdfn/vite` | Edge has no filesystem |

**Most users only need `@pdfn/tailwind`.** Build plugins are only for edge runtimes.

### Edge Runtime Setup (Vercel Edge, Cloudflare Workers)

If deploying to edge runtimes (routes with `export const runtime = 'edge'`):

```bash
# Next.js Edge
npm i @pdfn/tailwind @pdfn/next

# Vite / Cloudflare
npm i @pdfn/tailwind @pdfn/vite
```

Configure your build:

```ts
// next.config.ts
import { withPdfnTailwind } from "@pdfn/next";
export default withPdfnTailwind()({ /* your config */ });

// vite.config.ts
import { pdfnTailwind } from "@pdfn/vite";
export default { plugins: [pdfnTailwind()] };
```

See [@pdfn/next](../next) and [@pdfn/vite](../vite) for details.

## License

MIT
