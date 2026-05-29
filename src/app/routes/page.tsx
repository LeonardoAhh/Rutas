'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { geocodeAddress, type Coordinates } from '@/services/geocoding';
import { getRoute } from '@/services/routing';
import {
  getSavedRoutes,
  saveRoute,
  deleteRoute,
  type SavedRoute,
} from '@/services/savedRoutes';
import {
  Plus,
  X,
  Save,
  Download,
  Trash2,
  FolderOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import Label from '@/components/ui/Label';
import Toast from '@/components/ui/Toast';
import type { MapRef } from '@/components/Map';

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
  const [stops, setStops] = useState<Stop[]>([
    { id: stopIdCounter++, value: '' },
  ]);
  const [end, setEnd] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);
  const [roadGeometry, setRoadGeometry] = useState<[number, number][]>([]);
  const [routeDistance, setRouteDistance] = useState<number | undefined>();
  const [routeDuration, setRouteDuration] = useState<number | undefined>();
  const [routeLabels, setRouteLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'error' | 'success';
  }>({ visible: false, message: '', type: 'error' });

  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [routeName, setRouteName] = useState('');

  const mapRef = useRef<MapRef>(null);

  const refreshSaved = useCallback(async () => {
    const routes = await getSavedRoutes();
    setSavedRoutes(routes);
  }, []);

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  const showToast = useCallback(
    (message: string, type: 'error' | 'success' = 'error') => {
      setToast({ visible: true, message, type });
    },
    []
  );

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
    const addresses = [start, ...stops.map((s) => s.value), end].filter(
      Boolean
    );
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
    setRouteLabels(addresses);

    const routeResult = await getRoute(validCoordinates);
    if (routeResult) {
      setRoadGeometry(routeResult.geometry);
      setRouteDistance(routeResult.distanceKm);
      setRouteDuration(routeResult.durationMin);
      showToast('Ruta calculada por carretera.', 'success');
    } else {
      setRoadGeometry([]);
      setRouteDistance(undefined);
      setRouteDuration(undefined);
      showToast('Ruta visualizada (sin datos de carretera).', 'success');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (routeCoordinates.length < 2) {
      showToast('Visualiza una ruta primero.');
      return;
    }
    const name =
      routeName.trim() ||
      `Ruta ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
    const addresses = [start, ...stops.map((s) => s.value), end].filter(
      Boolean
    );
    await saveRoute(name, addresses, routeCoordinates);
    await refreshSaved();
    setRouteName('');
    showToast('Ruta guardada.', 'success');
  };

  const handleLoadRoute = async (route: SavedRoute) => {
    setRouteCoordinates(route.coordinates);
    setRouteLabels(route.addresses);

    const routeResult = await getRoute(route.coordinates);
    if (routeResult) {
      setRoadGeometry(routeResult.geometry);
      setRouteDistance(routeResult.distanceKm);
      setRouteDuration(routeResult.durationMin);
    } else {
      setRoadGeometry([]);
      setRouteDistance(undefined);
      setRouteDuration(undefined);
    }
    if (route.addresses.length >= 2) {
      setStart(route.addresses[0]);
      setEnd(route.addresses[route.addresses.length - 1]);
      const middle = route.addresses.slice(1, -1);
      setStops(
        middle.length > 0
          ? middle.map((v) => ({ id: stopIdCounter++, value: v }))
          : [{ id: stopIdCounter++, value: '' }]
      );
    }
    showToast(`Ruta "${route.name}" cargada.`, 'success');
  };

  const handleDeleteRoute = async (id: string) => {
    await deleteRoute(id);
    await refreshSaved();
    showToast('Ruta eliminada.', 'success');
  };

  const handleExportPng = async () => {
    const container = mapRef.current?.getContainer();
    if (!container) {
      showToast('No hay mapa para exportar.');
      return;
    }

    setExporting(true);

    await new Promise((r) => setTimeout(r, 800));

    try {
      const html2canvas = (await import('html2canvas')).default;
      const mapCanvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const addresses = [start, ...stops.map((s) => s.value), end].filter(
        Boolean
      );
      const name =
        routeName.trim() ||
        `Ruta — ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}`;

      const headerH = 80;
      const stopsH = addresses.length * 28 + 20;
      const footerH = routeDistance != null ? 50 : 0;
      const padding = 32;
      const totalH = headerH + stopsH + mapCanvas.height + footerH + padding;
      const totalW = mapCanvas.width;

      const out = document.createElement('canvas');
      out.width = totalW;
      out.height = totalH;
      const ctx = out.getContext('2d');
      if (!ctx) throw new Error('No canvas context');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, totalW, totalH);

      ctx.fillStyle = '#292524';
      ctx.font = `bold ${28 * 2}px Inter, system-ui, sans-serif`;
      ctx.fillText(name, padding, headerH - 16);

      ctx.font = `${13 * 2}px Inter, system-ui, sans-serif`;
      addresses.forEach((addr, i) => {
        const y = headerH + 12 + i * 28 * 2;
        const isFirst = i === 0;
        const isLast = i === addresses.length - 1;
        const marker = isFirst ? 'A' : isLast ? 'B' : String(i);
        const color = isFirst ? '#16a34a' : isLast ? '#dc2626' : '#292524';

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(padding + 12, y - 6, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${11 * 2}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(marker, padding + 12, y - 1);
        ctx.textAlign = 'left';

        ctx.fillStyle = '#57534e';
        ctx.font = `${13 * 2}px Inter, system-ui, sans-serif`;
        ctx.fillText(addr, padding + 36, y);
      });

      const mapY = headerH + stopsH;
      ctx.drawImage(mapCanvas, 0, mapY);

      if (routeDistance != null) {
        const footerY = mapY + mapCanvas.height + 16;
        ctx.fillStyle = '#292524';
        ctx.font = `600 ${14 * 2}px Inter, system-ui, sans-serif`;
        let info = `${routeCoordinates.length} paradas · ${routeDistance.toFixed(1)} km`;
        if (routeDuration != null) {
          const h = Math.floor(routeDuration / 60);
          const m = Math.round(routeDuration % 60);
          info += ` · ${h > 0 ? `${h} h ${m} min` : `${m} min`}`;
        }
        ctx.fillText(info, padding, footerY);
      }

      const link = document.createElement('a');
      link.download = `ruta-${Date.now()}.png`;
      link.href = out.toDataURL('image/png');
      link.click();
      showToast('Mockup descargado.', 'success');
    } catch {
      showToast('Error al exportar imagen.');
    } finally {
      setExporting(false);
    }
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
                      onChange={(e) =>
                        handleStopChange(stop.id, e.target.value)
                      }
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

            {/* Action buttons */}
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
                {loading ? 'Calculando ruta...' : 'Visualizar Ruta'}
              </Button>
            </div>

            {/* Save & Export section */}
            {routeCoordinates.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-sm border-t border-hairline pt-md"
              >
                <div className="flex items-end gap-sm">
                  <div className="flex-grow">
                    <Label>Nombre de ruta (opcional)</Label>
                    <TextInput
                      value={routeName}
                      onChange={(e) => setRouteName(e.target.value)}
                      placeholder="Mi ruta favorita"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-md border border-hairline-strong text-ink transition-colors hover:bg-surface-strong"
                    title="Guardar ruta"
                  >
                    <Save size={20} />
                  </button>
                </div>

                <Button
                  variant="outline"
                  onClick={handleExportPng}
                  disabled={exporting}
                  className="w-full"
                >
                  <Download size={16} className="mr-xs" />
                  {exporting ? 'Generando mockup...' : 'Descargar Mockup (PNG)'}
                </Button>
              </motion.div>
            )}

            {/* Saved routes accordion */}
            <div className="border-t border-hairline pt-md">
              <button
                onClick={() => setShowSaved((v) => !v)}
                className="flex w-full items-center justify-between text-title-sm font-medium text-ink"
              >
                <span className="flex items-center gap-xs">
                  <FolderOpen size={18} />
                  Rutas Guardadas ({savedRoutes.length})
                </span>
                {showSaved ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>

              <AnimatePresence>
                {showSaved && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="mt-sm space-y-sm overflow-hidden"
                  >
                    {savedRoutes.length === 0 ? (
                      <p className="text-body-sm text-muted">
                        No hay rutas guardadas.
                      </p>
                    ) : (
                      savedRoutes.map((route) => (
                        <div
                          key={route.id}
                          className="flex items-center justify-between rounded-lg border border-hairline bg-surface-card px-base py-sm"
                        >
                          <button
                            onClick={() => handleLoadRoute(route)}
                            className="flex-grow text-left"
                          >
                            <p className="text-body-sm font-medium text-ink">
                              {route.name}
                            </p>
                            <p className="text-caption text-muted">
                              {route.addresses.length} paradas &middot;{' '}
                              {new Date(route.createdAt).toLocaleDateString(
                                'es-MX'
                              )}
                            </p>
                          </button>
                          <button
                            onClick={() => handleDeleteRoute(route.id)}
                            className="ml-sm flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:text-semantic-error"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="col-span-1 h-[50vh] w-full md:col-span-2 md:h-full">
          <Map
            ref={mapRef}
            routeCoordinates={routeCoordinates}
            roadGeometry={roadGeometry}
            distanceKm={routeDistance}
            durationMin={routeDuration}
            labels={routeLabels}
          />
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
