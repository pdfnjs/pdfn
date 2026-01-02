# @pdfx-dev/cli

CLI and server for PDFX - PDF generation from React components.

## Installation

```bash
npm install -D @pdfx-dev/cli
```

## Commands

After installing, you can use `pdfx-dev` directly or `npx @pdfx-dev/cli`:

### `pdfx-dev dev`

Start the development server with a preview UI and hot reload.

```bash
npx @pdfx-dev/cli dev
npx @pdfx-dev/cli dev --port 4000
npx @pdfx-dev/cli dev --templates ./src/pdf
npx @pdfx-dev/cli dev --no-open     # Don't auto-open browser

# Or after installing:
pdfx-dev dev
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

### `pdfx-dev serve`

Start the production server (headless, no UI).

```bash
npx @pdfx-dev/cli serve
npx @pdfx-dev/cli serve --port 3456
npx @pdfx-dev/cli serve --max-concurrent 10

# Or after installing:
pdfx-dev serve
```

**Options:**

| Option | Env Variable | Default | Description |
|--------|--------------|---------|-------------|
| `--port` | `PDFX_PORT` | 3456 | Server port |
| `--max-concurrent` | `PDFX_MAX_CONCURRENT` | 5 | Max concurrent PDF generations |
| `--timeout` | `PDFX_TIMEOUT` | 30000 | Request timeout in ms |

### `pdfx-dev add`

Add starter templates to your project.

```bash
npx @pdfx-dev/cli add invoice       # Add invoice template
npx @pdfx-dev/cli add --list        # Show available templates

# Or after installing:
pdfx-dev add invoice
pdfx-dev add letter
pdfx-dev add contract
pdfx-dev add ticket
pdfx-dev add poster
pdfx-dev add --list
pdfx-dev add invoice --output ./src/templates
pdfx-dev add invoice --force
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

Generate a PDF from a React element. Requires `PDFX_HOST` environment variable.

```tsx
import { Document, Page } from '@pdfx-dev/react';
import { generate } from '@pdfx-dev/cli';

process.env.PDFX_HOST = 'http://localhost:3456';

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
  host?: string;  // Override PDFX_HOST
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
import { createServer } from '@pdfx-dev/cli/server';

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
import { Document, Page } from '@pdfx-dev/react';
import { generate } from '@pdfx-dev/cli';

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
docker run -p 3456:3456 ghcr.io/pdfx-dev/cli serve
```

## License

MIT
