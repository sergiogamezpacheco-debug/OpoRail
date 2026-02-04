/* ===============================
   DATOS SIMULADOS DEL USUARIO
   =============================== */

const userData = {
  name: "Usuario",
  email: "email@example.com",
  avatar: null,
  courses: [
    { title: "Ajustador-Montador", progress: 65 },
    { title: "Eléctrico", progress: 40 },
    { title: "Suministros", progress: 0 },
    { title: "Pintura", progress: 0 },
    { title: "Soldadores", progress: 20 },
    { title: "Torneros", progress: 0 }
  ]
};

/* ===============================
   ELEMENTOS BASE
   =============================== */

const content = document.getElementById("content");
const menuLinks = document.querySelectorAll(".menu a");

/* ===============================
   VISTAS
   =============================== */

function loadDashboard() {
  content.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
    <p class="mb-6 text-gray-600">
      Bienvenido <strong>${userData.name}</strong>. Estos son tus cursos activos.
    </p>

    <div class="grid md:grid-cols-2 gap-6">
      ${userData.courses.map(course => `
        <div class="bg-white rounded-xl shadow-md p-4">
          <h3 class="text-lg font-semibold text-purple-700 mb-2">
            ${course.title}
          </h3>

          <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              class="bg-purple-700 h-3 rounded-full"
              style="width: ${course.progress}%">
            </div>
          </div>

          <p class="text-sm text-gray-600">
            Progreso: ${course.progress}%
          </p>
        </div>
      `).join("")}
    </div>
  `;
}

function loadCourses() {
  content.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">Mis Cursos</h2>

    <div class="grid md:grid-cols-2 gap-6">
      ${userData.courses.map(course => `
        <div class="bg-white rounded-xl shadow-md p-4">
          <h3 class="text-lg font-semibold text-purple-700 mb-2">
            ${course.title}
          </h3>
          <p class="text-gray-600 text-sm">
            Accede al contenido y continúa tu progreso.
          </p>
        </div>
      `).join("")}
    </div>
  `;
}

function loadProgress() {
  content.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">Progreso General</h2>

    <div class="space-y-4">
      ${userData.courses.map(course => `
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium">${course.title}</span>
            <span class="text-sm">${course.progress}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="bg-purple-700 h-3 rounded-full"
              style="width: ${course.progress}%">
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

/* ===============================
   NAVEGACIÓN
   =============================== */

menuLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    menuLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    const view = link.dataset.view;

    if (view === "dashboard") loadDashboard();
    if (view === "courses") loadCourses();
    if (view === "progress") loadProgress();
  });
});

/* ===============================
   LOGOUT (SIMULADO)
   =============================== */

const logoutBtn = document.getElementById("btn-logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

/* ===============================
   INICIO
   =============================== */

loadDashboard();
