'use client';

import { motion } from 'framer-motion';

type OrbColor =
  | 'gradient-mint'
  | 'gradient-peach'
  | 'gradient-lavender'
  | 'gradient-sky'
  | 'gradient-rose';

interface GradientOrbProps {
  color?: OrbColor;
  className?: string;
}

const colorMap: Record<OrbColor, string> = {
  'gradient-mint': 'bg-gradient-mint',
  'gradient-peach': 'bg-gradient-peach',
  'gradient-lavender': 'bg-gradient-lavender',
  'gradient-sky': 'bg-gradient-sky',
  'gradient-rose': 'bg-gradient-rose',
};

export default function GradientOrb({
  color = 'gradient-sky',
  className = '',
}: GradientOrbProps) {
  return (
    <motion.div
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 15, -10, 0],
        scale: [1, 1.05, 0.97, 1.02, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
      className={`h-[300px] w-[300px] rounded-full opacity-20 blur-[80px] sm:h-[400px] sm:w-[400px] sm:blur-[90px] lg:h-[600px] lg:w-[600px] lg:blur-[100px] ${colorMap[color]} ${className}`}
    />
  );
}
