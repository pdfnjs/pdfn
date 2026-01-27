import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates - pdfn",
  description:
    "Ready-to-use PDF templates for invoices, reports, contracts, letters, and tickets. Built with React and Tailwind CSS.",
  openGraph: {
    title: "Templates - pdfn",
    description:
      "Ready-to-use PDF templates for invoices, reports, contracts, letters, and tickets. Built with React and Tailwind CSS.",
  },
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
