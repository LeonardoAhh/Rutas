import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

// Configurar la fuente Inter para el cuerpo del texto
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Variable CSS para Inter
  weights: ["400", "500", "600"],
});

// Configurar la fuente EB Garamond como sustituto de Waldenburg para los títulos
const eb_garamond = EB_Garamond({
  subsets: ["latin"],
  weight: "400", // design.md especifica peso 300, pero 400 es el más cercano en la fuente gratuita
  variable: "--font-eb-garamond", // Variable CSS para EB Garamond
});

export const metadata: Metadata = {
  title: "Route Planner",
  description: "Planifica y visualiza tus rutas con una estética editorial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${eb_garamond.variable}`}>
      <body className="bg-canvas font-sans text-body-md text-body">
        <header className="border-b border-hairline">
          <nav className="container mx-auto flex h-[64px] items-center justify-between px-xl">
            <h1 className="font-serif text-display-sm text-ink">
              <Link href="/">Route Planner</Link>
            </h1>
            <div className="flex items-center space-x-lg">
              <Link
                href="/routes"
                className="font-medium text-nav-link text-ink hover:text-body-strong"
              >
                Planificar Ruta
              </Link>
              <Link
                href="#"
                className="font-medium text-nav-link text-ink hover:text-body-strong"
              >
                Acerca de
              </Link>
              <Link
                href="#"
                className="font-medium text-nav-link text-ink hover:text-body-strong"
              >
                Contacto
              </Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
