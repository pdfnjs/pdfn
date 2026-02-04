# @pdfn/tailwind

## 0.2.3

### Patch Changes

- Updated dependencies [5d1dfd0]
  - @pdfn/core@0.2.0

## 0.2.2

### Patch Changes

- Updated dependencies
  - @pdfn/core@0.1.2

## 0.2.1

### Patch Changes

- Implement processor registry for proper dependency inversion
  - @pdfn/core: Add processor registry for optional package registration
  - @pdfn/tailwind: Self-register on import, add @pdfn/core as dependency
  - @pdfn/react: Use registry instead of dynamic import, remove @pdfn/tailwind peer dep
  - @pdfn/next: Add @pdfn/react as required peer, make tailwind deps optional
  - @pdfn/vite: Add @pdfn/react as required peer, make tailwind deps optional

- Updated dependencies
  - @pdfn/core@0.1.1

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
