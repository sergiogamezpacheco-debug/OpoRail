// /js/load-header.js
fetch('/data/site.json')
  .then(response => response.json())
  .then(data => {
    const headerContainer = document.getElementById('site-header');
    if (!headerContainer) return;

    const { title, logo, menu } = data;

    headerContainer.innerHTML = `
      <header class="bg-gradient-to-r from-green-700 to-purple-700 text-white shadow-lg">
        <div class="container mx-auto flex justify-between items-center p-4">
          <div class="flex items-center space-x-3">
            <img src="${logo}" alt="${title}" class="h-10 w-10 rounded-full border border-white">
            <span class="text-xl font-semibold">${title}</span>
          </div>

          <nav>
            <ul class="flex space-x-6 text-sm font-medium">
              ${menu.map(item => `
                <li>
                  <a href="${item.link}" class="hover:text-gray-200 transition">${item.name}</a>
                </li>
              `).join('')}
            </ul>
          </nav>

          <div>
            <a href="/admin/auth.html" class="bg-white text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Acceder
            </a>
          </div>
        </div>
      </header>
    `;
  })
  .catch(err => console.error("Error cargando el header:", err));
