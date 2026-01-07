# @pdfn/tailwind

Tailwind CSS support for pdfn. Use Tailwind classes in your PDF templates.

> **Server-only** - Tailwind processing happens during HTML generation and cannot run in the browser.

## Installation

```bash
npm install @pdfn/tailwind
```

## Quick Start

Wrap your template with `<Tailwind>` to enable Tailwind classes:

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

## Using Your Theme

Point to your CSS file to use your custom theme, fonts, and colors:

```tsx
<Document>
  <Tailwind css="./src/app/globals.css">
    <Page>
      <div className="font-inter text-brand">Uses your theme!</div>
    </Page>
  </Tailwind>
</Document>
```

Your CSS file should include Tailwind and any customizations:

```css
/* globals.css */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
@import "tailwindcss";

@theme {
  --font-inter: "Inter", var(--font-sans);
  --color-brand: #007bff;
}
```

## Auto-detection

If no `css` prop is provided, auto-detects from common locations like `./src/app/globals.css`, `./app/globals.css`, etc. Falls back to default Tailwind styles if no CSS file is found.

## API

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Content to render |
| `css` | `string` | Optional path to a Tailwind CSS entry file |

## Deployment Compatibility

| Environment | Works? | Notes |
|-------------|--------|-------|
| Node.js (local, Vercel, any server) | ✅ Yes | Runtime processing works |
| Vercel Edge | ❌ No | No filesystem, use `@pdfn/next` |
| Cloudflare Workers | ❌ No | No filesystem, use `@pdfn/vite` |

**Most users don't need build plugins.** Only edge runtimes require pre-compilation.

## Edge Runtime Deployment

For edge runtimes only (routes with `export const runtime = 'edge'`):

```bash
# Next.js Edge
npm i @pdfn/tailwind @pdfn/next

# Vite / Cloudflare Workers
npm i @pdfn/tailwind @pdfn/vite
```

See [@pdfn/next](../next) and [@pdfn/vite](../vite) for build configuration.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | - | Set to `pdfn:tailwind` or `pdfn:*` to enable logging |

## License

MIT
