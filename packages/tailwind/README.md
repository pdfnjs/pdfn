# @pdfn/tailwind

Tailwind CSS support for pdfn.

> **Server-only** — Tailwind processing runs during HTML generation, not in browsers.

## Installation

```bash
npm install @pdfn/tailwind
```

## Quick Start

Wrap your template with `<Tailwind>`:

```tsx
import { Document, Page } from '@pdfn/react';
import { Tailwind } from '@pdfn/tailwind';

function Invoice() {
  return (
    <Document>
      <Tailwind>
        <Page size="A4">
          <h1 className="text-2xl font-bold text-blue-600">Invoice</h1>
          <p className="text-gray-600 mt-2">Thank you for your purchase.</p>
        </Page>
      </Tailwind>
    </Document>
  );
}
```

## Custom Theme

Create `pdfn-templates/styles.css` for custom fonts and colors:

```css
/* pdfn-templates/styles.css */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
@import "tailwindcss";

@theme {
  --font-inter: "Inter", var(--font-sans);
  --color-brand: #007bff;
}
```

This file is auto-detected when you use `<Tailwind>`.

## Edge Runtimes

`@pdfn/tailwind` works on Node.js but not on edge runtimes (no filesystem).

For Vercel Edge or Cloudflare Workers, add a build plugin:

```bash
# Next.js
npm i @pdfn/next

# Vite
npm i @pdfn/vite
```

See [@pdfn/next](../next) or [@pdfn/vite](../vite) for setup.

## License

MIT
