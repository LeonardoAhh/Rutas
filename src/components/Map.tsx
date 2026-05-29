'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLngBounds } from 'leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Coordinates } from '@/services/geocoding'; // CORREGIDO: Ruta de importación
import { useEffect } from 'react';

// Corrige el problema del icono predeterminado en react-leaflet.
const DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * `MapEffect` es un componente auxiliar que ajusta la vista del mapa
 * para que se ajuste a los límites de las coordenadas de la ruta.
 * @param {{ routeCoordinates: Coordinates[] }} props - Las coordenadas de la ruta.
 * @returns {null}
 */
const MapEffect = ({ routeCoordinates }: { routeCoordinates: Coordinates[] }) => {
  const map = useMap();

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      const bounds = new LatLngBounds(
        routeCoordinates.map(c => [c.lat, c.lon] as L.LatLngTuple)
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeCoordinates, map]);

  return null;
};

/**
 * `Map` es un componente que renderiza un mapa interactivo usando react-leaflet.
 * Muestra los marcadores de una ruta y una línea que los conecta.
 * @param {{ routeCoordinates: Coordinates[] }} props - Las coordenadas de la ruta a mostrar.
 * @returns {JSX.Element} El componente de mapa.
 */
const Map = ({ routeCoordinates }: { routeCoordinates: Coordinates[] }) => {
  const defaultPosition: LatLngExpression = [40.416775, -3.703790]; // Centro de Madrid

  return (
    <MapContainer center={defaultPosition} zoom={6} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {routeCoordinates.map((coords, index) => (
        <Marker key={index} position={[coords.lat, coords.lon]}>
          <Popup>Parada {index + 1}</Popup>
        </Marker>
      ))}
      {routeCoordinates.length > 1 && (
        <Polyline
          positions={routeCoordinates.map(c => [c.lat, c.lon] as L.LatLngTuple)}
          color="#292524" // CORREGIDO: Usar un color del sistema de diseño (ink-primary)
        />
      )}
      <MapEffect routeCoordinates={routeCoordinates} />
    </MapContainer>
  );
};

export default Map;
