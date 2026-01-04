# pdfn

The React framework for print-ready HTML → PDF.

## Requirements

**Node.js only** - pdfn generates PDFs on the server, not in the browser.

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
npm install @pdfn/react
npx pdfn add invoice
npx pdfn dev
```

This opens a preview UI with a working invoice template. Edit `pdf-templates/invoice.tsx` and see changes instantly.

## Generate PDFs Programmatically

```tsx
import { Document, Page, generate } from '@pdfn/react';

const pdf = await generate(
  <Document title="Invoice #123">
    <Page size="A4" margin="1in">
      <h1>Invoice #123</h1>
      <p>Customer: Acme Corp</p>
      <p>Total: $148.00</p>
    </Page>
  </Document>
);

// pdf is a Buffer - save it, return it from an API, etc.
```

Requires a running pdfn server (`npx pdfn serve` or `npx pdfn dev`). Defaults to `http://localhost:3456`.

## Packages

| Package | Description |
|---------|-------------|
| [@pdfn/react](./packages/react) | React components, `render()`, and `generate()` |
| [pdfn](./packages/cli) | CLI and PDF server |
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
3. `generate()` sends HTML to the pdfn server
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

#### `generate(element)` - from `@pdfn/react`

Converts React to PDF. Requires a running pdfn server.

```ts
import { Document, Page, generate } from '@pdfn/react';

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
import { Document, Page, generate } from '@pdfn/react';

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

pdfn uses Node.js APIs (`fs`, `react-dom/server`) and cannot run in the browser. If you import it in a `"use client"` file, you'll get a build error:

```
Error: This module cannot be imported from a Client Component module.
It should only be used from a Server Component.
```

This is intentional - it prevents runtime crashes and unclear errors.

---

If pdfn is useful, consider [starring it on GitHub](https://github.com/pdfnjs/pdfn).

## License

MIT
