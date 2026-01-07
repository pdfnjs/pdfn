# pdfn

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
