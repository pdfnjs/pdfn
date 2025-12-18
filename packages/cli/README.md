# @pdfx-dev/cli

CLI and server for PDFX - PDF generation from React components.

> **Alpha Release** - The `serve` command works. `dev` and `add` commands are coming soon.

## Installation

```bash
npm install -D @pdfx-dev/cli
```

## Commands

### `pdfx serve`

Start the PDF generation server.

```bash
npx pdfx serve
npx pdfx serve --port 3456
npx pdfx serve --max-concurrent 10
npx pdfx serve --timeout 60000
```

**Options:**

| Option | Env Variable | Default | Description |
|--------|--------------|---------|-------------|
| `--port` | `PDFX_PORT` | 3456 | Server port |
| `--max-concurrent` | `PDFX_MAX_CONCURRENT` | 5 | Max concurrent PDF generations |
| `--timeout` | `PDFX_TIMEOUT` | 30000 | Request timeout in ms |

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

## Usage with @pdfx-dev/react

```tsx
import { generate, Document, Page } from '@pdfx-dev/react';

process.env.PDFX_HOST = 'http://localhost:3456';

const pdf = await generate(
  <Document>
    <Page>
      <h1>Hello World</h1>
    </Page>
  </Document>
);
```

## Embedding in Your Server

```ts
import { createServer } from '@pdfx-dev/cli/server';

const pdfServer = createServer({ port: 3456 });
await pdfServer.start();

// Or mount routes in Express
app.use('/pdf', pdfServer.routes);
```

## Docker (Coming Soon)

```bash
docker run -p 3456:3456 ghcr.io/pdfx-dev/cli serve
```

## License

MIT
