import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Validator - Free PDF/A & PDF/UA Compliance Checker | pdfn",
  description:
    "Validate PDF/A archival and PDF/UA accessibility compliance. Free, instant validation. No registration required.",
  keywords: [
    "PDF/A validator",
    "PDF/UA validator",
    "PDF compliance checker",
    "PDF accessibility checker",
    "validate PDF/A",
    "validate PDF/UA",
    "PDF/A-2b",
    "PDF/UA-1",
    "PDF archival",
    "free PDF validator",
  ],
  openGraph: {
    title: "PDF Validator - Free PDF/A & PDF/UA Compliance Checker",
    description: "Validate PDF/A archival and PDF/UA accessibility compliance. Free, instant validation.",
    url: "https://pdfn.dev/tools/pdf-validator",
  },
  alternates: {
    canonical: "https://pdfn.dev/tools/pdf-validator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
