# pdfn

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
