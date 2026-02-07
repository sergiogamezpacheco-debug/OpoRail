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

## Tutorial rápido: cómo añadir preguntas y tests

Este proyecto carga las preguntas desde `data/test-bank-template.json`. Ahí puedes añadir tanto temario común como específico y psicotécnicos sin tocar JavaScript.

### 1) Localiza el archivo
* Ruta: `data/test-bank-template.json`

### 2) Añade preguntas en el bloque que corresponda
Ejemplo mínimo para temario común:
```json
{
  "default": {
    "test-comun": [
      {
        "question": "¿Cuál es el objetivo principal del mantenimiento preventivo?",
        "options": [
          "Reducir averías futuras",
          "Aumentar el consumo",
          "Eliminar revisiones",
          "Reducir la formación"
        ],
        "answer": "Reducir averías futuras"
      }
    ],
    "test-especifico": [],
    "psicotecnicos": {
      "omnibus": [],
      "sinonimosAntonimos": [],
      "seriesNumericas": [],
      "razonamientoAbstracto": [],
      "razonamientoVerbal": [],
      "atencionPercepcion": []
    }
  }
}
```

### 3) Añadir por curso (opcional)
Puedes personalizar preguntas por título de curso:
```json
{
  "byCourseTitle": {
    "Ajustador-Montador": {
      "test-especifico": [
        {
          "question": "¿Qué herramienta se usa para medir el par de apriete?",
          "options": ["Torquímetro", "Calibrador", "Micrómetro", "Galgas"],
          "answer": "Torquímetro"
        }
      ]
    }
  }
}
```

### 4) Guardar y refrescar
Guarda el archivo y recarga la página del curso para ver los nuevos datos.