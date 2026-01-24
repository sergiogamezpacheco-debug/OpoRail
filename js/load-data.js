document.addEventListener('DOMContentLoaded', () => {

  // CURSOS
  const coursesContainer = document.getElementById('courses-list');
  if (coursesContainer) {
    fetch('/data/cursos.json')
      .then(res => res.json())
      .then(cursos => {
        coursesContainer.innerHTML = cursos.map(curso => `
          <div class="bg-purple-700 text-white rounded-xl p-6 shadow-lg hover:scale-105 transition">
            <h3 class="text-xl font-bold mb-2">${curso.titulo}</h3>
            <p class="text-sm mb-4">${curso.descripcion}</p>
            <span class="inline-block px-3 py-1 rounded-full text-xs bg-white text-purple-700 font-semibold">
              ${curso.estado}
            </span>
          </div>
        `).join('');
      })
      .catch(err => {
        coursesContainer.innerHTML = '<p class="text-red-600">Error cargando cursos</p>';
        console.error(err);
      });
  }

  // PLANES
  const planesContainer = document.getElementById('planes-list');
  if (planesContainer) {
    fetch('/data/planes.json')
      .then(res => res.json())
      .then(planes => {
        planesContainer.innerHTML = planes.map(plan => `
          <div class="bg-purple-700 text-white rounded-xl p-6 shadow-lg hover:scale-105 transition">
            <h3 class="text-xl font-bold mb-2">${plan.nombre}</h3>
            <p class="text-sm mb-4">${plan.descripcion}</p>
            <p class="text-2xl font-bold mb-4">${plan.precio}</p>
            <ul class="text-sm mb-4 list-disc list-inside">
              ${plan.caracteristicas.map(c => `<li>${c}</li>`).join('')}
            </ul>
            <button class="bg-white text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Elegir plan
            </button>
          </div>
        `).join('');
      })
      .catch(err => {
        planesContainer.innerHTML = '<p class="text-red-600">Error cargando planes</p>';
        console.error(err);
      });
  }

});
