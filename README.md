# OpoRail - web estática editable con Netlify CMS

Estructura:
- index.html, cursos.html, curso.html, planes.html
- /data/*.json → editable desde Netlify CMS
- /admin → Netlify CMS admin

Sigue las instrucciones en el panel de Netlify para desplegar y activar Identity + Git Gateway.


## Contenido de cursos (edición rápida)
- Estructura de apartados por curso: `data/course-content.json`.
- Plantilla de banco de preguntas tipo test: `data/test-bank-template.json`.

Puedes editar estos JSON directamente para añadir bloques, preguntas y categorías sin tocar `js/load-data.js`.
