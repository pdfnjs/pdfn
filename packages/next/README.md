# @pdfn/next

Next.js plugin for pre-compiling Tailwind CSS at build time for Vercel Edge.

## When Do You Need This?

**Only if you use Vercel Edge runtime** (routes with `export const runtime = 'edge'`).

| Setup | Plugin Needed? |
|-------|---------------|
| Inline styles only | **No** - just use `@pdfn/react` |
| Tailwind + Node.js | **No** - runtime processing works |
| Tailwind + Vercel Edge | **Yes** - Edge has no filesystem |

**Most Next.js users don't need this plugin.** Only add it if using Edge runtime.

## Quick Start

```bash
npm i @pdfn/react @pdfn/tailwind @pdfn/next
```

```ts
// next.config.ts
import type { NextConfig } from "next";
import { withPdfnTailwind } from "@pdfn/next";

const nextConfig: NextConfig = {
  // your config
};

export default withPdfnTailwind()(nextConfig);
```

```tsx
// pdfn-templates/invoice.tsx
import { Document, Page } from "@pdfn/react";
import { Tailwind } from "@pdfn/tailwind";  // Always import from @pdfn/tailwind

export default function Invoice() {
  return (
    <Document>
      <Tailwind>
        <Page size="A4">
          <h1 className="text-2xl font-bold">Invoice</h1>
        </Page>
      </Tailwind>
    </Document>
  );
}
```

```tsx
// app/api/invoice/route.ts
import { generate } from "@pdfn/react";
import Invoice from "@/pdfn-templates/invoice";

export async function GET() {
  const pdf = await generate(<Invoice />);

  return new Response(pdf, {
    headers: { "Content-Type": "application/pdf" },
  });
}
```

> **Note:** `generate()` requires a running pdfn server (`npx pdfn serve`). See [pdfn CLI](../cli).

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `templates` | `string \| string[]` | `['./pdfn-templates/**/*.tsx']` | Glob patterns for template files |
| `cssPath` | `string` | `./pdfn-templates/styles.css` | Path to CSS file with Tailwind imports |
| `debug` | `boolean` | `false` | Enable debug logging |

## How It Works

1. At build time, scans template files for Tailwind classes
2. Compiles CSS using Tailwind v4's `compile()` API
3. Writes pre-compiled CSS to `node_modules/.pdfn/tailwind.js`
4. Configures loader to inject CSS into `<Tailwind>` components

## Dev Mode (HMR)

In development (`NODE_ENV !== 'production'`), the plugin:
- Watches template directories for file changes
- Watches `pdfn-templates/styles.css` and `pdfn-templates/styles/*.css`
- Recompiles CSS when `.tsx`, `.ts`, `.jsx`, `.js` files change
- Logs recompilation status in the console

```
[pdfn:next] Using CSS file: ./pdfn-templates/styles.css
[pdfn:next] Compiled 20589 bytes of CSS from 142 classes in 6 files
[pdfn:next] Watching for changes: /path/to/pdfn-templates
```

## Using Your Theme

Create `pdfn-templates/styles.css` with your custom theme:

```css
/* pdfn-templates/styles.css */
@import url("https://fonts.googleapis.com/css2?family=Inter&display=swap");
@import "tailwindcss";

@theme {
  --font-inter: "Inter", var(--font-sans);
  --color-brand: #007bff;
}

/* Import plain CSS for specific templates */
@import "./styles/contract.css";
```

This file is auto-detected by the plugin. You can also explicitly set the path:

```ts
export default withPdfnTailwind({
  cssPath: "./pdfn-templates/styles.css",
})(nextConfig);
```

## Requirements

- Next.js 14+ (Turbopack fully supported in 16+)
- Tailwind CSS 4+

## License

MIT
