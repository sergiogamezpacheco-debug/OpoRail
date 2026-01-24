document.addEventListener('DOMContentLoaded', () => {

  // ===== CURSOS =====
  const courses = document.getElementById('courses-list');

  if (courses) {
    fetch('/data/cursos.json')
      .then(res => res.json())
      .then(data => {
        courses.innerHTML = data.map(curso => `
          <div class="bg-purple-700 text-white rounded-xl p-6 shadow-lg">
            <h3 class="text-xl font-bold mb-3">${curso.titulo}</h3>
            <p class="mb-4 text-purple-100">${curso.descripcion}</p>
            <span class="text-sm font-semibold bg-white text-purple-700 px-3 py-1 rounded-full">
              ${curso.estado}
            </span>
          </div>
        `).join('');
      })
      .catch(err => console.error('Error cargando cursos', err));
  }

  // ===== PLANES =====
  const planes = document.getElementById('planes-list');

  if (planes) {
    fetch('/data/planes.json')
      .then(res => res.json())
      .then(data => {
        planes.innerHTML = data.map(plan => `
          <div class="bg-purple-700 text-white rounded-xl p-6 shadow-lg text-center">
            <h3 class="text-2xl font-bold mb-3">${plan.nombre}</h3>
            <p class="mb-4 text-purple-100">${plan.descripcion}</p>
            <div class="text-3xl font-extrabold bg-white text-purple-700 inline-block px-6 py-2 rounded-full">
              ${plan.precio}
            </div>
          </div>
        `).join('');
      })
      .catch(err => console.error('Error cargando planes', err));
  }

});
