fetch('/data/site.json')
  .then((res) => res.json())
  .then((site) => {
    const isHome = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html');

    const header = `
      <header class="${isHome ? 'absolute top-0 left-0 right-0 z-20 text-white' : 'bg-white shadow'}">
        <div class="max-w-[1200px] mx-auto px-6 py-5 flex justify-between items-center">
          <a href="/index.html" class="text-5xl md:text-4xl font-extrabold tracking-tight ${isHome ? 'text-white' : 'text-gray-900'}">
            OpoRail
          </a>

          <nav class="flex items-center gap-8 text-xl md:text-lg font-semibold ${isHome ? 'text-white' : 'text-gray-700'}">
            ${site.menu
              .map(
                (item) => `
              <a href="${item.link}" class="hover:opacity-80 transition">
                ${item.name}
              </a>
            `,
              )
              .join('')}
          </nav>
        </div>
      </header>
    `;

    document.getElementById('site-header').innerHTML = header;
  })
  .catch((err) => {
    console.error('Error cargando header:', err);
  });
