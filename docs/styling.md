# Styling Guide

pdfn supports multiple styling approaches. Choose based on your needs:

| Approach | Dependencies | Best for |
|----------|--------------|----------|
| Inline styles | None | Simple templates, no build step |
| CSS props | None | Custom stylesheets, design systems |
| Tailwind | `@pdfn/tailwind` | Rapid development, utility classes |

## 1. Inline Styles

Use React's `style` prop. No dependencies required.

```tsx
import { Document, Page } from '@pdfn/react';

function Invoice() {
  return (
    <Document title="Invoice">
      <Page size="A4" margin="1in">
        <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          Invoice #001
        </h1>
        <p style={{ color: '#666', lineHeight: 1.5 }}>
          Thank you for your business.
        </p>
        <div style={{
          marginTop: 32,
          padding: 16,
          backgroundColor: '#f5f5f5',
          borderRadius: 8
        }}>
          <p style={{ fontSize: 20, fontWeight: 'bold' }}>Total: $148.00</p>
        </div>
      </Page>
    </Document>
  );
}
```

**Pros:** Zero dependencies, works everywhere, explicit
**Cons:** Verbose, no pseudo-classes, no media queries

## 2. CSS Props (css / cssFile)

Add custom CSS via `<Document>` props. No extra packages required.

### Inline CSS String

```tsx
import { Document, Page } from '@pdfn/react';

function Invoice() {
  return (
    <Document
      title="Invoice"
      css={`
        .invoice-header {
          font-size: 24px;
          font-weight: bold;
          border-bottom: 2px solid #007bff;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .total {
          font-size: 20px;
          font-weight: bold;
          background: #f5f5f5;
          padding: 16px;
          border-radius: 8px;
        }
        .muted {
          color: #666;
        }
      `}
    >
      <Page size="A4" margin="1in">
        <h1 className="invoice-header">Invoice #001</h1>
        <p className="muted">Thank you for your business.</p>
        <div className="total">Total: $148.00</div>
      </Page>
    </Document>
  );
}
```

### External CSS File

Keep styles in a separate file:

```css
/* styles/invoice.css */
.invoice-header {
  font-size: 24px;
  font-weight: bold;
  border-bottom: 2px solid #007bff;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.total {
  font-size: 20px;
  font-weight: bold;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}
```

```tsx
import { Document, Page } from '@pdfn/react';

function Invoice() {
  return (
    <Document title="Invoice" cssFile="./styles/invoice.css">
      <Page size="A4" margin="1in">
        <h1 className="invoice-header">Invoice #001</h1>
        <div className="total">Total: $148.00</div>
      </Page>
    </Document>
  );
}
```

**Pros:** Full CSS support, reusable, pseudo-classes work
**Cons:** Separate file management

### CSS Cascade Order

1. Base styles (pdfn framework)
2. Tailwind CSS (if using `<Tailwind>`)
3. Document CSS (`css`/`cssFile` props)
4. Inline styles (`style={}`)

Document CSS comes after Tailwind, so you can override Tailwind utilities.

## 3. Tailwind CSS

Use Tailwind utility classes for rapid development.

### Installation

```bash
npm i @pdfn/tailwind
```

### Usage

Wrap your content with `<Tailwind>`:

```tsx
import { Document, Page } from '@pdfn/react';
import { Tailwind } from '@pdfn/tailwind';

function Invoice() {
  return (
    <Document title="Invoice">
      <Tailwind>
        <Page size="A4" margin="1in">
          <h1 className="text-2xl font-bold border-b-2 border-blue-500 pb-4 mb-6">
            Invoice #001
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Thank you for your business.
          </p>
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-xl font-bold">Total: $148.00</p>
          </div>
        </Page>
      </Tailwind>
    </Document>
  );
}
```

### Using Your Theme

Point to your CSS file to use custom theme, fonts, and colors:

```tsx
<Tailwind css="./src/app/globals.css">
  <Page>
    <div className="font-inter text-brand">Uses your theme!</div>
  </Page>
</Tailwind>
```

Your CSS file should include Tailwind:

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --font-inter: "Inter", var(--font-sans);
  --color-brand: #007bff;
}
```

### Edge Runtime Deployment

For Vercel Edge or Cloudflare Workers, add build plugins:

```bash
# Next.js Edge
npm i @pdfn/next

# Vite / Cloudflare
npm i @pdfn/vite
```

See [@pdfn/next](/packages/next/README.md) and [@pdfn/vite](/packages/vite/README.md) for configuration.

## PDF-Specific CSS Notes

Some CSS behaves differently in PDFs:

- **Flexbox/Grid:** Fully supported
- **box-shadow:** Works, but avoid blur > 10px (slow rendering)
- **opacity:** Works, prefer for watermarks
- **position: fixed:** Behaves like `absolute` (no viewport)
- **vh/vw units:** Relative to page size, not viewport
- **@media print:** Respected, use for PDF-specific styles

## Combining Approaches

You can mix approaches:

```tsx
<Document
  css={`.custom { border: 1px solid #ccc; }`}
>
  <Tailwind>
    <Page>
      {/* Tailwind classes */}
      <h1 className="text-2xl font-bold">Title</h1>

      {/* Custom CSS class */}
      <div className="custom">
        {/* Inline styles */}
        <p style={{ color: 'red' }}>Mixed styling</p>
      </div>
    </Page>
  </Tailwind>
</Document>
```
