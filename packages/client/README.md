# @pdfn/client

Client-side rendering support for pdfn templates with React hooks.

## Overview

`@pdfn/client` enables PDF generation from templates that use React hooks (like Recharts, interactive components). Unlike server-side rendering with `renderToStaticMarkup`, client rendering executes hooks by running React in the browser via Puppeteer.

## When to Use

Use `@pdfn/client` when your templates contain:

- **Charting libraries** — Recharts, Victory, Chart.js with React wrappers
- **Components with hooks** — `useState`, `useEffect`, `useRef`
- **Animation libraries** — Framer Motion, React Spring
- **Any "use client" components**

## How It Works

```
Standard SSR (hooks skipped):
┌─────────────────────────────────────────────┐
│ renderToStaticMarkup(Template)              │
│   └── Recharts hooks skipped → empty divs   │
└─────────────────────────────────────────────┘

Client rendering (hooks execute):
┌─────────────────────────────────────────────┐
│ 1. Detect "use client" in template          │
│ 2. Bundle template with esbuild             │
│ 3. Generate HTML with embedded bundle       │
│ 4. Puppeteer loads HTML → React renders     │
│    (hooks execute, charts appear)           │
│ 5. Paged.js paginates → PDF                 │
└─────────────────────────────────────────────┘
```

## Installation

```bash
npm install @pdfn/client
```

## Usage

### Automatic Detection

When using `@pdfn/next` or `@pdfn/vite`, client components are detected automatically via the `"use client"` directive:

```tsx
// pdfn-templates/report.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis } from 'recharts';

export default function Report({ data }) {
  return (
    <Document>
      <Page size="A4">
        <BarChart width={600} height={300} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </Page>
    </Document>
  );
}
```

### Manual Usage

```typescript
import { bundleForClient, generateClientHtml, hasClientMarkers } from '@pdfn/client';

// Check if template needs client rendering
if (hasClientMarkers(element)) {
  // Bundle template for browser
  const bundle = await bundleForClient({
    templatePath: '/path/to/template.tsx',
    props: { data: [...] },
    cwd: process.cwd(),
  });

  // Generate HTML with embedded bundle
  const html = generateClientHtml({
    bundleCode: bundle,
    title: 'Report',
    css: compiledTailwindCss,
  });
}
```

## Build-Time Bundling

For production, templates are pre-bundled at build time:

### Next.js

```typescript
// next.config.ts
import { withPdfn } from '@pdfn/next';

export default withPdfn({
  // Your Next.js config
});
```

### Vite

```typescript
// vite.config.ts
import { pdfn } from '@pdfn/vite';

export default {
  plugins: [pdfn()],
};
```

## API

### `bundleForClient(options)`

Bundles a template for client-side rendering.

```typescript
const bundle = await bundleForClient({
  templatePath: string,    // Absolute path to template
  props?: object,          // Props to pass to template
  cwd?: string,            // Working directory
  debug?: boolean,         // Enable debug logging
});
```

### `generateClientHtml(options)`

Generates HTML that loads and renders the bundled template.

```typescript
const html = generateClientHtml({
  bundleCode: string,      // Output from bundleForClient
  title?: string,          // Document title
  css?: string,            // CSS to include
  pageSize?: string,       // e.g., "A4"
  orientation?: string,    // "portrait" or "landscape"
});
```

### `hasClientMarkers(element)`

Checks if a React element tree contains client component markers.

```typescript
const needsClientRendering = hasClientMarkers(<MyTemplate />);
```

## Peer Dependencies

- `react` ^18.0.0 || ^19.0.0
- `react-dom` ^18.0.0 || ^19.0.0

## License

MIT
