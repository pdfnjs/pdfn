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

Create `pdfn-templates/styles.css` with your custom theme, fonts, and colors:

```css
/* pdfn-templates/styles.css */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
@import "tailwindcss";

@theme {
  --font-inter: "Inter", var(--font-sans);
  --color-brand: #007bff;
}

/* Import plain CSS files */
@import "./styles/contract.css";
```

This file is automatically detected when you use `<Tailwind>`:

```tsx
<Document>
  <Tailwind>
    <Page>
      <div className="font-inter text-brand">Uses your theme!</div>
    </Page>
  </Tailwind>
</Document>
```

## CSS Auto-detection

The `<Tailwind>` component looks for `./pdfn-templates/styles.css` in your project root. If found, it uses that file for Tailwind processing. If not found, it uses vanilla Tailwind (`@import "tailwindcss"`).

This keeps your PDF template styles isolated from your web app's `globals.css`.

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
