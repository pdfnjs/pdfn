# @pdfn/vite

Vite plugin for pre-compiling Tailwind CSS at build time.

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
npm install @pdfn/vite
```

## Usage

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

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `templates` | `string \| string[]` | `['./pdf-templates/**/*.tsx', './src/pdf/**/*.tsx']` | Glob patterns for template files |
| `cssPath` | `string` | Auto-detected | Path to CSS file with Tailwind imports |

## How It Works

1. Scans template files for Tailwind classes at build time
2. Compiles CSS using Tailwind v4's `compile()` API
3. Creates a virtual module with pre-compiled CSS
4. Transforms `<Tailwind>` components to use the pre-compiled CSS

## Dev Mode (HMR)

In development, the plugin:
- Recompiles CSS when template files change
- Triggers a full reload to apply new styles
- Logs `[pdfn:vite] Template changed: <file>` in the console

## CSS Auto-Detection

If `cssPath` is not provided, the plugin looks for CSS in common locations:

- `./src/app/globals.css`
- `./src/styles/globals.css`
- `./app/globals.css`
- `./styles/globals.css`
- `./styles/tailwind.css`

Falls back to vanilla Tailwind if no custom CSS found.

## Requirements

- Vite 5+
- Tailwind CSS 4+

## License

MIT
