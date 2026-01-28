---
"@pdfn/react": major
"pdfn": patch
---

Migrate generate() and render() to single-object input pattern

**Breaking change:** `client.generate()` and `client.render()` now take a single object instead of separate arguments.

Before:
```typescript
client.generate(<Invoice />, { standard: 'PDF/A-2b' })
client.render(<Invoice />, { debug: true })
```

After:
```typescript
client.generate({ react: <Invoice />, standard: 'PDF/A-2b' })
client.render({ react: <Invoice />, debug: true })
```

HTML input is unchanged:
```typescript
client.generate({ html: '<h1>Hello</h1>', filename: 'hello.pdf' })
```

Also removes dead code: old `generate()` function, `PdfOptions` interface, and `render/index.ts` barrel file.
