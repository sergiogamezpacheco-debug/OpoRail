function resolveDataPath(fileName) {
  const isUserPage = window.location.pathname.includes('/user/');
  return isUserPage ? `../data/${fileName}` : `/data/${fileName}`;
}

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\"', '&quot;')
    .replaceAll("'", '&#39;');
}

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

// ---------- CURSOS (listado) ----------
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

// ---------- CURSO (detalle) ----------
const courseDetailContainer = document.getElementById('course-detail');
if (courseDetailContainer) {
  const params = new URLSearchParams(window.location.search);
  const selectedId = Number(params.get('id'));

  fetch(resolveDataPath('courses.json'))
    .then((res) => {
      if (!res.ok) throw new Error('Cursos no encontrados');
      return res.json();
    })
    .then((cursos) => {
      const fallbackCourse = cursos[0];
      const isInvalidId = Number.isNaN(selectedId) || selectedId < 1 || selectedId > cursos.length;
      const courseId = isInvalidId ? 1 : selectedId;
      const course = isInvalidId ? fallbackCourse : cursos[selectedId - 1];

      if (!course) {
        courseDetailContainer.innerHTML = '<p class="text-red-600">No se encontró el curso solicitado.</p>';
        return;
      }

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
            <button id="enroll-course-btn" data-course-id="${courseId}" class="inline-flex bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition">
              Añadir a mi panel
            </button>
          </div>

          <p id="enroll-feedback" class="text-sm text-gray-600 -mt-4 mb-6"></p>

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
        </article>
      `;

      const enrollBtn = document.getElementById('enroll-course-btn');
      const enrollFeedback = document.getElementById('enroll-feedback');

      if (enrollBtn && enrollFeedback) {
        enrollBtn.addEventListener('click', () => {
          const id = Number(enrollBtn.dataset.courseId);
          const result = addEnrollment(id);

          if (!result.ok) {
            enrollFeedback.textContent = 'Inicia sesión para añadir este curso a tu panel.';
            return;
          }

          enrollFeedback.textContent = 'Curso añadido correctamente. Lo verás en tu panel de usuario.';
        });
      }
    })
    .catch((err) => {
      console.error('Error cargando detalle del curso:', err);
      courseDetailContainer.innerHTML = '<p class="text-red-600">Error cargando el detalle del curso</p>';
    });
}

// ---------- PLANES ----------
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

// ---------- NOTICIAS (home) ----------
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