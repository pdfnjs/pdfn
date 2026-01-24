# Getting Started

Generate your first PDF in 2 minutes.

## Installation

```bash
npm install @pdfn/react
```

## Setup

Set your API key as an environment variable:

```bash
export PDFN_API_KEY=pdfn_live_...
```

Get your API key from [console.pdfn.dev](https://console.pdfn.dev).

```typescript
import { pdfn } from '@pdfn/react';

const client = pdfn(); // Auto-reads PDFN_API_KEY
```

## Create a Template

```tsx
// pdfn-templates/invoice.tsx
import { Document, Page, PageNumber } from '@pdfn/react';

interface InvoiceProps {
  number: string;
  customer: string;
  total: number;
}

export default function Invoice({ number, customer, total }: InvoiceProps) {
  return (
    <Document title={`Invoice ${number}`}>
      <Page size="A4" margin="1in" footer={<PageNumber />}>
        <h1>Invoice {number}</h1>
        <p>Customer: {customer}</p>
        <p>Total: ${total.toFixed(2)}</p>
      </Page>
    </Document>
  );
}
```

## Generate PDF

```typescript
import { pdfn } from '@pdfn/react';
import Invoice from './pdfn-templates/invoice';
import fs from 'fs';

const client = pdfn();

const { data, error } = await client.generate(
  <Invoice number="INV-001" customer="Acme Corp" total={148} />
);

if (error) {
  console.error(error.message);
  process.exit(1);
}

fs.writeFileSync('invoice.pdf', data.buffer);
```

## Local Development

Preview templates with hot reload — no API key needed:

```bash
npx pdfn dev --open
```

```typescript
const client = pdfn(); // No PDFN_API_KEY set → uses localhost:3456
const { data } = await client.generate(<Invoice />);
```

## PDF/A Compliance

```typescript
const { data } = await client.generate(<Invoice />, {
  standard: 'PDF/A-2b',
});
```

Requires pdfn Cloud. Layout is identical.

## Next Steps

- [Components](./components.md) — Full component reference
- [Styling](./styling.md) — Tailwind, CSS, inline styles
- [Next.js](./nextjs.md) — Framework integration
- [Errors](./errors.md) — Error handling patterns
- [Self-Hosting](./self-hosting.md) — Puppeteer/Playwright guide
- [API Reference](../packages/react/README.md) — SDK details
