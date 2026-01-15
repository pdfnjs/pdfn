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

Production server for PDF generation. Requires Docker (uses [Gotenberg](https://gotenberg.dev)).

```bash
npx pdfn serve              # Start server on port 3456
npx pdfn serve --port 8080  # Custom port
```

| Option | Env Variable | Default | Description |
|--------|--------------|---------|-------------|
| `--port` | `PDFN_PORT` | `3456` | Server port |
| `--mode` | - | `production` | Environment mode (loads .env.[mode]) |

Docker runs Gotenberg which handles PDF rendering with Chromium.

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
| `report` | Sales report with charts (requires recharts) |

## Server API

Both `pdfn dev` and `pdfn serve` expose a Gotenberg-compatible API:

```bash
POST /forms/chromium/convert/html
Content-Type: multipart/form-data
# Form fields: files (index.html), waitForExpression, preferCssPageSize, printBackground
# Returns: application/pdf

GET /health
# Returns: { "status": "ok", ... }
```

The `generate()` function from `@pdfn/react` handles this API automatically.

## Embedding in Your Server

For embedding a PDF server in your Node.js application (without Docker):

```ts
import { createServer } from 'pdfn/server';

const server = createServer({ port: 3456, maxConcurrent: 10 });
await server.start();
```

This uses embedded Puppeteer and exposes both the legacy `/generate` endpoint and the Gotenberg-compatible `/forms/chromium/convert/html` endpoint.

## License

MIT
