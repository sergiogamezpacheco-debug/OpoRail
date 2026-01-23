// /js/load-data.js
// Carga cursos
fetch('/data/courses.json')
  .then(res => res.json())
  .then(data => {
    const coursesList = document.getElementById('courses-list');
    if(coursesList){
      coursesList.innerHTML = data.map(c => `
        <div class="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
          <h3 class="font-semibold text-lg mb-2">${c.title}</h3>
          <p class="text-gray-600">${c.description}</p>
          <a href="${c.link}" class="mt-2 inline-block bg-purple-700 text-white px-4 py-2 rounded-lg">Acceder</a>
        </div>
      `).join('');
    }
  })
  .catch(err => console.error("Error cargando cursos:", err));

// Carga planes
fetch('/data/planes.json')
  .then(res => res.json())
  .then(data => {
    const planesList = document.getElementById('planes-list');
    if(planesList){
      planesList.innerHTML = data.map(p => `
        <div class="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
          <h3 class="font-semibold text-lg mb-2">${p.title}</h3>
          <p class="text-gray-600">${p.description}</p>
          <p class="font-semibold">${p.price}</p>
        </div>
      `).join('');
    }
  })
  .catch(err => console.error("Error cargando planes:", err));
