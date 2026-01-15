export type PageSize = "A4" | "A5" | "Letter" | "Legal" | "Tabloid";
export type Orientation = "portrait" | "landscape";
export type Styling = "tailwind" | "inline" | "cssFile" | "cssProp";

export interface Template {
  id: string;
  file: string;
  name: string;
  description: string;
  pageSize: PageSize;
  orientation: Orientation;
  styling: Styling;
  /** Templates with client components (e.g., Recharts) require pdfn dev/serve */
  requiresClient?: boolean;
}

export const templates: Template[] = [
  {
    id: "contract",
    file: "./contract.tsx",
    name: "Contract",
    description: "Legal service agreement",
    pageSize: "Legal",
    orientation: "portrait",
    styling: "cssFile",
  },
  {
    id: "report",
    file: "./report.tsx",
    name: "Report",
    description: "Sales report with Recharts",
    pageSize: "A4",
    orientation: "portrait",
    styling: "tailwind",
    requiresClient: true,
  },
  {
    id: "invoice",
    file: "./invoice.tsx",
    name: "Invoice",
    description: "Professional invoice with itemized billing",
    pageSize: "A4",
    orientation: "portrait",
    styling: "tailwind",
  },
  {
    id: "letter",
    file: "./letter.tsx",
    name: "Business Letter",
    description: "US business correspondence",
    pageSize: "Letter",
    orientation: "portrait",
    styling: "inline",
  },
  {
    id: "ticket",
    file: "./ticket.tsx",
    name: "Ticket",
    description: "Event admission ticket",
    pageSize: "A5",
    orientation: "portrait",
    styling: "tailwind",
  },
  {
    id: "poster",
    file: "./poster.tsx",
    name: "Poster",
    description: "Promotional event poster",
    pageSize: "Tabloid",
    orientation: "landscape",
    styling: "cssProp",
  },
];
