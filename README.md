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

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| alex.tochez | Iglesia2024! | Administrador |
| luis.romero | Iglesia2024! | Administrador |
| douglas.guzman | Iglesia2024! | Administrador |
| andrea.joma | Iglesia2024! | Administrador |
| jeremy.galdamez | Iglesia2024! | Administrador |
| kevi.onan | Iglesia2024! | Administrador |
| kevin.ayala | Iglesia2024! | Administrador |

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

## Despliegue

```bash
npm run build
# Servir dist/ con nginx o similar
```

## Licencia

ISC