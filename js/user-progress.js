// js/user-progress.js
// Gestión centralizada del progreso del alumno.
// Mantiene el sistema local durante la fase de desarrollo y deja una API estable
// para conectar Firestore más adelante.

(function () {
  'use strict';

  const STORAGE_KEY = 'oporail_progress_v1';

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' ? data : {};
    } catch (error) {
      console.error('[OpoRail] No se pudo leer el progreso:', error);
      return {};
    }
  }

  function saveAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function courseKey(course) {
    if (!course) return '';
    if (typeof course === 'string') return normalize(course);
    return normalize(course.id || course.slug || course.titulo || course.title || '');
  }

  function get(course) {
    const key = courseKey(course);
    if (!key) return null;
    return loadAll()[key] || null;
  }

  function getPercent(course) {
    const item = get(course);
    if (!item) return 0;
    const percent = Number(item.percent);
    return Number.isFinite(percent) ? Math.max(0, Math.min(100, Math.round(percent))) : 0;
  }

  function setPercent(course, percent) {
    const key = courseKey(course);
    if (!key) return null;
    const data = loadAll();
    const previous = data[key] || {};
    const value = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
    data[key] = {
      ...previous,
      courseId: key,
      percent: value,
      updatedAt: new Date().toISOString()
    };
    saveAll(data);
    window.dispatchEvent(new CustomEvent('oporail:progress-updated', {
      detail: { courseId: key, percent: value }
    }));
    return data[key];
  }

  function markTopic(course, topicId, completed) {
    const key = courseKey(course);
    if (!key || !topicId) return null;
    const data = loadAll();
    const previous = data[key] || { courseId: key, percent: 0, topics: {} };
    const topics = { ...(previous.topics || {}) };
    topics[String(topicId)] = Boolean(completed);
    data[key] = {
      ...previous,
      courseId: key,
      topics,
      updatedAt: new Date().toISOString()
    };
    saveAll(data);
    window.dispatchEvent(new CustomEvent('oporail:progress-updated', {
      detail: { courseId: key, topics }
    }));
    return data[key];
  }

  function setLastActivity(course, activity) {
    const key = courseKey(course);
    if (!key) return null;
    const data = loadAll();
    const previous = data[key] || { courseId: key, percent: 0 };
    data[key] = {
      ...previous,
      courseId: key,
      lastActivity: activity || '',
      lastActivityAt: new Date().toISOString()
    };
    saveAll(data);
    return data[key];
  }

  function getOverall(courses) {
    const list = Array.isArray(courses) ? courses : [];
    if (!list.length) return 0;
    const total = list.reduce((sum, course) => sum + getPercent(course), 0);
    return Math.round(total / list.length);
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('oporail:progress-updated'));
  }

  window.OpoRailProgress = {
    loadAll,
    get,
    getPercent,
    setPercent,
    markTopic,
    setLastActivity,
    getOverall,
    clear,
    courseKey
  };
})();
