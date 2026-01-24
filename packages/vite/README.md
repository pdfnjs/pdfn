# @pdfn/vite

Vite plugin for pdfn. Pre-compiles Tailwind CSS for edge deployment.

## When Needed

Only for edge deployments (Cloudflare Workers, etc.). Not required for Node.js.

## Installation

```bash
npm install @pdfn/vite
```

## Setup

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { pdfn } from '@pdfn/vite';

export default defineConfig({
  plugins: [react(), pdfn()],
});
```

### With Options

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { pdfn } from '@pdfn/vite';

export default defineConfig({
  plugins: [
    react(),
    pdfn({
      tailwind: true,  // Enable Tailwind pre-compilation (default: true)
      debug: false,    // Enable debug logging (default: false)
    }),
  ],
});
```

## Usage

```tsx
// src/generate-pdf.tsx
import { pdfn } from '@pdfn/react';
import Invoice from './pdfn-templates/invoice';

const client = pdfn(process.env.PDFN_API_KEY);

export async function generateInvoice() {
  const { data, error } = await client.generate(<Invoice />);

  if (error) {
    console.error(error.message);
    return null;
  }

  return data.buffer;
}
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tailwind` | `boolean` | `true` | Pre-compile Tailwind CSS for edge runtime |
| `debug` | `boolean` | `false` | Enable debug logging |

## Requirements

- Vite 5+
- Tailwind CSS 4+

## License

MIT
