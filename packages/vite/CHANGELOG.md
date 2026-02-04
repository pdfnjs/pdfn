# @pdfn/vite

## 2.0.2

### Patch Changes

- Updated dependencies [5d1dfd0]
  - @pdfn/core@0.2.0
  - @pdfn/client@0.1.3
  - @pdfn/react@1.1.2
  - @pdfn/tailwind@0.2.3

## 2.0.1

### Patch Changes

- Fix tailwindcss resolution to use user's project node_modules
- Updated dependencies
  - @pdfn/core@0.1.2
  - @pdfn/client@0.1.2
  - @pdfn/react@1.1.1
  - @pdfn/tailwind@0.2.2

## 2.0.0

### Patch Changes

- Updated dependencies [b52e5cf]
  - @pdfn/react@1.1.0

## 1.0.0

### Patch Changes

- Updated dependencies [b865ab9]
  - @pdfn/react@1.0.0

## 0.5.3

### Patch Changes

- Implement processor registry for proper dependency inversion
  - @pdfn/core: Add processor registry for optional package registration
  - @pdfn/tailwind: Self-register on import, add @pdfn/core as dependency
  - @pdfn/react: Use registry instead of dynamic import, remove @pdfn/tailwind peer dep
  - @pdfn/next: Add @pdfn/react as required peer, make tailwind deps optional
  - @pdfn/vite: Add @pdfn/react as required peer, make tailwind deps optional

- Updated dependencies
  - @pdfn/core@0.1.1
  - @pdfn/react@0.8.2
  - @pdfn/tailwind@0.2.1
  - @pdfn/client@0.1.1

## 0.5.2

### Patch Changes

- 0b429a1: Update documentation with improved examples and options reference

## 0.5.1

### Patch Changes

- Make @pdfn/client a direct dependency so users don't need to install it separately

## 0.5.0

### Minor Changes

- Add unified pdfn() plugin export that combines all functionality

## 0.4.0

### Minor Changes

- Standardize template architecture with `pdfn-templates` convention

  **Breaking Changes:**
  - Default templates path changed to `./pdfn-templates/**/*.tsx`
  - Default CSS path changed to `./pdfn-templates/styles.css`
  - Removed `cssFile` prop handling from transform

  **Migration:**

  ```bash
  mv pdf-templates pdfn-templates
  ```

## 0.3.1

### Patch Changes

- feat(react): Add `css` and `cssFile` props to Document component for custom styling
  feat(react): Add `debug` option to render() and generate() for troubleshooting
  feat(cli): Show helpful Chromium browser tip when `--open` flag is not used

## 0.3.0

### Minor Changes

- f24f17e: Remove Tailwind component re-exports from build plugins

  **Breaking Change:** Import `Tailwind` from `@pdfn/tailwind` instead of `@pdfn/next` or `@pdfn/vite`.

  ```diff
  - import { Tailwind } from "@pdfn/next";
  + import { Tailwind } from "@pdfn/tailwind";
  ```

  This simplifies the package structure:
  - `@pdfn/tailwind` is now a peerDependency (install it explicitly)
  - Build plugins only handle CSS pre-compilation for edge runtimes

## 0.2.1

### Patch Changes

- Updated dependencies
  - @pdfn/tailwind@0.1.1

## 0.2.0

### Minor Changes

- Simplify Tailwind setup with fewer packages
  - @pdfn/next and @pdfn/vite now include @pdfn/tailwind as a dependency
  - Re-export Tailwind component: `import { Tailwind } from "@pdfn/next"`
  - Reduced install from 3 packages to 2 for serverless deployments
  - Added --inline and --tailwind flags to `pdfn add` command
  - Inline styles are now the default template style
