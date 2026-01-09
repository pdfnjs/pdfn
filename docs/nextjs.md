# Next.js Integration

This guide covers integrating pdfn with Next.js App Router.

## Installation

```bash
npm i @pdfn/react
```

For Tailwind support:

```bash
npm i @pdfn/tailwind
```

## API Route (App Router)

Create an API route to generate PDFs:

```tsx
// app/api/invoice/route.ts
import { Document, Page, PageNumber, generate } from '@pdfn/react';
import { Tailwind } from '@pdfn/tailwind';

interface InvoiceData {
  id: string;
  customer: string;
  total: number;
}

function Invoice({ data }: { data: InvoiceData }) {
  return (
    <Document title={`Invoice ${data.id}`}>
      <Tailwind>
        <Page size="A4" margin="1in" footer={<PageNumber />}>
          <h1 className="text-2xl font-bold mb-4">Invoice #{data.id}</h1>
          <p className="text-gray-600">Customer: {data.customer}</p>
          <p className="text-xl font-bold mt-4">Total: ${data.total}</p>
        </Page>
      </Tailwind>
    </Document>
  );
}

export async function POST(req: Request) {
  const data: InvoiceData = await req.json();

  const pdf = await generate(<Invoice data={data} />);

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${data.id}.pdf"`,
    },
  });
}

// Optional: GET for testing
export async function GET() {
  const pdf = await generate(
    <Invoice data={{ id: '001', customer: 'Acme Corp', total: 148 }} />
  );

  return new Response(pdf, {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
```

## Running the PDF Server

`generate()` requires a running pdfn server:

**Development:**

```bash
# Terminal 1: pdfn server
npx pdfn serve

# Terminal 2: Next.js dev
npm run dev
```

**Production:**

Run `pdfn serve` as a sidecar process or separate service.

```bash
# Start both (example with concurrently)
npx concurrently "pdfn serve" "next start"
```

## HTML Preview Endpoint

Add an HTML preview for debugging:

```tsx
// app/api/invoice/route.ts
import { render, generate } from '@pdfn/react';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format');

  const invoice = <Invoice data={{ id: '001', customer: 'Acme', total: 148 }} />;

  if (format === 'html') {
    const html = await render(invoice);
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const pdf = await generate(invoice);
  return new Response(pdf, {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
```

Access:
- PDF: `/api/invoice`
- HTML: `/api/invoice?format=html`

## Template Organization

Keep templates in a dedicated folder:

```
app/
├── api/
│   └── invoice/
│       └── route.ts
├── page.tsx
└── ...

pdf-templates/
├── invoice.tsx
├── receipt.tsx
└── components/
    └── Header.tsx
```

```tsx
// app/api/invoice/route.ts
import Invoice from '@/pdf-templates/invoice';

export async function POST(req: Request) {
  const data = await req.json();
  const pdf = await generate(<Invoice data={data} />);
  // ...
}
```

## Edge Runtime

For Vercel Edge deployment, add the build plugin:

```bash
npm i @pdfn/next
```

```ts
// next.config.ts
import { withPdfnTailwind } from '@pdfn/next';

export default withPdfnTailwind()({
  // your Next.js config
});
```

**Note:** Edge runtimes can only use `render()` (HTML output). `generate()` requires Node.js runtime.

```tsx
// app/api/invoice/route.ts
export const runtime = 'edge'; // Only for render(), not generate()

import { render } from '@pdfn/react';

export async function GET() {
  const html = await render(<Invoice />);
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
```

## Client-Side Download Button

```tsx
// app/page.tsx
'use client';

export default function Page() {
  const downloadInvoice = async () => {
    const response = await fetch('/api/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '001', customer: 'Acme', total: 148 }),
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={downloadInvoice}>
      Download Invoice
    </button>
  );
}
```

## Environment Variables

```bash
# .env.local
PDFN_HOST=http://localhost:3456  # Default, change for production
```

## Deployment Checklist

1. **pdfn server** — Run `pdfn serve` as a sidecar or separate service
2. **PDFN_HOST** — Set to your pdfn server URL in production
3. **Chromium** — Ensure headless Chrome is available (Docker, Browserless, etc.)

For serverless (Vercel, AWS Lambda), consider:
- [@sparticuz/chromium](https://github.com/Sparticuz/chromium) for Lambda
- [Browserless](https://browserless.io) for managed Chromium
- Self-hosted pdfn server on a VM/container
