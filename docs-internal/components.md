# Components

## Document

Root wrapper for PDF templates. Sets metadata and fonts.

```tsx
import { Document } from '@pdfn/react';

<Document
  title="Invoice #001"
  author="Acme Corp"
  subject="Monthly Invoice"
  keywords="invoice, billing"
  creator="My App"
  css={`.custom { color: red; }`}
  fonts={[
    { family: 'Inter', src: '/fonts/Inter.woff2' }
  ]}
>
  <Page>...</Page>
</Document>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | PDF title metadata |
| `author` | `string` | PDF author metadata |
| `subject` | `string` | PDF subject metadata |
| `keywords` | `string[]` | PDF keywords metadata |
| `creator` | `string` | PDF creator metadata |
| `css` | `string` | Custom CSS injected into document |
| `fonts` | `FontConfig[]` | Custom fonts to load |
| `language` | `string` | Document language (default: `"en"`) |
| `children` | `ReactNode` | Page components |

### FontConfig

```typescript
interface FontConfig {
  family: string;
  src: string;
  weight?: number | string;
  style?: 'normal' | 'italic';
}
```

---

## Page

Container for page content. Sets size, margins, headers, footers.

```tsx
import { Page, PageNumber } from '@pdfn/react';

<Page
  size="A4"
  orientation="portrait"
  margin="1in"
  background="#ffffff"
  header={<div>Header on every page</div>}
  footer={<PageNumber />}
  watermark="DRAFT"
>
  <h1>Content here</h1>
</Page>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `PageSize` | `'A4'` | Page size |
| `orientation` | `'portrait' \| 'landscape'` | `'portrait'` | Page orientation |
| `margin` | `string \| MarginConfig` | `'1in'` | Page margins |
| `background` | `string` | `'#ffffff'` | Background color |
| `header` | `ReactNode` | — | Repeated header |
| `footer` | `ReactNode` | — | Repeated footer |
| `watermark` | `string \| WatermarkConfig` | — | Page watermark |
| `children` | `ReactNode` | — | Page content |

### PageSize

```typescript
type PageSize =
  | 'A3' | 'A4' | 'A5'
  | 'Letter' | 'Legal' | 'Tabloid'
  | 'B4' | 'B5'
  | [string, string]; // [width, height] e.g. ['8.5in', '11in']
```

### MarginConfig

```typescript
// String shorthand
margin="1in"           // All sides
margin="1in 0.5in"     // Vertical, horizontal

// Object
margin={{
  top: '1in',
  right: '0.5in',
  bottom: '1in',
  left: '0.5in'
}}
```

### WatermarkConfig

```typescript
// String shorthand
watermark="DRAFT"

// Object
watermark={{
  text: 'CONFIDENTIAL',
  opacity: 0.1,
  rotation: -35,
}}
```

---

## PageNumber

Displays current page number. Use in headers/footers.

```tsx
import { PageNumber } from '@pdfn/react';

<Page footer={<PageNumber />}>
  ...
</Page>

// With format
<Page footer={<>Page <PageNumber /> of <TotalPages /></>}>
  ...
</Page>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | CSS class |

---

## TotalPages

Displays total page count. Use with PageNumber.

```tsx
import { PageNumber, TotalPages } from '@pdfn/react';

<Page footer={
  <div>
    Page <PageNumber /> of <TotalPages />
  </div>
}>
  ...
</Page>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | CSS class |

---

## PageBreak

Forces a page break at this position.

```tsx
import { PageBreak } from '@pdfn/react';

<Page>
  <h1>Chapter 1</h1>
  <p>Content...</p>

  <PageBreak />

  <h1>Chapter 2</h1>
  <p>More content...</p>
</Page>
```

### Props

None.

---

## AvoidBreak

Keeps content together, preventing page breaks within.

```tsx
import { AvoidBreak } from '@pdfn/react';

<Page>
  {items.map(item => (
    <AvoidBreak key={item.id}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <p>{item.price}</p>
    </AvoidBreak>
  ))}
</Page>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | CSS class |
| `children` | `ReactNode` | Content to keep together |

---

## Thead

Table header that repeats on each page when table spans multiple pages.

```tsx
import { Thead, Tr } from '@pdfn/react';

<table>
  <Thead>
    <Tr>
      <th>Item</th>
      <th>Qty</th>
      <th>Price</th>
    </Tr>
  </Thead>
  <tbody>
    {items.map(item => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>{item.qty}</td>
        <td>{item.price}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | CSS class |
| `repeat` | `boolean` | Repeat header on each page (default: `true`) |
| `children` | `ReactNode` | Table header rows |

---

## Tr

Table row component. Use inside Thead for repeating headers.

```tsx
import { Thead, Tr } from '@pdfn/react';

<Thead>
  <Tr className="bg-gray-100">
    <th>Column 1</th>
    <th>Column 2</th>
  </Tr>
</Thead>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | CSS class |
| `style` | `CSSProperties` | Inline styles |
| `keep` | `boolean` | Prevent row from splitting across pages |
| `children` | `ReactNode` | Table cells |

---

## Tailwind

Wrapper that enables Tailwind CSS classes. From `@pdfn/tailwind`.

```tsx
import { Document, Page } from '@pdfn/react';
import { Tailwind } from '@pdfn/tailwind';

<Document>
  <Tailwind>
    <Page>
      <h1 className="text-2xl font-bold text-blue-600">
        Styled with Tailwind
      </h1>
    </Page>
  </Tailwind>
</Document>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `string` | Path to custom CSS file |
| `children` | `ReactNode` | Content using Tailwind classes |

### Custom Theme

Create `pdfn-templates/styles.css`:

```css
@import "tailwindcss";

@theme {
  --color-brand: #007bff;
  --font-heading: "Georgia", serif;
}
```

The file is auto-detected by `<Tailwind>`.
