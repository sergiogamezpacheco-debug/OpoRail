fetch("/data/site.json")
  .then(res => res.json())
  .then(site => {
    const header = `
      <header class="bg-gradient-to-r from-green-700 to-purple-700 text-white">
        <div class="container mx-auto flex justify-between items-center px-4 py-4">
          <div class="flex items-center gap-3">
            <img src="${site.logo}" class="h-10" alt="OpoRail">
            <span class="text-xl font-bold">${site.title}</span>
          </div>

          <nav class="flex items-center gap-6">
            ${site.menu.map(item => `
              <a href="${item.link}" class="hover:underline">
                ${item.name}
              </a>
            `).join("")}
          </nav>
        </div>
      </header>
    `;
    document.getElementById("site-header").innerHTML = header;
  })
  .catch(err => console.error("Error cargando header:", err));
