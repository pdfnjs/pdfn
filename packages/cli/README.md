# pdfn

CLI and server for PDFN - PDF generation from React components.

## Installation

```bash
npm install -D pdfn
```

## Commands

After installing, you can use `pdfn` directly or `npx pdfn`:

### `pdfn dev`

Start the development server with a preview UI and hot reload.

```bash
npx pdfn dev
npx pdfn dev --port 4000
npx pdfn dev --templates ./src/pdf
npx pdfn dev --no-open     # Don't auto-open browser

# Or after installing:
pdfn dev
```

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `--port` | 3456 | Server port |
| `--templates` | `./pdf-templates` | Templates directory |
| `--no-open` | false | Don't auto-open browser |

The dev server:
- Auto-discovers templates in your templates directory
- Provides a live preview UI with hot reload
- Shows performance metrics and debug overlays
- Exposes `/generate` endpoint for PDF generation

### `pdfn serve`

Start the production server (headless, no UI).

```bash
npx pdfn serve
npx pdfn serve --port 3456
npx pdfn serve --max-concurrent 10

# Or after installing:
pdfn serve
```

**Options:**

| Option | Env Variable | Default | Description |
|--------|--------------|---------|-------------|
| `--port` | `PDFN_PORT` | 3456 | Server port |
| `--max-concurrent` | `PDFN_MAX_CONCURRENT` | 5 | Max concurrent PDF generations |
| `--timeout` | `PDFN_TIMEOUT` | 30000 | Request timeout in ms |

### `pdfn add`

Add starter templates to your project.

```bash
npx pdfn add invoice       # Add invoice template
npx pdfn add --list        # Show available templates

# Or after installing:
pdfn add invoice
pdfn add letter
pdfn add contract
pdfn add ticket
pdfn add poster
pdfn add --list
pdfn add invoice --output ./src/templates
pdfn add invoice --force
```

**Available Templates:**

| Template | Description | Page Size |
|----------|-------------|-----------|
| `invoice` | Professional invoice with itemized billing | A4 |
| `letter` | US business correspondence | Letter |
| `contract` | Legal service agreement with terms | Legal |
| `ticket` | Event admission ticket with QR placeholder | A5 |
| `poster` | Event poster (landscape) | Tabloid |

### Server Endpoints

```bash
# Generate PDF from HTML
POST /generate
Content-Type: application/json
{ "html": "<html>...</html>" }
# Returns: application/pdf

# Health check
GET /health
# Returns: { "status": "ok", "browser": "connected", ... }
```

## Programmatic API

### `generate(element, options?)`

Generate a PDF from a React element. Requires `PDFN_HOST` environment variable.

```tsx
import { Document, Page } from '@pdfn/react';
import { generate } from 'pdfn';

process.env.PDFN_HOST = 'http://localhost:3456';

const pdf = await generate(
  <Document>
    <Page size="A4">
      <h1>Hello World</h1>
    </Page>
  </Document>
);
```

**Options:**

```ts
interface GenerateOptions {
  output?: 'pdf' | 'html';  // Output format (default: 'pdf')
  debug?: boolean | DebugOptions;  // Enable debug overlays
  host?: string;  // Override PDFN_HOST
  pdf?: {
    printBackground?: boolean;  // Print background graphics (default: true)
    preferCSSPageSize?: boolean;  // Use CSS page size (default: true)
  };
}

interface DebugOptions {
  grid?: boolean;     // Show grid overlay
  margins?: boolean;  // Highlight margins
  headers?: boolean;  // Highlight headers/footers
  breaks?: boolean;   // Show page break indicators
}
```

**Examples:**

```tsx
// Generate PDF (default)
const pdf = await generate(<Invoice data={data} />);

// Generate HTML for preview
const html = await generate(<Invoice data={data} />, { output: 'html' });

// Generate with debug overlays
const pdf = await generate(<Invoice data={data} />, {
  debug: { grid: true, margins: true }
});
```

### Embedding in Your Server

```ts
import { createServer } from 'pdfn/server';

const server = createServer({
  port: 3456,
  maxConcurrent: 10,
  timeout: 30000
});

await server.start();
```

## Usage with Next.js

```tsx
// app/api/invoice/route.ts
import { Document, Page } from '@pdfn/react';
import { generate } from 'pdfn';

export async function POST(req: Request) {
  const data = await req.json();

  const pdf = await generate(
    <Document>
      <Page size="A4">
        <h1>Invoice #{data.id}</h1>
      </Page>
    </Document>
  );

  return new Response(pdf, {
    headers: { 'Content-Type': 'application/pdf' }
  });
}
```

## Docker

Docker support coming soon.

```bash
# Coming soon
docker run -p 3456:3456 ghcr.io/pdfnjs/cli serve
```

## License

MIT
