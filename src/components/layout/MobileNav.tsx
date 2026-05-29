'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const links = [
  { href: '/routes', label: 'Planificar Ruta' },
  { href: '#', label: 'Acerca de' },
  { href: '#', label: 'Contacto' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-[44px] w-[44px] items-center justify-center rounded-md text-ink md:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={24} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[280px] flex-col bg-canvas-soft p-xl shadow-soft-drop md:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-display-sm text-ink">Menú</span>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-[44px] w-[44px] items-center justify-center rounded-md text-ink"
                  aria-label="Cerrar menú"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="mt-xl flex flex-col space-y-lg">
                {links.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-title-sm font-medium text-ink hover:text-body-strong"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
