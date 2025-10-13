// panel.js - funcionalidad básica sin servidor

const state = {
  user: JSON.parse(localStorage.getItem('oporail_user')) || {name:'Usuario Invitado',email:'',avatar:''},
  view:'dashboard'
}

function saveUser(){localStorage.setItem('oporail_user', JSON.stringify(state.user));}

function renderProfileCard(){
  const nameEl = document.getElementById('userName');
  const emailEl = document.getElementById('userEmail');
  const avatarEl = document.getElementById('avatar');
  if(nameEl) nameEl.textContent = state.user.name || 'Usuario Invitado';
  if(emailEl) emailEl.textContent = state.user.email || '';
  if(avatarEl){
    if(state.user.avatar){ avatarEl.style.backgroundImage = `url(${state.user.avatar})`; avatarEl.style.backgroundSize='cover'}
    else avatarEl.style.backgroundImage = ''
  }
}

function loadView(view){
  state.view = view || 'dashboard';
  const content = document.getElementById('content');
  if(!content) return;
  if(view==='dashboard'){
    content.innerHTML = `
Bienvenido, ${state.user.name}
Accede a tus cursos y pruebas desde aquí.

`;
  } else if(view==='courses'){
    content.innerHTML = `
Mis Cursos
Lista de cursos disponibles:

Ajustador Montador
Eléctrico
Soldadores
`;
  } else if(view==='progress'){
    content.innerHTML = `
Progreso
No hay datos guardados.

`;
  }
}

function initPanel(){
  // render datos básicos si existen
  renderProfileCard();
  // manejar enlaces del menú
  document.querySelectorAll('.menu a').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      document.querySelectorAll('.menu a').forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
      const v = a.dataset.view;
      loadView(v);
    })
  });

  // formulario perfil (si existe)
  const pf = document.getElementById('profileForm');
  if(pf){
    const nameI = document.getElementById('inputName');
    const emailI = document.getElementById('inputEmail');
    const avI = document.getElementById('inputAvatar');
    // rellenar
    if(nameI) nameI.value = state.user.name || '';
    if(emailI) emailI.value = state.user.email || '';
    if(avI) avI.value = state.user.avatar || '';
    pf.addEventListener('submit', e=>{
      e.preventDefault();
      state.user.name = nameI.value || state.user.name;
      state.user.email = emailI.value || state.user.email;
      state.user.avatar = avI.value || state.user.avatar;
      saveUser(); renderProfileCard(); alert('Perfil guardado');
    })
  }

  // logout
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn) logoutBtn.addEventListener('click', e=>{ e.preventDefault(); localStorage.removeItem('oporail_user'); location.href='/'; })

  // default view
  loadView(state.view);
}

// si estamos en index.html del panel
if(typeof window !== 'undefined'){
  window.addEventListener('DOMContentLoaded', initPanel);
}