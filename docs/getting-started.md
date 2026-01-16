# Getting Started

Generate your first PDF in under 2 minutes.

## Prerequisites

- Node.js 18+

## Installation

**React Projects (Next.js, Vite, etc.):**

```bash
npm i @pdfn/react
```

**Plain Node.js:**

```bash
npm i react react-dom @pdfn/react
```

## Create Your First Template

Create a file at `pdfn-templates/invoice.tsx`:

```tsx
import { Document, Page, PageNumber } from '@pdfn/react';

export default function Invoice() {
  return (
    <Document title="Invoice #001">
      <Page size="A4" margin="1in" footer={<PageNumber />}>
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>Invoice #001</h1>
        <p style={{ color: '#666' }}>Customer: Acme Corp</p>
        <p style={{ fontSize: 20, fontWeight: 'bold' }}>Total: $148.00</p>
      </Page>
    </Document>
  );
}
```

## Preview Your Template

Start the dev server:

```bash
npx pdfn dev --open
```

This opens a browser with live preview. Edit your template and see changes instantly.

## Generate a PDF

Choose based on your infrastructure — all options produce identical PDFs.

### Option 1: Local Development

Use the dev server with `generate()`:

```bash
# Terminal 1: Start dev server
npx pdfn dev

# Terminal 2: Run your app
PDFN_HOST=http://localhost:3456 node your-app.js
```

```tsx
import { generate } from '@pdfn/react';
import Invoice from './pdfn-templates/invoice';

// PDFN_HOST environment variable points to your local server
const pdf = await generate(<Invoice />);
```

### Option 2: Self-host with Puppeteer

Full control with your own Chromium setup:

```tsx
import puppeteer from 'puppeteer';
import { render } from '@pdfn/react';
import Invoice from './pdfn-templates/invoice';

// Render to HTML
const html = await render(<Invoice />);

// Generate PDF
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });

await page.waitForFunction(() => window.PDFN?.ready === true); // Wait for pagination

const pdf = await page.pdf({
  preferCSSPageSize: true,
  printBackground: true,
});
await browser.close();
```

### Option 3: pdfn Cloud

Managed infrastructure — no browser setup:

```tsx
import { generate } from '@pdfn/react';
import Invoice from './pdfn-templates/invoice';

// Set PDFN_API_KEY environment variable
const pdf = await generate(<Invoice />);
// pdf is a Buffer — save it, return it from an API, etc.
```

Get an API key at [console.pdfn.dev](https://console.pdfn.dev).

## Next Steps

- [Styling Guide](/docs/styling.md) — Inline styles, CSS props, Tailwind
- [Next.js Integration](/docs/nextjs.md) — API routes and deployment
- [Components Reference](/packages/react/README.md) — All components and props
