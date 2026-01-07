# @pdfn/next

Next.js plugin for pre-compiling Tailwind CSS at build time.

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
npm i @pdfn/react @pdfn/next
```

```ts
// next.config.ts
import type { NextConfig } from "next";
import { withPdfnTailwind } from "@pdfn/next";

const nextConfig: NextConfig = {
  // your config
};

export default withPdfnTailwind({
  templates: ["./pdf-templates/**/*.tsx"],
})(nextConfig);
```

```tsx
// pdf-templates/invoice.tsx
import { Document, Page } from "@pdfn/react";
import { Tailwind } from "@pdfn/next";  // Tailwind included, no extra install

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
import Invoice from "@/pdf-templates/invoice";

export async function GET() {
  const pdf = await generate(<Invoice />);

  return new Response(pdf, {
    headers: { "Content-Type": "application/pdf" },
  });
}
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `templates` | `string \| string[]` | `['./pdf-templates/**/*.tsx', './src/pdf/**/*.tsx']` | Glob patterns for template files |
| `cssPath` | `string` | Auto-detected from `globals.css` etc. | Path to CSS file with Tailwind imports |

## How It Works

1. At build time, scans template files for Tailwind classes
2. Compiles CSS using Tailwind v4's `compile()` API
3. Writes pre-compiled CSS to `node_modules/.pdfn/tailwind.js`
4. Configures loader to inject CSS into `<Tailwind>` components

## Dev Mode (HMR)

In development (`NODE_ENV !== 'production'`), the plugin:
- Watches template directories for file changes
- Recompiles CSS when `.tsx`, `.ts`, `.jsx`, `.js` files change
- Logs recompilation status in the console

```
[pdfn:next] Using CSS file: ./src/app/globals.css
[pdfn:next] Compiled 20589 bytes of CSS from 142 classes in 6 files
[pdfn:next] Watching for changes: /path/to/pdf-templates
```

## Using Your Theme

Point to your CSS file to use custom colors, fonts, etc:

```ts
export default withPdfnTailwind({
  templates: ["./pdf-templates/**/*.tsx"],
  cssPath: "./src/app/globals.css",
})(nextConfig);
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

- Next.js 14+ (Turbopack fully supported in 16+)
- Tailwind CSS 4+

## License

MIT
