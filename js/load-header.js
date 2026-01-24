fetch('/site.json')
  .then(res => res.json())
  .then(site => {
    // HEADER
    const header = `
      <header class="bg-white shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
          <a href="/index.html" class="flex items-center gap-2">
            <img src="${site.logo}" alt="${site.title}" class="h-10">
            <span class="font-bold text-xl text-purple-700">${site.title}</span>
          </a>
          <nav class="space-x-6 hidden md:block">
            ${site.menu.map(item =>
              `<a href="${item.link}" class="text-gray-700 hover:text-purple-700 font-medium">${item.name}</a>`
            ).join('')}
          </nav>
        </div>
      </header>
    `;
    document.getElementById('site-header').innerHTML = header;

    // FOOTER
    const footer = `
      <footer class="bg-gray-900 text-white text-center py-6 mt-12">
        <p class="text-sm">© ${new Date().getFullYear()} OpoRail · Academia online ferroviaria</p>
      </footer>
    `;
    document.getElementById('site-footer').innerHTML = footer;
  })
  .catch(err => {
    console.error('Error cargando site.json', err);
  });
