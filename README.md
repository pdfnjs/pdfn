# pdfn

[![npm version](https://img.shields.io/npm/v/@pdfn/react.svg)](https://www.npmjs.com/package/@pdfn/react)
[![license](https://img.shields.io/npm/l/@pdfn/react.svg)](https://github.com/pdfnjs/pdfn/blob/main/LICENSE)

### Write PDF templates as React components.

**React-first, Chromium-based PDF generation with predictable pagination and Tailwind support.**

## Why pdfn?

Most PDFs start as HTML. As documents grow, minor CSS changes start breaking pagination, headers/footers drift, and preview no longer matches production — causing silent layout failures in business-critical PDFs.

pdfn fixes this:

- **Write PDF templates in React** — components, props, loops, conditionals
- **Live preview** — `npx pdfn dev` with hot reload
- **Smart page breaks** — content never splits mid-paragraph or mid-row
- **Repeating headers/footers** — like Word or Google Docs
- **Dynamic page numbers** — `Page 1 of 5` resolves correctly
- **Debug overlays** — visualize margins, grid, page breaks
- **Tailwind CSS support** — works out of the box via `@pdfn/tailwind`
- **Uses headless Chromium** — via `pdfn serve` or your existing Puppeteer setup

```
React → pdfn → HTML → Chromium → PDF
```

## What pdfn is not

- Not a visual/WYSIWYG PDF editor
- Not client-side PDF generation
- Not a replacement for Chromium

## Quick Start

pdfn works with any Node.js or Next.js project. Below is a minimal setup to try it locally.

```bash
mkdir pdfn-node && cd pdfn-node
npm init -y
npm install react react-dom @pdfn/react
npx pdfn add invoice
npx pdfn dev --open
```

![pdfn dev preview](./docs/assets/dev-preview.png)

```tsx
// pdfn-templates/invoice.tsx — created by `pdfn add invoice`
import { Document, Page, PageNumber } from '@pdfn/react';

export default function Invoice({ number, customer, items, ... }) {
  return (
    <Document title={`Invoice ${number}`}>
      <Page size="A4" margin="1in" footer={<PageNumber />}>
        {/* ... */}
      </Page>
    </Document>
  );
}
```

Edit `pdfn-templates/invoice.tsx` — changes appear instantly with hot reload.

### Generating PDFs

**Using `generate()`** — requires `npx pdfn serve` running

```tsx
// generate-pdf.tsx
import React from 'react';
import { generate } from '@pdfn/react';
import { writeFileSync } from 'fs';
import Invoice from './pdfn-templates/invoice';

async function main() {
  const pdf = await generate(<Invoice number="INV-2025-042" />);
  writeFileSync('invoice.pdf', pdf);
}
main();
```

```bash
npx tsx generate-pdf.tsx  # Generates invoice.pdf
```

**Using `render()` + Puppeteer** — bring your own browser

```bash
npm install puppeteer
```

```tsx
// generate-puppeteer-pdf.tsx
import React from 'react';
import { render } from '@pdfn/react';
import { writeFileSync } from 'fs';
import Invoice from './pdfn-templates/invoice';
import puppeteer from 'puppeteer';

async function main() {
  const html = await render(<Invoice number="INV-2025-042" />);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.PDFN?.ready === true); // Wait for pagination
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  await browser.close();

  writeFileSync('invoice-puppeteer.pdf', pdf);
}
main();
```

```bash
npx tsx generate-puppeteer-pdf.tsx  # Generates invoice-puppeteer.pdf
```

## Example: Next.js + Tailwind

```bash
npx create-next-app@latest pdfn-next --tailwind --yes
cd pdfn-next
npm install @pdfn/react @pdfn/tailwind @pdfn/next
```

```ts
// next.config.ts
import type { NextConfig } from 'next';
import { withPdfn } from '@pdfn/next';

const nextConfig: NextConfig = {
  // your existing config
};

export default withPdfn()(nextConfig);
```

```bash
npx pdfn add invoice --tailwind
npx pdfn dev --open  # Preview at http://localhost:3456
```

Create the API route at `app/api/invoice/route.tsx`:

```tsx
// app/api/invoice/route.tsx
import { generate } from '@pdfn/react';
import Invoice from '@/pdfn-templates/invoice';

export async function GET() {
  const pdf = await generate(<Invoice number="INV-2025-042" />);
  return new Response(new Uint8Array(pdf), { headers: { 'Content-Type': 'application/pdf' } });
}
```

```bash
npm run dev  # Start Next.js at http://localhost:3000
```

Open http://localhost:3000/api/invoice to download the PDF.

> **Note:** `generate()` requires `npx pdfn dev` or `npx pdfn serve` running.

## Examples

Full working examples at [github.com/pdfnjs/pdf-examples](https://github.com/pdfnjs/pdf-examples):
- [Node.js](https://github.com/pdfnjs/pdf-examples/tree/main/examples/pdfn-node)
- [Next.js](https://github.com/pdfnjs/pdf-examples/tree/main/examples/pdfn-next)

## Core Components

| Component | Purpose |
|-----------|---------|
| `<Document>` | Root wrapper (title, fonts, metadata) |
| `<Page>` | Page container (size, margins, header/footer) |
| `<PageNumber>` | Current page number |
| `<TotalPages>` | Total page count |
| `<PageBreak>` | Force page break |
| `<AvoidBreak>` | Keep content together |
| `<Tailwind>` | Enable Tailwind classes (from `@pdfn/tailwind`) |

## CLI

```bash
npx pdfn dev              # Dev server with hot reload
npx pdfn dev --open       # Dev server + open browser
npx pdfn serve            # Production server (for generate())
npx pdfn add invoice      # Add invoice template
npx pdfn add --list       # See all available templates
```

## Packages

| Use Case | Install |
|----------|---------|
| Basic | `@pdfn/react` |
| + Tailwind CSS | + `@pdfn/tailwind` |
| + Next.js (client components/edge) | + `@pdfn/next` |
| + Vite (client components/edge) | + `@pdfn/vite` |

**Most users:** `npm install @pdfn/react @pdfn/tailwind` + `npx pdfn dev`

## Requirements

- **Node.js 18+** (server-side only, not browser)
- **Chromium** (bundled with `pdfn` CLI)

## Documentation

- **[@pdfn/react](./packages/react)** — Components, `render()`, `generate()`
- **[@pdfn/tailwind](./packages/tailwind)** — Tailwind CSS support
- **[@pdfn/next](./packages/next)** — Next.js integration
- **[@pdfn/vite](./packages/vite)** — Vite integration
- **[pdfn CLI](./packages/cli)** — Dev server and production server

## Support & Feedback

- Questions or help: [GitHub Discussions](https://github.com/pdfnjs/pdfn/discussions)
- Bugs: [GitHub Issues](https://github.com/pdfnjs/pdfn/issues)

---

pdfn focuses on correctness and predictability. For high-throughput workloads, run `pdfn serve` as a dedicated service.

## License

MIT

---

If pdfn saves you time, consider [starring it on GitHub](https://github.com/pdfnjs/pdfn).

Built by [@gokulsiva](https://github.com/gokulsiva)
