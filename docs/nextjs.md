# Next.js Integration

This guide covers integrating pdfn with Next.js App Router.

## Installation

```bash
npm i @pdfn/react @pdfn/tailwind @pdfn/next
```

## Build Configuration

Add the pdfn plugin to your Next.js config:

```ts
// next.config.ts
import type { NextConfig } from 'next';
import { withPdfn } from '@pdfn/next';

const nextConfig: NextConfig = {
  // your config
};

export default withPdfn()(nextConfig);
```

This enables Tailwind pre-compilation and client component support (charts, hooks).

## API Route (App Router)

Create an API route to generate PDFs:

```tsx
// app/api/invoice/route.tsx
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

  return new Response(new Uint8Array(pdf), {
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

  return new Response(new Uint8Array(pdf), {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
```

## PDF Generation Options

**Option 1: Local Development**

Use the dev server with `generate()`:

```bash
# Terminal 1: Start dev server
npx pdfn dev

# Terminal 2: Start Next.js
PDFN_HOST=http://localhost:3456 npm run dev
```

**Option 2: Self-host with Puppeteer**

Use `render()` to get print-ready HTML, then convert with your own browser:

```tsx
import { render } from '@pdfn/react';
import puppeteer from 'puppeteer';

export async function GET() {
  const html = await render(<Invoice />);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.PDFN?.ready === true);
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  await browser.close();

  return new Response(pdf, { headers: { 'Content-Type': 'application/pdf' } });
}
```

**Option 3: pdfn Cloud**

Use `generate()` for managed PDF generation:

```bash
# .env.local
PDFN_API_KEY=pdfn_live_...
```

Get an API key at [console.pdfn.dev](https://console.pdfn.dev).

## HTML Preview Endpoint

Add an HTML preview for debugging:

```tsx
// app/api/invoice/route.tsx
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
  return new Response(new Uint8Array(pdf), {
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
│       └── route.tsx
├── page.tsx
└── ...

pdfn-templates/
├── invoice.tsx
├── receipt.tsx
└── components/
    └── Header.tsx
```

```tsx
// app/api/invoice/route.tsx
import Invoice from '@/pdfn-templates/invoice';

export async function POST(req: Request) {
  const data = await req.json();
  const pdf = await generate(<Invoice data={data} />);
  // ...
}
```

## Client Components (Charts, Hooks)

Templates with React hooks (Recharts, Chart.js, etc.) work automatically with the build config above.

Create a template with the `"use client"` directive:

```tsx
// pdfn-templates/report.tsx
"use client";

import { Document, Page } from '@pdfn/react';
import { Tailwind } from '@pdfn/tailwind';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
];

export default function Report() {
  return (
    <Document title="Sales Report">
      <Tailwind>
        <Page size="A4" margin="1in">
          <h1 className="text-2xl font-bold mb-6">Sales Report</h1>
          <BarChart width={500} height={300} data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </Page>
      </Tailwind>
    </Document>
  );
}
```

For charts, install recharts: `npm i recharts`

## Edge Runtime

The build config above also enables Vercel Edge deployment.

**Note:** Edge runtimes can only use `render()` (HTML output). `generate()` requires Node.js runtime.

```tsx
// app/api/invoice/route.tsx
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

# Option 1: Local development
PDFN_HOST=http://localhost:3456

# Option 2: pdfn Cloud (production)
PDFN_API_KEY=pdfn_live_...
```

## Deployment Checklist

**Using pdfn Cloud:**
1. Set `PDFN_API_KEY` environment variable
2. That's it — pdfn Cloud handles everything

**Self-hosting:**
1. Set up Puppeteer/Playwright in your infrastructure
2. Use `render()` to get HTML, then convert with your own browser
3. See [self-hosting docs](https://pdfn.dev/docs/self-hosting)
