// /js/user-panel.js
// Panel de usuario completo con login, perfil, cursos y progreso

const STORAGE_KEY = 'oporail_user_v1';
const state = {
  user: null,
  view: 'dashboard',
  courses: []
};

// -------------------- UTILIDADES --------------------
function saveUserLocal(user){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}
function loadUserLocal(){
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch(e){ return null; }
}
function clearUserLocal(){
  localStorage.removeItem(STORAGE_KEY);
}

// -------------------- RENDER PROFILE --------------------
function renderProfileCard(){
  const user = state.user;
  const nameEl = document.getElementById('userName');
  const emailEl = document.getElementById('userEmail');
  const avatarEl = document.getElementById('avatar');
  if(!nameEl) return;
  nameEl.textContent = user && user.name ? user.name : 'Usuario Invitado';
  emailEl.textContent = user && user.email ? user.email : 'No has iniciado sesión';
  if(avatarEl){
    if(user && user.avatar){
      avatarEl.style.backgroundImage = `url(${user.avatar})`;
    } else {
      avatarEl.style.backgroundImage = '';
    }
  }
}

// -------------------- CARGA DE CURSOS --------------------
async function loadCourses(){
  try {
    const res = await fetch('/data/courses.json');
    state.courses = await res.json();
  } catch(e){
    console.warn('No se pudieron cargar los cursos:', e);
    state.courses = [];
  }
}

// -------------------- VIEWS --------------------
function loadView(view){
  state.view = view || 'dashboard';
  const content = document.getElementById('content');
  if(!content) return;

  // Si no hay usuario logueado, mostramos auth
  if(!state.user){
    content.innerHTML = document.getElementById('auth-area') ? document.getElementById('auth-area').outerHTML : `
      <div class="auth-wrap">
        <h2 class="text-2xl font-bold mb-4">Accede a tu panel</h2>
        <form id="authForm" class="auth-form space-y-3">
          <div>
            <label>Nombre</label>
            <input id="authName" required class="border rounded px-2 py-1 w-full">
          </div>
          <div>
            <label>Email</label>
            <input id="authEmail" type="email" required class="border rounded px-2 py-1 w-full">
          </div>
          <button class="btn bg-purple-700 text-white px-4 py-2 rounded">Iniciar sesión</button>
        </form>
        <div class="or my-2 text-center text-gray-500">ó</div>
        <div class="guest-area text-center">
          <button id="btn-guest" class="btn-ghost px-4 py-2 border rounded">Entrar como invitado</button>
        </div>
      </div>`;
    attachAuthHandlers();
    return;
  }

  // -------------------- VIEWS LOGUEADO --------------------
  if(view === 'dashboard'){
    content.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">Bienvenido, ${state.user.name}</h2>
      <p>Selecciona una opción en el menú lateral para gestionar tu perfil y progresos.</p>
      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 bg-white rounded shadow">
          <h3 class="font-semibold">Mis Cursos</h3>
          <p>Visualiza tus cursos activos y tu progreso.</p>
          <button class="btn mt-2" data-view="courses">Ir a Mis Cursos</button>
        </div>
        <div class="p-4 bg-white rounded shadow">
          <h3 class="font-semibold">Progreso</h3>
          <p>Revisa tu avance en cada curso.</p>
          <button class="btn mt-2" data-view="progress">Ver Progreso</button>
        </div>
        <div class="p-4 bg-white rounded shadow">
          <h3 class="font-semibold">Perfil</h3>
          <p>Modifica tus datos personales y avatar.</p>
          <button class="btn mt-2" data-view="profile">Editar Perfil</button>
        </div>
      </div>
    `;
    initMenuLinks(); // los botones internos funcionan
  }
  else if(view === 'courses'){
    const list = state.courses.map(c => `
      <li class="p-2 border-b flex justify-between items-center">
        <span>${c.name}</span>
        <span class="text-gray-500">${c.status || 'Sin iniciar'}</span>
      </li>
    `).join('');
    content.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">Mis Cursos</h2>
      <ul class="bg-white rounded shadow divide-y">${list}</ul>
    `;
  }
  else if(view === 'progress'){
    const list = state.courses.map(c => `
      <li class="p-2 border-b">
        <span>${c.name} — ${c.progress || 0}% completado</span>
      </li>
    `).join('');
    content.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">Progreso</h2>
      <ul class="bg-white rounded shadow divide-y">${list}</ul>
    `;
  }
  else if(view === 'profile'){
    content.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">Mi Perfil</h2>
      <form id="profileForm" class="space-y-3">
        <div>
          <label>Nombre</label>
          <input id="inputName" class="border rounded px-2 py-1 w-full">
        </div>
        <div>
          <label>Email</label>
          <input id="inputEmail" type="email" class="border rounded px-2 py-1 w-full">
        </div>
        <div>
          <label>Avatar (URL)</label>
          <input id="inputAvatar" class="border rounded px-2 py-1 w-full">
        </div>
        <button class="btn bg-purple-700 text-white px-4 py-2 rounded">Guardar</button>
      </form>
    `;
    initProfileForm();
  }
}

// -------------------- AUTH HANDLERS --------------------
function attachAuthHandlers(){
  const authForm = document.getElementById('authForm');
  if(authForm){
    authForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = document.getElementById('authName').value.trim();
      const email = document.getElementById('authEmail').value.trim();
      if(!name || !email) { alert('Rellena nombre y email'); return; }
      state.user = { name, email, avatar: '' };
      saveUserLocal(state.user);
      renderProfileCard();
      loadView('dashboard');
    });
  }

  const guestBtn = document.getElementById('btn-guest');
  if(guestBtn){
    guestBtn.addEventListener('click', function(){
      state.user = { name: 'Invitado', email: '', avatar: '' };
      saveUserLocal(state.user);
      renderProfileCard();
      loadView('dashboard');
    });
  }
}

// -------------------- PROFILE --------------------
function initProfileForm(){
  const pf = document.getElementById('profileForm');
  if(!pf) return;
  const nameI = document.getElementById('inputName');
  const emailI = document.getElementById('inputEmail');
  const avI = document.getElementById('inputAvatar');
  const user = state.user || { name:'', email:'', avatar:'' };
  if(nameI) nameI.value = user.name || '';
  if(emailI) emailI.value = user.email || '';
  if(avI) avI.value = user.avatar || '';

  pf.addEventListener('submit', function(e){
    e.preventDefault();
    state.user.name = nameI.value.trim() || state.user.name;
    state.user.email = emailI.value.trim() || state.user.email;
    state.user.avatar = avI.value.trim() || state.user.avatar;
    saveUserLocal(state.user);
    alert('Perfil actualizado');
    renderProfileCard();
  });
}

// -------------------- SETTINGS --------------------
function initSettings(){
  const dm = document.getElementById('darkMode');
  if(!dm) return;
  const saved = localStorage.getItem('oporail_darkmode') === '1';
  if(saved) document.documentElement.classList.add('dark');
  dm.checked = saved;
  dm.addEventListener('change', function(){
    if(dm.checked){
      localStorage.setItem('oporail_darkmode','1');
      document.documentElement.classList.add('dark');
    } else {
      localStorage.removeItem('oporail_darkmode');
      document.documentElement.classList.remove('dark');
    }
  });

  const resetBtn = document.getElementById('btn-reset');
  if(resetBtn){
    resetBtn.addEventListener('click', function(){
      if(confirm('Borrar todos los datos locales?')) {
        clearUserLocal();
        localStorage.removeItem('oporail_darkmode');
        alert('Datos borrados. Se recargará la página.');
        location.href = '/';
      }
    });
  }
}

// -------------------- MENU --------------------
function initMenuLinks(){
  document.querySelectorAll('.menu a, .btn[data-view]').forEach(a=>{
    a.addEventListener('click', function(e){
      e.preventDefault();
      document.querySelectorAll('.menu a, .btn[data-view]').forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
      const v = a.getAttribute('data-view');
      loadView(v);
    });
  });
}

// -------------------- LOGOUT --------------------
function initLogout(){
  const btn = document.getElementById('btn-logout');
  if(btn){
    btn.addEventListener('click', function(){
      if(confirm('Cerrar sesión?')) {
        clearUserLocal();
        state.user = null;
        location.href = '/';
      }
    });
  }
}

// -------------------- INIT --------------------
document.addEventListener('DOMContentLoaded', async function(){
  state.user = loadUserLocal();
  renderProfileCard();
  await loadCourses();  // cargamos cursos antes de mostrar dashboard
  initMenuLinks();
  initLogout();

  if(document.getElementById('profileForm')) initProfileForm();
  if(document.getElementById('darkMode') || document.getElementById('btn-reset')) initSettings();

  if(document.getElementById('content')){
    if(state.user){
      loadView('dashboard');
    } else {
      loadView('auth');
    }
    attachAuthHandlers();
  }
});
