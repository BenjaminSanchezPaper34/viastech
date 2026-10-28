import type { MetadataRoute } from "next";

const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Parcours indexable ; admin, annulation et API exclus. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/e85/admin", "/e85/annuler"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
