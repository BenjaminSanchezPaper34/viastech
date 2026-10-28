import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sur e85.viastech.fr la racine mène au parcours ; les paramètres UTM suivent la redirection.
  async redirects() {
    return [{ source: "/", destination: "/e85", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
