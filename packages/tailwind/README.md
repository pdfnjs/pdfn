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

## Serverless / Edge Deployment

Runtime Tailwind compilation requires Node.js APIs. For serverless or edge deployments, use a build plugin instead:

- **Next.js:** `npm i @pdfn/react @pdfn/next` - see [@pdfn/next](../next)
- **Vite:** `npm i @pdfn/react @pdfn/vite` - see [@pdfn/vite](../vite)

Both plugins include `@pdfn/tailwind` - no separate install needed:

```tsx
import { Tailwind } from "@pdfn/next";  // or "@pdfn/vite"
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | - | Set to `pdfn:tailwind` or `pdfn:*` to enable logging |

## License

MIT
