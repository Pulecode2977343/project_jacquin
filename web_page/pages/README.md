# 🎹 JACQUIN - Frontend (React Components)

Este directorio contiene la lógica de los componentes React utilizados en la plataforma Jacquin, integrados mediante una arquitectura de Micro-Frontends.

## 🚀 Arquitectura de Micro-Frontends
El Header y el Footer son componentes React independientes que se compilan como bundles de JavaScript para ser utilizados en páginas HTML tradicionales (Dashboards).

### Comandos de Compilación
Para regenerar los bundles después de realizar cambios en los componentes:

- **Build Footer**: `npm run build:footer` (Genera `public/js/react-footer.bundle.js`)
- **Build Header**: `npm run build:header` (Genera `public/js/react-header.bundle.js`)
- **Desarrollo**: `npm start`

## 🛠️ Tecnologías
- **React 18**: Framework de interfaz.
- **Esbuild**: Empaquetador ultra-rápido para los bundles MFE.
- **Vanilla CSS**: Estilos modulares (`footer.css`, `style.css`).

## 📡 Comunicación Multi-Frontend
Los componentes se comunican con el resto del sistema (Vanilla JS) a través de eventos personalizados:

- `enrollment-status-updated`: Disparado desde el dashboard administrativo para actualizar el `EnrollmentStatusBadge` en tiempo real sin recargar la página.

---
*Mantenido por el equipo de ADSO - 2026*
