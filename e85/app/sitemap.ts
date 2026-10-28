import type { MetadataRoute } from "next";

const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
const lastModified = new Date("2026-10-28");

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/e85", "/mentions-legales", "/confidentialite"].map((p) => ({ url: `${base}${p}`, lastModified }));
}
