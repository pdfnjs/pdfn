# @pdfn/core

## 0.1.2

### Patch Changes

- Fix tailwindcss resolution to use user's project node_modules

## 0.1.1

### Patch Changes

- Implement processor registry for proper dependency inversion
  - @pdfn/core: Add processor registry for optional package registration
  - @pdfn/tailwind: Self-register on import, add @pdfn/core as dependency
  - @pdfn/react: Use registry instead of dynamic import, remove @pdfn/tailwind peer dep
  - @pdfn/next: Add @pdfn/react as required peer, make tailwind deps optional
  - @pdfn/vite: Add @pdfn/react as required peer, make tailwind deps optional
