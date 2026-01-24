# Next.js Integration

## Installation

```bash
npm install @pdfn/react @pdfn/tailwind
```

## Create a Template

```tsx
// pdfn-templates/invoice.tsx
import { Document, Page, PageNumber } from '@pdfn/react';
import { Tailwind } from '@pdfn/tailwind';

interface InvoiceProps {
  number: string;
  customer: string;
  total: number;
}

export default function Invoice({ number, customer, total }: InvoiceProps) {
  return (
    <Document title={`Invoice ${number}`}>
      <Tailwind>
        <Page size="A4" footer={<PageNumber />}>
          <h1 className="text-2xl font-bold">Invoice {number}</h1>
          <p className="text-gray-600">Customer: {customer}</p>
          <p className="text-xl font-bold mt-4">Total: ${total}</p>
        </Page>
      </Tailwind>
    </Document>
  );
}
```

## App Router

```tsx
// app/api/invoice/route.tsx
import { pdfn } from '@pdfn/react';
import Invoice from '@/pdfn-templates/invoice';

const client = pdfn(process.env.PDFN_API_KEY);

export async function GET() {
  const { data, error } = await client.generate(
    <Invoice number="INV-001" customer="Acme Corp" total={1500} />
  );

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response(data.buffer, {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
```

## Pages Router

```tsx
// pages/api/invoice.tsx
import type { NextApiRequest, NextApiResponse } from 'next';
import { pdfn } from '@pdfn/react';
import Invoice from '@/pdfn-templates/invoice';

const client = pdfn(process.env.PDFN_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data, error } = await client.generate(
    <Invoice number="INV-001" customer="Acme Corp" total={1500} />
  );

  if (error) {
    return res.status(500).send(error.message);
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(data.buffer));
}
```

## Local Development

```bash
# Terminal 1
npx pdfn dev

# Terminal 2
npm run dev
```

```typescript
const client = pdfn(); // Uses localhost:3456
```

## Environment Variables

```bash
# .env.local
PDFN_API_KEY=pdfn_live_...
```

Get your key at [console.pdfn.dev](https://console.pdfn.dev).

## Project Structure

```
# App Router
app/
├── api/invoice/route.tsx
└── page.tsx

# Pages Router
pages/
├── api/invoice.tsx
└── index.tsx

# Shared templates (used by both)
pdfn-templates/
├── invoice.tsx
├── receipt.tsx
└── components/
    └── Header.tsx
```

## Dynamic Data

```tsx
// app/api/invoice/route.tsx
export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await client.generate(
    <Invoice
      number={body.invoiceNumber}
      customer={body.customerName}
      total={body.total}
    />
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return new Response(data.buffer, {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
```

## HTML Preview

### App Router

```tsx
// app/api/invoice/route.tsx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  if (searchParams.get('format') === 'html') {
    const { data, error } = await client.render(<Invoice {...props} />);
    if (error) return new Response(error.message, { status: 500 });
    return new Response(data.html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const { data, error } = await client.generate(<Invoice {...props} />);
  if (error) return new Response(error.message, { status: 500 });
  return new Response(data.buffer, {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
```

### Pages Router

```tsx
// pages/api/invoice.tsx
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { format } = req.query;

  if (format === 'html') {
    const { data, error } = await client.render(<Invoice {...props} />);
    if (error) return res.status(500).send(error.message);
    res.setHeader('Content-Type', 'text/html');
    return res.send(data.html);
  }

  const { data, error } = await client.generate(<Invoice {...props} />);
  if (error) return res.status(500).send(error.message);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(data.buffer));
}
```

## Edge Runtime (Vercel Edge)

For deploying to Vercel Edge, add the Next.js plugin:

```bash
npm install @pdfn/next
```

```ts
// next.config.ts
import { withPdfn } from '@pdfn/next';

export default withPdfn()(nextConfig);
```

This pre-compiles Tailwind CSS at build time (required for edge runtimes without filesystem access).

## Client Components (Charts)

For templates with React hooks (Recharts, Chart.js):

```tsx
// pdfn-templates/report.tsx
"use client";

import { Document, Page } from '@pdfn/react';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

interface ReportProps {
  data: Array<{ name: string; value: number }>;
}

export default function Report({ data }: ReportProps) {
  return (
    <Document>
      <Page size="A4">
        <h1 className="text-2xl font-bold mb-4">Monthly Report</h1>
        <BarChart width={500} height={300} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </Page>
    </Document>
  );
}
```

## Download Button

### App Router

```tsx
// app/page.tsx
'use client';

export default function Page() {
  const download = async () => {
    const res = await fetch('/api/invoice');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice.pdf';
    a.click();
  };

  return <button onClick={download}>Download PDF</button>;
}
```

### Pages Router

```tsx
// pages/index.tsx
export default function Home() {
  const download = async () => {
    const res = await fetch('/api/invoice');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice.pdf';
    a.click();
  };

  return <button onClick={download}>Download PDF</button>;
}
```
