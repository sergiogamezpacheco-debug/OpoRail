fetch("/data/site.json")
  .then(res => res.json())
  .then(site => {
    const header = `
      <header class="bg-white shadow">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/index.html" class="text-2xl font-bold">
            <span class="text-green-700">Opo</span><span class="text-purple-700">Rail</span>
          </a>

          <nav class="flex items-center gap-6">
            ${site.menu.map(item => `
              <a href="${item.link}" class="text-gray-700 hover:text-purple-700 font-medium">
                ${item.name}
              </a>
            `).join("")}

            <!-- ICONO USUARIO -->
            <a href="/user/index.html" title="Panel de usuario">
              <div class="h-10 w-10 rounded-full bg-gray-400 border border-white hover:ring-2 hover:ring-purple-600 transition"></div>
            </a>
          </nav>
        </div>
      </header>
    `;

    document.getElementById("site-header").innerHTML = header;
  })
  .catch(err => {
    console.error("Error cargando header:", err);
  });
