# @pdfn/next

Next.js plugin for pdfn. Pre-compiles Tailwind CSS for edge deployment.

## When needed

Recommended for all Next.js projects. Handles Tailwind pre-compilation for edge runtimes and client component bundling.

## Installation

```bash
npm install @pdfn/next
```

## Setup

```ts
// next.config.ts
import type { NextConfig } from 'next';
import { withPdfn } from '@pdfn/next';

const nextConfig: NextConfig = {
  // your existing config
};

export default withPdfn()(nextConfig);
```

### With Options

```ts
// next.config.ts
import type { NextConfig } from 'next';
import { withPdfn } from '@pdfn/next';

const nextConfig: NextConfig = {};

export default withPdfn({
  tailwind: true,  // Enable Tailwind pre-compilation (default: true)
  debug: false,    // Enable debug logging (default: false)
})(nextConfig);
```

### Composing with Other Plugins

```ts
// next.config.ts
import type { NextConfig } from 'next';
import { withPdfn } from '@pdfn/next';

const nextConfig: NextConfig = {};

// Nest plugins (innermost runs first)
export default withPdfn()(
  withOtherPlugin()(nextConfig)
);
```

## Usage

```tsx
// app/api/invoice/route.tsx
import { pdfn } from '@pdfn/react';
import Invoice from '@/pdfn-templates/invoice';

const client = pdfn(process.env.PDFN_API_KEY);

export async function GET() {
  const { data, error } = await client.generate({ react: <Invoice /> });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response(data.buffer, {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tailwind` | `boolean` | `true` | Pre-compile Tailwind CSS for edge runtime |
| `debug` | `boolean` | `false` | Enable debug logging |

## Requirements

- Node.js 22+
- Next.js 14+
- Tailwind CSS 4+

## License

MIT
