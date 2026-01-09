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

## Pages

- `/` - Landing page with interactive demo
- `/templates` - Template gallery with detailed info

## Development

```bash
# From monorepo root
pnpm install

# Terminal 1: Start pdfn server (for PDF generation)
pnpm --filter pdfn exec pdfn serve

# Terminal 2: Start website
pnpm --filter web dev
```

Open http://localhost:3000

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page with demo
│   ├── templates/page.tsx    # Template gallery
│   └── api/pdf/route.tsx     # PDF generation endpoint
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── StylingBadge.tsx      # Displays styling method
├── lib/
│   └── template-code.ts      # Auto-generated template source
└── ...

pdf-templates/
├── invoice.tsx               # A4 - Tailwind
├── letter.tsx                # Letter - Inline styles
├── contract.tsx              # Legal - External CSS file
├── ticket.tsx                # A5 - Tailwind
├── poster.tsx                # Tabloid - css prop
├── styles/
│   └── contract.css          # External CSS for contract
└── components/               # Shared components
```

## Templates & Styling Approaches

Each template demonstrates a different styling method:

| Template | Size | Styling | Description |
|----------|------|---------|-------------|
| Invoice | A4 | Tailwind | `<Tailwind>` wrapper component |
| Letter | Letter | Inline | React `style={{}}` prop |
| Contract | Legal | cssFile | External CSS via `cssFile` prop |
| Ticket | A5 | Tailwind | `<Tailwind>` wrapper component |
| Poster | Tabloid | cssProp | Embedded CSS via `css` prop |

## How It Works

1. Templates are React components in `pdf-templates/`
2. API route uses `render()` for HTML preview and `generate()` for PDF
3. Demo page shows live preview with inspector panel

```tsx
// api/pdf/route.tsx
import { render, generate } from '@pdfn/react';
import Invoice from '../../../pdf-templates/invoice';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const html = searchParams.get('html');

  if (html) {
    const htmlContent = await render(<Invoice />);
    return new Response(htmlContent, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  const pdf = await generate(<Invoice />);
  return new Response(pdf, {
    headers: { 'Content-Type': 'application/pdf' }
  });
}
```

## Build

```bash
pnpm --filter web build
```

## License

MIT
