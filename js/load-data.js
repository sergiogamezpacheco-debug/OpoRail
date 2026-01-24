document.addEventListener('DOMContentLoaded', () => {

  // ===== CURSOS =====
  const coursesContainer = document.getElementById('courses-list');
  if (coursesContainer) {
    fetch('/data/cursos.json')
      .then(r => r.json())
      .then(cursos => {
        coursesContainer.innerHTML = cursos.map(c => `
          <div class="bg-purple-700 text-white rounded-xl p-6 shadow-lg">
            <h3 class="text-xl font-bold mb-2">${c.titulo}</h3>
            <p class="text-purple-100 mb-4">${c.descripcion}</p>
            <span class="inline-block bg-white text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
              ${c.estado}
            </span>
          </div>
        `).join('');
      });
  }

  // ===== PLANES =====
  const planesContainer = document.getElementById('planes-list');
  if (planesContainer) {
    fetch('/data/planes.json')
      .then(r => r.json())
      .then(planes => {
        planesContainer.innerHTML = planes.map(p => `
          <div class="bg-purple-700 text-white rounded-xl p-6 shadow-lg text-center">
            <h3 class="text-2xl font-bold mb-3">${p.nombre}</h3>
            <p class="text-purple-100 mb-4">${p.descripcion}</p>
            <div class="bg-white text-purple-700 inline-block px-6 py-2 rounded-full text-2xl font-bold">
              ${p.precio}
            </div>
          </div>
        `).join('');
      });
  }

});
