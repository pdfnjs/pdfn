# @pdfn/react

## 1.0.0

### Major Changes

- b865ab9: Migrate generate() and render() to single-object input pattern

  **Breaking change:** `client.generate()` and `client.render()` now take a single object instead of separate arguments.

  Before:

  ```typescript
  client.generate(<Invoice />, { standard: 'PDF/A-2b' })
  client.render(<Invoice />, { debug: true })
  ```

  After:

  ```typescript
  client.generate({ react: <Invoice />, standard: 'PDF/A-2b' })
  client.render({ react: <Invoice />, debug: true })
  ```

  HTML input is unchanged:

  ```typescript
  client.generate({ html: "<h1>Hello</h1>", filename: "hello.pdf" });
  ```

  Also removes dead code: old `generate()` function, `PdfOptions` interface, and `render/index.ts` barrel file.

## 0.8.2

### Patch Changes

- Implement processor registry for proper dependency inversion
  - @pdfn/core: Add processor registry for optional package registration
  - @pdfn/tailwind: Self-register on import, add @pdfn/core as dependency
  - @pdfn/react: Use registry instead of dynamic import, remove @pdfn/tailwind peer dep
  - @pdfn/next: Add @pdfn/react as required peer, make tailwind deps optional
  - @pdfn/vite: Add @pdfn/react as required peer, make tailwind deps optional

- Updated dependencies
  - @pdfn/core@0.1.1
  - @pdfn/client@0.1.1

## 0.8.1

### Patch Changes

- 0654c3e: Auto-read PDFN_API_KEY from environment variable

  `pdfn()` now automatically reads the `PDFN_API_KEY` environment variable. If set, it connects to pdfn Cloud. If not set, it falls back to localhost:3456 for local development.

## 0.8.0

### Minor Changes

- 0b429a1: Add pdfn() client factory with improved developer experience
  - New `pdfn()` factory function with smart defaults (local dev vs cloud)
  - Typed `PdfnError` with codes and actionable suggestions
  - `{ data, error }` response pattern (no try/catch needed)
  - Renamed `host` to `baseUrl` for consistency
  - Updated documentation

## 0.7.1

### Patch Changes

- Support plain HTML in generateFromHtml

  **pdfn:**
  - Fix dev server to support plain HTML without pdfn scripts
  - Update error message for PDF/A compliance requests

  **@pdfn/react:**
  - Clarify PDFStandard JSDoc: compliance is post-processing, layout is identical everywhere

## 0.7.0

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

## 0.6.1

### Patch Changes

- Remove PDF/UA from conformance options (not yet implemented in backend)

  Conformance generation now supports PDF/A only:
  - PDF/A-1b: Basic PDF 1.4 archival
  - PDF/A-2b: PDF 1.7 archival with transparency
  - PDF/A-3b: PDF/A-2b plus embedded files

  PDF/UA support will be added in a future release after backend testing.

## 0.6.0

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

## 0.5.2

### Patch Changes

- Improve error handling in generate() with specific messages for validation errors (400), rate limits (429), and timeouts (504)

## 0.5.1

### Patch Changes

- Align local and cloud API to use /v1/generate endpoint. Add PDFN_HOST support for local development.

## 0.5.0

### Minor Changes

- Add pdfn Cloud integration for PDF generation
  - `generate()` now uses pdfn Cloud API for PDF generation
  - Supports `PDFN_API_KEY` environment variable or `apiKey` option
  - `render()` remains free with no API key required - use with your own Puppeteer setup
  - Both paths produce identical PDFs

## 0.4.0

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

## 0.3.2

### Patch Changes

- Make @pdfn/client a direct dependency so client components work with npx pdfn dev

## 0.3.1

### Patch Changes

- ac4fe30: Add debug overlay support for client templates and fix serverless deployment

  **@pdfn/next:**
  - Fix bundle manifest loading on Vercel serverless (use static imports)
  - Fix Tailwind CSS loading on Vercel serverless (use static imports)
  - Add debug overlay support for renderTemplate()
  - Fix cache check for client templates (report template)

  **@pdfn/react:**
  - Re-export DebugOptions from @pdfn/core
  - Use shared debug utilities from @pdfn/core

  Note: @pdfn/core and @pdfn/client are new packages published at 0.1.0

## 0.3.0

### Minor Changes

- Standardize template architecture with `pdfn-templates` convention

  **Breaking Changes:**
  - Remove `cssFile` prop from Document component (use `@import` in `pdfn-templates/styles.css` instead)
  - CSS auto-detection only uses `pdfn-templates/styles.css` (not `globals.css`)

  **Migration:**

  ```bash
  # Move cssFile imports to styles.css
  # Before: <Document cssFile="./styles/contract.css">
  # After:  Add @import "./styles/contract.css"; to pdfn-templates/styles.css
  ```

## 0.2.0

### Minor Changes

- feat(react): Add `css` and `cssFile` props to Document component for custom styling
  feat(react): Add `debug` option to render() and generate() for troubleshooting
  feat(cli): Show helpful Chromium browser tip when `--open` flag is not used

## 0.1.1

### Patch Changes

- Updated dependencies
  - @pdfn/tailwind@0.1.1
