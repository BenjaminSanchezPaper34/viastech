import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MetaPixel } from "@/components/site/MetaPixel";
import "./globals.css";

// next/font télécharge les polices au build et les sert depuis le site : aucun appel à Google côté visiteur.
// Polices de la charte Viastech : Bricolage Grotesque (titres), Inter (texte), JetBrains Mono (données).
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz"], variable: "--font-bricolage", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  // Préversion en *.vercel.app : noindex jusqu'au branchement de e85.viastech.fr (APP_URL).
  ...(new URL(process.env.APP_URL ?? "http://localhost").hostname.endsWith(".vercel.app") && {
    robots: { index: false, follow: false },
  }),
  title: "Garage Viastech à Vias",
  description: "Garage Viastech, spécialiste véhicules allemands à Vias.",
};

export const viewport: Viewport = {
  themeColor: "#07090a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        {children}
        <Analytics />
        <MetaPixel />
      </body>
    </html>
  );
}
