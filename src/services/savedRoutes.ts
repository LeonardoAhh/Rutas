import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Coordinates } from './geocoding';

export interface SavedRoute {
  id: string;
  name: string;
  addresses: string[];
  coordinates: Coordinates[];
  createdAt: number;
}

const COLLECTION = 'routes';

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

export async function getSavedRoutes(): Promise<SavedRoute[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name ?? '',
        addresses: Array.isArray(data.addresses) ? data.addresses : [],
        coordinates: Array.isArray(data.coordinates)
          ? data.coordinates.filter(isValidCoord)
          : [],
        createdAt: data.createdAt ?? 0,
      };
    });
  } catch (error) {
    console.error('Error al leer rutas:', error);
    return [];
  }
}

export async function saveRoute(
  name: string,
  addresses: string[],
  coordinates: Coordinates[]
): Promise<SavedRoute> {
  const createdAt = Date.now();
  const docRef = await addDoc(collection(db, COLLECTION), {
    name,
    addresses,
    coordinates: coordinates.map((c) => ({ lat: c.lat, lon: c.lon })),
    createdAt,
  });

  return {
    id: docRef.id,
    name,
    addresses,
    coordinates,
    createdAt,
  };
}

export async function deleteRoute(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error('Error al eliminar ruta:', error);
  }
}
