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

Create a file at `pdf-templates/invoice.tsx`:

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

### Option 1: Using generate()

Start the pdfn server in one terminal:

```bash
npx pdfn serve
```

Then generate PDFs in your code:

```tsx
import { generate } from '@pdfn/react';
import Invoice from './pdf-templates/invoice';

const pdf = await generate(<Invoice />);
// pdf is a Buffer — save it, return it from an API, etc.
```

### Option 2: Using render() with Your Own Puppeteer

If you have an existing Puppeteer/Playwright setup:

```tsx
import puppeteer from 'puppeteer';
import { render } from '@pdfn/react';
import Invoice from './pdf-templates/invoice';

// Render to HTML
const html = await render(<Invoice />);

// Generate PDF
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });

// Wait for pdfn's pagination to complete
await page.waitForFunction(() => window.PDFN?.ready === true);

const pdf = await page.pdf({
  preferCSSPageSize: true,
  printBackground: true,
});
await browser.close();
```

## Next Steps

- [Styling Guide](/docs/styling.md) — Inline styles, CSS props, Tailwind
- [Next.js Integration](/docs/nextjs.md) — API routes and deployment
- [Components Reference](/packages/react/README.md) — All components and props
