# @pdfn/tailwind

## 0.2.0

### Minor Changes

- Standardize template architecture with `pdfn-templates` convention

  **Breaking Changes:**
  - CSS auto-detection only uses `pdfn-templates/styles.css` (not `globals.css`)
  - Simplified `processTailwind()` to use single standardized path

  **Migration:**
  ```bash
  # 1. Rename folder
  mv pdf-templates pdfn-templates

  # 2. Create styles.css
  echo '@import "tailwindcss";' > pdfn-templates/styles.css
  ```

## 0.1.1

### Patch Changes

- Move tailwindcss from dependencies to peerDependencies to use the user's installation
