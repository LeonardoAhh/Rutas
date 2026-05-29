'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { geocodeAddress, type Coordinates } from '@/services/geocoding';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import Label from '@/components/ui/Label';
import Toast from '@/components/ui/Toast';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-strong">
      <p className="text-muted">Cargando mapa...</p>
    </div>
  ),
});

let stopIdCounter = 0;

interface Stop {
  id: number;
  value: string;
}

export default function RoutesPage() {
  const [start, setStart] = useState('');
  const [stops, setStops] = useState<Stop[]>([{ id: stopIdCounter++, value: '' }]);
  const [end, setEnd] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'error' | 'success' }>({ visible: false, message: '', type: 'error' });

  const showToast = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    setToast({ visible: true, message, type });
  }, []);

  const handleAddStop = () => {
    setStops((prev) => [...prev, { id: stopIdCounter++, value: '' }]);
  };

  const handleStopChange = (id: number, value: string) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, value } : s)));
  };

  const handleRemoveStop = (id: number) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const handleVisualize = async () => {
    const addresses = [start, ...stops.map((s) => s.value), end].filter(Boolean);
    if (addresses.length < 2) {
      showToast('Introduce al menos un punto de inicio y un final.');
      return;
    }

    setLoading(true);

    const coordinates = await Promise.all(
      addresses.map((addr) => geocodeAddress(addr))
    );

    const validCoordinates = coordinates.filter(
      (c): c is Coordinates => c !== null
    );

    if (validCoordinates.length !== addresses.length) {
      showToast('No se encontraron coordenadas para todas las direcciones.');
      setLoading(false);
      return;
    }

    setRouteCoordinates(validCoordinates);
    showToast('Ruta visualizada correctamente.', 'success');
    setLoading(false);
  };

  return (
    <>
      <div className="grid h-[calc(100vh-64px)] grid-cols-1 md:grid-cols-3">
        {/* Sidebar panel */}
        <div className="col-span-1 overflow-y-auto bg-canvas p-base sm:p-xl">
          <h1 className="font-serif text-display-lg font-light text-ink">
            Planifica Tu Ruta
          </h1>

          <div className="mt-lg space-y-md">
            <div>
              <Label strong>Inicio</Label>
              <TextInput
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="Dirección de partida"
              />
            </div>

            <AnimatePresence initial={false}>
              {stops.map((stop, index) => (
                <motion.div
                  key={stop.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="flex items-end space-x-sm overflow-hidden"
                >
                  <div className="flex-grow">
                    <Label>Parada {index + 1}</Label>
                    <TextInput
                      value={stop.value}
                      onChange={(e) => handleStopChange(stop.id, e.target.value)}
                      placeholder="Parada adicional"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveStop(stop.id)}
                    className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-md border border-hairline-strong text-muted transition-colors hover:border-semantic-error hover:text-semantic-error"
                  >
                    <X size={20} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <div>
              <Label strong>Final</Label>
              <TextInput
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                placeholder="Dirección de destino"
              />
            </div>

            <div className="space-y-base pt-md">
              <Button
                variant="outline"
                onClick={handleAddStop}
                className="w-full"
              >
                <Plus size={16} className="mr-xs" />
                Añadir Parada
              </Button>
              <Button
                variant="primary"
                onClick={handleVisualize}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Geocodificando...' : 'Visualizar Ruta'}
              </Button>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="col-span-1 h-[50vh] w-full md:col-span-2 md:h-full">
          <Map routeCoordinates={routeCoordinates} />
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </>
  );
}
