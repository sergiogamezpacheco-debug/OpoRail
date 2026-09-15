// js/user-progress.js
// Gestión centralizada del progreso del alumno.
// Durante el desarrollo conserva el almacenamiento local que ya utiliza el panel.
// La API queda preparada para conectar Firestore en una fase posterior.

(function () {
  'use strict';

  const LEGACY_PREFIX = 'oporail_progress_';

  function normalize(value) {
    return String(value || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function courseKey(course) {
    if (!course) return '';
    if (typeof course === 'string' || typeof course === 'number') return normalize(course);
    return normalize(course.id || course.slug || course.titulo || course.title || '');
  }

  function getMap(userId) {
    if (!userId) return {};
    try {
      const raw = localStorage.getItem(`${LEGACY_PREFIX}${userId}`);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' ? data : {};
    } catch (error) {
      console.error('[OpoRail] No se pudo leer el progreso:', error);
      return {};
    }
  }

  function saveMap(userId, data) {
    if (!userId) return;
    localStorage.setItem(`${LEGACY_PREFIX}${userId}`, JSON.stringify(data));
  }

  function getPercent(course, userId) {
    const key = courseKey(course);
    if (!key || !userId) return 0;
    const map = getMap(userId);
    const value = Number(map[key] ?? (course && course.id != null ? map[course.id] : undefined));
    return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
  }

  function setPercent(course, percent, userId) {
    const key = courseKey(course);
    if (!key || !userId) return null;
    const map = getMap(userId);
    const value = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
    map[key] = value;
    if (course && typeof course === 'object' && course.id != null) map[String(course.id)] = value;
    saveMap(userId, map);
    window.dispatchEvent(new CustomEvent('oporail:progress-updated', { detail: { courseId: key, percent: value } }));
    return value;
  }

  function markTopic(course, topicId, completed, totalTopics, userId) {
    const key = courseKey(course);
    if (!key || !topicId || !userId) return null;
    const storageKey = `${LEGACY_PREFIX}topics_${userId}`;
    let topics = {};
    try { topics = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (_) { topics = {}; }
    topics[key] = { ...(topics[key] || {}), [String(topicId)]: Boolean(completed) };
    localStorage.setItem(storageKey, JSON.stringify(topics));
    const completedCount = Object.values(topics[key]).filter(Boolean).length;
    if (Number(totalTopics) > 0) setPercent(course, completedCount / Number(totalTopics) * 100, userId);
    return topics[key];
  }

  function setLastActivity(course, activity, userId) {
    const key = courseKey(course);
    if (!key || !userId) return null;
    const storageKey = `${LEGACY_PREFIX}activity_${userId}`;
    let activities = {};
    try { activities = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (_) { activities = {}; }
    activities[key] = { activity: activity || '', updatedAt: new Date().toISOString() };
    localStorage.setItem(storageKey, JSON.stringify(activities));
    return activities[key];
  }

  function getOverall(courses, userId) {
    const list = Array.isArray(courses) ? courses : [];
    if (!list.length) return 0;
    return Math.round(list.reduce((sum, course) => sum + getPercent(course, userId), 0) / list.length);
  }

  function clear(userId) {
    if (!userId) return;
    localStorage.removeItem(`${LEGACY_PREFIX}${userId}`);
    localStorage.removeItem(`${LEGACY_PREFIX}topics_${userId}`);
    localStorage.removeItem(`${LEGACY_PREFIX}activity_${userId}`);
    window.dispatchEvent(new CustomEvent('oporail:progress-updated'));
  }

  window.OpoRailProgress = { getMap, getPercent, setPercent, markTopic, setLastActivity, getOverall, clear, courseKey };
})();
