document.addEventListener('DOMContentLoaded', () => {

  const coursesEl = document.getElementById('courses-list');
  if (coursesEl) {
    fetch('/data/courses.json')
      .then(r => r.json())
      .then(data => {
        coursesEl.innerHTML = data.map(c => `
          <div class="bg-purple-700 text-white p-6 rounded-xl shadow-lg">
            <h3 class="text-xl font-bold mb-2">${c.titulo}</h3>
            <p class="text-purple-100 mb-4">${c.descripcion}</p>
            <span class="bg-white text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
              ${c.estado}
            </span>
          </div>
        `).join('');
      });
  }

  const planesEl = document.getElementById('planes-list');
  if (planesEl) {
    fetch('/data/planes.json')
      .then(r => r.json())
      .then(data => {
        planesEl.innerHTML = data.map(p => `
          <div class="bg-purple-700 text-white p-6 rounded-xl shadow-lg text-center">
            <h3 class="text-2xl font-bold mb-3">${p.nombre}</h3>
            <p class="text-purple-100 mb-4">${p.descripcion}</p>
            <div class="bg-white text-purple-700 px-6 py-2 rounded-full text-xl font-bold">
              ${p.precio}
            </div>
          </div>
        `).join('');
      });
  }

});
