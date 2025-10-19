// /js/load-data.js

// === CARGAR NOTICIAS ===
if (document.getElementById('noticias-lista')) {
  fetch('/data/news.json')
    .then(res => res.json())
    .then(noticias => {
      const container = document.getElementById('noticias-lista');
      container.innerHTML = noticias.map(n => `
        <article class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
          <img src="${n.image}" alt="${n.title}" class="w-full h-40 object-cover rounded-md mb-3">
          <h3 class="font-bold text-lg mb-1">${n.title}</h3>
          <p class="text-gray-600 text-sm mb-3">${n.excerpt}</p>
          <a href="${n.link}" target="_blank" class="text-purple-700 font-semibold">Leer más</a>
        </article>
      `).join('');
    })
    .catch(err => console.error("Error cargando noticias:", err));
}

// === CARGAR CURSOS ===
if (document.getElementById('courses-list')) {
  fetch('/data/courses.json')
    .then(res => res.json())
    .then(cursos => {
      const container = document.getElementById('courses-list');
      container.innerHTML = cursos.map(curso => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
          <img src="${curso.image}" alt="${curso.name}" class="w-full h-48 object-cover">
          <div class="p-4">
            <h3 class="text-lg font-bold mb-2">${curso.name}</h3>
            <p class="text-sm text-gray-600 mb-3">${curso.description}</p>
            <a href="/user/dashboard.html" class="inline-block bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-800 transition">Acceder</a>
          </div>
        </div>
      `).join('');
    })
    .catch(err => console.error("Error cargando cursos:", err));
}

// === CARGAR PLANES ===
if (document.getElementById('planes-list')) {
  fetch('/data/planes.json')
    .then(res => res.json())
    .then(planes => {
      const container = document.getElementById('planes-list');
      container.innerHTML = planes.map(plan => `
        <div class="bg-white rounded-lg shadow-md p-5 text-center hover:shadow-xl transition">
          <h3 class="text-xl font-bold mb-2">${plan.name}</h3>
          <p class="text-gray-600 text-sm mb-4">${plan.description}</p>
          <span class="block text-2xl font-semibold text-purple-700 mb-3">${plan.price}</span>
          <a href="/admin/auth.html" class="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition">Comenzar</a>
        </div>
      `).join('');
    })
    .catch(err => console.error("Error cargando planes:", err));
}
