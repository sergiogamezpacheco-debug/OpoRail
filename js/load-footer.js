// /js/load-footer.js
fetch('/data/site.json')
  .then(res => res.json())
  .then(data => {
    const footerContainer = document.getElementById('site-footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
      <footer class="bg-gray-800 text-white py-8 mt-12">
        <div class="container mx-auto px-4 text-center md:text-left md:flex md:justify-between md:items-center">
          <div class="mb-4 md:mb-0">
            <h3 class="font-bold text-lg">OpoRail</h3>
            <p class="text-gray-300 text-sm">Academia online de preparación para oposiciones Renfe</p>
            <p class="text-gray-400 text-xs mt-1">&copy; ${new Date().getFullYear()} OpoRail. Todos los derechos reservados.</p>
          </div>
          <div class="space-x-4 text-sm">
            <a href="/index.html" class="hover:underline text-gray-300">Inicio</a>
            <a href="/cursos.html" class="hover:underline text-gray-300">Cursos</a>
            <a href="/planes.html" class="hover:underline text-gray-300">Planes</a>
            <a href="/contacto.html" class="hover:underline text-gray-300">Contacto</a>
          </div>
        </div>
      </footer>
    `;
  })
  .catch(err => console.error("Error cargando el footer:", err));
