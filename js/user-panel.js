import { logout, onUserChanged, requireAuth } from "./auth.js";

const courses = [
  { title: "Ajustador-Montador", progress: 65, active: true },
  { title: "Eléctrico", progress: 40, active: true },
  { title: "Suministros", progress: 0, active: false },
];

requireAuth();

function bindLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", async () => {
    await logout();
  });
}

function renderDashboard() {
  const grid = document.getElementById("courses-grid");
  if (!grid) return;

  grid.innerHTML = courses
    .map(
      (course) => `
      <div class="${course.active ? 'bg-purple-700' : 'bg-purple-400 opacity-70'} text-white rounded-xl p-5 shadow-md">
        <h4 class="font-bold text-lg mb-2">${course.title}</h4>
        <p class="text-purple-100 text-sm">${course.active ? 'Curso activo' : 'Próximamente'}</p>
      </div>
    `,
    )
    .join("");

  const avg = Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length);
  const bar = document.getElementById("global-progress-bar");
  const text = document.getElementById("global-progress-text");
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
  renderDashboard();
});

bindLogout();
