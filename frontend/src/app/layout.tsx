import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shironekolab3d.runa.laotrared.net"),
  title: "🐾 Shiro Neko Lab | Regalos de Autor & Colecciones por Temporada",
  description: "Boutique artesanal de regalos, impresión 3D, cajas personalizadas y detalles únicos. Descubre nuestra Edición Especial de Navidad y colecciones por temporada.",
  keywords: [
    "Shiro Neko",
    "Shiro Neko Lab",
    "impresión 3D La Paz",
    "regalos de navidad",
    "regalos personalizados",
    "cajas de regalo",
    "papelería artesanal",
    "detalles de autor",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "🐾 Shiro Neko Lab | Regalos & Detalles Únicos en 3D",
    description: "Boutique artesanal de regalos, impresión 3D, cajas personalizadas y colecciones por temporada.",
    url: "https://shironekolab3d.runa.laotrared.net",
    siteName: "Shiro Neko Lab",
    type: "website",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Shiro Neko Lab 🐾",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "🐾 Shiro Neko Lab | Regalos & Detalles Únicos",
    description: "Boutique artesanal de regalos, impresión 3D y cajas personalizadas.",
    images: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${plusJakarta.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-rose-bg text-rose-fg font-sans">
        {children}
      </body>
    </html>
  );
}
