# Blueprint: Route Planner

## 1. Descripción General

Route Planner es una aplicación web diseñada para ofrecer una experiencia editorial y de primera calidad en la planificación y visualización de rutas de viaje. La aplicación permite a los usuarios introducir un punto de inicio, múltiples paradas y un punto final para geocodificarlos y visualizarlos en un mapa interactivo. El diseño se centra en la tipografía, el espacio en blanco y una paleta de colores sofisticada para crear una experiencia de usuario tranquila y elegante.

## 2. Sistema de Diseño y Características Implementadas

### Sistema de Diseño (`design.md`)

Se ha establecido un sistema de diseño editorial detallado en `design.md`. Los principios clave incluyen:

- **Filosofía:** "Voltaje Fotográfico" y "Diseño Editorial".
- **Tipografía:** Se utiliza `EB Garamond` (serif) para los títulos y `Inter` (sans-serif) para el cuerpo del texto.
- **Tokens de Diseño:** Se ha definido una jerarquía completa de tokens en `tailwind.config.js` para colores (paletas `ink`, `paper`, `sky`, etc.), espaciado, tipografía (`display`, `editorial`, `body`) y componentes.
- **Componentes Definidos:** `hero-band`, `button-primary`, `button-outline`, `text-input`, `surface-card`.

### Configuración de Estilos Globales

- **`tailwind.config.js`:** Totalmente configurado para usar los tokens de diseño definidos, incluyendo fuentes personalizadas y paletas de colores extendidas.
- **`src/app/globals.css`:** Limpio y configurado con las directivas `@tailwind` necesarias y las variables de fuente CSS para `Inter` y `EB Garamond`.

### Página de Inicio (`/`)

- **Diseño:** Implementa un `hero-band` a toda página.
- **Contenido:** Muestra un título principal grande (`display-mega`), un párrafo introductorio y un botón de llamada a la acción principal (`button-primary`) con estilo `pill`.
- **Efectos Visuales:** Utiliza un gradiente atmosférico radial (`gradient-sky`) para añadir profundidad visual sin distraer.
- **Tecnología:** Totalmente estática, construida con React Server Components.

### Página de Planificación de Rutas (`/routes`)

- **Diseño:** Un diseño de dos columnas: un panel de control a la izquierda y un mapa interactivo a la derecha.
- **Panel de Control:**
    - Un formulario limpio y funcional para introducir el inicio, las paradas y el final de la ruta.
    - Los campos de entrada siguen el estilo `text-input`.
    - Los botones "Añadir Parada" (`button-outline` con icono) y "Visualizar Ruta" (`button-primary`) están claramente definidos.
- **Mapa Interactivo:**
    - Utiliza `react-leaflet` para mostrar un mapa de OpenStreetMap.
    - Carga dinámica del componente del mapa para optimizar el rendimiento.
    - Muestra marcadores para cada punto de la ruta y una polilínea que los conecta.
    - Se ajusta automáticamente para centrar y hacer zoom en la ruta visualizada.
- **Funcionalidad:** Mantiene toda la lógica del lado del cliente para añadir/eliminar paradas y visualizar la ruta mediante geocodificación a través de la API de Nominatim.

### Estructura del Proyecto

- Se ha refactorizado para seguir las mejores prácticas de Next.js.
- Los componentes reutilizables residen en `src/components` (por ejemplo, `Map.tsx`).
- Los servicios de lógica de negocio residen en `src/services` (por ejemplo, `geocoding.ts`).
- Las rutas de importación utilizan alias (`@/`) para mayor claridad y mantenibilidad.

## 3. Estado Actual

La configuración inicial del proyecto y la refactorización de la interfaz de usuario están completas. La aplicación es funcional, visualmente coherente y está alineada con el sistema de diseño establecido. La base de código es limpia, organizada y está lista para la implementación de nuevas características.
