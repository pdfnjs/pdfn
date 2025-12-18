# @pdfx-dev/react

The React framework for PDFs. Create pixel-perfect PDF documents using React components.

> **Alpha Release** - Core PDF generation works. Some features are still in development.

> **⚠️ Server-only** - This package must be used in server environments only. Do not import it in files marked with `"use client"`.

## Requirements

**Node.js only** - This package generates PDFs on the server, not in the browser.

Use it in:
- Next.js API routes / Server Actions / Server Components
- Express, Fastify, Hono backends
- Node.js scripts

**Do NOT use in:**
- `"use client"` components
- Browser code
- Client-side React

## Installation

```bash
npm install @pdfx-dev/react
npm install -D @pdfx-dev/cli
```

## Quick Start

### 1. Start the PDF server

```bash
npx pdfx serve
```

### 2. Generate a PDF

```tsx
import { generate, Document, Page, PageNumber } from '@pdfx-dev/react';
import { writeFileSync } from 'fs';

process.env.PDFX_HOST = 'http://localhost:3456';

const pdf = await generate(
  <Document title="Invoice #123">
    <Page size="A4" margin="1in" footer={<PageNumber />}>
      <h1>Invoice #123</h1>
      <p>Customer: Acme Corp</p>
      <p>Total: $148.00</p>
    </Page>
  </Document>
);

writeFileSync('invoice.pdf', pdf);
```

## Components

| Component | Description |
|-----------|-------------|
| `Document` | Root wrapper with metadata (title, author, etc.) |
| `Page` | Page container with size, margins, header/footer |
| `PageNumber` | Current page number |
| `TotalPages` | Total page count |
| `PageBreak` | Force a page break |
| `AvoidBreak` | Keep content together on same page |
| `RepeatableTableHeader` | Table header that repeats on each page |

## API

### `render(element)`

Converts a React element to a self-contained HTML string.

```ts
import { render } from '@pdfx-dev/react';
const html = await render(<Document>...</Document>);
```

### `generate(element)`

Converts a React element to a PDF buffer. Requires `PDFX_HOST` environment variable.

```ts
import { generate } from '@pdfx-dev/react';
const pdf = await generate(<Document>...</Document>);
```

## Page Props

```tsx
<Page
  size="A4"              // "A4" | "Letter" | "Legal" | [width, height]
  orientation="portrait" // "portrait" | "landscape"
  margin="1in"           // string or { top, right, bottom, left }
  header={<div>Header</div>}
  footer={<PageNumber />}
  watermark="DRAFT"      // string or WatermarkConfig
>
  {children}
</Page>
```

## Usage with Next.js

```tsx
// app/api/invoice/route.ts
import { generate, Document, Page } from '@pdfx-dev/react';

export async function POST(req: Request) {
  const data = await req.json();

  const pdf = await generate(
    <Document>
      <Page size="A4">
        <h1>Invoice #{data.id}</h1>
      </Page>
    </Document>
  );

  return new Response(pdf, {
    headers: { 'Content-Type': 'application/pdf' }
  });
}
```

## License

MIT
