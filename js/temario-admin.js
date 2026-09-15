(() => {
  'use strict';

  const CATEGORY_DEFINITIONS = [
    {
      id: 'common-2025',
      title: 'Temario Común 2025',
      description: 'Material común a las especialidades de mantenimiento de la convocatoria.',
      shared: true,
    },
    {
      id: 'specific-2025',
      title: 'Temario Específico 2025',
      description: 'Material específico de esta especialidad.',
      shared: false,
    },
    {
      id: 'common-summary',
      title: 'Temario Común Resumido y Optimizado por OpoRail',
      description: 'Versión resumida y optimizada del contenido común.',
      shared: true,
    },
    {
      id: 'specific-summary',
      title: 'Temario Específico Resumido y Optimizado por OpoRail',
      description: 'Versión resumida y optimizada de esta especialidad.',
      shared: false,
    },
  ];

  function isAdmin() {
    return localStorage.getItem('oporail_is_admin') === 'true';
  }

  function getCourseTitle() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('curso') || params.get('course') || params.get('titulo') || params.get('title');
    if (fromUrl) return fromUrl.trim();

    const heading = document.querySelector('#course-detail h1, #course-detail h2');
    if (heading && heading.textContent.trim()) {
      const value = heading.textContent.trim();
      if (!/^curso$/i.test(value) && !/^temario$/i.test(value)) return value;
    }

    const pathMatch = window.location.pathname.match(/curso\/([^/]+)/i);
    if (pathMatch) return decodeURIComponent(pathMatch[1]);

    return 'Curso';
  }

  function slug(value) {
    return String(value || 'general')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function storageKey(category, courseTitle) {
    if (category.shared) return `oporail_temario_${category.id}`;
    return `oporail_temario_${category.id}_${slug(courseTitle)}`;
  }

  function readDocs(category, courseTitle) {
    const key = storageKey(category, courseTitle);
    try {
      const raw = localStorage.getItem(key);
      const docs = raw ? JSON.parse(raw) : [];
      if (Array.isArray(docs)) return docs;
    } catch (error) {
      console.error('Error leyendo documentos del temario:', error);
    }

    // Compatibilidad con los documentos que se habían guardado antes
    // de separar el temario por categorías.
    if (category.id === 'specific-2025') {
      const legacyKey = `oporail_temario_docs_${String(courseTitle || 'general').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}`;
      try {
        const legacyRaw = localStorage.getItem(legacyKey);
        const legacyDocs = legacyRaw ? JSON.parse(legacyRaw) : [];
        return Array.isArray(legacyDocs) ? legacyDocs : [];
      } catch {
        return [];
      }
    }

    return [];
  }

  function saveDocs(category, courseTitle, docs) {
    localStorage.setItem(storageKey(category, courseTitle), JSON.stringify(docs));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function renderDocuments(list, category, courseTitle) {
    const docs = readDocs(category, courseTitle);
    if (!docs.length) {
      list.innerHTML = '<li class="text-gray-500">No hay documentos cargados todavía.</li>';
      return;
    }

    list.innerHTML = docs.map((doc, index) => `
      <li class="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-lg p-2">
        <a class="text-purple-700 hover:underline min-w-0 truncate" href="${doc.dataUrl}" download="${escapeHtml(doc.name)}">${index + 1}. ${escapeHtml(doc.name)}</a>
        <span class="text-xs text-gray-500 shrink-0">${escapeHtml(doc.type || 'documento')}</span>
      </li>
    `).join('');
  }

  function createCategoryCard(category, courseTitle) {
    const key = `temario-${slug(category.id)}`;
    const docs = readDocs(category, courseTitle);

    return `
      <article class="bg-gray-50 rounded-xl border border-gray-100 p-5">
        <h3 class="text-lg font-bold text-purple-700 mb-2">${escapeHtml(category.title)}</h3>
        <p class="text-sm text-gray-600 mb-4">${escapeHtml(category.description)}</p>

        <ul id="${key}-list" class="space-y-2 text-sm text-gray-700 mb-4">
          ${docs.length
            ? docs.map((doc, index) => `<li class="flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-lg p-2"><a class="text-purple-700 hover:underline min-w-0 truncate" href="${doc.dataUrl}" download="${escapeHtml(doc.name)}">${index + 1}. ${escapeHtml(doc.name)}</a><span class="text-xs text-gray-500 shrink-0">${escapeHtml(doc.type || 'documento')}</span></li>`).join('')
            : '<li class="text-gray-500">No hay documentos cargados todavía.</li>'}
        </ul>

        ${isAdmin() ? `
          <div class="space-y-2">
            <input id="${key}-input" type="file" accept=".pdf,.doc,.docx,.txt,.md" multiple class="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <button id="${key}-button" type="button" class="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-800 transition">Cargar documentos</button>
            <p id="${key}-feedback" class="text-xs text-gray-500">Solo visible para administradores.</p>
          </div>
        ` : ''}
      </article>
    `;
  }

  function renderAdminTemario() {
    if (!isAdmin()) return false;

    const original = Array.from(document.querySelectorAll('section')).find((section) => {
      const heading = section.querySelector('h2');
      return heading && heading.textContent.trim().toLowerCase() === 'temario';
    });

    if (!original || original.dataset.categoryTemarioReady === 'true') return false;

    const courseTitle = getCourseTitle();
    const replacement = document.createElement('section');
    replacement.className = original.className;
    replacement.dataset.categoryTemarioReady = 'true';
    replacement.innerHTML = `
      <h2 class="text-2xl font-bold text-purple-700 mb-2">Temario</h2>
      <p class="text-sm text-gray-600 mb-4">Material actualizado y optimizado para la convocatoria 2025.</p>
      <div class="grid md:grid-cols-2 gap-4">
        ${CATEGORY_DEFINITIONS.map((category) => createCategoryCard(category, courseTitle)).join('')}
      </div>
      <div class="mt-5 border-t border-gray-100 pt-4">
        <p class="text-xs text-gray-500">Los temarios comunes se comparten entre las especialidades. Los temarios específicos se almacenan de forma independiente para cada curso.</p>
        <a href="/admin/temarios.html" class="inline-flex items-center mt-3 border border-purple-200 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">Panel admin de temarios</a>
      </div>
    `;

    original.replaceWith(replacement);

    CATEGORY_DEFINITIONS.forEach((category) => {
      const key = `temario-${slug(category.id)}`;
      const input = document.getElementById(`${key}-input`);
      const button = document.getElementById(`${key}-button`);
      const feedback = document.getElementById(`${key}-feedback`);
      const list = document.getElementById(`${key}-list`);
      if (!input || !button || !feedback || !list) return;

      button.addEventListener('click', async () => {
        const files = Array.from(input.files || []);
        if (!files.length) {
          feedback.textContent = 'Selecciona al menos un archivo.';
          return;
        }

        const docs = readDocs(category, courseTitle);
        let added = 0;

        for (const file of files) {
          if (file.size > 5 * 1024 * 1024) {
            feedback.textContent = `El archivo ${file.name} supera 5MB y no se ha cargado.`;
            continue;
          }

          try {
            const dataUrl = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
              reader.readAsDataURL(file);
            });
            docs.push({ name: file.name, type: file.type, dataUrl });
            added += 1;
          } catch (error) {
            console.error('Error leyendo documento:', error);
          }
        }

        try {
          saveDocs(category, courseTitle, docs);
          renderDocuments(list, category, courseTitle);
          input.value = '';
          feedback.textContent = added === 1 ? 'Documento cargado correctamente.' : `${added} documentos cargados correctamente.`;
        } catch (error) {
          console.error('Error guardando documentos:', error);
          feedback.textContent = 'No se pudieron guardar los documentos por el límite de almacenamiento del navegador.';
        }
      });
    });

    return true;
  }

  function waitForTemario() {
    let attempts = 0;
    const tryRender = () => {
      if (renderAdminTemario()) return;
      attempts += 1;
      if (attempts < 100) window.setTimeout(tryRender, 100);
    };
    tryRender();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForTemario, { once: true });
  } else {
    waitForTemario();
  }
})();
