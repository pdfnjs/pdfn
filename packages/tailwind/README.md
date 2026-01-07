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
    <Tailwind>
      <Document>
        <Page size="A4">
          <h1 className="text-2xl font-bold text-blue-600">Invoice</h1>
          <p className="text-gray-600 mt-2">Thank you for your purchase.</p>
        </Page>
      </Document>
    </Tailwind>
  );
}
```

## Using Your Theme

Point to your CSS file to use your custom theme, fonts, and colors:

```tsx
<Tailwind css="./src/app/globals.css">
  <Document>
    <Page>
      <div className="font-inter text-brand">Uses your theme!</div>
    </Page>
  </Document>
</Tailwind>
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

If no `css` prop is provided, auto-detects from common locations:

- `./src/app/globals.css`
- `./src/styles/globals.css`
- `./app/globals.css`
- `./styles/globals.css`
- `./styles/tailwind.css`
- `./src/index.css`
- `./src/styles.css`

Falls back to default Tailwind styles if no CSS file is found.

## API

### `<Tailwind>`

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Content to render |
| `css` | `string` | Optional path to a Tailwind CSS entry file |

### `processTailwind(html, options?)`

Low-level function for advanced use cases:

```ts
import { processTailwind } from '@pdfn/tailwind';

const css = await processTailwind(html, {
  cssPath: './src/app/globals.css'
});
```

## How It Works

1. `<Tailwind>` wraps your content with a hidden marker
2. `render()` detects the marker during processing
3. Tailwind v4's `compile()` API extracts only the classes used in the document
4. Generated CSS is inlined in the final HTML

This ensures:
- Only used classes are included (small CSS output)
- Your custom theme and fonts work out of the box
- No build step required

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
