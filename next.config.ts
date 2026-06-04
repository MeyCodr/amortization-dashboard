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
};

export default nextConfig;
