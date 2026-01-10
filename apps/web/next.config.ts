import type { NextConfig } from "next";
import { withPdfnTailwind } from "@pdfn/next";

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
};

// Pre-compile Tailwind CSS at build time for serverless deployment
export default withPdfnTailwind({
  templates: ["./pdfn-templates/**/*.tsx"],
})(nextConfig);
