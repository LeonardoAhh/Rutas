'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { geocodeAddress, Coordinates } from '@/services/geocoding'; // CORREGIDO: Ruta de importación a @/services
import { Plus, X } from 'lucide-react'; // Usar lucide-react para los iconos

// Carga dinámica del componente Map, deshabilitando el renderizado en el lado del servidor (SSR).
const Map = dynamic(() => import('@/components/Map'), { // CORREGIDO: Ruta de importación a @/components
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-surface-strong"><p className="text-muted">Cargando mapa...</p></div>,
});

export default function RoutesPage() {
  const [start, setStart] = useState('');
  const [stops, setStops] = useState(['']);
  const [end, setEnd] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);

  const handleAddStop = () => {
    setStops([...stops, '']);
  };

  const handleStopChange = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  const handleRemoveStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
  };

  const handleVisualize = async () => {
    const addresses = [start, ...stops, end].filter(Boolean);
    if (addresses.length < 2) {
      alert('Por favor, introduce al menos un punto de inicio y un final.');
      return;
    }

    const coordinates = await Promise.all(
      addresses.map(addr => geocodeAddress(addr))
    );

    const validCoordinates = coordinates.filter((c): c is Coordinates => c !== null);

    if (validCoordinates.length !== addresses.length) {
      alert('No se pudieron encontrar las coordenadas para todas las direcciones. Por favor, verifica las direcciones introducidas.');
      return;
    }

    setRouteCoordinates(validCoordinates);
  };

  const inputStyles = "h-[44px] w-full rounded-md border border-hairline-strong bg-surface-card px-base text-body-md text-ink placeholder-muted focus:border-2 focus:border-ink-primary focus:outline-none";

  return (
    <div className="grid h-[calc(100vh-64px)] grid-cols-1 md:grid-cols-3">
      <div className="col-span-1 overflow-y-auto bg-canvas p-xl">
        <h1 className="font-serif text-display-lg text-ink">Planifica Tu Ruta</h1>
        
        <div className="mt-lg space-y-md">
          <div>
            <label className="mb-xs block text-sm font-medium text-body-strong">Inicio</label>
            <input type="text" value={start} onChange={(e) => setStart(e.target.value)} className={inputStyles} placeholder="Dirección de partida" />
          </div>

          {stops.map((stop, index) => (
            <div key={index} className="flex items-end space-x-sm">
              <div className="flex-grow">
                <label className="mb-xs block text-sm font-medium text-body">Parada {index + 1}</label>
                <input type="text" value={stop} onChange={(e) => handleStopChange(index, e.target.value)} className={inputStyles} placeholder={`Parada adicional`} />
              </div>
              <button onClick={() => handleRemoveStop(index)} className="flex h-[44px] w-[44px] items-center justify-center rounded-md border border-hairline-strong text-muted hover:border-semantic-error hover:text-semantic-error">
                <X size={20} />
              </button>
            </div>
          ))}

          <div>
            <label className="mb-xs block text-sm font-medium text-body-strong">Final</label>
            <input type="text" value={end} onChange={(e) => setEnd(e.target.value)} className={inputStyles} placeholder="Dirección de destino" />
          </div>

          <div className="space-y-base pt-md">
            <button onClick={handleAddStop} className="flex w-full items-center justify-center rounded-pill border border-hairline-strong py-sm text-center text-button font-medium text-ink hover:border-ink">
              <Plus size={16} className="mr-xs"/>
              Añadir Parada
            </button>
            <button onClick={handleVisualize} className="w-full rounded-pill bg-ink-primary py-3 text-center text-button font-medium text-on-primary transition-colors hover:bg-ink-primary-active">
              Visualizar Ruta
            </button>
          </div>
        </div>
      </div>
      <div className="col-span-1 md:col-span-2 h-full w-full">
        <Map routeCoordinates={routeCoordinates} />
      </div>
    </div>
  );
}
