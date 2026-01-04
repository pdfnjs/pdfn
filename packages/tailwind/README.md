# @pdfn/tailwind

Tailwind CSS support for PDFN. Use Tailwind classes in your PDF templates.

## Installation

```bash
npm install @pdfn/tailwind
```

## Quick Start

Wrap your content with the `<Tailwind>` component:

```tsx
import { Document, Page } from '@pdfn/react';
import { Tailwind } from '@pdfn/tailwind';

export default function Invoice() {
  return (
    <Document>
      <Tailwind>
        <Page size="A4">
          <h1 className="text-2xl font-bold text-blue-600">Invoice</h1>
          <p className="text-gray-600 mt-2">Thank you for your purchase.</p>
        </Page>
      </Tailwind>
    </Document>
  );
}
```

## Using Your Project's Theme

Point to your CSS file to use your custom theme, fonts, and colors:

```tsx
<Tailwind css="./src/app/globals.css">
  <Page>
    <div className="font-inter text-brand">Uses your theme!</div>
  </Page>
</Tailwind>
```

Your CSS file should include Tailwind and any customizations:

```css
/* globals.css */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
@import "tailwindcss";

@theme {
  --font-inter: "Inter", var(--font-sans);
  --color-brand: #007bff;
}
```

## Auto-detection

If no `css` prop is provided, the component auto-detects CSS from common locations:

- `./src/app/globals.css`
- `./src/styles/globals.css`
- `./app/globals.css`
- `./styles/globals.css`
- `./styles/tailwind.css`
- `./src/index.css`
- `./src/styles.css`

Falls back to vanilla Tailwind if no CSS file is found.

## API

### `<Tailwind>`

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Content to render with Tailwind processing |
| `css` | `string` | Optional path to your CSS file |

### `processTailwind(html, options?)`

Low-level function for advanced use cases:

```ts
import { processTailwind } from '@pdfn/tailwind';

const css = await processTailwind(html, {
  cssPath: './src/app/globals.css'
});
```

## How It Works

1. The `<Tailwind>` component wraps your content with a hidden marker
2. When `render()` processes the HTML, it detects the marker
3. Tailwind v4's `compile()` API extracts only the CSS classes you use
4. The generated CSS is inlined in the final HTML

This ensures:
- Only used classes are included (small CSS output)
- Your custom theme and fonts work out of the box
- No build step required

## License

MIT
