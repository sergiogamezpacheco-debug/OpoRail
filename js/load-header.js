// /js/load-header.js
document.addEventListener('DOMContentLoaded', () => {
  fetch('data/site.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('No se pudo cargar data/site.json');
      }
      return response.json();
    })
    .then(data => {
      const headerContainer = document.getElementById('site-header');
      if (!headerContainer) return;

      const { title, menu } = data;

      headerContainer.innerHTML = `
        <header class="bg-gradient-to-r from-green-700 to-purple-700 text-white shadow-lg">
          <div class="container mx-auto flex justify-between items-center p-4">

            <!-- LOGO / TITULO -->
            <div class="flex items-center space-x-3">
              <span class="text-xl font-semibold">${title}</span>
            </div>

            <!-- MENU -->
            <nav>
              <ul class="flex space-x-6 text-sm font-medium">
                ${menu.map(item => `
                  <li>
                    <a href="${item.link}" class="hover:text-gray-200 transition">
                      ${item.name}
                    </a>
                  </li>
                `).join('')}
              </ul>
            </nav>

            <!-- ICONO PANEL USUARIO (CIRCULO GRIS) -->
            <a href="user/index.html" title="Panel de usuario">
              <div class="h-10 w-10 rounded-full bg-gray-400 border border-white cursor-pointer hover:ring-2 hover:ring-white transition"></div>
            </a>

          </div>
        </header>
      `;
    })
    .catch(err => {
      console.error('ERROR cargando el header:', err);
    });
});
