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
