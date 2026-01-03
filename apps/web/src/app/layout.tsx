import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "PDFN - The React Framework for PDFs",
  description:
    "Build beautiful, pixel-perfect PDFs using React components and Tailwind CSS. What you see is what you ship.",
  metadataBase: new URL("https://pdfn.dev"),
  keywords: [
    "PDF",
    "React",
    "PDF generation",
    "React PDF",
    "Tailwind CSS",
    "document generation",
    "invoice generator",
    "PDF templates",
  ],
  authors: [{ name: "PDFN" }],
  creator: "PDFN",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdfn.dev",
    siteName: "PDFN",
    title: "PDFN - The React Framework for PDFs",
    description:
      "Build beautiful, pixel-perfect PDFs using React components and Tailwind CSS.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFN - The React Framework for PDFs",
    description:
      "Build beautiful, pixel-perfect PDFs using React components and Tailwind CSS.",
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
      </body>
    </html>
  );
}
