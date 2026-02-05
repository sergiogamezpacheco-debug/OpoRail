function resolveDataPath(fileName) {
  const isUserPage = window.location.pathname.includes('/user/');
  return isUserPage ? `../data/${fileName}` : `/data/${fileName}`;
}

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

<<<<<<< HEAD
// ---------- CURSOS (listado) ----------
=======
function getActiveUserId() {
  const raw = localStorage.getItem('oporail_active_uid');
  return raw || null;
}

function addEnrollment(courseId) {
  const uid = getActiveUserId();
  if (!uid) return { ok: false, reason: 'not-authenticated' };

  const key = `oporail_enrollments_${uid}`;
  const raw = localStorage.getItem(key);
  let list = [];

  try {
    list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }

  if (!list.includes(courseId)) {
    list.push(courseId);
    localStorage.setItem(key, JSON.stringify(list));
  }

  return { ok: true };
}

function getFallbackCourseBlueprint(courseTitle) {
  return {
    intro: `Estructura recomendada para ${courseTitle}: preparada para que puedas cargar contenido progresivamente (tests, explicaciones y recursos).`,
    blocks: [
      {
        id: 'test-comun',
        title: 'Test · Temario común',
        description: 'Cuestionarios sobre legislación básica, prevención y marco general ferroviario. Recomendado para cimentar la base común.',
        items: [
          'Bloques de 25/50 preguntas con corrección inmediata',
          'Modo repaso por temas y modo examen cronometrado',
          'Registro de errores frecuentes para reforzar estudio',
        ],
      },
      {
        id: 'test-especifico',
        title: 'Test · Temario específico',
        description: 'Banco específico por especialidad de mantenimiento con dificultad progresiva.',
        items: [
          'Preguntas técnicas por subtema',
          'Mini-simulacros por especialidad',
          'Indicadores de acierto por bloque',
        ],
      },
      {
        id: 'psicotecnicos',
        title: 'Psicotécnicos (bloques habituales en OEP de mantenimiento)',
        description: 'Estructura propuesta según tipologías frecuentes en procesos selectivos de perfil mantenimiento.',
        items: [
          'Omnibus',
          'Sinónimos y antónimos',
          'Series numéricas',
          'Razonamiento abstracto',
          'Razonamiento verbal',
          'Atención y percepción',
        ],
      },
      {
        id: 'temario',
        title: 'Temario',
        description: 'Espacio para teoría en formato guía: explicación, esquemas, fichas y recursos descargables.',
        items: [
          'Tema 1: fundamentos y contexto',
          'Tema 2: procedimientos y normativa aplicada',
          'Tema 3: casos prácticos y resolución guiada',
        ],
      },
      {
        id: 'simulacros',
        title: 'Simulacros OEP',
        description: 'Sección preparada para simulacros completos por convocatoria (ej. 2022, 2023, 2024, 2025).',
        items: [
          'Simulacro por año y especialidad',
          'Informe de resultados y ranking de áreas a mejorar',
          'Reintento inteligente centrado en errores',
        ],
      },
    ],
  };
}

async function getCourseBlueprint(courseTitle) {
  try {
    const res = await fetch(resolveDataPath('course-content.json'));
    if (!res.ok) throw new Error('No se encontró course-content.json');

    const payload = await res.json();
    const custom = payload?.byCourseTitle?.[courseTitle];
    if (custom && Array.isArray(custom.blocks) && custom.blocks.length) {
      return custom;
    }

    if (payload?.default && Array.isArray(payload.default.blocks) && payload.default.blocks.length) {
      return payload.default;
    }
  } catch (error) {
    console.error('Error cargando estructura de contenido del curso:', error);
  }

  return getFallbackCourseBlueprint(courseTitle);
}

function renderCourseContentBlocks(blueprint) {
  return `
    <section class="mt-10">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Apartados del curso</h2>
      <p class="text-gray-600 mb-6">${escapeHtml(blueprint.intro || '')}</p>

      <div class="grid md:grid-cols-2 gap-4">
        ${blueprint.blocks
          .map(
            (block) => `
          <article id="${escapeHtml(block.id || 'bloque')}" class="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <h3 class="text-lg font-bold text-purple-700 mb-2">${escapeHtml(block.title || 'Apartado')}</h3>
            <p class="text-sm text-gray-700 mb-3">${escapeHtml(block.description || '')}</p>
            <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
              ${(Array.isArray(block.items) ? block.items : [])
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join('')}
            </ul>
          </article>
        `,
          )
          .join('')}
      </div>
    </section>
  `;
}

>>>>>>> 7dbc22b (Externalizar estructura de contenido de cursos en JSON)
const coursesContainer = document.getElementById('courses-list');
if (coursesContainer) {
  fetch(resolveDataPath('courses.json'))
    .then((res) => {
      if (!res.ok) throw new Error('Cursos no encontrados');
      return res.json();
    })
    .then((cursos) => {
      coursesContainer.innerHTML = cursos
        .map((c, index) => {
          const courseId = index + 1;
          const courseStateClass = c.estado === 'Disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
          return `
          <article class="bg-purple-700 text-white rounded-xl p-6 shadow-lg hover:scale-[1.02] transition">
            <h3 class="text-xl font-bold mb-2">${escapeHtml(c.titulo)}</h3>
            <p class="text-sm mb-4">${escapeHtml(c.descripcion)}</p>
            <div class="flex items-center justify-between gap-3">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold ${courseStateClass}">
                ${escapeHtml(c.estado)}
              </span>
              <a href="/curso.html?id=${courseId}" class="inline-flex items-center bg-white text-purple-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition">
                Ver curso
              </a>
            </div>
          </article>
        `;
        })
        .join('');
    })
    .catch((err) => {
      console.error('Error cargando cursos:', err);
      coursesContainer.innerHTML = '<p class="text-red-600">Error cargando cursos</p>';
    });
}

const courseDetailContainer = document.getElementById('course-detail');
if (courseDetailContainer) {
  const params = new URLSearchParams(window.location.search);
  const selectedId = Number(params.get('id'));

  fetch(resolveDataPath('courses.json'))
    .then((res) => {
      if (!res.ok) throw new Error('Cursos no encontrados');
      return res.json();
    })
    .then(async (cursos) => {
      const fallbackCourse = cursos[0];
      const course = Number.isNaN(selectedId) || selectedId < 1 || selectedId > cursos.length
        ? fallbackCourse
        : cursos[selectedId - 1];

      if (!course) {
        courseDetailContainer.innerHTML = '<p class="text-red-600">No se encontró el curso solicitado.</p>';
        return;
      }

      const blueprint = await getCourseBlueprint(course.titulo);

      courseDetailContainer.innerHTML = `
        <article class="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <p class="text-sm font-semibold text-purple-700 mb-2">Curso OpoRail</p>
          <h1 class="text-4xl font-extrabold text-gray-900 mb-4">${escapeHtml(course.titulo)}</h1>
          <p class="text-lg text-gray-700 mb-6">${escapeHtml(course.descripcion)}</p>

          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span class="inline-flex px-4 py-2 rounded-full text-sm font-semibold ${course.estado === 'Disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
              ${escapeHtml(course.estado)}
            </span>
            <a href="/cursos.html" class="inline-flex bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-800 transition">
              Volver a cursos
            </a>
            <a href="/user/index.html" class="inline-flex bg-white border border-purple-700 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Acceder al panel
            </a>
          </div>

          <section class="grid md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p class="text-xs uppercase tracking-wide text-gray-500">Duración orientativa</p>
              <p class="text-base font-semibold text-gray-800">12 semanas</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p class="text-xs uppercase tracking-wide text-gray-500">Modalidad</p>
              <p class="text-base font-semibold text-gray-800">Online</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p class="text-xs uppercase tracking-wide text-gray-500">Tutorías</p>
              <p class="text-base font-semibold text-gray-800">Semanales en directo</p>
            </div>
          </section>
<<<<<<< HEAD
=======

          ${renderCourseContentBlocks(blueprint)}
>>>>>>> 7dbc22b (Externalizar estructura de contenido de cursos en JSON)
        </article>
      `;
    })
    .catch((err) => {
      console.error('Error cargando detalle del curso:', err);
      courseDetailContainer.innerHTML = '<p class="text-red-600">Error cargando el detalle del curso</p>';
    });
}

const planesContainer = document.getElementById('planes-list');
if (planesContainer) {
  fetch(resolveDataPath('planes.json'))
    .then((res) => {
      if (!res.ok) throw new Error('Planes no encontrados');
      return res.json();
    })
    .then((planes) => {
      planesContainer.innerHTML = planes
        .map(
          (p) => `
        <article class="bg-purple-700 text-white rounded-xl p-6 shadow-lg hover:scale-[1.02] transition">
          <h3 class="text-xl font-bold mb-2">${escapeHtml(p.nombre)}</h3>
          <p class="text-sm mb-4">${escapeHtml(p.descripcion)}</p>
          <p class="text-2xl font-bold">${escapeHtml(p.precio)}</p>
        </article>
      `,
        )
        .join('');
    })
    .catch((err) => {
      console.error('Error cargando planes:', err);
      planesContainer.innerHTML = '<p class="text-red-600">Error cargando planes</p>';
    });
}

const newsContainer = document.getElementById('news-list');
if (newsContainer) {
  fetch(resolveDataPath('news.json'))
    .then((res) => {
      if (!res.ok) throw new Error('Noticias no encontradas');
      return res.json();
    })
    .then((payload) => {
      const articles = payload.articles || [];

      if (!articles.length) {
        newsContainer.innerHTML = '<p class="text-gray-600">Pronto publicaremos nuevas noticias.</p>';
        return;
      }

      newsContainer.innerHTML = articles
        .map((article) => {
          const rawDate = article.date ? new Date(article.date) : null;
          const prettyDate = rawDate && !Number.isNaN(rawDate.valueOf())
            ? rawDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
            : 'Fecha pendiente';

          return `
          <article class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="h-44 bg-gray-100">
              <img src="${escapeHtml(article.image || '/img/uploads/default-news.jpg')}" alt="${escapeHtml(article.title || 'Noticia OpoRail')}" class="w-full h-full object-cover" loading="lazy">
            </div>
            <div class="p-5">
              <p class="text-xs uppercase tracking-wide text-purple-700 font-semibold mb-2">${prettyDate}</p>
              <h3 class="text-lg font-bold text-gray-900 mb-2">${escapeHtml(article.title || 'Nueva noticia')}</h3>
              <p class="text-sm text-gray-600">${escapeHtml(article.summary || 'Sin resumen disponible.')}</p>
            </div>
          </article>
        `;
        })
        .join('');
    })
    .catch((err) => {
      console.error('Error cargando noticias:', err);
      newsContainer.innerHTML = '<p class="text-red-600">Error cargando noticias</p>';
    });
}