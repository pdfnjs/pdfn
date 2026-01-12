# pdfn

CLI for pdfn. Dev server with live preview, production server for PDF generation.

> For serverless deployments, use [@sparticuz/chromium](https://github.com/Sparticuz/chromium) or a hosted browser service.

## Installation

```bash
npm install -D pdfn
```

## Commands

### `pdfn dev`

Development server with live preview and hot reload.

```bash
npx pdfn dev           # Start on port 3456
npx pdfn dev --open    # Start and open browser
```

### `pdfn serve`

Production server for PDF generation (headless, no UI).

```bash
npx pdfn serve                     # Start server
npx pdfn serve --max-concurrent 10 # Concurrency limit
```

| Option | Env Variable | Default | Description |
|--------|--------------|---------|-------------|
| `--port` | `PDFN_PORT` | `3456` | Server port |
| `--max-concurrent` | `PDFN_MAX_CONCURRENT` | `5` | Max concurrent generations |
| `--timeout` | `PDFN_TIMEOUT` | `30000` | Request timeout (ms) |

### `pdfn add`

Add starter templates to your project.

```bash
npx pdfn add invoice            # Add invoice template
npx pdfn add invoice --tailwind # With Tailwind classes
npx pdfn add --list             # Show all templates
```

| Template | Description |
|----------|-------------|
| `invoice` | Professional invoice with itemized billing |
| `letter` | US business correspondence |
| `contract` | Legal service agreement |
| `ticket` | Event admission ticket |
| `poster` | Event poster (landscape) |

## Server API

```bash
POST /generate
Content-Type: application/json
{ "html": "<html>...</html>" }
# Returns: application/pdf

GET /health
# Returns: { "status": "ok", ... }
```

## Embedding in Your Server

```ts
import { createServer } from 'pdfn/server';

const server = createServer({ port: 3456 });
await server.start();
```

## License

MIT
