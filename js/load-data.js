// js/load-data.js

// ---------- NOTICIAS (solo index) ----------
const noticiasContainer = document.getElementById('noticias-lista');
if (noticiasContainer) {
  fetch('/data/news.json')
    .then(res => res.json())
    .then(noticias => {
      noticiasContainer.innerHTML = noticias.map(n => `
        <div class="bg-white rounded-xl shadow p-5">
          <h3 class="font-bold text-lg mb-2">${n.titulo}</h3>
          <p class="text-gray-600 text-sm">${n.descripcion}</p>
        </div>
      `).join('');
    })
    .catch(err => console.error('Error noticias:', err));
}

// ---------- CURSOS ----------
const coursesContainer = document.getElementById('courses-list');
if (coursesContainer) {
  fetch('/data/courses.json')
    .then(res => res.json())
    .then(cursos => {
      coursesContainer.innerHTML = cursos.map(c => `
        <div class="bg-purple-700 text-white rounded-xl p-6 shadow-lg hover:scale-[1.02] transition">
          <h3 class="text-xl font-bold mb-2">${c.titulo}</h3>
          <p class="text-sm mb-4">${c.descripcion}</p>
          <span class="inline-block bg-white text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
            ${c.estado}
          </span>
        </div>
      `).join('');
    })
    .catch(err => {
      console.error('Error cursos:', err);
      coursesContainer.innerHTML = '<p>Error cargando cursos</p>';
    });
}

// ---------- PLANES ----------
const planesContainer = document.getElementById('planes-list');
if (planesContainer) {
  fetch('/data/planes.json')
    .then(res => res.json())
    .then(planes => {
      planesContainer.innerHTML = planes.map(p => `
        <div class="bg-purple-700 text-white rounded-xl p-6 shadow-lg">
          <h3 class="text-xl font-bold mb-2">${p.nombre}</h3>
          <p class="text-sm mb-4">${p.descripcion}</p>
          <p class="text-2xl font-bold">${p.precio}</p>
        </div>
      `).join('');
    })
    .catch(err => {
      console.error('Error planes:', err);
      planesContainer.innerHTML = '<p>Error cargando planes</p>';
    });
}
