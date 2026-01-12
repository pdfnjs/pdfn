/**
 * Base CSS styles for pdfn documents
 *
 * These styles are required for proper PDF rendering with Paged.js
 */
export const BASE_STYLES = `
/* Reset and base styles */
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Page container */
[data-pdfn-page] {
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Content area */
[data-pdfn-content] {
  flex: 1;
}

/* Headers and footers - use CSS Paged Media running elements */
[data-pdfn-header] {
  position: running(header);
}

[data-pdfn-footer] {
  position: running(footer);
}

/* Watermark - handled via @page CSS for multi-page support */
[data-pdfn-watermark] {
  display: none;
}

/* Page number and total pages - Paged.js counters */
[data-pdfn-page-number]::after {
  content: counter(page);
}

[data-pdfn-total-pages]::after {
  content: counter(pages);
}

/* Page break */
[data-pdfn-page-break] {
  break-after: page;
  page-break-after: always;
  height: 0;
}

/* Avoid break */
[data-pdfn-avoid-break] {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Table header - repeats on each page with Paged.js */
[data-pdfn-table-header] {
  display: table-header-group;
  break-inside: avoid;
}

/* Paged.js table header repetition */
table {
  border-collapse: collapse;
}

thead {
  display: table-header-group;
}

tbody {
  display: table-row-group;
}

tr {
  break-inside: avoid;
}

/* Print styles */
@media print {
  body {
    background: white;
  }

  [data-pdfn-page] {
    page-break-after: always;
  }

  [data-pdfn-page]:last-child {
    page-break-after: auto;
  }
}

/* Paged.js integration */
@page {
  @top-center {
    content: element(header);
  }
  @bottom-center {
    content: element(footer);
  }
}

/* Paged.js preview styles */
.pagedjs_pages {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pagedjs_page {
  margin-bottom: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
`;
