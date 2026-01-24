fetch('/data/site.json')
  .then(res => res.json())
  .then(data => {
    const headerContainer = document.getElementById('site-header');
    if(!headerContainer) return;

    const { title, logo, menu } = data;

    headerContainer.innerHTML = `
      <header class="bg-gradient-to-r from-green-700 to-purple-700 text-white shadow-lg">
        <div class="container mx-auto flex justify-between items-center p-4">

          <div class="flex items-center space-x-3">
            <img src="${logo}" alt="${title}" class="h-10 w-10 rounded-full border border-white">
            <span class="text-xl font-semibold">${title}</span>
          </div>

          <nav>
            <ul class="flex space-x-6 text-sm font-medium">
              ${menu.map(item => `<li><a href="${item.link}" class="hover:text-gray-200 transition">${item.name}</a></li>`).join('')}
            </ul>
          </nav>

          <div>
            <a href="/user/index.html" title="Panel de Usuario">
              <div class="h-10 w-10 rounded-full border border-white bg-gray-400 cursor-pointer hover:ring-2 hover:ring-white transition"></div>
            </a>
          </div>

        </div>
      </header>
    `;
  })
  .catch(err => console.error(err));
