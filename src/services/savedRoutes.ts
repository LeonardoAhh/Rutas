import { type Coordinates } from './geocoding';

export interface SavedRoute {
  id: string;
  name: string;
  addresses: string[];
  coordinates: Coordinates[];
  createdAt: number;
}

const STORAGE_KEY = 'route-planner-saved-routes';

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

function readAll(): SavedRoute[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedRoute[];
    return parsed.map((r) => ({
      ...r,
      coordinates: Array.isArray(r.coordinates)
        ? r.coordinates.filter(isValidCoord)
        : [],
      addresses: Array.isArray(r.addresses) ? r.addresses : [],
    }));
  } catch {
    return [];
  }
}

function writeAll(routes: SavedRoute[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
}

export function getSavedRoutes(): SavedRoute[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveRoute(
  name: string,
  addresses: string[],
  coordinates: Coordinates[]
): SavedRoute {
  const routes = readAll();
  const route: SavedRoute = {
    id: `route-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    addresses,
    coordinates,
    createdAt: Date.now(),
  };
  routes.push(route);
  writeAll(routes);
  return route;
}

export function deleteRoute(id: string): void {
  const routes = readAll().filter((r) => r.id !== id);
  writeAll(routes);
}
