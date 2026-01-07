---
"@pdfn/next": minor
"@pdfn/vite": minor
---

Remove Tailwind component re-exports from build plugins

**Breaking Change:** Import `Tailwind` from `@pdfn/tailwind` instead of `@pdfn/next` or `@pdfn/vite`.

```diff
- import { Tailwind } from "@pdfn/next";
+ import { Tailwind } from "@pdfn/tailwind";
```

This simplifies the package structure:
- `@pdfn/tailwind` is now a peerDependency (install it explicitly)
- Build plugins only handle CSS pre-compilation for edge runtimes
