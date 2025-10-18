// /js/load-footer.js
document.addEventListener("DOMContentLoaded", async () => {
  const footerContainer = document.getElementById("site-footer");
  if (!footerContainer) return;

  try {
    const response = await fetch("/data/site.json");
    const data = await response.json();
    const footer = data.footer;

    footerContainer.innerHTML = `
      <footer class="bg-gradient-to-r from-purple-700 to-indigo-800 text-white mt-12 py-10">
        <div class="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h2 class="font-bold text-lg mb-2">${footer.title}</h2>
            <p class="text-sm">${footer.description}</p>
          </div>

          <div>
            <h2 class="font-bold text-lg mb-2">Enlaces rápidos</h2>
            <ul class="space-y-2">
              ${footer.links.map(link => `<li><a href="${link.url}" class="hover:underline">${link.name}</a></li>`).join('')}
            </ul>
          </div>

          <div>
            <h2 class="font-bold text-lg mb-2">Síguenos</h2>
            <div class="flex justify-center md:justify-start gap-4">
              ${footer.social.map(s => `
                <a href="${s.url}" target="_blank" rel="noopener" class="hover:text-purple-300">
                  <i class="${s.icon} text-xl"></i>
                </a>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="text-center text-xs mt-8 border-t border-purple-500 pt-4">
          © ${new Date().getFullYear()} OpoRail. Todos los derechos reservados.
        </div>
      </footer>
    `;
  } catch (error) {
    console.error("Error al cargar el footer:", error);
  }
});
