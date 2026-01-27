import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Components - pdfn",
  description:
    "React components for PDF generation. Document, Page, PageNumber, PageBreak, and more.",
  openGraph: {
    title: "Components - pdfn",
    description:
      "React components for PDF generation. Document, Page, PageNumber, PageBreak, and more.",
  },
};

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
