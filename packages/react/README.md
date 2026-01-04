# @pdfn/react

React components for building PDF documents. Use familiar React patterns to create pixel-perfect PDFs.

> **⚠️ Server-only** - This package must be used in server environments only. Do not import it in files marked with `"use client"`.

## Installation

```bash
npm install @pdfn/react
npm install -D pdfn
```

## Quick Start

```tsx
import { render, Document, Page, PageNumber } from '@pdfn/react';

const html = await render(
  <Document title="Invoice #123">
    <Page size="A4" margin="1in" footer={<PageNumber />}>
      <h1>Invoice #123</h1>
      <p>Customer: Acme Corp</p>
      <p>Total: $148.00</p>
    </Page>
  </Document>
);
```

To generate a PDF, use `generate()` from `pdfn`:

```tsx
import { Document, Page } from '@pdfn/react';
import { generate } from 'pdfn';

const pdf = await generate(
  <Document>
    <Page size="A4">
      <h1>Hello World</h1>
    </Page>
  </Document>
);
```

## Components

| Component | Description |
|-----------|-------------|
| `Document` | Root wrapper with metadata (title, author, fonts) |
| `Page` | Page container with size, margins, header/footer |
| `PageNumber` | Current page number |
| `TotalPages` | Total page count |
| `PageBreak` | Force a page break |
| `AvoidBreak` | Keep content together on same page |
| `TableHeader` | Table header that repeats on each page |

## API

### `render(element)`

Converts a React element to a self-contained HTML string. No server required.

```ts
import { render } from '@pdfn/react';

const html = await render(<Document>...</Document>);
```

This is useful for:
- Previewing PDFs in a browser
- Custom PDF generation pipelines
- Testing templates

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

### Multi-page with Page Numbers

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

### Controlled Page Breaks

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

### Repeating Table Headers

```tsx
<Document>
  <Page size="A4">
    <table>
      <TableHeader>
        <tr>
          <th>Item</th>
          <th>Price</th>
        </tr>
      </TableHeader>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>${item.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Page>
</Document>
```

### Fonts

```tsx
// Google Fonts (simple)
<Document fonts={['Playfair Display', 'Roboto Mono']}>
  ...
</Document>

// Google Fonts with specific weights
<Document fonts={[{ family: 'Inter', weights: [400, 500, 700] }]}>
  ...
</Document>

// Local fonts (embedded as base64)
<Document fonts={[
  { family: 'CustomFont', src: './fonts/custom.woff2', weight: 400 },
  { family: 'CustomFont', src: './fonts/custom-bold.woff2', weight: 700 },
]}>
  <Page size="A4">
    <h1 style={{ fontFamily: 'CustomFont' }}>Custom Font Title</h1>
  </Page>
</Document>
```

## Server-only

This package uses Node.js APIs (`fs`, `react-dom/server`) and cannot run in the browser. Importing it in a `"use client"` file will cause a build error:

```
Error: This module cannot be imported from a Client Component module.
It should only be used from a Server Component.
```

Use it in:
- Next.js API routes / Server Actions / Server Components
- Express, Fastify, Hono backends
- Node.js scripts

## License

MIT
