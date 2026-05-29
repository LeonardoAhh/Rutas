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

function haversineKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function totalDistanceKm(coords: Coordinates[]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineKm(coords[i - 1], coords[i]);
  }
  return total;
}

const AnimatedPolyline = ({
  positions,
}: {
  positions: L.LatLngTuple[];
}) => {
  const [visible, setVisible] = useState<L.LatLngTuple[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (positions.length < 2) {
      setVisible(positions);
      return;
    }

    setVisible([positions[0]]);
    let current = 1;

    const step = () => {
      if (current < positions.length) {
        setVisible((prev) => [...prev, positions[current]]);
        current++;
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameRef.current);
  }, [positions]);

  if (visible.length < 2) return null;

  return (
    <Polyline
      positions={visible}
      pathOptions={{
        color: '#292524',
        weight: 4,
        opacity: 0.85,
        dashArray: '12, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  );
};

const MapEffect = ({
  routeCoordinates,
}: {
  routeCoordinates: Coordinates[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      const bounds = new LatLngBounds(
        routeCoordinates.map((c) => [c.lat, c.lon] as L.LatLngTuple)
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [routeCoordinates, map]);

  return null;
};

export interface MapRef {
  getContainer: () => HTMLDivElement | null;
}

interface MapProps {
  routeCoordinates: Coordinates[];
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

const Map = forwardRef<MapRef, MapProps>(
  ({ routeCoordinates: rawCoords, labels }, ref) => {
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

    const distance =
      routeCoordinates.length > 1
        ? totalDistanceKm(routeCoordinates)
        : null;

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
          {routeCoordinates.length > 1 && (
            <AnimatedPolyline
              positions={routeCoordinates.map(
                (c) => [c.lat, c.lon] as L.LatLngTuple
              )}
            />
          )}
          <MapEffect routeCoordinates={routeCoordinates} />
        </MapContainer>

        {distance !== null && (
          <div className="absolute bottom-lg left-lg z-[1000] rounded-xl border border-hairline bg-surface-card px-lg py-sm shadow-soft-drop">
            <p className="text-caption font-medium text-ink">
              {routeCoordinates.length} paradas &middot;{' '}
              {distance < 1
                ? `${Math.round(distance * 1000)} m`
                : `${distance.toFixed(1)} km`}
            </p>
          </div>
        )}
      </div>
    );
  }
);

Map.displayName = 'Map';

export default Map;
