# pdfn

CLI and PDF server for pdfn. Dev server with live preview, production server for PDF generation.

> Requires headless Chromium (Puppeteer/Playwright compatible). For serverless, use [@sparticuz/chromium](https://github.com/Sparticuz/chromium) or a hosted browser service.

## Installation

```bash
npm install -D pdfn
```

## Commands

### `pdfn dev`

Development server with live preview and hot reload. Intended for local development and template iteration only.

```bash
npx pdfn dev                    # Start on port 3456
npx pdfn dev --open             # Start and open browser
npx pdfn dev --port 4000        # Custom port
npx pdfn dev --templates ./src  # Custom templates directory
```

| Option | Default | Description |
|--------|---------|-------------|
| `--port` | `3456` | Server port |
| `--templates` | `./pdf-templates` | Templates directory |
| `--open` | `false` | Open browser automatically |

Features:
- Auto-discovers templates in your templates directory
- Live preview UI with hot reload
- Performance metrics and debug overlays
- Exposes a local `/generate` endpoint for PDF generation

### `pdfn serve`

Production server (headless, no UI). Intended for production use behind an API or worker.

```bash
npx pdfn serve                          # Start server
npx pdfn serve --port 3456              # Custom port
npx pdfn serve --max-concurrent 10      # Concurrency limit
```

| Option | Env Variable | Default | Description |
|--------|--------------|---------|-------------|
| `--port` | `PDFN_PORT` | `3456` | Server port |
| `--max-concurrent` | `PDFN_MAX_CONCURRENT` | `5` | Max concurrent PDF generations |
| `--timeout` | `PDFN_TIMEOUT` | `30000` | Request timeout in ms |

### `pdfn add`

Add starter templates to your project.

```bash
npx pdfn add invoice            # Add invoice template (inline styles)
npx pdfn add invoice --tailwind # Add with Tailwind classes
npx pdfn add letter             # Add business letter
npx pdfn add contract           # Add contract template
npx pdfn add ticket             # Add event ticket
npx pdfn add poster             # Add poster template
npx pdfn add --list             # Show all templates
npx pdfn add invoice --output ./src/templates
```

| Option | Default | Description |
|--------|---------|-------------|
| `--inline` | ✓ | Use inline styles (default, no extra dependencies) |
| `--tailwind` | | Use Tailwind CSS classes (requires `@pdfn/tailwind`) |
| `--output` | `./pdf-templates` | Output directory |
| `--force` | | Overwrite existing files |

| Template | Description | Page Size |
|----------|-------------|-----------|
| `invoice` | Professional invoice with itemized billing | A4 |
| `letter` | US business correspondence | Letter |
| `contract` | Legal service agreement | Legal |
| `ticket` | Event admission ticket | A5 |
| `poster` | Event poster (landscape) | Tabloid |

## Server API

```bash
# Generate PDF from HTML
POST /generate
Content-Type: application/json
{ "html": "<html>...</html>" }
# HTML must be print-ready and fully self-contained (fonts/images embedded)
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

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PDFN_PORT` | `3456` | Server port |
| `PDFN_MAX_CONCURRENT` | `5` | Max concurrent PDF generations |
| `PDFN_TIMEOUT` | `30000` | Request timeout in ms |
| `DEBUG` | - | Set to `pdfn:cli` or `pdfn:*` to enable logging |

## License

MIT
