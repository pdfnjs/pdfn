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
    pdfnTailwind({
      templates: ["./pdf-templates/**/*.tsx"],
    }),
  ],
});
```

```tsx
// pdf-templates/invoice.tsx
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
import Invoice from "./pdf-templates/invoice";

export async function generateInvoice() {
  const pdf = await generate(<Invoice />);
  return pdf;
}
```

> **Note:** `generate()` requires a running pdfn server (`npx pdfn serve`). See [pdfn CLI](../cli).

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `templates` | `string \| string[]` | `['./pdf-templates/**/*.tsx', './src/pdf/**/*.tsx']` | Glob patterns for template files |
| `cssPath` | `string` | Auto-detected from `globals.css` etc. | Path to CSS file with Tailwind imports |

## How It Works

1. At build time, scans template files for Tailwind classes
2. Compiles CSS using Tailwind v4's `compile()` API
3. Creates a virtual module with pre-compiled CSS
4. Transforms `<Tailwind>` components to use the pre-compiled CSS

## Dev Mode (HMR)

In development, the plugin:
- Recompiles CSS when template files change
- Watches CSS files used via `cssFile` prop and triggers reload on change
- Triggers a full reload to apply new styles
- Logs `[pdfn:vite] Template changed: <file>` in the console

## Custom CSS Files

The plugin also handles `cssFile` props on `<Document>`:

```tsx
// pdf-templates/invoice.tsx
<Document title="Invoice" cssFile="./styles/invoice.css">
  <Page>
    <h1 className="invoice-header">Invoice</h1>
  </Page>
</Document>
```

At build time, the CSS file is read and inlined. In dev mode, changes to the CSS file trigger hot reload.

## Using Your Theme

Point to your CSS file to use custom colors, fonts, etc:

```ts
pdfnTailwind({
  templates: ["./pdf-templates/**/*.tsx"],
  cssPath: "./src/styles/globals.css",
})
```

Your CSS file should include Tailwind:

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-brand: #007bff;
  --font-heading: "Inter", sans-serif;
}
```

## Requirements

- Vite 5+
- Tailwind CSS 4+

## License

MIT
