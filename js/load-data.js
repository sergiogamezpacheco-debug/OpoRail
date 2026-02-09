function resolveDataPath(fileName) {
  const isUserPage = window.location.pathname.includes('/user/');
  return isUserPage ? `../data/${fileName}` : `/data/${fileName}`;
}

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getActiveUserId() {
  const raw = localStorage.getItem('oporail_active_uid');
  return raw || null;
}

const DEFAULT_PLANS = [
  { id: 'free', maxCursos: 1, requierePago: false },
  { id: 'basic', maxCursos: 1, requierePago: true },
  { id: 'advanced', maxCursos: 0, requierePago: true },
];

function getPlanDefinition(planId) {
  const raw = localStorage.getItem('oporail_plan_catalog');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.find((plan) => plan.id === planId) || null;
      }
    } catch {
      return DEFAULT_PLANS.find((plan) => plan.id === planId) || null;
    }
  }
  return DEFAULT_PLANS.find((plan) => plan.id === planId) || null;
}

function getPlanStatus(uid) {
  const raw = localStorage.getItem(`oporail_plan_${uid}`);
  if (!raw) return { planId: 'free', paid: false };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { planId: 'free', paid: false };
    return {
      planId: parsed.planId || 'free',
      paid: Boolean(parsed.paid),
    };
  } catch {
    return { planId: 'free', paid: false };
  }
}

function isAdminUser() {
  return localStorage.getItem('oporail_is_admin') === 'true';
}

function addEnrollment(courseId) {
  const uid = getActiveUserId();
  if (!uid) return { ok: false, reason: 'not-authenticated' };

  const planStatus = getPlanStatus(uid);
  const plan = getPlanDefinition(planStatus.planId);
  if (plan?.requierePago && !planStatus.paid) {
    return { ok: false, reason: 'payment-required' };
  }

  const key = `oporail_enrollments_${uid}`;
  const raw = localStorage.getItem(key);
  let list = [];

  try {
    list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }

  if (!list.includes(courseId)) {
    const maxCourses = plan?.maxCursos ?? 0;
    if (maxCourses > 0 && list.length >= maxCourses) {
      return { ok: false, reason: 'limit-reached', limit: maxCourses };
    }
    list.push(courseId);
    localStorage.setItem(key, JSON.stringify(list));
  }

  return { ok: true };
}

function getFallbackCourseBlueprint(courseTitle) {
  return {
    intro: `Estructura recomendada para ${courseTitle}: preparada para que puedas cargar contenido progresivamente (tests, explicaciones y recursos).`,
    blocks: [
      {
        id: 'test-comun',
        title: 'Test · Temario común',
        description: 'Cuestionarios sobre legislación básica, prevención y marco general ferroviario. Recomendado para cimentar la base común.',
        items: [
          'Bloques de 25/50 preguntas con corrección inmediata',
          'Modo repaso por temas y modo examen cronometrado',
          'Registro de errores frecuentes para reforzar estudio',
        ],
      },
      {
        id: 'test-especifico',
        title: 'Test · Temario específico',
        description: 'Banco específico por especialidad de mantenimiento con dificultad progresiva.',
        items: [
          'Preguntas técnicas por subtema',
          'Mini-simulacros por especialidad',
          'Indicadores de acierto por bloque',
        ],
      },
      {
        id: 'psicotecnicos',
        title: 'Psicotécnicos (bloques habituales en OEP de mantenimiento)',
        description: 'Estructura propuesta según tipologías frecuentes en procesos selectivos de perfil mantenimiento.',
        items: [
          'Omnibus',
          'Sinónimos y antónimos',
          'Series numéricas',
          'Razonamiento abstracto',
          'Razonamiento verbal',
          'Atención y percepción',
        ],
      },
      {
        id: 'temario',
        title: 'Temario',
        description: 'Espacio para teoría en formato guía: explicación, esquemas, fichas y recursos descargables.',
        items: [
          'Tema 1: fundamentos y contexto',
          'Tema 2: procedimientos y normativa aplicada',
          'Tema 3: casos prácticos y resolución guiada',
        ],
      },
      {
        id: 'simulacros',
        title: 'Simulacros OEP',
        description: 'Sección preparada para simulacros completos por convocatoria (ej. 2022, 2023, 2024, 2025).',
        items: [
          'Simulacro por año y especialidad',
          'Informe de resultados y ranking de áreas a mejorar',
          'Reintento inteligente centrado en errores',
        ],
      },
    ],
  };
}

async function getCourseBlueprint(courseTitle) {
  try {
    const res = await fetch(resolveDataPath('course-content.json'));
    if (!res.ok) throw new Error('No se encontró course-content.json');

    const payload = await res.json();
    const custom = payload?.byCourseTitle?.[courseTitle];
    if (custom && Array.isArray(custom.blocks) && custom.blocks.length) {
      return custom;
    }

    if (payload?.default && Array.isArray(payload.default.blocks) && payload.default.blocks.length) {
      return payload.default;
    }
  } catch (error) {
    console.error('Error cargando estructura de contenido del curso:', error);
  }

  return getFallbackCourseBlueprint(courseTitle);
}

function renderCourseContentBlocks(blueprint) {
  return `
    <section class="mt-10">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Apartados del curso</h2>
      <p class="text-gray-600 mb-6">${escapeHtml(blueprint.intro || '')}</p>

      <div class="bg-white border border-purple-100 rounded-xl p-4 mb-6">
        <h3 class="text-sm font-semibold text-purple-700 mb-2">Índice rápido</h3>
        <ul class="grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
          ${blueprint.blocks
            .map(
              (block) => `
            <li>
              <a class="text-purple-700 hover:underline" href="#${escapeHtml(block.id || 'bloque')}">${escapeHtml(block.title || 'Apartado')}</a>
            </li>
          `,
            )
            .join('')}
        </ul>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        ${blueprint.blocks
          .map(
            (block) => `
          <article id="${escapeHtml(block.id || 'bloque')}" class="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <h3 class="text-lg font-bold text-purple-700 mb-2">${escapeHtml(block.title || 'Apartado')}</h3>
            <p class="text-sm text-gray-700 mb-3">${escapeHtml(block.description || '')}</p>
            <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
              ${(Array.isArray(block.items) ? block.items : [])
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join('')}
            </ul>
          </article>
        `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderTemarioSection() {
  const items = [
    'Temario Común 2025',
    'Temario Específico 2025',
    'Temario Común Resumido y Optimizado por OpoRail',
    'Temario Específico Resumido y Optimizado por OpoRail',
  ];

  return `
    <section class="mt-10 bg-white border border-purple-100 rounded-xl p-6">
      <h2 class="text-2xl font-bold text-purple-700 mb-2">Temario</h2>
      <p class="text-sm text-gray-600 mb-4">Material actualizado y optimizado para la convocatoria 2025.</p>
      <ul class="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
        ${items.map((item) => `<li class="bg-gray-50 border border-gray-100 rounded-lg p-3">• ${item}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderPublicPsychotechnicalCard() {
  const items = getPsychotechnicalMeta().map((item) => `<li>• ${item.label}</li>`).join('');
  return `
    <article class="bg-gray-50 rounded-xl border border-gray-100 p-5">
      <h3 class="text-lg font-bold text-purple-700 mb-2">Psicotécnicos</h3>
      <p class="text-sm text-gray-700 mb-3">Bloques habituales en procesos de mantenimiento.</p>
      <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
        ${items}
      </ul>
    </article>
  `;
}

function renderPublicOverview() {
  return `
    <section class="mt-10 grid md:grid-cols-2 gap-4">
      <article class="bg-gray-50 rounded-xl border border-gray-100 p-5">
        <h3 class="text-lg font-bold text-purple-700 mb-2">Test · Temario común</h3>
        <p class="text-sm text-gray-700 mb-3">Cuestionarios sobre legislación básica, prevención y marco general ferroviario.</p>
        <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Bloques de 25/50 preguntas con corrección inmediata</li>
          <li>Modo repaso por temas y modo examen cronometrado</li>
          <li>Registro de errores frecuentes para reforzar estudio</li>
        </ul>
      </article>

      <article class="bg-gray-50 rounded-xl border border-gray-100 p-5">
        <h3 class="text-lg font-bold text-purple-700 mb-2">Test · Temario específico</h3>
        <p class="text-sm text-gray-700 mb-3">Banco específico por especialidad de mantenimiento con dificultad progresiva.</p>
        <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Preguntas técnicas por subtema</li>
          <li>Mini-simulacros por especialidad</li>
          <li>Indicadores de acierto por bloque</li>
        </ul>
      </article>

      ${renderPublicPsychotechnicalCard()}

      <article class="bg-gray-50 rounded-xl border border-gray-100 p-5">
        <h3 class="text-lg font-bold text-purple-700 mb-2">Simulacro de examen</h3>
        <p class="text-sm text-gray-700 mb-3">Simulacros completos por convocatoria (2022-2025) con informe de resultados.</p>
        <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Simulacro por año y especialidad</li>
          <li>Informe de resultados y ranking</li>
          <li>Reintento inteligente por errores</li>
        </ul>
      </article>
    </section>
  `;
}

function getFallbackQuestionBank() {
  return {
    'test-comun': [],
    'test-especifico': [],
    psicotecnicos: {
      omnibus: [],
      sinonimosAntonimos: [],
      seriesNumericas: [],
      razonamientoAbstracto: [],
      razonamientoVerbal: [],
      atencionPercepcion: [],
    },
  };
}

function mergeQuestionBank(base, override = {}) {
  return {
    'test-comun': Array.isArray(override['test-comun']) ? override['test-comun'] : base['test-comun'],
    'test-especifico': Array.isArray(override['test-especifico']) ? override['test-especifico'] : base['test-especifico'],
    psicotecnicos: {
      omnibus: Array.isArray(override.psicotecnicos?.omnibus) ? override.psicotecnicos.omnibus : base.psicotecnicos.omnibus,
      sinonimosAntonimos: Array.isArray(override.psicotecnicos?.sinonimosAntonimos)
        ? override.psicotecnicos.sinonimosAntonimos
        : base.psicotecnicos.sinonimosAntonimos,
      seriesNumericas: Array.isArray(override.psicotecnicos?.seriesNumericas)
        ? override.psicotecnicos.seriesNumericas
        : base.psicotecnicos.seriesNumericas,
      razonamientoAbstracto: Array.isArray(override.psicotecnicos?.razonamientoAbstracto)
        ? override.psicotecnicos.razonamientoAbstracto
        : base.psicotecnicos.razonamientoAbstracto,
      razonamientoVerbal: Array.isArray(override.psicotecnicos?.razonamientoVerbal)
        ? override.psicotecnicos.razonamientoVerbal
        : base.psicotecnicos.razonamientoVerbal,
      atencionPercepcion: Array.isArray(override.psicotecnicos?.atencionPercepcion)
        ? override.psicotecnicos.atencionPercepcion
        : base.psicotecnicos.atencionPercepcion,
    },
  };
}

async function getQuestionBankForCourse(courseTitle) {
  const fallback = getFallbackQuestionBank();

  try {
    const res = await fetch(resolveDataPath('test-bank-template.json'));
    if (!res.ok) throw new Error('No se encontró test-bank-template.json');

    const payload = await res.json();
    const base = mergeQuestionBank(fallback, payload.default || {});
    const custom = payload?.byCourseTitle?.[courseTitle];

    return custom ? mergeQuestionBank(base, custom) : base;
  } catch (error) {
    console.error('Error cargando plantilla de test:', error);
    return fallback;
  }
}

function renderQuestionBankSummary(questionBank) {
  const commonCount = questionBank['test-comun'].length;
  const specificCount = questionBank['test-especifico'].length;

  const psychoMap = [
    ['Omnibus', questionBank.psicotecnicos.omnibus.length],
    ['Sinónimos y antónimos', questionBank.psicotecnicos.sinonimosAntonimos.length],
    ['Series numéricas', questionBank.psicotecnicos.seriesNumericas.length],
    ['Razonamiento abstracto', questionBank.psicotecnicos.razonamientoAbstracto.length],
    ['Razonamiento verbal', questionBank.psicotecnicos.razonamientoVerbal.length],
    ['Atención y percepción', questionBank.psicotecnicos.atencionPercepcion.length],
  ];

  return `
    <section class="mt-10 bg-white border border-purple-100 rounded-xl p-6">
      <h2 class="text-2xl font-bold text-purple-700 mb-2">Banco de preguntas (plantilla)</h2>
      <p class="text-sm text-gray-600 mb-4">
        Esta sección lee <code>/data/test-bank-template.json</code>. Puedes ampliar preguntas sin tocar JavaScript.
        <a class="text-purple-700 hover:underline ml-1" href="/data/test-bank-template.json" target="_blank" rel="noreferrer">Abrir plantilla</a>
      </p>

      <div class="grid sm:grid-cols-2 gap-4 text-sm">
        <article class="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <h3 class="font-bold text-purple-700 mb-2">Temario común</h3>
          <p class="text-gray-700">Preguntas cargadas: <strong>${commonCount}</strong></p>
        </article>

        <article class="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <h3 class="font-bold text-purple-700 mb-2">Temario específico</h3>
          <p class="text-gray-700">Preguntas cargadas: <strong>${specificCount}</strong></p>
        </article>
      </div>

      <article class="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
        <h3 class="font-bold text-purple-700 mb-2">Psicotécnicos</h3>
        <ul class="grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
          ${psychoMap.map(([name, count]) => `<li>${escapeHtml(name)}: <strong>${count}</strong></li>`).join('')}
        </ul>
      </article>
    </section>
  `;
}

function getPsychotechnicalMeta() {
  return [
    {
      id: 'omnibus',
      label: 'Omnibus',
      time: '12 min',
      description: 'Ejercicios combinados de comprensión, razonamiento y agilidad mental.',
    },
    {
      id: 'sinonimosAntonimos',
      label: 'Sinónimos y antónimos',
      time: '10 min',
      description: 'Evaluación de vocabulario, precisión léxica y rapidez verbal.',
    },
    {
      id: 'seriesNumericas',
      label: 'Matemáticas (series numéricas)',
      time: '15 min',
      description: 'Secuencias numéricas para medir razonamiento lógico-matemático.',
    },
    {
      id: 'razonamientoAbstracto',
      label: 'Razonamiento abstracto',
      time: '14 min',
      description: 'Patrones visuales para evaluar pensamiento lógico y espacial.',
    },
    {
      id: 'razonamientoVerbal',
      label: 'Razonamiento verbal',
      time: '12 min',
      description: 'Comprensión de textos breves y relaciones entre conceptos.',
    },
    {
      id: 'atencionPercepcion',
      label: 'Atención y percepción',
      time: '9 min',
      description: 'Foco, rapidez y precisión ante estímulos visuales.',
    },
  ];
}

function getFallbackQuestion() {
  return {
    question: 'Pregunta de ejemplo pendiente de configurar.',
    options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
    correctAnswer: 'Opción A',
    explanation: 'Añade preguntas reales en data/test-bank-template.json.',
  };
}

function normalizeQuestion(question) {
  if (!question || !Array.isArray(question.options)) return getFallbackQuestion();
  const correctAnswer = question.options?.[question.correctIndex] || question.options?.[0] || 'Respuesta';
  return {
    question: question.question || 'Pregunta sin título',
    options: question.options,
    correctAnswer,
    explanation: question.explanation || '',
  };
}

function getCommonTests(questionBank) {
  const commonQuestion = normalizeQuestion(questionBank['test-comun']?.[0]);
  return [
    {
      id: 'comunes-general',
      title: 'Test Materias Comunes (General)',
      duration: '12 min',
      info: 'Test global para repasar los conceptos comunes.',
      sample: commonQuestion,
    },
    {
      id: 'comunes-ftv-intro',
      title: 'Formación Técnica de Vehículos – Introducción',
      duration: '14 min',
      info: 'Bloque inicial sobre fundamentos técnicos de vehículos.',
      sample: commonQuestion,
    },
    {
      id: 'comunes-mantenimiento-avanzado',
      title: 'El Mantenimiento en Vehículos de Última Generación',
      duration: '16 min',
      info: 'Bloque sobre tecnologías modernas y protocolos de mantenimiento.',
      sample: commonQuestion,
    },
  ];
}

function getSpecificTests(questionBank) {
  const specificQuestion = normalizeQuestion(questionBank['test-especifico']?.[0]);
  return [
    {
      id: 'ajustador-general',
      title: 'Test Especialidad Ajustador-Montador',
      duration: '15 min',
      info: 'Cuestionario general de la especialidad.',
      sample: specificQuestion,
    },
    {
      id: 'traccion-diesel',
      title: 'Tracción Diésel, Motores térmicos',
      duration: '13 min',
      info: 'Bloque sobre motorización y sistemas diésel.',
      sample: specificQuestion,
    },
    {
      id: 'ftv-neumatica',
      title: 'FTV Básico Neumática y Freno',
      duration: '12 min',
      info: 'Fundamentos del sistema neumático y frenos.',
      sample: specificQuestion,
    },
    {
      id: 'bogies',
      title: 'Bogies, Tracción y Choque',
      duration: '14 min',
      info: 'Elementos de rodadura, tracción y seguridad.',
      sample: specificQuestion,
    },
  ];
}

function getPsychotechnicalTests(questionBank) {
  return getPsychotechnicalMeta().map((item) => {
    const question = normalizeQuestion(questionBank.psicotecnicos?.[item.id]?.[0]);
    return {
      id: `psy-${item.id}`,
      title: item.label,
      duration: item.time,
      info: item.description,
      sample: question,
    };
  });
}

function renderTestSection(title, tests, courseId, compact = false) {
  return `
    <section class="mt-10 bg-white border border-purple-100 rounded-xl p-6">
      <h2 class="text-2xl font-bold text-purple-700 mb-2">${title}</h2>
      <div class="grid md:grid-cols-2 gap-4">
        ${tests
          .map(
            (test) => `
          <article class="border border-gray-200 rounded-lg p-4 space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">${test.title}</h3>
                <p class="text-sm text-gray-600">Tiempo disponible: ${test.duration}</p>
              </div>
              ${compact ? '' : `<button class="test-info-btn w-8 h-8 rounded-full border border-purple-200 text-purple-700 font-bold" data-test-info="${test.id}">i</button>`}
            </div>
            ${compact ? '' : `<p class="text-sm text-gray-600">${test.info}</p>`}
            ${compact ? '' : `
              <div id="test-info-${test.id}" class="hidden text-sm text-gray-700">
                <p class="font-semibold">${test.sample.question}</p>
                <ul class="list-disc pl-5 mt-2 space-y-1">
                  ${test.sample.options.map((option) => `<li>${option}</li>`).join('')}
                </ul>
                <p class="mt-2 text-xs text-gray-500">Respuesta correcta: ${test.sample.correctAnswer}</p>
                ${test.sample.explanation ? `<p class="mt-2 text-xs text-gray-500">Explicación: ${test.sample.explanation}</p>` : ''}
              </div>
            `}
            <a class="btn w-full text-center" href="/test-info.html?course=${courseId}&test=${test.id}">
              Ver historial / Intentar test
            </a>
          </article>
        `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderExamSimulationSection(planStatus) {
  if (!planStatus || !['basic', 'advanced'].includes(planStatus.planId)) {
    return `
      <section class="mt-10 bg-white border border-purple-100 rounded-xl p-6">
        <h2 class="text-2xl font-bold text-purple-700 mb-2">Simulación de examen</h2>
        <p class="text-sm text-gray-600">Disponible solo para planes Básico y Avanzado.</p>
        <a href="/planes.html" class="inline-flex mt-3 text-purple-700 font-semibold hover:underline">Mejorar plan</a>
      </section>
    `;
  }

  return `
    <section class="mt-10 bg-white border border-purple-100 rounded-xl p-6">
      <h2 class="text-2xl font-bold text-purple-700 mb-2">Simulación de examen</h2>
      <p class="text-sm text-gray-600 mb-4">Simulacro completo con tiempo real y corrección automática.</p>
      <button class="btn">Iniciar simulacro</button>
    </section>
  `;
}

function bindTestInfoToggles() {
  document.querySelectorAll('.test-info-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(`test-info-${button.dataset.testInfo}`);
      if (target) {
        target.classList.toggle('hidden');
      }
    });
  });
}

function renderPsychotechnicalSection(questionBank) {
  const items = getPsychotechnicalMeta();
  const first = items[0];
  return `
    <section class="mt-10 bg-white border border-purple-100 rounded-xl p-6">
      <h2 class="text-2xl font-bold text-purple-700 mb-2">Psicotécnicos</h2>
      <p class="text-sm text-gray-600 mb-4">Selecciona un tipo para ver la explicación y el tiempo disponible.</p>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-3">
          ${items
            .map((item) => {
              const count = questionBank.psicotecnicos?.[item.id]?.length ?? 0;
              return `
              <button class="psycho-item w-full text-left border border-gray-200 rounded-lg p-3 hover:border-purple-500 transition" data-psycho-id="${item.id}">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="font-semibold text-gray-900">${item.label}</p>
                    <p class="text-xs text-gray-500">Preguntas disponibles: ${count}</p>
                  </div>
                  <span class="text-xs font-semibold text-purple-700">${item.time}</span>
                </div>
              </button>
            `;
            })
            .join('')}
        </div>

        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 id="psycho-title" class="text-lg font-bold text-purple-700">${first.label}</h3>
              <p id="psycho-time" class="text-sm text-gray-600">Tiempo disponible: ${first.time}</p>
            </div>
            <button id="psycho-info-btn" class="w-8 h-8 rounded-full border border-purple-200 text-purple-700 font-bold">i</button>
          </div>
          <div id="psycho-info" class="mt-3 text-sm text-gray-700 hidden"></div>
          <div id="psycho-description" class="mt-3 text-sm text-gray-700">${first.description}</div>
        </div>
      </div>
    </section>
  `;
}

function bindPsychotechnicalSection(questionBank) {
  const items = getPsychotechnicalMeta();
  const buttons = document.querySelectorAll('.psycho-item');
  const title = document.getElementById('psycho-title');
  const time = document.getElementById('psycho-time');
  const description = document.getElementById('psycho-description');
  const infoBox = document.getElementById('psycho-info');
  const infoBtn = document.getElementById('psycho-info-btn');

  if (!buttons.length || !title || !time || !description || !infoBox || !infoBtn) return;

  const updatePanel = (item) => {
    const count = questionBank.psicotecnicos?.[item.id]?.length ?? 0;
    title.textContent = item.label;
    time.textContent = `Tiempo disponible: ${item.time}`;
    description.textContent = item.description;
    infoBox.textContent = `En esta sección tendrás ${count} ejercicios preparados.`;
    infoBox.classList.add('hidden');
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.psychoId;
      const item = items.find((entry) => entry.id === targetId) || items[0];
      updatePanel(item);
    });
  });

  infoBtn.addEventListener('click', () => {
    infoBox.classList.toggle('hidden');
  });

  updatePanel(items[0]);
}

const coursesContainer = document.getElementById('courses-list');
if (coursesContainer) {
  fetch(resolveDataPath('courses.json'))
    .then((res) => {
      if (!res.ok) throw new Error('Cursos no encontrados');
      return res.json();
    })
    .then((cursos) => {
      const list = Array.isArray(cursos) ? cursos : Array.isArray(cursos?.courses) ? cursos.courses : [];
      coursesContainer.innerHTML = list
        .map((c, index) => {
          const courseId = index + 1;
          const courseStateClass = c.estado === 'Disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
          return `
          <article class="bg-purple-700 text-white rounded-xl p-6 shadow-lg hover:scale-[1.02] transition">
            <h3 class="text-xl font-bold mb-2">${escapeHtml(c.titulo)}</h3>
            <p class="text-sm mb-4">${escapeHtml(c.descripcion)}</p>
            <div class="flex items-center justify-between gap-3">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold ${courseStateClass}">
                ${escapeHtml(c.estado)}
              </span>
              <a href="/curso.html?id=${courseId}" class="inline-flex items-center bg-white text-purple-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition">
                Ver curso
              </a>
            </div>
          </article>
        `;
        })
        .join('');
    })
    .catch((err) => {
      console.error('Error cargando cursos:', err);
      coursesContainer.innerHTML = '<p class="text-red-600">Error cargando cursos</p>';
    });
}

const courseDetailContainer = document.getElementById('course-detail');
if (courseDetailContainer) {
  const params = new URLSearchParams(window.location.search);
  const selectedId = Number(params.get('id'));

  fetch(resolveDataPath('courses.json'))
    .then((res) => {
      if (!res.ok) throw new Error('Cursos no encontrados');
      return res.json();
    })
    .then(async (cursos) => {
      const list = Array.isArray(cursos) ? cursos : Array.isArray(cursos?.courses) ? cursos.courses : [];
      const fallbackCourse = list[0];
      const isInvalidId = Number.isNaN(selectedId) || selectedId < 1 || selectedId > list.length;
      const courseId = isInvalidId ? 1 : selectedId;
      const course = isInvalidId ? fallbackCourse : list[selectedId - 1];

      if (!course) {
        courseDetailContainer.innerHTML = '<p class="text-red-600">No se encontró el curso solicitado.</p>';
        return;
      }

      const questionBank = await getQuestionBankForCourse(course.titulo);

      const userId = getActiveUserId();
      const planStatus = getPlanStatus(userId);
      const planDefinition = getPlanDefinition(planStatus.planId);
      const hasAccess = Boolean(userId) && (!planDefinition?.requierePago || planStatus.paid);

      courseDetailContainer.innerHTML = `
        <article class="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <p class="text-sm font-semibold text-purple-700 mb-2">Curso OpoRail</p>
          <h1 class="text-4xl font-extrabold text-gray-900 mb-4">${escapeHtml(course.titulo)}</h1>
          <p class="text-lg text-gray-700 mb-6">${escapeHtml(course.descripcion)}</p>

          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span class="inline-flex px-4 py-2 rounded-full text-sm font-semibold ${course.estado === 'Disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
              ${escapeHtml(course.estado)}
            </span>
            <a href="/cursos.html" class="inline-flex bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-800 transition">
              Volver a cursos
            </a>
            <a href="/user/index.html" class="inline-flex bg-white border border-purple-700 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Acceder al panel
            </a>
            <button id="enroll-course-btn" data-course-id="${courseId}" class="inline-flex bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition">
              Añadir a mi panel
            </button>
          </div>

          <p id="enroll-feedback" class="text-sm text-gray-600 -mt-4 mb-6"></p>

          <section class="grid md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p class="text-xs uppercase tracking-wide text-gray-500">Duración orientativa</p>
              <p class="text-base font-semibold text-gray-800">12 semanas</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p class="text-xs uppercase tracking-wide text-gray-500">Modalidad</p>
              <p class="text-base font-semibold text-gray-800">Online</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p class="text-xs uppercase tracking-wide text-gray-500">Tutorías</p>
              <p class="text-base font-semibold text-gray-800">Semanales en directo</p>
            </div>
          </section>

          ${renderTemarioSection()}
          ${hasAccess ? renderTestSection('Tests · Materias comunes', getCommonTests(questionBank), courseId, true) : renderPublicOverview()}
          ${hasAccess ? renderTestSection('Tests · Especialidad Ajustador-Montador', getSpecificTests(questionBank), courseId, true) : ''}
          ${hasAccess ? renderTestSection('Tests · Psicotécnicos', getPsychotechnicalTests(questionBank), courseId, true) : ''}
          ${hasAccess ? renderExamSimulationSection(planStatus) : ''}
          ${isAdminUser() ? renderQuestionBankSummary(questionBank) : ''}
        </article>
      `;

      const enrollBtn = document.getElementById('enroll-course-btn');
      const enrollFeedback = document.getElementById('enroll-feedback');

      if (enrollBtn && enrollFeedback) {
        enrollBtn.addEventListener('click', () => {
          const id = Number(enrollBtn.dataset.courseId);
          const result = addEnrollment(id);

          if (!result.ok) {
            if (result.reason === 'not-authenticated') {
              enrollFeedback.textContent = 'Inicia sesión para añadir este curso a tu panel.';
            } else if (result.reason === 'payment-required') {
              enrollFeedback.innerHTML = 'Necesitas activar y pagar un plan para añadir cursos. Ve a <a class="text-purple-700 font-semibold hover:underline" href="/planes.html">planes</a> o <a class="text-purple-700 font-semibold hover:underline" href="/user/settings.html">ajustes</a>.';
            } else if (result.reason === 'limit-reached') {
              enrollFeedback.innerHTML = 'Has alcanzado el límite de tu plan. Cambia a <a class="text-purple-700 font-semibold hover:underline" href="/planes.html">Plan Avanzado</a> para añadir más cursos.';
            } else {
              enrollFeedback.textContent = 'No se pudo añadir el curso en este momento.';
            }
            return;
          }

          enrollFeedback.textContent = 'Curso añadido correctamente. Lo verás en tu panel de usuario.';
        });
      }

      bindPsychotechnicalSection(questionBank);
      bindTestInfoToggles();
    })
    .catch((err) => {
      console.error('Error cargando detalle del curso:', err);
      courseDetailContainer.innerHTML = '<p class="text-red-600">Error cargando el detalle del curso</p>';
    });
}

const planesContainer = document.getElementById('planes-list');
if (planesContainer) {
  fetch(resolveDataPath('planes.json'))
    .then((res) => {
      if (!res.ok) throw new Error('Planes no encontrados');
      return res.json();
    })
    .then((planes) => {
      localStorage.setItem('oporail_plan_catalog', JSON.stringify(planes));
      planesContainer.innerHTML = planes
        .map((p) => {
          const features = Array.isArray(p.features) ? p.features : [];
          const priceLine = [p.precioMensual, p.precioAnual].filter(Boolean).join(' · ');
          return `
        <article class="bg-purple-700 text-white rounded-xl p-6 shadow-lg hover:scale-[1.02] transition">
          <h3 class="text-xl font-bold mb-2">${escapeHtml(p.nombre)}</h3>
          <p class="text-sm mb-4">${escapeHtml(p.descripcion)}</p>
          <ul class="text-sm text-purple-100 space-y-1 mb-4">
            ${features.map((feature) => `<li>• ${escapeHtml(feature)}</li>`).join('')}
          </ul>
          <div class="flex items-center justify-between gap-4">
            <p class="text-lg font-bold">${escapeHtml(priceLine)}</p>
            <a href="/user/settings.html" class="inline-flex items-center bg-white text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition">
              Elegir plan
            </a>
          </div>
        </article>
      `;
        })
        .join('');
    })
    .catch((err) => {
      console.error('Error cargando planes:', err);
      planesContainer.innerHTML = '<p class="text-red-600">Error cargando planes</p>';
    });
}

const testRunner = document.getElementById('test-runner');
if (testRunner) {
  const params = new URLSearchParams(window.location.search);
  const courseId = Number(params.get('course'));
  const testId = params.get('test');

  Promise.all([fetch(resolveDataPath('courses.json')), fetch(resolveDataPath('test-bank-template.json'))])
    .then(async ([coursesRes, testRes]) => {
      if (!coursesRes.ok) throw new Error('Cursos no encontrados');
      if (!testRes.ok) throw new Error('Plantilla de test no encontrada');
      const coursesPayload = await coursesRes.json();
      const testPayload = await testRes.json();

      const list = Array.isArray(coursesPayload)
        ? coursesPayload
        : Array.isArray(coursesPayload?.courses)
          ? coursesPayload.courses
          : [];
      const resolvedCourseId = Number.isNaN(courseId) || courseId < 1 || courseId > list.length ? 1 : courseId;
      const course = list[resolvedCourseId - 1];

      const base = mergeQuestionBank(getFallbackQuestionBank(), testPayload.default || {});
      const custom = testPayload?.byCourseTitle?.[course?.titulo];
      const questionBank = custom ? mergeQuestionBank(base, custom) : base;

      const allTests = [
        ...getCommonTests(questionBank),
        ...getSpecificTests(questionBank),
        ...getPsychotechnicalTests(questionBank),
      ];
      const activeTest = allTests.find((test) => test.id === testId) || allTests[0];

      const testQuestions = (() => {
        if (activeTest.id.startsWith('psy-')) {
          const key = activeTest.id.replace('psy-', '');
          return questionBank.psicotecnicos?.[key] || [];
        }
        if (activeTest.id.startsWith('comunes')) {
          return questionBank['test-comun'] || [];
        }
        return questionBank['test-especifico'] || [];
      })();

      const normalizedQuestions = testQuestions.length
        ? testQuestions.map((question) => normalizeQuestion(question))
        : [];
      while (normalizedQuestions.length < 20) {
        const fallback = getFallbackQuestion();
        fallback.question = `Pregunta de ejemplo ${normalizedQuestions.length + 1}`;
        normalizedQuestions.push(fallback);
      }
      const totalQuestions = 20;
      const trimmedQuestions = normalizedQuestions.slice(0, totalQuestions);

      const questionsPerPage = 5;
      let currentPage = 0;
      const answers = Array(totalQuestions).fill(null);
      let remainingSeconds = 30 * 60;
      let timerId;

      const formatTime = (seconds) => {
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${mins}:${secs}`;
      };

      const finishTest = () => {
        if (timerId) clearInterval(timerId);
        const form = document.getElementById('test-form');
        if (form) {
          const start = currentPage * questionsPerPage;
          const pageQuestions = trimmedQuestions.slice(start, start + questionsPerPage);
          pageQuestions.forEach((_, index) => {
            const selected = form.querySelector(`input[name="answer-${start + index}"]:checked`);
            const selectedIndex = selected ? Number(selected.value) : null;
            answers[start + index] = selectedIndex;
          });
        }
        let correct = 0;
        trimmedQuestions.forEach((question, index) => {
          const correctIndex = question.options.findIndex((option) => option === question.correctAnswer);
          if (answers[index] === correctIndex) {
            correct += 1;
          }
        });
        const score = Math.round((correct / totalQuestions) * 100);

        const userId = getActiveUserId();
        if (userId) {
          const raw = localStorage.getItem(`oporail_test_history_${userId}`);
          const history = raw ? JSON.parse(raw) : [];
          const entry = {
            testId: activeTest.id,
            score,
            completedAt: new Date().toISOString(),
          };
          localStorage.setItem(`oporail_test_history_${userId}`, JSON.stringify([entry, ...(Array.isArray(history) ? history : [])]));
        }

        testRunner.innerHTML = `
          <section class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h1 class="text-3xl font-bold text-purple-700">Test finalizado</h1>
            <p class="text-sm text-gray-600 mt-2">Puntuación final: <strong>${score}%</strong></p>
            <div class="mt-4 text-sm text-gray-600 space-y-1">
              <p><strong>Preguntas:</strong> ${totalQuestions}</p>
              <p><strong>Tiempo empleado:</strong> ${formatTime(30 * 60 - remainingSeconds)}</p>
            </div>
            <a href="/curso.html?id=${resolvedCourseId}" class="inline-flex mt-4 bg-white border border-purple-700 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Volver al curso
            </a>
          </section>

          <section class="mt-6 bg-white border border-gray-100 rounded-xl p-6">
            <h2 class="text-xl font-bold text-purple-700 mb-4">Revisión de preguntas</h2>
            <div class="space-y-4">
              ${trimmedQuestions
                .map((question, index) => {
                  const correctIndex = question.options.findIndex((option) => option === question.correctAnswer);
                  const selectedIndex = answers[index];
                  return `
                  <article class="border border-gray-200 rounded-lg p-4">
                    <p class="font-semibold text-gray-900 mb-2">${index + 1}. ${question.question}</p>
                    <ul class="space-y-1 text-sm">
                      ${question.options
                        .map((option, optIndex) => {
                          const isCorrect = optIndex === correctIndex;
                          const isSelected = optIndex === selectedIndex;
                          const classes = isCorrect
                            ? 'text-emerald-700 font-semibold'
                            : isSelected
                              ? 'text-red-600 font-semibold'
                              : 'text-gray-700';
                          const marker = isCorrect ? ' ✅' : isSelected ? ' ❌' : '';
                          const radioClass = isSelected
                            ? isCorrect
                              ? 'border-emerald-600 bg-emerald-600'
                              : 'border-red-600 bg-red-600'
                            : 'border-gray-300 bg-white';
                          return `
                            <li class="flex items-center gap-2 ${classes}">
                              <span class="inline-flex h-4 w-4 items-center justify-center rounded-full border ${radioClass}">
                                ${isSelected ? '<span class="h-2 w-2 rounded-full bg-white"></span>' : ''}
                              </span>
                              <span>${option}${marker}</span>
                            </li>
                          `;
                        })
                        .join('')}
                    </ul>
                    <div class="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-900">
                      <p><strong>Respuesta correcta:</strong> ${question.correctAnswer}</p>
                      ${question.explanation ? `<p class="text-xs text-amber-800 mt-1">${question.explanation}</p>` : ''}
                    </div>
                  </article>
                `;
                })
                .join('')}
            </div>
          </section>
        `;
      };

      const renderPage = () => {
        const start = currentPage * questionsPerPage;
        const pageQuestions = trimmedQuestions.slice(start, start + questionsPerPage);

        testRunner.innerHTML = `
          <section class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 class="text-3xl font-bold text-purple-700">${activeTest.title}</h1>
                <p class="text-sm text-gray-600">Tiempo disponible: ${activeTest.duration}</p>
              </div>
              <a href="/curso.html?id=${resolvedCourseId}" class="inline-flex bg-white border border-purple-700 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
                Volver al curso
              </a>
            </div>
            <p class="mt-3 text-sm text-gray-600">Tiempo restante: <span id="test-timer" class="font-semibold text-purple-700">${formatTime(remainingSeconds)}</span></p>
            <p class="text-sm text-gray-600">Preguntas: ${totalQuestions} · Página ${currentPage + 1} / ${Math.ceil(totalQuestions / questionsPerPage)}</p>
          </section>

          <section class="mt-6 bg-white border border-gray-100 rounded-xl p-6">
            <p class="text-sm text-gray-600 mb-4">${activeTest.info}</p>
            <form id="test-form" class="space-y-6">
              ${pageQuestions
                .map(
                  (question, index) => `
                <div class="border border-gray-200 rounded-lg p-4">
                  <p class="font-semibold text-gray-900 mb-3">${start + index + 1}. ${question.question}</p>
                  <div class="space-y-2">
                    ${question.options
                      .map(
                        (option, optIndex) => `
                      <label class="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:border-purple-500 transition">
                        <input type="radio" name="answer-${start + index}" value="${optIndex}" class="accent-purple-600" ${answers[start + index] === optIndex ? 'checked' : ''}>
                        <span>${option}</span>
                      </label>
                    `,
                      )
                      .join('')}
                  </div>
                </div>
              `,
                )
                .join('')}
              <div class="flex flex-wrap gap-3">
                <button type="button" id="prev-page" class="btn-ghost" ${currentPage === 0 ? 'disabled' : ''}>Anterior</button>
                <button type="submit" class="btn">Guardar página</button>
                <button type="button" id="next-page" class="btn-ghost">Siguiente</button>
                <button type="button" id="finish-test" class="btn">Finalizar test</button>
              </div>
              <p id="test-feedback" class="text-sm text-gray-600"></p>
            </form>
          </section>
        `;

        const form = document.getElementById('test-form');
        const feedback = document.getElementById('test-feedback');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const finishBtn = document.getElementById('finish-test');

        if (prevBtn) {
          prevBtn.addEventListener('click', () => {
            if (currentPage > 0) {
              currentPage -= 1;
              renderPage();
            }
          });
        }

        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            if ((currentPage + 1) * questionsPerPage < trimmedQuestions.length) {
              currentPage += 1;
              renderPage();
            }
          });
        }

        if (finishBtn) {
          finishBtn.addEventListener('click', finishTest);
        }

        if (form && feedback) {
          form.addEventListener('change', () => {
            pageQuestions.forEach((_, index) => {
              const selected = form.querySelector(`input[name="answer-${start + index}"]:checked`);
              const selectedIndex = selected ? Number(selected.value) : null;
              answers[start + index] = selectedIndex;
            });
          });
          form.addEventListener('submit', (event) => {
            event.preventDefault();
            pageQuestions.forEach((_, index) => {
              const selected = form.querySelector(`input[name="answer-${start + index}"]:checked`);
              const selectedIndex = selected ? Number(selected.value) : null;
              answers[start + index] = selectedIndex;
            });
            feedback.textContent = 'Respuestas guardadas en esta página.';
          });
        }
      };

      renderPage();
      timerId = setInterval(() => {
        remainingSeconds -= 1;
        const timerEl = document.getElementById('test-timer');
        if (timerEl) timerEl.textContent = formatTime(remainingSeconds);
        if (remainingSeconds <= 0) {
          finishTest();
        }
      }, 1000);
    })
    .catch((error) => {
      console.error('Error cargando test:', error);
      testRunner.innerHTML = '<p class="text-red-600">Error cargando el test</p>';
    });
}

const testInfo = document.getElementById('test-info');
if (testInfo) {
  const params = new URLSearchParams(window.location.search);
  const courseId = Number(params.get('course'));
  const testId = params.get('test');

  Promise.all([fetch(resolveDataPath('courses.json')), fetch(resolveDataPath('test-bank-template.json'))])
    .then(async ([coursesRes, testRes]) => {
      if (!coursesRes.ok) throw new Error('Cursos no encontrados');
      if (!testRes.ok) throw new Error('Plantilla de test no encontrada');
      const coursesPayload = await coursesRes.json();
      const testPayload = await testRes.json();

      const list = Array.isArray(coursesPayload)
        ? coursesPayload
        : Array.isArray(coursesPayload?.courses)
          ? coursesPayload.courses
          : [];
      const resolvedCourseId = Number.isNaN(courseId) || courseId < 1 || courseId > list.length ? 1 : courseId;
      const course = list[resolvedCourseId - 1];

      const base = mergeQuestionBank(getFallbackQuestionBank(), testPayload.default || {});
      const custom = testPayload?.byCourseTitle?.[course?.titulo];
      const questionBank = custom ? mergeQuestionBank(base, custom) : base;

      const allTests = [
        ...getCommonTests(questionBank),
        ...getSpecificTests(questionBank),
        ...getPsychotechnicalTests(questionBank),
      ];
      const activeTest = allTests.find((test) => test.id === testId) || allTests[0];

      const userId = getActiveUserId();
      const rawHistory = userId ? localStorage.getItem(`oporail_test_history_${userId}`) : null;
      const history = rawHistory ? JSON.parse(rawHistory) : [];
      const filteredHistory = Array.isArray(history) ? history.filter((item) => item.testId === activeTest.id) : [];
      const bestScore = filteredHistory.length ? Math.max(...filteredHistory.map((item) => item.score)) : null;

      testInfo.innerHTML = `
        <section class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 class="text-3xl font-bold text-purple-700">${activeTest.title}</h1>
              <p class="text-sm text-gray-600">${activeTest.info}</p>
            </div>
            <a href="/curso.html?id=${resolvedCourseId}" class="inline-flex bg-white border border-purple-700 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Volver al curso
            </a>
          </div>
          <div class="mt-4 space-y-2 text-sm text-gray-600">
            <p><strong>Preguntas:</strong> 20</p>
            <p><strong>Tiempo máximo:</strong> 30 minutos</p>
          </div>
          <button id="start-test" class="btn mt-4">Comenzar test</button>
        </section>

        <section class="mt-6 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 class="text-xl font-bold text-purple-700 mb-3">Resumen de intentos previos</h2>
          ${filteredHistory.length
            ? `
            <div class="space-y-3">
              ${filteredHistory
                .map(
                  (item, index) => `
                <article class="border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-4">
                  <div>
                    <p class="text-sm text-gray-600">Intento ${index + 1} · ${new Date(item.completedAt).toLocaleString('es-ES')}</p>
                    <p class="font-semibold text-gray-900">Puntuación: ${item.score}%</p>
                  </div>
                  <span class="text-xs font-semibold text-purple-700">Finalizado</span>
                </article>
              `,
                )
                .join('')}
            </div>
            <p class="mt-4 text-sm text-gray-600">Mejor puntuación: <strong>${bestScore}%</strong></p>
          `
            : '<p class="text-sm text-gray-600">Aún no has realizado este test.</p>'}
        </section>
      `;

      const startBtn = document.getElementById('start-test');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          window.open(`/test-run.html?course=${resolvedCourseId}&test=${activeTest.id}`, '_blank', 'noopener,noreferrer');
        });
      }
    })
    .catch((error) => {
      console.error('Error cargando detalle del test:', error);
      testInfo.innerHTML = '<p class="text-red-600">Error cargando el detalle del test</p>';
    });
}

const newsContainer = document.getElementById('news-list');
if (newsContainer) {
  fetch(resolveDataPath('news.json'))
    .then((res) => {
      if (!res.ok) throw new Error('Noticias no encontradas');
      return res.json();
    })
    .then((payload) => {
      const articles = payload.articles || [];

      if (!articles.length) {
        newsContainer.innerHTML = '<p class="text-gray-600">Pronto publicaremos nuevas noticias.</p>';
        return;
      }

      newsContainer.innerHTML = articles
        .map((article) => {
          const rawDate = article.date ? new Date(article.date) : null;
          const prettyDate = rawDate && !Number.isNaN(rawDate.valueOf())
            ? rawDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
            : 'Fecha pendiente';

          return `
          <article class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="h-44 bg-gray-100">
              <img src="${escapeHtml(article.image || '/img/uploads/default-news.svg')}" alt="${escapeHtml(article.title || 'Noticia OpoRail')}" class="w-full h-full object-cover" loading="lazy">
            </div>
            <div class="p-5">
              <p class="text-xs uppercase tracking-wide text-purple-700 font-semibold mb-2">${prettyDate}</p>
              <h3 class="text-lg font-bold text-gray-900 mb-2">${escapeHtml(article.title || 'Nueva noticia')}</h3>
              <p class="text-sm text-gray-600">${escapeHtml(article.summary || 'Sin resumen disponible.')}</p>
            </div>
          </article>
        `;
        })
        .join('');
    })
    .catch((err) => {
      console.error('Error cargando noticias:', err);
      newsContainer.innerHTML = '<p class="text-red-600">Error cargando noticias</p>';
    });
}