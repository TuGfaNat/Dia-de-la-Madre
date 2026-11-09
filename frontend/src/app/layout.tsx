import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "💝 Regalos del Día de la Madre | Detalles Únicos y Especiales",
  description: "Encuentra el regalo perfecto para Mamá. Rosas premium, joyería en oro rosa, chocolates de autor y experiencias de spa. Compra rápido y fácil con envío coordinado por WhatsApp.",
  keywords: ["Día de la Madre", "regalos para mamá", "flores día de la madre", "joyería para mamá", "detalles premium"],
  openGraph: {
    title: "💝 Detalles Únicos y Especiales para Mamá",
    description: "Rosas premium, joyería en oro rosa, chocolates de autor y experiencias de spa. Compra rápido y fácil con envío coordinado por WhatsApp.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${outfit.variable} dark scroll-smooth`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-rose-bg text-rose-fg">
        {children}
      </body>
    </html>
  );
}
