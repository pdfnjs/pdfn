# @pdfn/next

Next.js plugin for pre-compiling Tailwind CSS at build time.

## When Do You Need This?

**Only if you use `@pdfn/tailwind`** and deploy to serverless/edge environments.

| Setup | Plugin Needed? |
|-------|---------------|
| Inline styles only | **No** |
| Tailwind + local Node.js | **No** |
| Tailwind + Vercel/serverless | **Yes** |
| Tailwind + Edge runtime | **Yes** |

If you use plain React with inline styles, no build config is required.

## Installation

```bash
npm install @pdfn/next
```

## Usage

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

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `templates` | `string \| string[]` | `['./pdf-templates/**/*.tsx', './src/pdf/**/*.tsx']` | Glob patterns for template files |
| `cssPath` | `string` | Auto-detected | Path to CSS file with Tailwind imports |

## How It Works

1. At config load time, scans template files for Tailwind classes
2. Compiles CSS using Tailwind v4's `compile()` API
3. Writes pre-compiled CSS to `node_modules/.pdfn/tailwind.js`
4. Configures loader to inject CSS into `<Tailwind>` components

## Dev Mode (HMR)

In development (`NODE_ENV !== 'production'`), the plugin:
- Watches template directories for file changes
- Recompiles CSS when `.tsx`, `.ts`, `.jsx`, `.js` files change
- Logs `[pdfn:next] Template changed, recompiling CSS...` in the console

Console output when starting:
```
[pdfn:next] Using CSS file: ./src/app/globals.css
[pdfn:next] Compiled 20589 bytes of CSS from 142 classes in 6 files
[pdfn:next] Watching for changes: /path/to/your/pdf-templates
```

## CSS Auto-Detection

If `cssPath` is not provided, the plugin looks for CSS in common locations:

- `./src/app/globals.css`
- `./src/styles/globals.css`
- `./app/globals.css`
- `./styles/globals.css`
- `./styles/tailwind.css`

Falls back to vanilla Tailwind if no custom CSS found.

## Requirements

- Next.js 14+ (full Turbopack support in 16+)
- Tailwind CSS 4+

## License

MIT
