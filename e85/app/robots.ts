import type { MetadataRoute } from "next";

const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Préversion sur une adresse technique (*.vercel.app) : rien n'est indexé tant que le domaine n'est pas branché. */
const isPreview = new URL(base).hostname.endsWith(".vercel.app");

/** Parcours indexable ; admin, annulation et API exclus. */
export default function robots(): MetadataRoute.Robots {
  if (isPreview) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/e85/admin", "/e85/annuler"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
