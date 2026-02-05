import { logout, onUserChanged, requireAuth } from "./auth.js";

requireAuth();

const FALLBACK_COURSES = [
  { titulo: "Ajustador-Montador", estado: "Disponible" },
  { titulo: "Eléctrico", estado: "Disponible" },
  { titulo: "Suministros", estado: "Próximamente" },
];

function resolveDataPath(fileName) {
  return window.location.pathname.includes('/user/') ? `../data/${fileName}` : `/data/${fileName}`;
}

function bindLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", async () => {
    await logout();
  });
}

function getEnrollments(userId) {
  const raw = localStorage.getItem(`oporail_enrollments_${userId}`);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getProgressMap(userId) {
  const raw = localStorage.getItem(`oporail_progress_${userId}`);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function createProgressIfMissing(userId, courseId) {
  const progressMap = getProgressMap(userId);
  if (typeof progressMap[courseId] !== 'number') {
    const seededValue = 20 + ((courseId * 13) % 61);
    progressMap[courseId] = seededValue;
    localStorage.setItem(`oporail_progress_${userId}`, JSON.stringify(progressMap));
  }
}

async function getCourseCatalog() {
  try {
    const res = await fetch(resolveDataPath('courses.json'));
    if (!res.ok) throw new Error('No se pudo cargar courses.json');
    const courses = await res.json();
    return Array.isArray(courses) ? courses : FALLBACK_COURSES;
  } catch (error) {
    console.error('Error cargando catálogo de cursos:', error);
    return FALLBACK_COURSES;
  }
}

async function renderDashboard(user) {
  const grid = document.getElementById("courses-grid");
  const emptyState = document.getElementById('courses-empty-state');
  if (!grid) return;

  const allCourses = await getCourseCatalog();
  const enrollments = getEnrollments(user.uid);

  const selectedCourses = (enrollments.length
    ? allCourses.filter((_, index) => enrollments.includes(index + 1))
    : allCourses.slice(0, 3));

  if (!selectedCourses.length) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    updateGlobalProgress([]);
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  selectedCourses.forEach((_, index) => {
    const courseId = enrollments.length ? enrollments[index] : index + 1;
    createProgressIfMissing(user.uid, courseId);
  });

  const progressMap = getProgressMap(user.uid);
  const normalizedCourses = selectedCourses.map((course, index) => {
    const id = enrollments.length ? enrollments[index] : index + 1;
    return {
      id,
      title: course.titulo,
      active: course.estado === 'Disponible',
      progress: progressMap[id] ?? 0,
    };
  });

  grid.innerHTML = normalizedCourses
    .map(
      (course) => `
      <article class="${course.active ? 'bg-purple-700' : 'bg-purple-400 opacity-80'} text-white rounded-xl p-5 shadow-md">
        <h4 class="font-bold text-lg mb-2">${course.title}</h4>
        <p class="text-purple-100 text-sm mb-3">${course.active ? 'Curso activo' : 'Próximamente'}</p>
        <div class="w-full bg-white/30 rounded-full h-2.5 overflow-hidden">
          <div class="bg-white h-2.5" style="width:${course.progress}%"></div>
        </div>
        <p class="text-xs mt-2 text-purple-100">Progreso: ${course.progress}%</p>
      </article>
    `,
    )
    .join("");

  updateGlobalProgress(normalizedCourses);
}

function updateGlobalProgress(courses) {
  const bar = document.getElementById("global-progress-bar");
  const text = document.getElementById("global-progress-text");

  if (!courses.length) {
    if (bar) bar.style.width = '0%';
    if (text) text.textContent = '0%';
    return;
  }

  const avg = Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length);
  if (bar) bar.style.width = `${avg}%`;
  if (text) text.textContent = `${avg}%`;
}

function fillUserInfo(user) {
  const name = user.displayName || "Usuario";
  const email = user.email || "-";
  const photo = user.photoURL || "https://ui-avatars.com/api/?name=Usuario&background=7c3aed&color=fff";
  const lastLogin = user.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString("es-ES")
    : "-";

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("user-name", name);
  setText("user-email", email);
  setText("last-login", lastLogin);
  setText("user-last-login", lastLogin);
  setText("user-uid", user.uid || "-");
  setText("user-provider", user.providerData?.[0]?.providerId || "-");

  const photoEls = document.querySelectorAll("#user-photo");
  photoEls.forEach((el) => {
    el.src = photo;
  });
}

onUserChanged((user) => {
  if (!user) return;
  fillUserInfo(user);
  renderDashboard(user);
});

bindLogout();
