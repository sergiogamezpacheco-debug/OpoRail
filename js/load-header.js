// js/load-header.js
document.addEventListener("DOMContentLoaded", async () => {
  const headerContainer = document.getElementById("site-header");
  if (!headerContainer) return;

  try {
    const response = await fetch("/data/site.json");
    const siteData = await response.json();

    headerContainer.innerHTML = `
      <header class="bg-gradient-to-r from-green-700 to-purple-700 text-white shadow-md fixed top-0 left-0 w-full z-50">
        <nav class="container mx-auto flex justify-between items-center py-4 px-6">
          <a href="index.html" class="text-2xl font-bold">${siteData.nombre}</a>
          <ul class="flex space-x-6 text-lg font-medium">
            <li><a href="index.html" class="hover:text-gray-200">Inicio</a></li>
            <li><a href="cursos.html" class="hover:text-gray-200">Cursos</a></li>
            <li><a href="planes.html" class="hover:text-gray-200">Planes</a></li>
            <li><a href="noticias.html" class="hover:text-gray-200">Noticias</a></li>
            <li><a href="contacto.html" class="hover:text-gray-200">Contacto</a></li>
            <li><a href="admin/auth.html" class="hover:text-gray-200">Acceder</a></li>
          </ul>
        </nav>
      </header>
      <div class="pt-20"></div> <!-- Espacio para compensar el header fijo -->
    `;
  } catch (error) {
    console.error("Error cargando el header:", error);
  }
});
