fetch('/data/site.json')
  .then((res) => res.json())
  .then((site) => {
    const isHome = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html');

    const header = `
      <header class="${isHome ? 'absolute top-0 left-0 right-0 z-20 text-white' : 'bg-white shadow'}">
        <div class="max-w-[1200px] mx-auto px-6 py-3 relative flex items-center">
          <a href="/index.html" class="absolute left-1/2 -translate-x-1/2 text-3xl font-bold ${isHome ? 'text-white' : 'text-gray-900'}">
            <span class="${isHome ? 'text-white' : 'text-green-700'}">Opo</span><span class="${isHome ? 'text-white' : 'text-purple-700'}">Rail</span>
          </a>

          <nav class="ml-auto pl-20 flex items-center gap-8 font-medium ${isHome ? 'text-white' : 'text-gray-700'}">
            ${site.menu
              .map(
                (item) => `
              <a href="${item.link}" class="hover:opacity-80 transition">
                ${item.name}
              </a>
            `,
              )
              .join('')}

            <a href="/user/index.html" title="Panel de usuario" aria-label="Panel de usuario">
              <div class="h-10 w-10 rounded-full bg-gray-400 border ${isHome ? 'border-white' : 'border-gray-200'} hover:ring-2 hover:ring-purple-600 transition"></div>
            </a>
          </nav>
        </div>
      </header>
    `;

    document.getElementById('site-header').innerHTML = header;
  })
  .catch((err) => {
    console.error('Error cargando header:', err);
  });
