# pdfn Website

Official website and interactive demo for pdfn.

**Write PDF templates as React components. Ship consistent PDFs.**

## Features

- Live template demos with real-time preview
- Multiple styling approaches showcased (Tailwind, inline, cssFile, cssProp)
- Debug overlays (grid, margins, headers, page breaks)
- Template source code viewer with syntax highlighting
- Performance metrics (render time, pagination, pages)
- One-click PDF download
- Zoom controls (Fit / 100%)
- Free PDF/A & PDF/UA validator tool

## Pages

- `/` - Landing page with interactive demo
- `/templates` - Template gallery with detailed info
- `/components` - Component documentation
- `/tools/pdf-validator` - Free PDF/A & PDF/UA compliance checker

## Development

```bash
# From monorepo root
pnpm install

# Terminal 1: Start local pdfn server
npx pdfn dev

# Terminal 2: Start website
pnpm --filter web dev
```

Open http://localhost:3000

For production, you can use pdfn Cloud (`PDFN_API_KEY`) or self-host with Puppeteer/Gotenberg.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page with demo
│   ├── templates/page.tsx          # Template gallery
│   ├── components/page.tsx         # Component documentation
│   ├── tools/
│   │   └── pdf-validator/          # PDF/A & PDF/UA validator
│   │       ├── page.tsx
│   │       └── layout.tsx
│   └── api/pdf/route.tsx           # PDF generation endpoint
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── StylingBadge.tsx            # Displays styling method
├── lib/
│   └── template-code.ts            # Auto-generated template source
└── ...

pdfn-templates/
├── styles.css                # Shared styles (Tailwind + fonts)
├── invoice.tsx               # A4 - Tailwind
├── letter.tsx                # Letter - Inline styles
├── contract.tsx              # Legal - Tailwind + plain CSS
├── ticket.tsx                # A5 - Tailwind
├── poster.tsx                # Tabloid - css prop
├── styles/
│   └── contract.css          # Plain CSS for contract
└── components/               # Shared components
```

## Templates & Styling Approaches

Each template demonstrates a different styling method:

| Template | Size | Styling | Description |
|----------|------|---------|-------------|
| Invoice | A4 | Tailwind | `<Tailwind>` wrapper with vanilla classes |
| Letter | Letter | Inline | React `style={{}}` prop |
| Contract | Legal | Tailwind | `<Tailwind>` + plain CSS via `styles/contract.css` |
| Ticket | A5 | Tailwind | `<Tailwind>` with custom fonts from `styles.css` |
| Poster | Tabloid | cssProp | Embedded CSS via Document's `css` prop |

## How It Works

1. Templates are React components in `pdfn-templates/`
2. API route uses `client.render()` for HTML preview and `client.generate()` for PDF
3. Demo page shows live preview with inspector panel

```tsx
// api/pdf/route.tsx
import { pdfn } from '@pdfn/react';
import Invoice from '../../../pdfn-templates/invoice';

const client = process.env.PDFN_API_KEY
  ? pdfn(process.env.PDFN_API_KEY)
  : pdfn();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const html = searchParams.get('html');

  if (html) {
    const { data, error } = await client.render({ react: <Invoice /> });
    if (error) {
      return new Response(error.message, { status: 500 });
    }
    return new Response(data.html, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  const { data, error } = await client.generate({ react: <Invoice /> });
  if (error) {
    return new Response(error.message, { status: 500 });
  }
  return new Response(data.buffer, {
    headers: { 'Content-Type': 'application/pdf' }
  });
}
```

## PDF Validator Tool

Free online tool to validate PDF compliance at `/tools/pdf-validator`.

**Supported Standards:**

| Type | Profiles |
|------|----------|
| PDF/A (Archival) | 1a, 1b, 2a, 2b, 2u, 3a, 3b, 4 |
| PDF/UA (Accessibility) | UA-1, UA-2 |

**Features:**
- Drag & drop or click to upload (max 100 MB)
- Grouped profile selector with recommended defaults
- Detailed issue reporting with descriptions
- Files are not stored on servers

**API Endpoint:**
```bash
# Validate PDF/A-2b (most common)
curl -X POST "https://api.pdfn.dev/v1/validate?profile=2b" -F "file=@document.pdf"

# Validate PDF/UA-1 (accessibility)
curl -X POST "https://api.pdfn.dev/v1/validate?profile=ua1" -F "file=@document.pdf"
```

## Build

```bash
pnpm --filter web build
```

## License

MIT
