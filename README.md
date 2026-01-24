# pdfn

[![npm version](https://img.shields.io/npm/v/@pdfn/react.svg)](https://www.npmjs.com/package/@pdfn/react)
[![license](https://img.shields.io/npm/l/@pdfn/react.svg)](https://github.com/pdfnjs/pdfn/blob/main/LICENSE)

Generate PDFs from React components.

[Live Demo](https://pdfn.dev) · [Templates](https://pdfn.dev/templates)

## Installation

```bash
npm install @pdfn/react
```

## Quick Start

```typescript
import { pdfn, Document, Page } from '@pdfn/react';
import fs from 'fs';

const client = pdfn(); // Auto-reads PDFN_API_KEY env var

const { data, error } = await client.generate(
  <Document>
    <Page size="A4">
      <h1>Hello World</h1>
    </Page>
  </Document>
);

if (error) {
  console.error(error.message);
  process.exit(1);
}

fs.writeFileSync('output.pdf', data.buffer);
```

Set your API key as an environment variable:

```bash
export PDFN_API_KEY=pdfn_live_...
```

Get your API key at [console.pdfn.dev](https://console.pdfn.dev).

## Features

- **React components** — Write templates with JSX
- **Smart pagination** — Content never splits mid-paragraph
- **Page numbers** — `<PageNumber />` and `<TotalPages />`
- **Repeating headers/footers** — Like Word or Google Docs
- **Tailwind CSS** — Works via `@pdfn/tailwind`
- **TypeScript** — Full type definitions included
- **Flexible** — Cloud API or local development server

## Local Development

Preview templates with hot reload:

```bash
npx pdfn dev
```

No API key needed — when `PDFN_API_KEY` is not set, it uses localhost:

```typescript
const client = pdfn(); // No env var → uses localhost:3456
```

## Examples

### Create a Template

```tsx
// pdfn-templates/invoice.tsx
import { Document, Page, PageNumber } from '@pdfn/react';
import { Tailwind } from '@pdfn/tailwind';

export default function Invoice({ number, customer, total }) {
  return (
    <Document title={`Invoice ${number}`}>
      <Tailwind>
        <Page size="A4" footer={<PageNumber />}>
          <h1 className="text-2xl font-bold">Invoice {number}</h1>
          <p className="text-gray-600">Customer: {customer}</p>
          <p className="text-xl mt-4">Total: ${total}</p>
        </Page>
      </Tailwind>
    </Document>
  );
}
```

### Next.js API Route

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

### With Tailwind CSS

```bash
npm install @pdfn/tailwind
```

```typescript
import { Tailwind } from '@pdfn/tailwind';

<Document>
  <Tailwind>
    <Page size="A4">
      <h1 className="text-2xl font-bold text-blue-600">Styled PDF</h1>
    </Page>
  </Tailwind>
</Document>
```

### Self-Hosting

Need to run on your own infrastructure? See [Self-Hosting Guide](./docs/self-hosting.md).

## Components

| Component | Description |
|-----------|-------------|
| `<Document>` | Root wrapper (title, fonts) |
| `<Page>` | Page container (size, margins, header/footer) |
| `<PageNumber>` | Current page number |
| `<TotalPages>` | Total page count |
| `<PageBreak>` | Force page break |
| `<AvoidBreak>` | Keep content together |

## CLI

```bash
npx pdfn dev              # Dev server with hot reload
npx pdfn add invoice      # Add template to your project
npx pdfn add --list       # Show available templates
```

## Packages

| Package | Purpose |
|---------|---------|
| `@pdfn/react` | Core SDK |
| `@pdfn/tailwind` | Tailwind CSS support |
| `@pdfn/next` | Next.js Edge support |
| `@pdfn/vite` | Vite Edge support |

## Documentation

- [Getting Started](./docs/getting-started.md) — First PDF in 2 minutes
- [Components](./docs/components.md) — Full component reference
- [Styling](./docs/styling.md) — Tailwind, CSS, inline styles
- [Next.js](./docs/nextjs.md) — Next.js integration guide
- [Error Handling](./docs/errors.md) — Error codes and handling
- [Self-Hosting](./docs/self-hosting.md) — Puppeteer/Playwright setup

## Requirements

Node.js 22+

## License

MIT

---

[GitHub](https://github.com/pdfnjs/pdfn) · [Issues](https://github.com/pdfnjs/pdfn/issues) · [Discussions](https://github.com/pdfnjs/pdfn/discussions)
