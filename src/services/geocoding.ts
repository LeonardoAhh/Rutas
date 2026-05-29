import axios from 'axios';

/**
 * Interfaz para representar las coordenadas geográficas.
 */
export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Llama a la API de Nominatim para convertir una dirección en coordenadas geográficas.
 * @param {string} address - La dirección a geocodificar.
 * @returns {Promise<Coordinates | null>} Una promesa que se resuelve con las coordenadas o null si no se encuentra.
 */
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  if (!address) return null;

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1,
      },
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    } else {
      return null; // No se encontraron resultados
    }
  } catch (error) {
    console.error('Error en la geocodificación:', error);
    return null; // Manejo de errores
  }
};
