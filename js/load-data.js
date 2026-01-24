document.addEventListener('DOMContentLoaded', () => {

  // ===== CURSOS =====
  const coursesContainer = document.getElementById('courses-list');
  if (coursesContainer) {
    fetch('data/cursos.json')
      .then(res => res.json())
      .then(cursos => {
        coursesContainer.innerHTML = cursos.map(curso => `
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-xl font-semibold mb-2">${curso.titulo}</h3>
            <p class="text-gray-600 mb-4">${curso.descripcion}</p>
            <span class="text-sm font-medium text-purple-700">
              ${curso.estado}
            </span>
          </div>
        `).join('');
      });
  }

  // ===== PLANES =====
  const planesContainer = document.getElementById('planes-list');
  if (planesContainer) {
    fetch('data/planes.json')
      .then(res => res.json())
      .then(planes => {
        planesContainer.innerHTML = planes.map(plan => `
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-xl font-semibold mb-2">${plan.nombre}</h3>
            <p class="text-gray-600 mb-4">${plan.descripcion}</p>
            <div class="text-2xl font-bold text-purple-700">
              ${plan.precio}
            </div>
          </div>
        `).join('');
      });
  }

});
