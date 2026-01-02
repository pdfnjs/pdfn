# PDFN Website

The official website and interactive demo for PDFN - The React framework for PDFs.

## Features

- Interactive PDF template demos (Invoice, Ticket, Report, Poster)
- Live preview with debug overlays
- Template code viewer
- PDF download functionality

## Development

```bash
# From monorepo root
pnpm install

# Start the PDFN server (required for PDF generation)
pnpm --filter pdfn exec pdfn serve

# In another terminal, start the website
pnpm --filter web dev
```

Open http://localhost:3000 to view the site.

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main demo page with preview and inspector
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
2. The API route uses `generate()` from `pdfn` to convert React to PDF
3. The demo page shows a live preview with an inspector panel

```tsx
// api/pdf/route.tsx
import { generate } from 'pdfn';
import Invoice from '../../../pdf-templates/invoice';

export async function GET(request: Request) {
  const pdf = await generate(<Invoice />);

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

## Deployment

The site will be deployed to https://pdfn.dev

```bash
pnpm --filter web build
```
