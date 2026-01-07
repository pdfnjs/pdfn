# @pdfn/vite

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
