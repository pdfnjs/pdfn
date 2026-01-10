# @pdfn/vite

Vite plugin for pre-compiling Tailwind CSS at build time for edge runtimes.

## When Do You Need This?

**Only if you deploy to edge runtimes** (Cloudflare Workers, Deno Deploy, etc.).

| Setup | Plugin Needed? |
|-------|---------------|
| Inline styles only | **No** - just use `@pdfn/react` |
| Tailwind + Node.js | **No** - runtime processing works |
| Tailwind + Cloudflare Workers | **Yes** - Edge has no filesystem |
| Tailwind + Deno Deploy | **Yes** - Edge has no filesystem |

**Most Vite users don't need this plugin.** Only install if deploying to edge runtimes.

## Quick Start

```bash
npm i @pdfn/react @pdfn/tailwind @pdfn/vite
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { pdfnTailwind } from "@pdfn/vite";

export default defineConfig({
  plugins: [
    react(),
    pdfnTailwind(),
  ],
});
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
// src/generate-pdf.ts
import { generate } from "@pdfn/react";
import Invoice from "../pdfn-templates/invoice";

export async function generateInvoice() {
  const pdf = await generate(<Invoice />);
  return pdf;
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
3. Creates a virtual module with pre-compiled CSS
4. Transforms `<Tailwind>` components to use the pre-compiled CSS

## Dev Mode (HMR)

In development, the plugin:
- Recompiles CSS when template files change
- Watches `pdfn-templates/styles.css` and `pdfn-templates/styles/*.css` for changes
- Triggers a full reload to apply new styles
- Logs `[pdfn:vite] Template changed: <file>` in the console

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
pdfnTailwind({
  cssPath: "./pdfn-templates/styles.css",
})
```

## Requirements

- Vite 5+
- Tailwind CSS 4+

## License

MIT
