# pdfn

CLI for pdfn. Dev server with live preview and template scaffolding.

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

| Option | Default | Description |
|--------|---------|-------------|
| `--port` | `3456` | Server port |
| `--templates` | `./pdfn-templates` | Templates directory |
| `--open` | `false` | Open browser on start |
| `--no-open` | - | Don't open browser |

**Server API:**

```
POST /v1/generate   # HTML → PDF
GET  /health        # Health check
```

Use with `generate()` by setting `PDFN_HOST`:

```bash
PDFN_HOST=http://localhost:3456 node your-app.js
```

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

## PDF Generation

For PDF generation, choose based on your infrastructure:

**Option 1: Local dev server**

Use `pdfn dev` for development with `generate()`:

```tsx
import { generate } from '@pdfn/react';

// Set PDFN_HOST=http://localhost:3456
const pdf = await generate(<Invoice />);
```

**Option 2: Self-host with Puppeteer/Playwright**

Use `render()` to get print-ready HTML, then convert with your own browser:

```tsx
import { render } from '@pdfn/react';
import puppeteer from 'puppeteer';

const html = await render(<Invoice />);

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => window.PDFN?.ready === true);
const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
await browser.close();
```

Works with Puppeteer, Playwright, Browserless, @sparticuz/chromium, or any Chromium setup.

**Option 3: pdfn Cloud**

Let pdfn manage the browser infrastructure:

```tsx
import { generate } from '@pdfn/react';

// Set PDFN_API_KEY=pdfn_live_...
const pdf = await generate(<Invoice />);
```

Get your API key at [console.pdfn.dev](https://console.pdfn.dev).

**All options produce identical PDFs** — same templates, same output.

## License

MIT
