import type { NextConfig } from "next";
import { withPdfn } from "@pdfn/next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/docs",
        destination: "https://pdfn.mintlify.dev/docs",
      },
      {
        source: "/docs/:path*",
        destination: "https://pdfn.mintlify.dev/docs/:path*",
      },
    ];
  },
};

// Pre-compile Tailwind CSS and bundle client components at build time
export default withPdfn()(nextConfig);
