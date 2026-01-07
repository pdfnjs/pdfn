# @pdfn/vite

Vite plugin for pre-compiling Tailwind CSS at build time.

## When Do You Need This?

**Only if you use `@pdfn/tailwind`** and deploy to serverless/edge environments.

| Setup | Plugin Needed? |
|-------|---------------|
| Inline styles only | **No** - just use `@pdfn/react` |
| Tailwind + local Node.js | **No** - runtime compilation works |
| Tailwind + Vercel/serverless | **Yes** |
| Tailwind + Edge runtime | **Yes** |

## Quick Start

```bash
npm i @pdfn/react @pdfn/vite
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
import { Tailwind } from "@pdfn/vite";  // Tailwind included, no extra install

export default function Invoice() {
  return (
    <Tailwind>
      <Document>
        <Page size="A4">
          <h1 className="text-2xl font-bold">Invoice</h1>
        </Page>
      </Document>
    </Tailwind>
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

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `templates` | `string \| string[]` | `['./pdf-templates/**/*.tsx', './src/pdf/**/*.tsx']` | Glob patterns for template files |
| `cssPath` | `string` | Auto-detected | Path to CSS file with Tailwind imports |

## How It Works

1. At build time, scans template files for Tailwind classes
2. Compiles CSS using Tailwind v4's `compile()` API
3. Creates a virtual module with pre-compiled CSS
4. Transforms `<Tailwind>` components to use the pre-compiled CSS

## Dev Mode (HMR)

In development, the plugin:
- Recompiles CSS when template files change
- Triggers a full reload to apply new styles
- Logs `[pdfn:vite] Template changed: <file>` in the console

## CSS Auto-Detection

If `cssPath` is not provided, looks for CSS in common locations:

- `./src/app/globals.css`
- `./src/styles/globals.css`
- `./app/globals.css`
- `./styles/globals.css`
- `./styles/tailwind.css`

Falls back to vanilla Tailwind if no custom CSS found.

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
