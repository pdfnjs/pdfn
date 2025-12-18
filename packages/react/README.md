# @pdfx-dev/react

The React framework for PDFs. Create pixel-perfect PDF documents using React components.

> **Alpha Release** - Core PDF generation works. Some features are still in development.

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

// Set the server URL
process.env.PDFX_HOST = 'http://localhost:3456';

// Create your PDF template
const Invoice = (
  <Document title="Invoice #123">
    <Page size="A4" margin="1in" footer={<PageNumber />}>
      <h1>Invoice #123</h1>
      <p>Customer: Acme Corp</p>
      <p>Total: $148.00</p>
    </Page>
  </Document>
);

// Generate PDF
const pdfBuffer = await generate(Invoice);
fs.writeFileSync('invoice.pdf', pdfBuffer);
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

## License

MIT
