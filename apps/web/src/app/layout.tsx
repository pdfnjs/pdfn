import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "pdfn - Write React. Ship PDFs.",
  description:
    "Build pixel-perfect, paginated PDFs with React and Tailwind. What you preview is what you ship.",
  metadataBase: new URL("https://pdfn.dev"),
  keywords: [
    "PDF",
    "React",
    "PDF generation",
    "React PDF",
    "Tailwind CSS",
    "pagination",
    "page breaks",
    "repeating table headers",
    "headless chrome",
    "document generation",
    "invoice generator",
    "PDF templates",
  ],
  authors: [{ name: "Gokul Siva", url: "https://github.com/gokulsiva" }],
  creator: "pdfn",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdfn.dev",
    siteName: "pdfn",
    title: "pdfn - Write React. Ship PDFs.",
    description:
      "Build pixel-perfect, paginated PDFs with React and Tailwind. What you preview is what you ship.",
  },
  twitter: {
    card: "summary_large_image",
    title: "pdfn - Write React. Ship PDFs.",
    description:
      "Build pixel-perfect, paginated PDFs with React and Tailwind. What you preview is what you ship.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Script
          src="https://cdn.counter.dev/script.js"
          data-id="e3da95bf-9fc8-48fa-b0b6-f8d9cb83de7b"
          data-utcoffset="6"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
