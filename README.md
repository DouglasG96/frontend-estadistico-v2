# Frontend Estadístico V2 — TBBCentral

Sistema de reportes estadísticos para la Iglesia **Tabernáculo Bíblico Bautista "Amigos de Israel" Central**.

## Stack

- **React 19** + **Vite 8** (build tool)
- **Tailwind CSS 4** (estilos)
- **Chart.js** + **react-chartjs-2** (gráficas)
- **jsPDF** + **jspdf-autotable** (exportación PDF)
- **xlsx** (exportación Excel)
- **lucide-react** (iconos)
- **react-router-dom** (rutas)
- **vite-plugin-pwa** (PWA - instalable en móvil)

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El frontend corre en `http://localhost:5173` y proxy inverso al backend en `http://localhost:3001`.

## Build

```bash
npm run build
```

Genera los archivos estáticos en `dist/`.

## Tests

```bash
npm test          # Una vez
npm run test:watch  # Modo watch
```

## Usuarios

Los usuarios se crean directamente en la base de datos MongoDB Atlas. Contacta al administrador para obtener credenciales de acceso.

> **Nota de seguridad:** Por política del proyecto, no se incluyen credenciales en el repositorio. Las contraseñas se distribuyen por canales seguros fuera de banda.

## Reportes disponibles

1. **Total General** — Reporte consolidado con filtros por fecha y agrupación (día/semana/mes/año)
2. **Servidores** — Estadísticas de servidores por período
3. **Asistencia** — Detalle de asistencia (Templo vs Iglesia al Aire)
4. **Taber Kids** — Estadísticas de niños y maestros (selector: ambos/maestros/ninos)
5. **Comparativo Anual** — Comparación año actual vs año anterior con métricas seleccionables
6. **Subir Foto** — Carga de imágenes de reportes

Todos los reportes incluyen:
- Tabla de datos con totales
- Gráfica de tendencia
- Exportación a PDF
- Exportación a Excel

## API Backend

El frontend consume la API del backend en `/api/v1/`:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/sesiones/login` | POST | Autenticación |
| `/reportes-estadisticos/total-general` | GET | Total General |
| `/reportes-estadisticos/servidores` | GET | Servidores |
| `/reportes-estadisticos/asistencia` | GET | Asistencia |
| `/reportes-estadisticos/taber-kids` | GET | Taber Kids |
| `/reportes-estadisticos/comparativo` | GET | Comparativo anual |
| `/reportes-estadisticos/anios-disponibles` | GET | Años disponibles |
| `/reportes-estadisticos/subir-foto` | POST | Subir imagen |

## PWA

La aplicación es instalable como PWA (Progressive Web App) en dispositivos móviles y de escritorio. Service worker generado automáticamente por `vite-plugin-pwa`.

## Docker

### Build

```bash
# Desde el directorio del frontend
docker build -t estadistico-frontend .
```

Build con API base URL personalizada (opcional):

```bash
docker build \
  --build-arg VITE_API_BASE_URL=/api/v1 \
  -t estadistico-frontend .
```

### Ejecutar

```bash
docker run -d \
  --name estadistico-frontend \
  -p 3000:80 \
  estadistico-frontend
```

Esto sirve el frontend en `http://localhost:3000`. Las peticiones a `/api/` se redirigen al **backend en `localhost:3001`** dentro del contenedor (ajustar `proxy_pass` en `nginx.conf` si el backend está en otra IP/host).

### Variables de entorno

| Variable | Build-time | Valor por defecto | Descripción |
|----------|-----------|-------------------|-------------|
| `VITE_API_BASE_URL` | `--build-arg` | `/api/v1` | Base path de la API |

Para cambiar dónde apunta el proxy de la API, editar `nginx.conf` (línea `proxy_pass http://localhost:3001;`) antes del build.

### Desarrollo local

```bash
cd frontend-estadistico-v2
npm install
npm run dev
```

## Despliegue

```bash
npm run build
# Servir dist/ con nginx o similar
```

## Licencia

ISC