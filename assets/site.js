// Ruta a la raíz del sitio ("" en portada, "../" en páginas internas)
const ROOT = document.documentElement.dataset.root || '';

// menú móvil
const mb = document.querySelector('.menu-btn'), menu = document.getElementById('menu');
function setMenu(open) { menu.classList.toggle('open', open); mb.setAttribute('aria-expanded', open) }
if (mb) {
  mb.onclick = e => { e.stopPropagation(); setMenu(!menu.classList.contains('open')) };
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => { if (!e.target.closest('.nav')) setMenu(false) });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); mb.focus() }
  });
}

// notas emergentes: las notas viven en /fuentes/; si no están en esta página se cargan una vez
let notesDoc = null;
async function getNote(id) {
  const local = document.getElementById(id);
  if (local) return local;
  if (!notesDoc) {
    try {
      const html = await fetch(ROOT + 'fuentes/').then(r => r.ok ? r.text() : Promise.reject());
      notesDoc = new DOMParser().parseFromString(html, 'text/html');
    } catch { return null }
  }
  return notesDoc.getElementById(id);
}

let pop;
function closePop() { pop && pop.remove(); pop = null }
document.querySelectorAll('sup.fn a').forEach(a => {
  a.addEventListener('click', async e => {
    const href = a.getAttribute('href'), id = href.slice(href.indexOf('#') + 1);
    e.preventDefault(); e.stopPropagation();
    if (pop && pop.dataset.id === id) { closePop(); return }
    const note = await getNote(id);
    if (!note) { location.href = href; return } // sin conexión al índice: ir a Fuentes
    closePop();
    pop = document.createElement('div'); pop.className = 'pop'; pop.dataset.id = id;
    pop.innerHTML = '<span class="n">NOTA ' + id.slice(1) + '</span>' + note.innerHTML +
      ' <a class="to-src" href="' + href + '" style="display:block;margin-top:8px;word-break:normal">Ver en Fuentes →</a>';
    document.body.appendChild(pop);
    const r = a.getBoundingClientRect(), w = pop.offsetWidth;
    let x = r.left + window.scrollX - w / 2;
    x = Math.max(16, Math.min(x, document.documentElement.clientWidth - w - 16));
    pop.style.left = x + 'px'; pop.style.top = (r.bottom + window.scrollY + 10) + 'px';
    pop.addEventListener('click', ev => ev.stopPropagation());
    pop.querySelector('.to-src').onclick = closePop;
  });
});
document.addEventListener('click', closePop);
document.addEventListener('keydown', e => e.key === 'Escape' && closePop());

// lightbox documentos
const lb = document.getElementById('lb');
if (lb) {
  document.querySelectorAll('.doc').forEach(d => d.onclick = () => {
    const img = lb.querySelector('img');
    img.src = d.dataset.full; img.alt = d.querySelector('img').alt; lb.showModal();
  });
  lb.onclick = () => lb.close();
}

// aparición suave
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
  }), { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  revealEls.forEach(el => io.observe(el));
} else revealEls.forEach(el => el.classList.add('in'));

// ===== Aviso de cookies (LSSI art. 22.2 · RGPD · Guía AEPD) =====
(function () {
  const KEY = 'jmb-consent', VERSION = 1, MAX_AGE = 365 * 864e5; // 12 meses
  const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Inter:wght@500;600&display=swap';
  const read = () => { try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); return c && c.v === VERSION && Date.now() - c.t < MAX_AGE ? c : null } catch { return null } };
  const loadFonts = () => {
    if (document.querySelector('link[data-gfonts]')) return;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = FONTS_URL; l.dataset.gfonts = '';
    document.head.appendChild(l);
  };
  const policy = ROOT + 'cookies/';

  const bar = document.createElement('section');
  bar.className = 'cc-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Aviso de cookies');
  bar.innerHTML = `
    <div class="cc-in">
      <p class="cc-txt"><b>Tu privacidad.</b> Este sitio no usa cookies de analítica ni de publicidad. Solo te pedimos permiso para cargar las tipografías de <b>Google Fonts</b>, un servicio de Google que recibe tu dirección IP. Si lo rechazas, la web funciona igual con las fuentes de tu dispositivo. <a href="${policy}">Política de cookies</a></p>
      <div class="cc-btns">
        <button type="button" class="cc-b cc-cfg">Configurar</button>
        <button type="button" class="cc-b cc-rej">Rechazar</button>
        <button type="button" class="cc-b cc-acc">Aceptar</button>
      </div>
    </div>`;

  const dlg = document.createElement('dialog');
  dlg.className = 'cc-dlg'; dlg.setAttribute('aria-labelledby', 'cc-t');
  dlg.innerHTML = `
    <h2 id="cc-t">Configurar cookies</h2>
    <p>Elige qué servicios permites. Puedes cambiar tu elección cuando quieras desde «Configurar cookies», en el pie de página. Más detalles en la <a href="${policy}">política de cookies</a>.</p>
    <div class="cc-opt">
      <div><b>Necesarias</b><span>Guardan tu elección sobre este aviso durante 12 meses (almacenamiento local, sin cookies de terceros).</span></div>
      <label class="cc-sw"><input type="checkbox" checked disabled><i></i><span class="cc-st">Siempre activas</span></label>
    </div>
    <div class="cc-opt">
      <div><b>Servicios de terceros: Google Fonts</b><span>Tipografías del diseño. Proveedor: Google Ireland Ltd. No instala cookies, pero recibe tu dirección IP.</span></div>
      <label class="cc-sw"><input type="checkbox" id="cc-ext"><i></i><span class="cc-st">Permitir</span></label>
    </div>
    <div class="cc-btns">
      <button type="button" class="cc-b cc-rej">Rechazar todo</button>
      <button type="button" class="cc-b cc-save">Guardar selección</button>
      <button type="button" class="cc-b cc-acc">Aceptar todo</button>
    </div>`;

  function save(ext) {
    const prev = read();
    try { localStorage.setItem(KEY, JSON.stringify({ v: VERSION, t: Date.now(), ext: !!ext })) } catch {}
    bar.remove(); if (dlg.open) dlg.close();
    if (ext) loadFonts();
    else if (prev && prev.ext) location.reload(); // retirar consentimiento: recargar sin Google Fonts
  }
  function openCfg() {
    const c = read(); dlg.querySelector('#cc-ext').checked = !!(c && c.ext);
    if (!dlg.isConnected) document.body.appendChild(dlg);
    dlg.showModal();
  }
  [bar, dlg].forEach(el => {
    el.querySelectorAll('.cc-acc').forEach(b => b.onclick = () => save(true));
    el.querySelectorAll('.cc-rej').forEach(b => b.onclick = () => save(false));
  });
  bar.querySelector('.cc-cfg').onclick = openCfg;
  dlg.querySelector('.cc-save').onclick = () => save(dlg.querySelector('#cc-ext').checked);
  document.querySelectorAll('.cc-open').forEach(b => b.onclick = openCfg);

  if (!read()) document.body.appendChild(bar);
})();
