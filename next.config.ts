import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/phnavt",
  // Allow LAN access in dev (e.g. http://192.168.x.x:3000/phnavt). Without this,
  // Next.js blocks _next assets from non-localhost origins and client JS won't run.
  allowedDevOrigins: [
    "192.168.0.117",
    "192.168.0.*",
    "10.0.0.*",
    "172.16.*",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
