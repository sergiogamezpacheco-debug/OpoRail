(() => {
  'use strict';

  const CATEGORIES = [
    { id: 'comun_2025', title: 'Temario Común 2025', description: 'Contenido común compartido por todas las especialidades.' , shared: true },
    { id: 'especifico_2025', title: 'Temario Específico 2025', description: 'Contenido específico de esta especialidad.', shared: false },
    { id: 'comun_oporail', title: 'Temario Común Resumido y Optimizado por OpoRail', description: 'Versión resumida y optimizada del contenido común.', shared: true },
    { id: 'especifico_oporail', title: 'Temario Específico Resumido y Optimizado por OpoRail', description: 'Versión resumida y optimizada del contenido específico.', shared: false }
  ];

  const slug = (value) => String(value || 'general')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const esc = (value) => String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

  function isAdmin() {
    return localStorage.getItem('oporail_is_admin') === 'true';
  }

  function getCourseTitle() {
    const params = new URLSearchParams(location.search);
    const query = params.get('curso') || params.get('course') || params.get('titulo') || params.get('title');
    if (query) return query.trim();
    const heading = document.querySelector('#course-detail h1, #course-detail h2');
    return heading?.textContent?.trim() || 'Curso';
  }

  function key(category, courseTitle) {
    return category.shared
      ? `oporail_temario_${category.id}`
      : `oporail_temario_${category.id}_${slug(courseTitle)}`;
  }

  function read(category, courseTitle) {
    try {
      const raw = localStorage.getItem(key(category, courseTitle));
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) return parsed;
    } catch (error) { console.error('Error leyendo temario:', error); }
    return [];
  }

  function save(category, courseTitle, docs) {
    localStorage.setItem(key(category, courseTitle), JSON.stringify(docs));
  }

  function renderDocs(list, category, courseTitle) {
    const docs = read(category, courseTitle);
    list.innerHTML = docs.length
      ? docs.map((doc, i) => `<li class="flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-lg p-2"><a class="text-purple-700 hover:underline min-w-0 truncate" href="${esc(doc.dataUrl)}" download="${esc(doc.name)}">${i + 1}. ${esc(doc.name)}</a><span class="text-xs text-gray-500 shrink-0">${esc(doc.type || 'documento')}</span></li>`).join('')
      : '<li class="text-gray-500">No hay documentos cargados todavía.</li>';
  }

  function card(category, courseTitle) {
    const id = `temario-${category.id}`;
    return `<article class="bg-gray-50 rounded-xl border border-gray-100 p-5">
      <h3 class="text-lg font-bold text-purple-700 mb-2">${esc(category.title)}</h3>
      <p class="text-sm text-gray-600 mb-4">${esc(category.description)}</p>
      <ul id="${id}-list" class="space-y-2 text-sm text-gray-700 mb-4"></ul>
      ${isAdmin() ? `<div class="space-y-2">
        <input id="${id}-input" type="file" accept=".pdf,.doc,.docx,.txt,.md" multiple class="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white">
        <button id="${id}-button" type="button" class="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-800 transition">Cargar documentos</button>
        <p id="${id}-feedback" class="text-xs text-gray-500">Solo visible para administradores.</p>
      </div>` : ''}
    </article>`;
  }

  function bindCategory(category, courseTitle) {
    const id = `temario-${category.id}`;
    const list = document.getElementById(`${id}-list`);
    if (!list) return;
    renderDocs(list, category, courseTitle);
    if (!isAdmin()) return;

    const input = document.getElementById(`${id}-input`);
    const button = document.getElementById(`${id}-button`);
    const feedback = document.getElementById(`${id}-feedback`);
    if (!input || !button || !feedback) return;

    button.addEventListener('click', async () => {
      const files = Array.from(input.files || []);
      if (!files.length) { feedback.textContent = 'Selecciona al menos un archivo.'; return; }
      const docs = read(category, courseTitle);
      let added = 0;

      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) { feedback.textContent = `El archivo ${file.name} supera 5MB y no se ha cargado.`; continue; }
        try {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          docs.push({ name: file.name, type: file.type, dataUrl });
          added++;
        } catch (error) { console.error('Error leyendo archivo:', error); }
      }

      try {
        save(category, courseTitle, docs);
        renderDocs(list, category, courseTitle);
        input.value = '';
        feedback.textContent = added ? `${added} documento(s) cargado(s) correctamente.` : 'No se ha cargado ningún documento.';
      } catch (error) {
        console.error('Error guardando temario:', error);
        feedback.textContent = 'No se pudieron guardar los documentos por el límite de almacenamiento del navegador.';
      }
    });
  }

  function render() {
    const detail = document.getElementById('course-detail');
    if (!detail) return false;
    const original = Array.from(detail.querySelectorAll('section')).find((section) => {
      const heading = section.querySelector('h2');
      return heading && heading.textContent.trim().toLowerCase() === 'temario';
    });
    if (!original || original.dataset.temarioArchitecture === 'true') return false;

    const courseTitle = getCourseTitle();
    const replacement = document.createElement('section');
    replacement.className = original.className || 'mt-10 bg-white border border-purple-100 rounded-xl p-6';
    replacement.dataset.temarioArchitecture = 'true';
    replacement.innerHTML = `<h2 class="text-2xl font-bold text-purple-700 mb-2">Temario</h2>
      <p class="text-sm text-gray-600 mb-4">Material actualizado y optimizado para la convocatoria 2025.</p>
      <div class="grid md:grid-cols-2 gap-4">${CATEGORIES.map((category) => card(category, courseTitle)).join('')}</div>
      <div class="mt-5 border-t border-gray-100 pt-4"><p class="text-xs text-gray-500">Los temarios comunes se comparten entre las especialidades. Los específicos pertenecen exclusivamente a cada curso.</p>
      ${isAdmin() ? '<a href="/admin/temarios.html" class="inline-flex items-center mt-3 border border-purple-200 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">Panel admin de temarios</a>' : ''}</div>`;
    original.replaceWith(replacement);
    CATEGORIES.forEach((category) => bindCategory(category, courseTitle));
    return true;
  }

  let attempts = 0;
  function wait() {
    if (render()) return;
    if (++attempts < 120) setTimeout(wait, 100);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once: true });
  else wait();
})();
