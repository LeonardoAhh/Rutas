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
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { type Coordinates } from '@/services/geocoding';
import { useEffect } from 'react';

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
});
L.Marker.prototype.options.icon = DefaultIcon;

const INK_PRIMARY = 'var(--color-ink-primary, #292524)';

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
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeCoordinates, map]);

  return null;
};

const Map = ({ routeCoordinates }: { routeCoordinates: Coordinates[] }) => {
  const defaultPosition: LatLngExpression = [40.416775, -3.70379];

  return (
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
        <Marker key={index} position={[coords.lat, coords.lon]}>
          <Popup>Parada {index + 1}</Popup>
        </Marker>
      ))}
      {routeCoordinates.length > 1 && (
        <Polyline
          positions={routeCoordinates.map(
            (c) => [c.lat, c.lon] as L.LatLngTuple
          )}
          color={INK_PRIMARY}
        />
      )}
      <MapEffect routeCoordinates={routeCoordinates} />
    </MapContainer>
  );
};

export default Map;
