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
  title: "🐾 Shiro Neko Lab | Regalos de Autor & Colecciones por Temporada",
  description: "Boutique artesanal de regalos, papelería y detalles únicos. Descubre nuestra Edición Especial de Navidad, colecciones por temporada y detalles personalizados con envío coordinado por WhatsApp.",
  keywords: ["Shiro Neko", "Shiro Neko Lab", "regalos de navidad", "regalos personalizados", "papelería artesanal", "detalles de autor"],
  openGraph: {
    title: "🐾 Shiro Neko Lab | Regalos & Detalles Únicos",
    description: "Boutique artesanal de regalos, cajas personalizadas, papelería y colecciones por temporada.",
    type: "website",
  }
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
