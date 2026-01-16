# pdfn

## 0.6.2

### Patch Changes

- Align local and cloud API to use /v1/generate endpoint. Add PDFN_HOST support for local development.
- Updated dependencies
  - @pdfn/react@0.5.1

## 0.6.1

### Patch Changes

- Cleanup unused internal code and simplify build configuration

## 0.6.0

### Minor Changes

- Add pdfn Cloud integration for PDF generation
  - `generate()` now uses pdfn Cloud API for PDF generation
  - Supports `PDFN_API_KEY` environment variable or `apiKey` option
  - `render()` remains free with no API key required - use with your own Puppeteer setup
  - Both paths produce identical PDFs

### Patch Changes

- Updated dependencies
  - @pdfn/react@0.5.0

## 0.5.0

### Minor Changes

- Switch to Gotenberg-compatible API for PDF generation

  **@pdfn/react:**
  - Add `generateFromHtml()` function for pre-rendered HTML
  - Update `generate()` to use Gotenberg-compatible multipart form API
  - Export new `GenerateFromHtmlOptions` type

  **pdfn CLI:**
  - `pdfn serve` now uses Docker + Gotenberg for production PDF generation
  - `pdfn dev` adds Gotenberg-compatible endpoint (`/forms/chromium/convert/html`)
  - Both commands expose the same API, making them interchangeable

### Patch Changes

- Updated dependencies
  - @pdfn/react@0.4.0

## 0.4.6

### Patch Changes

- Updated dependencies
  - @pdfn/react@0.3.2

## 0.4.5

### Patch Changes

- Updated dependencies
  - @pdfn/vite@0.5.1

## 0.4.4

### Patch Changes

- Fix report template charts: use explicit width/height instead of ResponsiveContainer for PDF compatibility

## 0.4.3

### Patch Changes

- Add unified pdfn() plugin export that combines all functionality
- Updated dependencies
  - @pdfn/vite@0.5.0

## 0.4.2

### Patch Changes

- Updated dependencies [ac4fe30]
  - @pdfn/react@0.3.1

## 0.4.1

### Patch Changes

- Fix add command to output templates to ./pdfn-templates/ (matching dev server expectation)

## 0.4.0

### Minor Changes

- Standardize template architecture with `pdfn-templates` convention

  **Breaking Changes:**
  - Removed `--templates` CLI option (always uses `./pdfn-templates`)
  - HMR now watches CSS files in `pdfn-templates/` folder

  **Migration:**

  ```bash
  mv pdf-templates pdfn-templates
  ```

### Patch Changes

- Updated dependencies
  - @pdfn/react@0.3.0
  - @pdfn/vite@0.4.0

## 0.3.0

### Minor Changes

- feat(react): Add `css` and `cssFile` props to Document component for custom styling
  feat(react): Add `debug` option to render() and generate() for troubleshooting
  feat(cli): Show helpful Chromium browser tip when `--open` flag is not used

### Patch Changes

- Updated dependencies
  - @pdfn/react@0.2.0
  - @pdfn/vite@0.3.1

## 0.2.4

### Patch Changes

- Use Puppeteer's bundled Chromium for `--open` flag to ensure WYSIWYG preview. Added keyboard shortcuts: press `o` to open browser, `q` to quit.

## 0.2.3

### Patch Changes

- 7229d3e: Fix @pdfn/tailwind detection for all package managers

  The `pdfn add --tailwind` command now correctly detects @pdfn/tailwind by checking both package.json dependencies and node_modules directory. This fixes issues with npm, pnpm, yarn, and monorepo setups.

## 0.2.2

### Patch Changes

- Updated dependencies [f24f17e]
  - @pdfn/vite@0.3.0

## 0.2.1

### Patch Changes

- @pdfn/react@0.1.1
- @pdfn/vite@0.2.1

## 0.2.0

### Minor Changes

- Simplify Tailwind setup with fewer packages
  - @pdfn/next and @pdfn/vite now include @pdfn/tailwind as a dependency
  - Re-export Tailwind component: `import { Tailwind } from "@pdfn/next"`
  - Reduced install from 3 packages to 2 for serverless deployments
  - Added --inline and --tailwind flags to `pdfn add` command
  - Inline styles are now the default template style

### Patch Changes

- Updated dependencies
  - @pdfn/vite@0.2.0
