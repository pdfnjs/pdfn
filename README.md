# PDFN

The React framework for print-ready HTML → PDF.

> **⚠️ Server-only** - Do not import in `"use client"` files. [Why?](#server-only)

## Requirements

**Node.js only** - PDFN generates PDFs on the server, not in the browser.

Use it in:
- Next.js API routes / Server Actions / Server Components
- Express, Fastify, Hono backends
- Node.js scripts

**Do NOT use in:**
- `"use client"` components
- Browser code
- Client-side React

## Quick Start

```bash
# Install packages
npm install @pdfn/react
npm install -D pdfn

# Start the dev server with preview UI
npx pdfn dev
```

Create a template in `pdf-templates/invoice.tsx`:

```tsx
import { Document, Page, PageNumber } from '@pdfn/react';

interface InvoiceData {
  id: string;
  customer: string;
  total: number;
}

export default function Invoice({
  data = { id: 'INV-001', customer: 'Acme Corp', total: 148 }
}: { data?: InvoiceData }) {
  return (
    <Document title={`Invoice ${data.id}`}>
      <Page size="A4" margin="1in" footer={<PageNumber />}>
        <h1>Invoice #{data.id}</h1>
        <p>Customer: {data.customer}</p>
        <p>Total: ${data.total.toFixed(2)}</p>
      </Page>
    </Document>
  );
}
```

Generate PDFs programmatically:

```tsx
import { Document, Page, PageNumber } from '@pdfn/react';
import { generate } from 'pdfn';
import { writeFileSync } from 'fs';

process.env.PDFN_HOST = 'http://localhost:3456';

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

## Packages

| Package | Description |
|---------|-------------|
| [@pdfn/react](./packages/react) | React components and `render()` |
| [pdfn](./packages/cli) | CLI, server, and `generate()` |
| [@pdfn/tailwind](./packages/tailwind) | Tailwind CSS support (optional) |

## Features

- **React Components** - Use familiar React patterns to build PDFs
- **Page Numbers** - Automatic page numbering with `<PageNumber />` and `<TotalPages />`
- **Page Breaks** - Control pagination with `<PageBreak />` and `<AvoidBreak />`
- **Headers/Footers** - Repeating headers and footers on every page
- **Table Headers** - Repeat table headers across pages with `<TableHeader />`
- **Watermarks** - Add text or custom watermarks
- **Multiple Sizes** - A4, A3, A5, Letter, Legal, Tabloid, B4, B5, or custom dimensions
- **Tailwind CSS** - Full Tailwind v4 support with `@pdfn/tailwind`
- **Google Fonts** - Easy font loading via `fonts` prop or Tailwind CSS
- **Local Images** - Automatic base64 embedding for relative image paths
- **Debug Mode** - Visual overlays for margins, grid, headers, and page breaks

## How It Works

```
React Component → render() → HTML → Server → Puppeteer → PDF
```

1. Write your PDF template as a React component
2. `render()` converts it to self-contained HTML with Paged.js
3. `generate()` sends HTML to the PDFN server
4. Puppeteer renders the HTML and captures as PDF

## API

### Components (from `@pdfn/react`)

| Component | Description |
|-----------|-------------|
| `Document` | Root wrapper with metadata (title, author, fonts) |
| `Page` | Page container with size, margins, header/footer |
| `PageNumber` | Current page number |
| `TotalPages` | Total page count |
| `PageBreak` | Force a page break |
| `AvoidBreak` | Keep content together on same page |
| `TableHeader` | Table header that repeats on each page |

### Functions

#### `render(element)` - from `@pdfn/react`

Converts React to HTML. No server needed.

```ts
import { render, Document, Page } from '@pdfn/react';

const html = await render(<Document><Page>...</Page></Document>);
```

#### `generate(element)` - from `pdfn`

Converts React to PDF. Requires `PDFN_HOST`.

```ts
import { Document, Page } from '@pdfn/react';
import { generate } from 'pdfn';

const pdf = await generate(<Document><Page>...</Page></Document>);
```

## CLI Commands

```bash
# Development - preview UI with hot reload
npx pdfn dev
npx pdfn dev --port 4000
npx pdfn dev --no-open     # Don't auto-open browser

# Production - headless server
npx pdfn serve
npx pdfn serve --port 3456 --max-concurrent 10

# Add starter templates
npx pdfn add invoice       # Add invoice template
npx pdfn add --list        # Show available templates

# After installing pdfn, you can use the shorter command:
pdfn dev
pdfn serve
pdfn add invoice
```

## Usage with Next.js

```tsx
// app/api/invoice/route.ts
import { Document, Page } from '@pdfn/react';
import { generate } from 'pdfn';

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

## Tailwind CSS

```tsx
import { Document, Page } from '@pdfn/react';
import { Tailwind } from '@pdfn/tailwind';

export default function Invoice() {
  return (
    <Tailwind>
      <Document>
        <Page size="A4">
          <h1 className="text-2xl font-bold text-blue-600">Invoice</h1>
        </Page>
      </Document>
    </Tailwind>
  );
}
```

## Development

```bash
pnpm install    # Install dependencies
pnpm build      # Build all packages
pnpm test       # Run tests
pnpm dev        # Watch mode
```

## Server-only

PDFN uses Node.js APIs (`fs`, `react-dom/server`) and cannot run in the browser. If you import it in a `"use client"` file, you'll get a build error:

```
Error: This module cannot be imported from a Client Component module.
It should only be used from a Server Component.
```

This is intentional - it prevents runtime crashes and unclear errors.

## License

MIT
