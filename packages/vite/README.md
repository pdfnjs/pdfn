# @pdfn/vite

Vite build plugin for pdfn. Pre-compiles client components and Tailwind classes for edge runtimes.

## When Do You Need This?

**Only if you deploy to edge runtimes** (Cloudflare Workers, Deno Deploy, etc.).

| Setup | Plugin Needed? |
|-------|---------------|
| Tailwind + Node.js | **No** — runtime processing works |
| Tailwind + Cloudflare Workers | **Yes** — Edge has no filesystem |

## Installation

```bash
npm i @pdfn/react @pdfn/tailwind @pdfn/vite
```

## Setup

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { pdfn } from "@pdfn/vite";

export default defineConfig({
  plugins: [react(), pdfn()],
});
```

## Usage

```tsx
// pdfn-templates/invoice.tsx
import { Document, Page } from "@pdfn/react";
import { Tailwind } from "@pdfn/tailwind";

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
// src/generate-pdf.tsx
import React from "react";
import { generate } from "@pdfn/react";
import Invoice from "../pdfn-templates/invoice";

async function main() {
  const pdf = await generate(<Invoice />);
}
main();
```

> **Note:** `generate()` requires a pdfn API key. Alternatively, use `render()` with your own Puppeteer setup — no API key needed.

## Custom Theme

Create `pdfn-templates/styles.css` — auto-detected by the plugin:

```css
@import "tailwindcss";

@theme {
  --color-brand: #007bff;
}
```

## Requirements

- Vite 5+
- Tailwind CSS 4+

## License

MIT
