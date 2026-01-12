# @pdfn/react

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
