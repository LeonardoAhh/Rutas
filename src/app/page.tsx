'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import GradientOrb from '@/components/ui/GradientOrb';
import Button from '@/components/ui/Button';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Home() {
  return (
    <section className="relative overflow-hidden bg-canvas py-section">
      <div className="mx-auto max-w-[1200px] px-base text-center sm:px-xl">
        {/* Atmospheric gradient orb */}
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <GradientOrb color="gradient-sky" />
        </div>

        {/* Hero content with staggered entrance */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.h1
            variants={fadeUp}
            className="font-serif text-display-md font-light text-ink sm:text-display-xl lg:text-display-mega"
          >
            Bienvenido a Route Planner
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-md max-w-[60ch] text-body-md text-body"
          >
            Tu herramienta definitiva para planificar y visualizar tus viajes con
            una estética editorial y una precisión inigualable.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-lg">
            <Link href="/routes">
              <Button variant="primary">Comenzar a Planificar</Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
