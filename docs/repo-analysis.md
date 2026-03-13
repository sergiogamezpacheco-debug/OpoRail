# Análisis inicial del repositorio OpoRail

## Estado de sincronización

- Repositorio limpio (`git status` sin cambios locales pendientes).
- Rama activa: `work`.
- No hay remotos configurados en el repositorio local, por lo que no se puede ejecutar `git pull`/`git fetch` contra origen hasta que se configure un `remote`.

## Estructura general detectada

- Sitio web estático con páginas HTML principales en raíz (`index.html`, `cursos.html`, `curso.html`, `planes.html`, etc.).
- Área de usuario en `user/` y área de administración en `admin/`.
- Lógica cliente en `js/` (autenticación, carga de datos, pagos, panel de usuario, recordatorios).
- Estilos globales y de panel en `css/`.
- Datos en formato JSON en `data/` (cursos, noticias, planes, bancos de preguntas, configuración de sitio, pagos).
- Función serverless en `netlify/functions/stripe-verify.js` para verificación de Stripe.

## Puntos clave para futuras modificaciones web

1. **Arquitectura de datos**
   - El contenido funcional parece depender fuertemente de archivos JSON bajo `data/`.
   - Recomendable validar contratos entre `js/load-data.js` y los esquemas actuales.

2. **Flujos críticos**
   - Registro/login (`user/register.html`, `js/auth.js`).
   - Dashboard y perfil (`user/dashboard.html`, `user/profile.html`, `js/user-panel.js`).
   - Pagos (`js/payments.js`, `data/payment.json`, `netlify/functions/stripe-verify.js`).

3. **Consistencia visual**
   - CSS centralizado en `css/style.css` y estilos de usuario en `css/user-panel.css`.
   - Conviene preparar una pequeña guía de componentes (botones, tarjetas, formularios) antes de cambios visuales grandes.

4. **Calidad y mantenimiento**
   - No se detectó de momento estructura de tests automatizados.
   - Propuesta siguiente paso: definir checklist de smoke test manual para rutas clave.

## Criterio de reporte de cambios (a partir de ahora)

En cada entrega se informará explícitamente:

- **Archivos modificados**
- **Archivos creados**
- **Archivos eliminados**

Además, si se trabaja con PR, se mantendrá la rama al día para facilitar el flujo de “Actualizar rama” en plataforma de revisión (cuando exista remoto configurado y PR abierto).
