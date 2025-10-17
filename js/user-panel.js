// user-panel.js
// Login simulado y panel con localStorage

const STORAGE_KEY = 'oporail_user_v1';

const state = {
  user: null,
  view: 'dashboard'
};

// Utilidades
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

// Render UI
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

// Views
function loadView(view){
  state.view = view || 'dashboard';
  const content = document.getElementById('content');
  if(!content) return;

  // if not logged in, show auth area
  if(!state.user){
    content.innerHTML = document.getElementById('auth-area') ? document.getElementById('auth-area').outerHTML : `
      <div class="auth-wrap">
        <h2>Accede a tu panel</h2>
        <form id="authForm" class="auth-form">
          <label>Nombre</label><input id="authName" required>
          <label>Email</label><input id="authEmail" type="email" required>
          <button class="btn">Iniciar sesión</button>
        </form>
        <div class="or">ó</div>
        <div class="guest-area"><p>O entrar como invitado.</p><button id="btn-guest" class="btn-ghost">Entrar como invitado</button></div>
      </div>`;
    attachAuthHandlers(); // attach handlers to new DOM
    return;
  }

  // logged in views
  if(view === 'dashboard'){
    content.innerHTML = `<h2>Bienvenido, ${state.user.name}</h2>
      <p>Selecciona una opción en el menú lateral para gestionar tu perfil y progresos.</p>
      <div style="margin-top:16px">
        <a class="btn" href="profile.html">Ir a Perfil</a>
      </div>`;
  } else if(view === 'courses'){
    // sample course list: could be loaded from data/courses.json
    content.innerHTML = `<h2>Mis Cursos</h2>
      <ul>
        <li>Ajustador Montador — <em>Sin iniciar</em></li>
        <li>Eléctrico — <em>Sin iniciar</em></li>
        <li>Soldadores — <em>Sin iniciar</em></li>
      </ul>`;
  } else if(view === 'progress'){
    content.innerHTML = `<h2>Progreso</h2><p>No tienes progreso guardado todavía.</p>`;
  }
}

// Auth handlers (attach events after DOM build)
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
      // re-render dashboard
      loadView('dashboard');
      // update menu active
      document.querySelectorAll('.menu a').forEach(a=>a.classList.remove('active'));
      const dashLink = document.querySelector('.menu a[data-view="dashboard"]');
      if(dashLink) dashLink.classList.add('active');
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

// Profile page behaviour
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
    state.user = state.user || {};
    state.user.name = nameI.value.trim() || state.user.name;
    state.user.email = emailI.value.trim() || state.user.email;
    state.user.avatar = avI.value.trim() || state.user.avatar;
    saveUserLocal(state.user);
    alert('Perfil actualizado');
    // update profile card in case user returns to panel
    renderProfileCard();
  });
}

// Settings handlers
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

// Menu wiring
function initMenuLinks(){
  document.querySelectorAll('.menu a').forEach(a=>{
    a.addEventListener('click', function(e){
      e.preventDefault();
      document.querySelectorAll('.menu a').forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
      const v = a.getAttribute('data-view');
      loadView(v);
    });
  });
}

// Logout
function initLogout(){
  const btn = document.getElementById('btn-logout');
  if(btn){
    btn.addEventListener('click', function(){
      if(confirm('Cerrar sesión?')) {
        clearUserLocal();
        state.user = null;
        // reload to root or show auth
        location.href = '/';
      }
    });
  }
}

// Initialization
document.addEventListener('DOMContentLoaded', function(){
  state.user = loadUserLocal();
  renderProfileCard();
  initMenuLinks();
  initLogout();

  // If we are on profile page, initialize profile form
  if(document.getElementById('profileForm')) initProfileForm();
  if(document.getElementById('darkMode') || document.getElementById('btn-reset')) initSettings();

  // If we are on dashboard (user/index.html)
  if(document.getElementById('content')){
    if(state.user){
      // render default logged in view
      loadView('dashboard');
    } else {
      // show auth area
      loadView('auth');
    }
    attachAuthHandlers();
  }
});
