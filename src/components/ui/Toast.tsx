'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success';
  visible: boolean;
  onClose: () => void;
}

export default function Toast({
  message,
  type = 'error',
  visible,
  onClose,
}: ToastProps) {
  const bgColor =
    type === 'error'
      ? 'bg-semantic-error text-on-primary'
      : 'bg-semantic-success text-on-primary';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`fixed bottom-lg left-1/2 z-50 flex -translate-x-1/2 items-center gap-sm rounded-pill px-lg py-sm text-body-sm font-medium ${bgColor}`}
        >
          <span>{message}</span>
          <button
            onClick={onClose}
            className="ml-xs flex-shrink-0 rounded-full p-xxs hover:opacity-80"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
