(function () {
  'use strict';

  const COURSE_BANKS = {
    1: 'question-banks/ajustador.json',
    2: 'question-banks/electrico.json',
    3: 'question-banks/suministros.json',
    4: 'question-banks/pintura.json',
    5: 'question-banks/soldadores.json',
    6: 'question-banks/torneros.json',
  };

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const normalizeText = (value) => String(value ?? '').trim();

  function resolveDataPath(fileName) {
    return `/data/${fileName}`;
  }

  async function loadBank(path) {
    try {
      const response = await fetch(resolveDataPath(path));
      if (!response.ok) return [];
      const payload = await response.json();
      return Array.isArray(payload?.questions) ? payload.questions : [];
    } catch (error) {
      console.error('[OpoRail] No se pudo cargar el banco de preguntas:', path, error);
      return [];
    }
  }

  async function buildSyllabusIndex() {
    const params = new URLSearchParams(window.location.search);
    const courseId = Number(params.get('course'));
    const bankPaths = ['question-banks/comun.json'];

    if (COURSE_BANKS[courseId]) bankPaths.push(COURSE_BANKS[courseId]);

    const banks = await Promise.all(bankPaths.map(loadBank));
    const index = new Map();

    banks.flat().forEach((question) => {
      const text = normalizeText(question?.question);
      const tags = Array.isArray(question?.tags)
        ? question.tags.filter((tag) => String(tag).trim())
        : [];

      if (text && tags.length) {
        index.set(text, tags);
      }
    });

    return index;
  }

  function isPsychotechnicalTest() {
    const params = new URLSearchParams(window.location.search);
    return String(params.get('test') || '').startsWith('psy-');
  }

  function addSyllabusLabels(index) {
    if (isPsychotechnicalTest()) return;

    const runner = document.getElementById('test-runner');
    if (!runner) return;

    const articles = runner.querySelectorAll('article');
    articles.forEach((article) => {
      const answerParagraph = Array.from(article.querySelectorAll('p')).find((paragraph) => {
        const strong = paragraph.querySelector('strong');
        return strong && normalizeText(strong.textContent) === 'Respuesta correcta:';
      });

      if (!answerParagraph || article.querySelector('.syllabus-reference')) return;

      const questionParagraph = article.querySelector('p.relative.font-semibold');
      if (!questionParagraph) return;

      const questionText = normalizeText(questionParagraph.textContent).replace(/^\d+\.\s*/, '');
      const tags = index.get(questionText);
      if (!tags?.length) return;

      const reference = document.createElement('div');
      reference.className = 'syllabus-reference mb-3 bg-purple-50 border border-purple-100 rounded-lg p-3 text-sm text-purple-900';
      reference.innerHTML = `
        <p class="font-semibold text-purple-700">Parte del temario</p>
        <p class="mt-1">${tags.map((tag) => `<span class="inline-block mr-2 mb-1">${escapeHtml(tag)}</span>`).join('')}</p>
      `;

      answerParagraph.parentElement.insertBefore(reference, answerParagraph);
    });
  }

  async function init() {
    if (isPsychotechnicalTest()) return;

    const index = await buildSyllabusIndex();
    if (!index.size) return;

    const runner = document.getElementById('test-runner');
    if (!runner) return;

    const observer = new MutationObserver(() => addSyllabusLabels(index));
    observer.observe(runner, { childList: true, subtree: true });

    addSyllabusLabels(index);
  }

  init();
})();
