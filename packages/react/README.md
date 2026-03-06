# @pdfn/react

Node.js SDK for pdfn. Generate PDFs from React components.

## Installation

```bash
npm install @pdfn/react
```

## Quick Start

```typescript
import { pdfn, Document, Page } from '@pdfn/react';
import fs from 'fs';

const client = pdfn(); // Auto-reads PDFN_API_KEY env var

const { data, error } = await client.generate({
  react: (
    <Document>
      <Page size="A4">
        <h1>Hello World</h1>
      </Page>
    </Document>
  ),
});

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

## Local Development

No API key needed — just start the dev server:

```bash
npx pdfn dev
```

```typescript
const client = pdfn(); // No PDFN_API_KEY set → uses localhost:3456
```

## Examples

### With Tailwind CSS

```bash
npm install @pdfn/tailwind
```

```typescript
import { Tailwind } from '@pdfn/tailwind';

const { data } = await client.generate({
  react: (
    <Document>
      <Tailwind>
        <Page size="A4">
          <h1 className="text-2xl font-bold">Styled PDF</h1>
        </Page>
      </Tailwind>
    </Document>
  ),
});
```

### With Page Numbers

```typescript
import { Document, Page, PageNumber, TotalPages } from '@pdfn/react';

<Page
  size="A4"
  footer={
    <div>
      Page <PageNumber /> of <TotalPages />
    </div>
  }
>
  {/* content */}
</Page>
```

## Error Handling

```typescript
const { data, error } = await client.generate({ react: <Invoice /> });

if (error) {
  console.error(error.code);    // "authentication_error"
  console.error(error.message); // "Invalid API key."
  console.error(error.suggestion); // "Check your PDFN_API_KEY..."
  return;
}

fs.writeFileSync('invoice.pdf', data.buffer);
```

Error codes: `configuration_error`, `validation_error`, `authentication_error`, `rate_limit_error`, `timeout_error`, `server_error`, `network_error`, `render_error`

## API Reference

### `pdfn()`

```typescript
pdfn()                              // Auto-reads PDFN_API_KEY, falls back to localhost
pdfn('pdfn_live_...')               // Explicit API key
pdfn({ apiKey, baseUrl, timeout })  // Custom config
```

### `client.generate()`

```typescript
const { data, error } = await client.generate({
  react: <Invoice />,
  standard: 'PDF/A-2b',  // Archival compliance
  timeout: 60000,
});
```

### `client.render()`

```typescript
const { data, error } = await client.render({ react: <Invoice /> });
// data.html = self-contained HTML string
```

## Components

| Component | Description |
|-----------|-------------|
| `<Document>` | Root wrapper (title, fonts, metadata) |
| `<Page>` | Page container (size, margins, header/footer) |
| `<PageNumber>` | Current page number |
| `<TotalPages>` | Total page count |
| `<PageBreak>` | Force page break |
| `<NoBreak>` | Keep content together |
| `<Thead>` | Repeating table header |

## Page Sizes

`A4` · `Letter` · `Legal` · `A3` · `A5` · `Tabloid` · `B4` · `B5` · `['6in', '9in']`

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  PdfnClient,
  PdfnConfig,
  PdfnError,
  GenerateResponse,
  RenderResponse,
  DocumentProps,
  PageProps,
} from '@pdfn/react';
```

## Requirements

- Node.js 22+
- React 18 or 19

## License

MIT
