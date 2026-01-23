// /js/load-footer.js
fetch('/data/site.json')
  .then(res => res.json())
  .then(data => {
    const footer = document.getElementById('site-footer');
    if(!footer) return;
    footer.innerHTML = `
      <footer class="bg-gray-800 text-white py-6 mt-12">
        <div class="container mx-auto text-center">
          &copy; ${new Date().getFullYear()} ${data.title}. Todos los derechos reservados.
        </div>
      </footer>
    `;
  });
