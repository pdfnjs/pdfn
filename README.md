# PDFX

The React framework for PDFs. Pixel-perfect. Deterministic.

> **Alpha Release** - Core PDF generation works. Dev UI coming soon.

## Requirements

**Node.js only** - PDFX generates PDFs on the server, not in the browser.

Use it in:
- Next.js API routes / Server Actions
- Express, Fastify, Hono backends
- Node.js scripts

## Quick Start

```bash
# Install packages
npm install @pdfx-dev/react
npm install -D @pdfx-dev/cli

# Start the PDF server
npx pdfx serve
```

```tsx
import { generate, Document, Page, PageNumber } from '@pdfx-dev/react';

process.env.PDFX_HOST = 'http://localhost:3456';

const Invoice = (
  <Document title="Invoice #123">
    <Page size="A4" margin="1in" footer={<PageNumber />}>
      <h1>Invoice #123</h1>
      <p>Customer: Acme Corp</p>
      <p>Total: $148.00</p>
    </Page>
  </Document>
);

const pdf = await generate(Invoice);
fs.writeFileSync('invoice.pdf', pdf);
```

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [@pdfx-dev/react](./packages/react) | React components and PDF generation | Alpha |
| [@pdfx-dev/cli](./packages/cli) | CLI and PDF server | Alpha |

## Features

- **React Components** - Use familiar React patterns to build PDFs
- **Page Numbers** - Automatic page numbering with `<PageNumber />` and `<TotalPages />`
- **Page Breaks** - Control pagination with `<PageBreak />` and `<AvoidBreak />`
- **Headers/Footers** - Repeating headers and footers on every page
- **Watermarks** - Add text or custom watermarks
- **Multiple Sizes** - A4, Letter, Legal, or custom dimensions

## How It Works

```
React Component → render() → HTML → Server → Puppeteer → PDF
```

1. Write your PDF template as a React component
2. `render()` converts it to self-contained HTML with Paged.js
3. `generate()` sends HTML to the PDFX server
4. Puppeteer renders the HTML and captures as PDF

## API

### `render(element)`

Converts React to HTML. No server needed.

```ts
const html = await render(<Document>...</Document>);
```

### `generate(element)`

Converts React to PDF. Requires `PDFX_HOST`.

```ts
const pdf = await generate(<Document>...</Document>);
```

## CLI Commands

```bash
npx pdfx serve              # Start PDF generation server
npx pdfx serve --port 4000  # Custom port
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

## Development

```bash
pnpm install    # Install dependencies
pnpm build      # Build all packages
pnpm test       # Run tests
pnpm dev        # Watch mode
```

## License

MIT
