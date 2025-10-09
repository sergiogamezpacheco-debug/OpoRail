async function fetchJSON(path){
  try{
    const r = await fetch(path + '?t=' + Date.now());
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  }catch(e){
    console.error('fetchJSON error', path, e);
    return null;
  }
}

function safeText(s){ return s || ''; }

function buildHeader(site){
  const header = document.getElementById('site-header');
  const logo = (safeText(site.logoOpo)||'Opo') + ' ' + (safeText(site.logoRail)||'Rail');
  const nav = site.nav || [{text:'Inicio', href:'index.html'},{text:'Cursos', href:'cursos.html'}];
  const navHtml = nav.map(item=>`<a href="${item.href}" class="mx-3 hover:text-purple-700">${item.text}</a>`).join('');
  header.innerHTML = `
    <header class="header container mx-auto">
      <div class="flex items-center gap-3">
        <a href="index.html" style="font-weight:800;font-size:1.25rem;">
          <span style="color:var(--adif-green)">${site.logoOpo||'Opo'}</span><span style="color:var(--renfe-purple)">${site.logoRail||'Rail'}</span>
        </a>
      </div>
      <nav class="hidden md:block">${navHtml}</nav>
      <div><a href="perfil.html"><div style="width:38px;height:38px;border-radius:50%;background:#d1d5db;"></div></a></div>
    </header>
  `;
}

function buildFooter(site){
  const f = document.getElementById('site-footer');
  f.innerHTML = `<footer class="text-center py-6 text-sm text-gray-500">${safeText(site.footerText)||'© 2025 OpoRail'}</footer>`;
}

function buildHero(site){
  if(!document.getElementById('hero')) return;
  document.getElementById('hero-title').textContent = safeText(site.heroTitle) || 'Prepárate para trabajar en Renfe con OpoRail';
  document.getElementById('hero-subtitle').textContent = safeText(site.heroSubtitle) || '';
  const cta = document.getElementById('hero-cta');
  if(cta){
    cta.textContent = safeText(site.heroCtaText) || 'Ver Cursos';
    cta.href = safeText(site.heroCtaLink) || 'cursos.html';
  }
}

// noticias
function buildNews(news){
  const container = document.getElementById('noticias-lista');
  if(!container) return;
  container.innerHTML = '';
  (news.articles || []).forEach(a=>{
    const image = a.image || 'img/default-news.jpg';
    const html = `
      <article class="card bg-white">
        <img src="${image}" alt="${a.title}" class="w-full h-40 object-cover">
        <div class="p-4">
          <h3 class="font-semibold">${a.title}</h3>
          <p class="text-sm text-gray-600 mt-2">${a.summary||''}</p>
        </div>
      </article>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

// beneficios
function buildBenefits(site){
  const container = document.getElementById('benefits-list');
  if(!container) return;
  container.innerHTML = '';
  (site.benefits || []).forEach(b=>{
    const html = `<div class="p-4 rounded-lg bg-white shadow text-center">${b.icon||''}<div class="mt-2">${b.title||''}</div></div>`;
    container.insertAdjacentHTML('beforeend', html);
  });
}

// cursos list
function buildCourses(data){
  const container = document.getElementById('courses-list');
  if(!container) return;
  container.innerHTML = '';
  (data.courses || []).forEach(c=>{
    const html = `
      <div class="card-rail text-center">
        <h3 class="text-xl font-semibold mb-2">${c.title}</h3>
        <p class="mb-4 text-sm">${c.description||''}</p>
        <a href="${c.link||'curso.html?id='+c.id}" class="bg-white text-purple-700 px-4 py-2 rounded-md font-semibold inline-block">Entrar</a>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

// planes list
function buildPlanes(data){
  const container = document.getElementById('planes-list');
  if(!container) return;
  container.innerHTML = '';
  (data.plans || []).forEach(p=>{
    const html = `
      <div class="bg-white shadow-lg p-6 rounded-lg text-center border">
        <h3 class="text-xl font-bold mb-2">${p.name}</h3>
        <p class="mb-4">${p.description}</p>
        <p class="text-3xl font-bold mb-4">${p.price}</p>
        <button class="bg-green-700 text-white px-4 py-2 rounded">Elegir</button>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

// detalle de curso (curso.html)
function buildCourseDetail(data){
  const el = document.getElementById('course-detail');
  if(!el) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const course = (data.courses||[]).find(c=>c.id === id);
  if(!course){
    el.innerHTML = `<div class="p-6 bg-white shadow rounded">Curso no encontrado. <a href="cursos.html">Volver</a></div>`;
    return;
  }
  el.innerHTML = `
    <div class="bg-white p-6 rounded shadow">
      <h1 class="text-2xl font-bold mb-2">${course.title}</h1>
      <p class="text-gray-600 mb-4">${course.description||''}</p>
      <a href="${course.link || '#'}" class="btn-rail inline-block">Comenzar test</a>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const site = await fetchJSON('data/site.json') || {};
  const courses = await fetchJSON('data/courses.json') || {courses:[]};
  const news = await fetchJSON('data/news.json') || {articles:[]};
  const planes = await fetchJSON('data/planes.json') || {plans:[]};

  buildHeader(site);
  buildFooter(site);
  buildHero(site);
  buildNews(news);
  buildBenefits(site);
  buildCourses(courses);
  buildPlanes(planes);
  buildCourseDetail(courses);
});
