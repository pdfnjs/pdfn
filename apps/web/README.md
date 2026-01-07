# pdfn Website

Official website and interactive demo for pdfn.

## Features

- Live template demos (Invoice, Letter, Contract, Ticket, Poster)
- Real-time preview with debug overlays
- One-click PDF download
- Template source code viewer
- Performance metrics

## Development

```bash
# From monorepo root
pnpm install

# Terminal 1: Start pdfn server
pnpm --filter pdfn exec pdfn serve

# Terminal 2: Start website
pnpm --filter web dev
```

Open http://localhost:3000

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page with demo
│   └── api/pdf/route.tsx     # PDF generation endpoint
├── lib/
│   └── template-code.ts      # Auto-generated template source
└── ...

pdf-templates/
├── invoice.tsx               # A4
├── letter.tsx                # Letter
├── contract.tsx              # Legal
├── ticket.tsx                # A5
├── poster.tsx                # Tabloid
└── components/               # Shared components
```

## How It Works

1. Templates are React components in `pdf-templates/`
2. API route uses `generate()` from `@pdfn/react`
3. Demo page renders live preview with inspector

```tsx
// api/pdf/route.tsx
import { generate } from '@pdfn/react';
import Invoice from '../../../pdf-templates/invoice';

export async function GET() {
  const pdf = await generate(<Invoice />);

  return new Response(pdf, {
    headers: { 'Content-Type': 'application/pdf' }
  });
}
```

## Templates

Templates use default props for demo data (React Email pattern):

```tsx
import { Document, Page } from '@pdfn/react';
import { Tailwind } from '@pdfn/tailwind';

export default function Invoice({
  data = { id: 'INV-001', customer: 'Acme Corp', total: 148 }
}) {
  return (
    <Tailwind>
      <Document title={`Invoice ${data.id}`}>
        <Page size="A4">
          <h1 className="text-2xl font-bold">Invoice #{data.id}</h1>
        </Page>
      </Document>
    </Tailwind>
  );
}
```

## Build

```bash
pnpm --filter web build
```

## License

MIT
