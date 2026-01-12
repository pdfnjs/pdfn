# @pdfn/core

Shared utilities and constants for pdfn packages.

> **Note:** This is an internal package. Most users should use `@pdfn/react` directly.

## Overview

`@pdfn/core` provides shared functionality used across the pdfn ecosystem:

- **Page sizes** — A4, Letter, Legal, and other standard dimensions
- **CSS utilities** — Base styles for PDF rendering
- **Tailwind helpers** — Class extraction and marker detection
- **HTML generation** — Client-side rendering HTML templates

## Installation

```bash
npm install @pdfn/core
```

## Entry Points

### `@pdfn/core` (Browser-safe)

The main entry point contains utilities safe for browser bundling:

```typescript
import {
  // Page sizes
  PAGE_SIZES,
  getPageDimensions,
  getPageSizeCss,

  // CSS utilities
  BASE_STYLES,
  generatePageCss,
  extractPageConfig,

  // Tailwind utilities
  hasTailwindMarker,
  extractPrecompiledCss,
  removeTailwindMarker,

  // HTML generation
  generateClientHtml,
  CLIENT_READY_SCRIPT,
} from '@pdfn/core';
```

### `@pdfn/core/tailwind` (Server-only)

Server-only Tailwind CSS compilation. Uses Node.js built-ins (`fs`, `path`) and `fast-glob`:

```typescript
import { compileTailwind } from '@pdfn/core/tailwind';

const { css, classCount, fileCount } = await compileTailwind({
  templatePatterns: ['./pdfn-templates/**/*.tsx'],
  cssPath: './pdfn-templates/styles.css', // optional
  cwd: process.cwd(),
  debug: true,
});
```

> **Important:** Only import from `@pdfn/core/tailwind` in server-side code (build plugins, CLI tools). It cannot be bundled for browsers.

## Used By

- `@pdfn/react` — Uses page sizes, CSS utilities, and Tailwind markers
- `@pdfn/client` — Uses HTML generation for client-side rendering
- `@pdfn/next` — Uses Tailwind compilation for build-time CSS
- `@pdfn/vite` — Uses Tailwind compilation for build-time CSS

## License

MIT
