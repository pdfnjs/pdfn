# @pdfn/react

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
