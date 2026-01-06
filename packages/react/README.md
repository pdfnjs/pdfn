# @pdfn/react

React components for building PDFs using standard web layout primitives.

> **Server-only** - Do not import in `"use client"` files.

## Installation

```bash
npm install @pdfn/react
```

## Quick Start

Two ways to generate PDFs:

- **`render()`** → HTML string (use with Puppeteer/Playwright for full control)
- **`generate()`** → PDF buffer directly
  - Requires `npx pdfn serve` running (starts a local Chromium-backed PDF server)

### Using render() + Puppeteer

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

| Component | Description |
|-----------|-------------|
| `<Document>` | Root wrapper with metadata (title, author, fonts) |
| `<Page>` | Page container with size, margins, header/footer |
| `<PageNumber>` | Current page number |
| `<TotalPages>` | Total page count |
| `<PageBreak>` | Force a page break |
| `<AvoidBreak>` | Keep content together on the same page |
| `<Thead>` | Enhanced `<thead>` - add `repeat` to repeat across pages |
| `<Tr>` | Enhanced `<tr>` - add `keep` to prevent splitting |

## API

### `render(element)`

Converts React to HTML. No server required.

```ts
const html = await render(<Document>...</Document>);
```

Use for:
- Custom PDF pipelines with Puppeteer/Playwright
- Previewing in browser
- Testing templates

### `generate(element, options?)`

Converts React to PDF buffer. Requires pdfn server. Returns `Buffer` (Node.js).

```ts
const pdf = await generate(<Document>...</Document>);
```

Options:
- `output` - `"pdf"` (default) or `"html"`
- `host` - Server URL (default: `process.env.PDFN_HOST` or `http://localhost:3456`)

### Document Props

```tsx
<Document
  title="Invoice"              // PDF title metadata
  author="ACME Corp"           // PDF author metadata
  subject="Invoice for Q4"     // PDF subject metadata
  keywords={['invoice', 'q4']} // PDF keywords metadata
  language="en"                // Document language (default: "en")
  fonts={['Inter', 'Roboto Mono']}  // Google Fonts to load
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

## Debug Utilities

For custom preview UIs, import from `@pdfn/react/debug`. These helpers modify HTML output only and are not included in production PDFs.

```ts
import { injectDebugSupport } from '@pdfn/react/debug';

const html = await render(<Document>...</Document>);
const debugHtml = injectDebugSupport(html, {
  grid: true,     // 1cm grid overlay
  margins: true,  // Margin boundaries
  headers: true,  // Header/footer regions
  breaks: true,   // Page break indicators
});
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PDFN_HOST` | `http://localhost:3456` | Server URL for `generate()` |
| `PDFN_NO_EDGE_WARNINGS` | - | Set to `1` to suppress edge runtime warnings |
| `DEBUG` | - | Set to `pdfn:react` or `pdfn:*` to enable logging |

## Edge Runtime Support

`render()` works on edge runtimes (Vercel Edge, Cloudflare Workers) with some limitations:

- **Remote images/fonts**: Work everywhere
- **Local images/fonts**: Require Node.js (helpful errors on edge)
- **Runtime Tailwind**: Requires Node.js or `@pdfn/vite` plugin for build-time compilation

For edge deployments with Tailwind, use the `@pdfn/vite` plugin to pre-compile CSS at build time:

```ts
// vite.config.ts or next.config.js
import { pdfnTailwind } from '@pdfn/vite';

export default {
  plugins: [pdfnTailwind({ templates: ['./pdf-templates/**/*.tsx'] })]
}
```

## License

MIT
