import axios from 'axios';
import { type Coordinates } from './geocoding';

const OSRM_BASE = 'https://router.project-osrm.org';

export interface RouteResult {
  geometry: [number, number][];
  distanceKm: number;
  durationMin: number;
}

/**
 * Calls OSRM to get a road-following route between waypoints.
 * Returns the decoded geometry as [lat, lon] pairs, plus distance and duration.
 */
export async function getRoute(
  waypoints: Coordinates[]
): Promise<RouteResult | null> {
  if (waypoints.length < 2) return null;

  const coordsString = waypoints
    .map((w) => `${w.lon},${w.lat}`)
    .join(';');

  try {
    const response = await axios.get(
      `${OSRM_BASE}/route/v1/driving/${coordsString}`,
      {
        params: {
          overview: 'full',
          geometries: 'geojson',
          steps: 'false',
        },
      }
    );

    if (
      response.data &&
      response.data.code === 'Ok' &&
      response.data.routes &&
      response.data.routes.length > 0
    ) {
      const route = response.data.routes[0];
      const geoCoords: [number, number][] =
        route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]] as [number, number]
        );

      return {
        geometry: geoCoords,
        distanceKm: route.distance / 1000,
        durationMin: route.duration / 60,
      };
    }

    return null;
  } catch (error) {
    console.error('Error al obtener ruta OSRM:', error);
    return null;
  }
}
