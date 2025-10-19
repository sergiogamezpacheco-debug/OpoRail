// /js/load-footer.js
fetch('/data/site.json')
  .then(response => response.json())
  .then(data => {
    const footerContainer = document.getElementById('site-footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
      <footer class="bg-gray-900 text-gray-300 py-10 mt-16">
        <div class="container mx-auto px-6 grid md:grid-cols-3 gap-8">
          
          <div>
            <h3 class="text-white text-lg font-semibold mb-3">${data.title}</h3>
            <p class="text-sm leading-relaxed">${data.description}</p>
          </div>

          <div>
            <h3 class="text-white text-lg font-semibold mb-3">Enlaces útiles</h3>
            <ul class="space-y-2 text-sm">
              ${data.menu.map(item => `
                <li><a href="${item.link}" class="hover:text-white transition">${item.name}</a></li>
              `).join('')}
            </ul>
          </div>

          <div>
            <h3 class="text-white text-lg font-semibold mb-3">Síguenos</h3>
            <div class="flex space-x-4">
              ${Object.entries(data.social || {}).map(([name, link]) => `
                <a href="${link}" target="_blank" rel="noopener noreferrer" class="hover:text-white transition">
                  <i class="fab fa-${name}"></i>
                </a>
              `).join('')}
            </div>
          </div>

        </div>
        <div class="text-center text-gray-500 text-sm mt-10 border-t border-gray-800 pt-4">
          &copy; ${new Date().getFullYear()} ${data.title}. Todos los derechos reservados.
        </div>
      </footer>
    `;
  })
  .catch(err => console.error("Error cargando el footer:", err));
