# @pdfn/next

Next.js build plugin for pdfn. Pre-compiles client components and Tailwind classes for Vercel Edge runtime.

## When Do You Need This?

**Only if you deploy to Vercel Edge** (routes with `export const runtime = 'edge'`).

| Setup | Plugin Needed? |
|-------|---------------|
| Tailwind + Node.js | **No** — runtime processing works |
| Tailwind + Vercel Edge | **Yes** — Edge has no filesystem |

## Installation

```bash
npm i @pdfn/react @pdfn/tailwind @pdfn/next
```

## Setup

```ts
// next.config.ts
import { withPdfn } from "@pdfn/next";

export default withPdfn()({
  // your config
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
// app/api/invoice/route.ts
import { generate } from "@pdfn/react";
import Invoice from "@/pdfn-templates/invoice";

export async function GET() {
  const pdf = await generate(<Invoice />);
  return new Response(pdf, { headers: { "Content-Type": "application/pdf" } });
}
```

> **Note:** `generate()` requires `npx pdfn serve` running.

## Custom Theme

Create `pdfn-templates/styles.css` — auto-detected by the plugin:

```css
@import "tailwindcss";

@theme {
  --color-brand: #007bff;
}
```

## Requirements

- Next.js 14+
- Tailwind CSS 4+

## License

MIT
