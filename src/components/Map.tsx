'use client';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLngBounds } from 'leaflet';
import L from 'leaflet';
import { type Coordinates } from '@/services/geocoding';
import { useEffect, useState, useRef, forwardRef } from 'react';

function createNumberedIcon(index: number, total: number): L.DivIcon {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const bg = isFirst ? '#16a34a' : isLast ? '#dc2626' : '#292524';
  const label = isFirst ? 'A' : isLast ? 'B' : String(index);

  return L.divIcon({
    className: '',
    html: `<div style="
      width:32px;height:32px;border-radius:9999px;
      background:${bg};color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-family:Inter,sans-serif;font-size:13px;font-weight:600;
      box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid #fff;
    ">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

const AnimatedPolyline = ({
  positions,
}: {
  positions: L.LatLngTuple[];
}) => {
  const [count, setCount] = useState(positions.length);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (positions.length < 2) {
      setCount(positions.length);
      return;
    }

    const batchSize = Math.max(1, Math.floor(positions.length / 60));
    setCount(2);
    let idx = 2;

    const step = () => {
      if (idx < positions.length) {
        idx = Math.min(idx + batchSize, positions.length);
        setCount(idx);
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameRef.current);
  }, [positions]);

  const visible = positions.slice(0, count);

  if (visible.length < 2) return null;

  return (
    <Polyline
      positions={visible}
      pathOptions={{
        color: '#4F46E5',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  );
};

const MapEffect = ({
  bounds,
}: {
  bounds: L.LatLngTuple[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (bounds.length > 0) {
      const b = new LatLngBounds(bounds);
      map.fitBounds(b, { padding: [50, 50], maxZoom: 15 });
    }
  }, [bounds, map]);

  return null;
};

export interface MapRef {
  getContainer: () => HTMLDivElement | null;
}

interface MapProps {
  routeCoordinates: Coordinates[];
  roadGeometry?: [number, number][];
  distanceKm?: number;
  durationMin?: number;
  labels?: string[];
}

function isValidCoord(c: unknown): c is Coordinates {
  return (
    c != null &&
    typeof c === 'object' &&
    'lat' in c &&
    'lon' in c &&
    typeof (c as Coordinates).lat === 'number' &&
    typeof (c as Coordinates).lon === 'number' &&
    !isNaN((c as Coordinates).lat) &&
    !isNaN((c as Coordinates).lon)
  );
}

function formatDuration(min: number): string {
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

const Map = forwardRef<MapRef, MapProps>(
  ({ routeCoordinates: rawCoords, roadGeometry, distanceKm, durationMin, labels }, ref) => {
    const routeCoordinates = rawCoords.filter(isValidCoord);
    const defaultPosition: LatLngExpression = [40.416775, -3.70379];
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<MapRef | null>).current = {
          getContainer: () => containerRef.current,
        };
      }
    }, [ref]);

    const polylinePositions: L.LatLngTuple[] =
      roadGeometry && roadGeometry.length > 1
        ? roadGeometry
        : routeCoordinates.map((c) => [c.lat, c.lon] as L.LatLngTuple);

    const boundsPoints: L.LatLngTuple[] =
      roadGeometry && roadGeometry.length > 0
        ? roadGeometry
        : routeCoordinates.map((c) => [c.lat, c.lon] as L.LatLngTuple);

    const hasRoute = routeCoordinates.length > 1;

    return (
      <div ref={containerRef} className="relative h-full w-full">
        <MapContainer
          center={defaultPosition}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {routeCoordinates.map((coords, index) => (
            <Marker
              key={index}
              position={[coords.lat, coords.lon]}
              icon={createNumberedIcon(index, routeCoordinates.length)}
            >
              <Popup>
                <span className="text-caption font-medium">
                  {labels && labels[index]
                    ? labels[index]
                    : index === 0
                      ? 'Inicio'
                      : index === routeCoordinates.length - 1
                        ? 'Final'
                        : `Parada ${index}`}
                </span>
              </Popup>
            </Marker>
          ))}
          {hasRoute && polylinePositions.length > 1 && (
            <AnimatedPolyline positions={polylinePositions} />
          )}
          {boundsPoints.length > 0 && <MapEffect bounds={boundsPoints} />}
        </MapContainer>

        {hasRoute && (distanceKm != null || durationMin != null) && (
          <div className="absolute bottom-lg left-lg z-[1000] rounded-xl border border-hairline bg-surface-card px-lg py-sm shadow-soft-drop">
            <p className="text-caption font-medium text-ink">
              {routeCoordinates.length} paradas
              {distanceKm != null && (
                <>
                  {' '}&middot;{' '}
                  {distanceKm < 1
                    ? `${Math.round(distanceKm * 1000)} m`
                    : `${distanceKm.toFixed(1)} km`}
                </>
              )}
              {durationMin != null && (
                <>
                  {' '}&middot; {formatDuration(durationMin)}
                </>
              )}
            </p>
          </div>
        )}
      </div>
    );
  }
);

Map.displayName = 'Map';

export default Map;
