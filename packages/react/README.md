# @pdfn/react

React components for building PDFs with predictable pagination.

> **Server-only** — runs in Node.js, not in browsers.

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

## render() vs generate()

| | `render()` | `generate()` |
|---|---|---|
| **Input** | React element | React element |
| **Returns** | HTML string | PDF buffer |
| **Requires** | Nothing | pdfn server |
| **Use when** | Full control with your own Chromium | Local dev or pdfn Cloud |

**Both paths produce identical PDFs.** Choose based on your infrastructure preferences:
- `render()` → You manage Chromium (Puppeteer, Playwright, Browserless, etc.)
- `generate()` → pdfn dev server or pdfn Cloud

### Using generate()

Requires either a local pdfn server or pdfn Cloud API key.

```tsx
import { generate } from '@pdfn/react';

// Option 1: Local development
// Run `npx pdfn dev` and set PDFN_HOST
// PDFN_HOST=http://localhost:3456
const pdf = await generate(<Invoice />);

// Option 2: pdfn Cloud
// Get API key at https://console.pdfn.dev
// PDFN_API_KEY=pdfn_live_...
const pdf = await generate(<Invoice />);

// Or pass options directly
const pdf = await generate(<Invoice />, { host: 'http://localhost:3456' });
const pdf = await generate(<Invoice />, { apiKey: 'pdfn_live_...' });
```

### Using generateFromHtml()

When you already have HTML (e.g., from `render()` or custom templates):

```tsx
import { render, generateFromHtml } from '@pdfn/react';

const html = await render(<Invoice data={data} />);
const pdf = await generateFromHtml(html);
// Requires PDFN_HOST or PDFN_API_KEY environment variable
```

### Using render() + Puppeteer

```tsx
import { render } from '@pdfn/react';
import puppeteer from 'puppeteer';

const html = await render(<Invoice />);

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => window.PDFN?.ready === true); // Wait for pagination
const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
await browser.close();
```

## Components

| Component | Description |
|-----------|-------------|
| `<Document>` | Root wrapper (title, fonts, metadata) |
| `<Page>` | Page container (size, margins, header/footer) |
| `<PageNumber>` | Current page number |
| `<TotalPages>` | Total page count |
| `<PageBreak>` | Force a page break |
| `<AvoidBreak>` | Keep content together |
| `<Thead repeat>` | Table header that repeats on every page |
| `<Tr keep>` | Table row that won't split across pages |

## Page Sizes

| Size | Dimensions |
|------|------------|
| A4 | 210mm × 297mm |
| Letter | 8.5in × 11in |
| Legal | 8.5in × 14in |
| A3, A5, Tabloid, B4, B5 | Standard sizes |
| Custom | `['6in', '9in']` |

## Document Props

```tsx
<Document
  title="Invoice"
  author="ACME Corp"
  fonts={['Inter', 'Roboto Mono']}
  css={`/* custom styles */`}
/>
```

## Page Props

```tsx
<Page
  size="A4"
  orientation="portrait"
  margin="1in"
  background="#f5f5f5"
  header={<div>Header</div>}
  footer={<PageNumber />}
  watermark="DRAFT"
/>
```

## Fonts

```tsx
// Google Fonts
<Document fonts={['Inter', 'Roboto Mono']} />

// With weights
<Document fonts={[{ family: 'Inter', weights: [400, 600, 700] }]} />

// Local fonts
<Document fonts={[
  { family: 'CustomFont', src: './fonts/custom.woff2', weight: 400 }
]} />
```

## Tailwind CSS

Use `@pdfn/tailwind` for Tailwind support:

```tsx
import { Tailwind } from '@pdfn/tailwind';

<Document>
  <Tailwind>
    <Page size="A4">
      <h1 className="text-2xl font-bold">Styled PDF</h1>
    </Page>
  </Tailwind>
</Document>
```

See [@pdfn/tailwind](../tailwind) for details.

## License

MIT
