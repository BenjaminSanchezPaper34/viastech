/** Aperçu du lien (WhatsApp, Facebook) : prix et promesse lisibles même en vignette. */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { brand } from "@/lib/brand";

export const alt = "Conversion E85 chez Viastech à Vias : 420 €, 1er plein offert";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(path.join(process.cwd(), "public/brand/viastech-logo-blanc.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: brand.bg, color: brand.text, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72 }}>
        <img src={src} width={420} height={100} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: 120, height: 5, background: brand.accent, marginBottom: 28 }} />
          <div style={{ fontSize: 64, fontWeight: 700 }}>Passez à l&apos;E85</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 28, marginTop: 12 }}>
            <span style={{ fontSize: 150, fontWeight: 800, color: brand.accent, lineHeight: 1 }}>420 €</span>
            <span style={{ fontSize: 44 }}>1er plein offert</span>
          </div>
        </div>
        <div style={{ fontSize: 32, color: brand.textMuted }}>Réservez votre pose à Vias en 1 minute</div>
      </div>
    ),
    size,
  );
}
