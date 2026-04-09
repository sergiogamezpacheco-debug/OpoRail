fetch('/data/site.json')
  .then((res) => res.json())
  .then(async (site) => {
    const pathname = window.location.pathname;
    const courseRoutes = new Set(['/curso', '/curso.html', '/test-info', '/test-info.html', '/test-run', '/test-run.html']);
    const isCoursePage = courseRoutes.has(pathname);
    const activeUid = localStorage.getItem('oporail_active_uid');

    let cachedProfile = null;
    try {
      cachedProfile = JSON.parse(localStorage.getItem('oporail_user_profile') || 'null');
    } catch {
      cachedProfile = null;
    }

    let userLabel = '';
    if (activeUid) {
      try {
        const { getAuth } = await import('/js/firebase-config.js');
        const user = getAuth().currentUser;
        const displayName = user?.displayName?.trim()
          || cachedProfile?.displayName
          || user?.email?.split('@')[0]
          || cachedProfile?.email?.split('@')[0]
          || '';
        const parts = displayName.split(/\s+/).filter(Boolean);
        userLabel = parts.slice(0, 2).join(' ') || displayName || 'Usuario';
      } catch (error) {
        console.error('Error leyendo usuario activo:', error);
      }
    }

    const headerClass = isCoursePage
      ? 'absolute top-0 left-0 right-0 z-20 text-white bg-gradient-to-r from-[#0b5a2a] to-purple-700 shadow-md'
      : 'absolute top-0 left-0 right-0 z-30 text-white bg-gradient-to-r from-[#0b5a2a]/95 to-purple-700/95 backdrop-blur-sm';

    const navLinks = site.menu
      .map((item) => {
        const isAccessLink = item.link === '/user/index.html' || item.name.toLowerCase() === 'acceder';
        if (!activeUid || !isAccessLink) {
          return `<a href="${item.link}" class="block hover:opacity-80 transition">${item.name}</a>`;
        }
        return '';
      })
      .join('');

    const userArea = activeUid
      ? `
      <div class="relative" id="user-menu-wrapper">
        <button type="button" id="user-menu-btn" class="inline-flex items-center gap-2 text-sm font-semibold border border-white/60 rounded-full px-3 py-1 hover:bg-white/10 transition" aria-haspopup="true" aria-expanded="false">
          <span>${userLabel}</span>
          <span aria-hidden="true">▾</span>
        </button>
        <div id="user-menu-panel" class="hidden absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg border border-gray-200 overflow-hidden z-40">
          <a href="/user/dashboard.html" class="block px-4 py-2 hover:bg-gray-50">Mi perfil</a>
          <a href="/user/dashboard.html#mis-cursos" class="block px-4 py-2 hover:bg-gray-50">Cursos</a>
          <a href="/user/dashboard.html#mensajes" class="block px-4 py-2 hover:bg-gray-50">Mensajes</a>
          <button type="button" data-logout class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">Desconectar</button>
        </div>
      </div>
      `
      : '';

    const header = `
      <header class="${headerClass}">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <a href="/index.html" class="text-2xl md:text-3xl font-bold text-white">OpoRail</a>

          <button id="mobile-menu-btn" class="md:hidden inline-flex items-center justify-center border border-white/60 rounded-lg p-2" aria-label="Abrir menú">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>

          <nav class="hidden md:flex items-center gap-6 font-medium text-white">
            ${navLinks}
            ${userArea}
          </nav>
        </div>
        <div id="mobile-menu" class="hidden md:hidden px-4 sm:px-6 pb-4">
          <nav class="bg-white/10 border border-white/20 rounded-xl p-4 flex flex-col gap-3 text-sm font-medium">
            ${navLinks}
            ${activeUid ? '<a href="/user/dashboard.html" class="block">Mi perfil</a><a href="/user/dashboard.html#mis-cursos" class="block">Cursos</a><button type="button" data-logout class="text-left text-red-200">Desconectar</button>' : ''}
          </nav>
        </div>
      </header>
    `;

    document.getElementById('site-header').innerHTML = header;

    const bindLogoutButtons = () => {
      document.querySelectorAll('[data-logout]').forEach((logoutLink) => {
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
      });
    };
    bindLogoutButtons();

    const userMenuBtn = document.getElementById('user-menu-btn');
    const userMenuPanel = document.getElementById('user-menu-panel');
    if (userMenuBtn && userMenuPanel) {
      userMenuBtn.addEventListener('click', () => {
        const willShow = userMenuPanel.classList.contains('hidden');
        userMenuPanel.classList.toggle('hidden', !willShow);
        userMenuBtn.setAttribute('aria-expanded', willShow ? 'true' : 'false');
      });

      document.addEventListener('click', (event) => {
        const wrapper = document.getElementById('user-menu-wrapper');
        if (wrapper && !wrapper.contains(event.target)) {
          userMenuPanel.classList.add('hidden');
          userMenuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
  })
  .catch((err) => {
    console.error('Error cargando header:', err);
  });