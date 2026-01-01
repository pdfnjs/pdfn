# PDFX + Next.js Example

Interactive demo of PDFX - generate PDFs from React components in a Next.js application.

## Features

- Multiple PDF templates (Invoice, Ticket, Report, Poster)
- Live preview with debug overlays
- Template code viewer
- Download PDF functionality
- Responsive design

## Quick Start

```bash
# Install dependencies
pnpm install

# Start the PDFX server (in a separate terminal)
node ../../packages/cli/dist/cli.js serve

# Start the Next.js dev server
pnpm dev
```

Open http://localhost:3000 to view the demo.

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Demo page with preview and inspector
│   └── api/pdf/
│       └── route.tsx      # API route for PDF generation
├── lib/
│   └── template-code.ts   # Auto-generated template source code
└── ...

pdf-templates/
├── invoice.tsx            # Invoice template
├── ticket.tsx             # Event ticket template
├── report.tsx             # Multi-page report template
├── poster.tsx             # Large format poster template
└── components/            # Shared template components
```

## How It Works

1. Templates are React components in `pdf-templates/`
2. The API route uses `generate()` from `@pdfx-dev/cli` to convert React to PDF
3. The demo page shows a live preview with an inspector panel

```tsx
// api/pdf/route.tsx
import { Document, Page } from '@pdfx-dev/react';
import { generate } from '@pdfx-dev/cli';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template') || 'invoice';

  const pdf = await generate(
    <Template />,
    { debug: searchParams.get('debug') }
  );

  return new Response(pdf, {
    headers: { 'Content-Type': 'application/pdf' }
  });
}
```

## Templates

Each template uses default parameters for sample data (React Email pattern):

```tsx
export default function Invoice({
  data = { id: 'INV-001', customer: 'Acme Corp', total: 148 }
}: { data?: InvoiceData }) {
  return (
    <Document>
      <Page size="A4">
        <h1>Invoice #{data.id}</h1>
      </Page>
    </Document>
  );
}
```

## Debug Mode

Add debug overlays to visualize page structure:

- Grid overlay
- Margin highlights
- Header/footer highlights
- Page break indicators

## Important

PDFX is **server-only**. The `generate()` function can only be used in:
- API routes (like this example)
- Server Actions
- Server Components

Do NOT import `@pdfx-dev/react` or `@pdfx-dev/cli` in files marked with `"use client"`.
