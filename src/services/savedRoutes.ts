import { type Coordinates } from './geocoding';

export interface SavedRoute {
  id: string;
  name: string;
  addresses: string[];
  coordinates: Coordinates[];
  createdAt: number;
}

const STORAGE_KEY = 'route-planner-saved-routes';

function readAll(): SavedRoute[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedRoute[]) : [];
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
