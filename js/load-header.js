fetch('/data/site.json')
  .then((res) => res.json())
  .then((site) => {
    const pathname = window.location.pathname;
    const courseRoutes = new Set(['/curso', '/curso.html', '/test-info', '/test-info.html', '/test-run', '/test-run.html']);
    const isCoursePage = courseRoutes.has(pathname);
    const activeUid = localStorage.getItem('oporail_active_uid');
    const headerClass = isCoursePage
      ? 'absolute top-0 left-0 right-0 z-20 text-white bg-gradient-to-r from-[#0b5a2a] to-purple-700 shadow-md'
      : 'absolute top-0 left-0 right-0 z-20 text-white';

    const header = `
      <header class="${headerClass}">
        <div class="max-w-[1200px] mx-auto px-6 py-3 relative flex items-center">
          <a href="/index.html" class="absolute left-1/2 -translate-x-1/2 text-3xl font-bold text-white">
            <span class="text-white">Opo</span><span class="text-white">Rail</span>
          </a>

          <nav class="ml-auto pl-32 flex items-center gap-8 font-medium text-white">
            ${site.menu
              .map((item) => {
                const isAccessLink = item.link === '/user/index.html' || item.name.toLowerCase() === 'acceder';
                if (isAccessLink && activeUid) {
                  return `
              <a href="#" data-logout class="hover:opacity-80 transition">
                Desconectar
              </a>
            `;
                }

                return `
              <a href="${item.link}" class="hover:opacity-80 transition">
                ${item.name}
              </a>
            `;
              })
              .join('')}

            <a href="/user/index.html" title="Panel de usuario" aria-label="Panel de usuario">
              <div class="h-10 w-10 rounded-full bg-gray-400 border border-white hover:ring-2 hover:ring-purple-600 transition"></div>
            </a>
          </nav>
        </div>
      </header>
    `;

    document.getElementById('site-header').innerHTML = header;
    const logoutLink = document.querySelector('[data-logout]');
    if (logoutLink) {
      logoutLink.addEventListener('click', async (event) => {
        event.preventDefault();
        try {
          const { logout } = await import('/js/auth.js');
          await logout();
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
          localStorage.removeItem('oporail_active_uid');
          window.location.href = '/index.html';
        }
      });
    }
  })
  .catch((err) => {
    console.error('Error cargando header:', err);
  });
