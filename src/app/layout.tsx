import type { Metadata } from 'next';
import { EB_Garamond, Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import MobileNav from '@/components/layout/MobileNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-eb-garamond',
});

export const metadata: Metadata = {
  title: 'Route Planner',
  description: 'Planifica y visualiza tus rutas con una estética editorial',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${ebGaramond.variable}`}>
      <body className="bg-canvas font-sans text-body-md text-body">
        <header className="border-b border-hairline bg-canvas">
          <nav className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-base sm:px-xl">
            <h1 className="font-serif text-display-sm text-ink">
              <Link href="/">Route Planner</Link>
            </h1>

            {/* Desktop nav */}
            <div className="hidden items-center space-x-lg md:flex">
              <Link
                href="/routes"
                className="text-nav-link font-medium text-ink hover:text-body-strong"
              >
                Planificar Ruta
              </Link>
              <Link
                href="#"
                className="text-nav-link font-medium text-ink hover:text-body-strong"
              >
                Acerca de
              </Link>
              <Link
                href="#"
                className="text-nav-link font-medium text-ink hover:text-body-strong"
              >
                Contacto
              </Link>
            </div>

            {/* Mobile hamburger */}
            <MobileNav />
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
