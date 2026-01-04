# pdfn

CLI and server for pdfn - PDF generation from React components.

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

## Embedding in Your Server

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
import { Document, Page, generate } from '@pdfn/react';

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

> Note: `generate()` is now exported from `@pdfn/react`. The CLI package provides only CLI commands and server utilities.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PDFN_PORT` | `3456` | Server port |
| `PDFN_MAX_CONCURRENT` | `5` | Max concurrent PDF generations |
| `PDFN_TIMEOUT` | `30000` | Request timeout in ms |
| `DEBUG` | - | Set to `pdfn:cli` or `pdfn:*` or `pdfn` to enable debug logging |

## License

MIT
