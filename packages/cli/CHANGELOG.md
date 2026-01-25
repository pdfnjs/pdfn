# pdfn

## 0.8.5

### Patch Changes

- Updated dependencies
  - @pdfn/react@0.8.2
  - @pdfn/vite@0.5.3
  - @pdfn/client@0.1.1

## 0.8.4

### Patch Changes

- Updated dependencies [0654c3e]
  - @pdfn/react@0.8.1

## 0.8.3

### Patch Changes

- 0b429a1: Update documentation with improved examples
- Updated dependencies [0b429a1]
- Updated dependencies [0b429a1]
  - @pdfn/vite@0.5.2
  - @pdfn/react@0.8.0

## 0.8.2

### Patch Changes

- Support plain HTML in generateFromHtml

  **pdfn:**
  - Fix dev server to support plain HTML without pdfn scripts
  - Update error message for PDF/A compliance requests

  **@pdfn/react:**
  - Clarify PDFStandard JSDoc: compliance is post-processing, layout is identical everywhere

- Updated dependencies
  - @pdfn/react@0.7.1

## 0.8.1

### Patch Changes

- Return error when `standard` option is used without API key

  When a standard is specified, pdfn generates the PDF using pdfn Cloud, where required post-processing and validation is applied. Local development does not apply these compliance steps.

  Without an API key, pdfn now fails with a clear error instead of silently generating non-compliant PDFs:

  ```
  PDF/A-2b requires finalization. Local dev cannot guarantee compliance.
  Set PDFN_API_KEY to generate compliant PDFs, or remove 'standard' for a non-compliant preview.
  ```

## 0.8.0

### Minor Changes

- BREAKING: Rename `conformance` option to `standard`

  The option for generating archival PDFs has been renamed for better clarity:

  ```tsx
  // Before
  const pdf = await generate(<Invoice />, { conformance: "PDF/A-2b" });

  // After
  const pdf = await generate(<Invoice />, { standard: "PDF/A-2b" });
  ```

  Type renamed from `ConformanceLevel` to `PDFStandard`.

### Patch Changes

- Updated dependencies
  - @pdfn/react@0.7.0

## 0.7.1

### Patch Changes

- Remove PDF/UA from conformance options (not yet implemented in backend)

  Conformance generation now supports PDF/A only:
  - PDF/A-1b: Basic PDF 1.4 archival
  - PDF/A-2b: PDF 1.7 archival with transparency
  - PDF/A-3b: PDF/A-2b plus embedded files

  PDF/UA support will be added in a future release after backend testing.

- Updated dependencies
  - @pdfn/react@0.6.1

## 0.7.0

### Minor Changes

- feat: add PDF/A and PDF/UA conformance support

  **@pdfn/react:**
  - Add `conformance` option to `generate()` and `generateFromHtml()` for PDF/A and PDF/UA compliance
  - Support levels: PDF/A-1b, PDF/A-2b, PDF/A-3b, PDF/UA
  - Improve metadata extraction from Document component
  - Add visually hidden h1 for accessibility (screen readers)

  **pdfn CLI:**
  - Add accessibility checker powered by axe-core in dev server
  - Add conformance dropdown (PDF/A, PDF/UA) in inspector panel
  - Show "(Cloud)" indicator in logs when using pdfn Cloud for conformance
  - UI improvements for inspector panel

### Patch Changes

- Updated dependencies
  - @pdfn/react@0.6.0

## 0.6.4

### Patch Changes

- Updated dependencies
  - @pdfn/react@0.5.2

## 0.6.3

### Patch Changes

- Remove legacy Gotenberg endpoint and multer dependency

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
