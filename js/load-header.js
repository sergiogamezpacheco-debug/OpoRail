fetch('/data/site.json')
  .then((res) => res.json())
  .then((site) => {
    const isCoursePage = window.location.pathname.includes('curso.html');
    const headerClass = isCoursePage
      ? 'relative z-20 text-white bg-gradient-to-r from-[#0b5a2a] to-purple-700'
      : 'absolute top-0 left-0 right-0 z-20 text-white';

    const header = `
      <header class="${headerClass}">
        <div class="max-w-[1200px] mx-auto px-6 py-3 relative flex items-center">
          <a href="/index.html" class="absolute left-1/2 -translate-x-1/2 text-3xl font-bold text-white">
            <span class="text-white">Opo</span><span class="text-white">Rail</span>
          </a>

          <nav class="ml-auto pl-32 flex items-center gap-8 font-medium text-white">
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
              <div class="h-10 w-10 rounded-full bg-gray-400 border border-white hover:ring-2 hover:ring-purple-600 transition"></div>
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