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
  experimental: {
    sri: {
      algorithm: "sha256",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-XSS-Protection", value: "0" },
          // Content-Security-Policy is set per-request in proxy.ts (needs a fresh nonce each request)
        ],
      },
    ];
  },
};

export default nextConfig;
