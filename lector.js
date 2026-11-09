// Lógica de la biblioteca y el lector. No necesitas tocar este archivo.
// Lee los libros desde la carpeta "libros" (ver libros/lista.json).
(function () {
  const vista = document.getElementById('vista-libros');
  if (!vista) return;

  let LIBROS = [];

  // ---------- Estilos extra del lector (voz y música) ----------
  const css = `
    .controles { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; max-width: 680px; margin: 0 auto 24px; }
    .sel { background: var(--panel); color: var(--texto); border: 1px solid #2a2a36; border-radius: 4px; padding: 8px; font-family: 'Lora', serif; }
    .controles input[type=range] { accent-color: var(--dorado); width: 110px; }
    .texto-lector p.leyendo { background: rgba(201,162,75,0.14); border-left: 3px solid var(--dorado); padding-left: 12px; margin-left: -15px; border-radius: 2px; }
    .aviso-voz { color: var(--texto-suave); font-size: 0.85rem; font-style: italic; }
  `;
  const estilo = document.createElement('style');
  estilo.textContent = css;
  document.head.appendChild(estilo);

  // ---------- Utilidades ----------
  const leer = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const arriba = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const buscar = id => LIBROS.find(l => l.id === id);

  // ---------- Rutas (todo lo de un libro vive en su carpeta) ----------
  //  libros/<libro>/portada.png
  //  libros/<libro>/libro.json
  //  libros/<libro>/parte-01/texto.txt  y  caratula.png
  const carpLibro = id => `libros/${id}`;
  const carpParte = (id, i) => `libros/${id}/parte-${String(i + 1).padStart(2, '0')}`;
  const portadaDe = l => `${carpLibro(l.id)}/${l.portada || 'portada.png'}`;

  let tam = parseInt(leer('tam-letra'), 10) || 19;
  let tokenParte = 0; // evita que una carga lenta pise a otra pantalla

  // ---------- Lectura en voz alta ----------
  const hayVoz = 'speechSynthesis' in window;
  let leyendo = false;
  let pausado = false;
  let pos = 0;            // fragmento donde va la lectura
  let sesion = 0;
  let enCurso = null;     // referencia al fragmento que suena (evita que el navegador lo corte)
  let chunks = [];        // fragmentos de voz: { texto, p } (p = número de párrafo)
  let claveActual = '';
  let ultimoP = -1;
  let velocidad = parseFloat(leer('vel-voz')) || 1;

  function cortar(s) {
    const out = [];
    while (s.length > 250) {
      let k = s.lastIndexOf(' ', 200);
      if (k <= 0) k = 200;
      out.push(s.slice(0, k));
      s = s.slice(k + 1);
    }
    if (s.trim()) out.push(s);
    return out;
  }

  function partir(texto) {
    const frases = texto.match(/[^.!?…]+[.!?…]+["”»')\]]*\s*|[^.!?…]+$/g) || [texto];
    const out = [];
    let acc = '';
    frases.forEach(f => {
      if (acc && (acc + f).length > 180) { out.push(acc.trim()); acc = f; }
      else acc += f;
    });
    if (acc.trim()) out.push(acc.trim());
    return out.flatMap(cortar);
  }

  function construirChunks() {
    const res = [];
    vista.querySelectorAll('.texto-lector p').forEach((p, i) => {
      partir(p.textContent).forEach(t => res.push({ texto: t, p: i }));
    });
    return res;
  }

  function guardarPos() { if (claveActual) guardar(claveActual, pos); }

  function elegirVoz() {
    const voces = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang));
    return voces.find(v => /es-(CO|MX|US|419)/i.test(v.lang)) || voces[0] || null;
  }

  function botonesVoz() {
    const b = document.getElementById('btn-leer');
    const s = document.getElementById('btn-parar');
    const r = document.getElementById('btn-reiniciar');
    if (b) b.textContent = !leyendo ? (pos > 0 ? '▶ Continuar' : '🔊 Escuchar') : (pausado ? '▶ Continuar' : '⏸ Pausar');
    if (s) s.hidden = !leyendo;
    if (r) r.hidden = !(pos > 0 || leyendo);
  }

  function irA(p, suave) {
    const ps = vista.querySelectorAll('.texto-lector p');
    if (ps[p]) ps[p].scrollIntoView({ block: 'center', behavior: suave ? 'smooth' : 'auto' });
  }

  function marcar(p) {
    vista.querySelectorAll('.texto-lector p').forEach((el, i) => el.classList.toggle('leyendo', i === p));
    if (p !== ultimoP) { irA(p, true); ultimoP = p; }
  }

  function hablar(n) {
    if (n >= chunks.length) {
      pos = 0; guardarPos();
      detenerVoz();
      return;
    }
    pos = n;
    guardarPos();
    marcar(chunks[n].p);
    const mi = ++sesion;
    const u = new SpeechSynthesisUtterance(chunks[n].texto);
    const voz = elegirVoz();
    u.lang = voz ? voz.lang : 'es-ES';
    if (voz) u.voice = voz;
    u.rate = velocidad;
    const siguiente = () => { if (mi === sesion && leyendo && !pausado) hablar(n + 1); };
    u.onend = siguiente;
    u.onerror = e => { if (e.error !== 'interrupted' && e.error !== 'canceled') siguiente(); };
    enCurso = u;
    speechSynthesis.speak(u);
    botonesVoz();
  }

  function detenerVoz() {
    sesion++;
    if (hayVoz) speechSynthesis.cancel();
    leyendo = false;
    pausado = false;
    ultimoP = -1;
    vista.querySelectorAll('.texto-lector p.leyendo').forEach(p => p.classList.remove('leyendo'));
    botonesVoz();
  }

  function alternarVoz() {
    if (!hayVoz || !chunks.length) return;
    if (!leyendo) {
      leyendo = true; pausado = false;
      hablar(pos);
    } else if (!pausado) {
      pausado = true;
      sesion++;
      speechSynthesis.cancel();
      botonesVoz();
    } else {
      pausado = false;
      hablar(pos);
    }
  }

  function reiniciarVoz() {
    if (!hayVoz || !chunks.length) return;
    detenerVoz();
    pos = 0;
    guardarPos();
    leyendo = true;
    hablar(0);
  }

  // ---------- Música de fondo ----------
  const audio = new Audio();
  audio.loop = true;
  let vol = parseFloat(leer('vol-musica'));
  if (isNaN(vol)) vol = 0.4;
  audio.volume = vol;
  let musicaOn = false;
  let musicaSrc = '';

  function botonMusica() {
    const b = document.getElementById('btn-musica');
    if (b) b.textContent = musicaOn ? '🎵 Música: sí' : '🎵 Música: no';
  }

  function ponerMusica(src) {
    if (!src) { audio.pause(); musicaSrc = ''; botonMusica(); return; }
    if (src !== musicaSrc) { musicaSrc = src; audio.src = src; }
    if (musicaOn) audio.play().catch(() => {});
    botonMusica();
  }

  function alternarMusica() {
    musicaOn = !musicaOn;
    if (musicaOn) audio.play().catch(() => {});
    else audio.pause();
    botonMusica();
  }

  function pararMusica() {
    audio.pause();
    musicaOn = false;
    musicaSrc = '';
  }

  // ---------- Búsqueda de soundtracks ----------
  // Parte: usa la "musica" que escribas en esa parte, o el archivo parte-XX/soundtrack.mp3
  //        si existe, o si no, el soundtrack del libro.
  // Libro: usa la "musica" del libro, o libros/<libro>/soundtrack.mp3 si existe.
  const cacheExiste = {};
  async function existe(url) {
    if (url in cacheExiste) return cacheExiste[url];
    let ok = false;
    try { ok = (await fetch(url, { method: 'HEAD' })).ok; } catch (e) {}
    cacheExiste[url] = ok;
    return ok;
  }

  async function musicaDeLibro(l) {
    if (l.musica) return `${carpLibro(l.id)}/${l.musica}`;
    const u = `${carpLibro(l.id)}/soundtrack.mp3`;
    return (await existe(u)) ? u : '';
  }

  async function musicaDeParte(l, i, p) {
    const base = carpParte(l.id, i);
    if (p.musica) return `${base}/${p.musica}`;
    const u = `${base}/soundtrack.mp3`;
    if (await existe(u)) return u;
    return musicaDeLibro(l);
  }

  function activarMusica(src, cont) {
    if (src && cont && !cont.querySelector('#btn-musica')) {
      cont.insertAdjacentHTML('beforeend',
        `<button class="btn" id="btn-musica" data-accion="musica">🎵 Música: no</button>
         <input type="range" data-accion="volumen" min="0" max="1" step="0.05" value="${vol}" aria-label="Volumen de la música">`);
    }
    ponerMusica(src);
  }

  // ---------- Vistas ----------
  function estrellas(id) {
    const n = parseInt(leer('estrellas-' + id), 10) || 0;
    let h = '<div class="estrellas" role="group" aria-label="Tu calificación">';
    for (let i = 1; i <= 5; i++) {
      h += `<button class="estrella ${i <= n ? 'on' : ''}" data-accion="votar" data-id="${id}" data-valor="${i}" aria-label="${i} estrellas">★</button>`;
    }
    h += `</div><div class="estrellas-nota">${n ? 'Tu calificación: ' + n + ' de 5' : 'Toca una estrella para calificar'}</div>`;
    return h;
  }

  function biblioteca() {
    tokenParte++;
    detenerVoz();
    pararMusica();
    const tarjetas = LIBROS.map(l => `
      <div class="libro" data-accion="abrir-libro" data-id="${l.id}" tabindex="0">
        <img src="${portadaDe(l)}" alt="${esc(l.titulo)}">
        <div class="libro-titulo">${esc(l.titulo)}</div>
      </div>`).join('');
    vista.innerHTML = `<div class="rejilla">${tarjetas}<div class="libro"><div class="portada sin-clic">Próximamente</div></div></div>`;
  }

  function libro(id) {
    const mi = ++tokenParte;
    detenerVoz();
    const l = buscar(id);
    if (!l) return biblioteca();
    const partes = (l.partes || []).map((p, i) => `
      <button class="parte" data-accion="abrir-parte" data-id="${id}" data-i="${i}">
        <span>${esc(p.titulo)}</span>
        <span class="leida">${leer('leida-' + id + '-' + i) ? '✓ Leída' : ''}</span>
      </button>`).join('');
    vista.innerHTML = `
      <button class="volver" data-accion="biblioteca">← Volver a la biblioteca</button>
      <div class="detalle">
        <img src="${portadaDe(l)}" alt="${esc(l.titulo)}">
        <div class="detalle-info">
          <h3>${esc(l.titulo)}</h3>
          <p>${esc(l.descripcion || '')}</p>
          <div id="caja-estrellas">${estrellas(id)}</div>
          <div class="controles" id="ctrl-musica" style="margin:16px 0 0"></div>
        </div>
      </div>
      <h3 class="subtitulo">Partes</h3>
      <div class="lista-partes">${partes}</div>`;
    arriba();
    musicaDeLibro(l).then(src => {
      if (mi === tokenParte) activarMusica(src, document.getElementById('ctrl-musica'));
    });
  }

  async function parte(id, i) {
    detenerVoz();
    const l = buscar(id);
    const p = l && l.partes && l.partes[i];
    if (!p) return libro(id);
    const mi = ++tokenParte;
    guardar('leida-' + id + '-' + i, '1');

    const base = carpParte(id, i);
    const hayAnt = i > 0;
    const haySig = i < l.partes.length - 1;
    const opcionesVel = [['0.85', 'Lenta'], ['1', 'Normal'], ['1.2', 'Rápida']]
      .map(([v, t]) => `<option value="${v}" ${parseFloat(v) === velocidad ? 'selected' : ''}>${t}</option>`).join('');
    const controlVoz = hayVoz
      ? `<button class="btn" id="btn-leer" data-accion="leer">🔊 Escuchar</button>
         <button class="btn" id="btn-parar" data-accion="parar-voz" hidden>⏹ Detener</button>
         <button class="btn" id="btn-reiniciar" data-accion="reiniciar-voz" hidden>↺ Desde el inicio</button>
         <select class="sel" data-accion="velocidad" aria-label="Velocidad de la voz">${opcionesVel}</select>`
      : `<span class="aviso-voz">Tu navegador no permite lectura en voz alta.</span>`;
    vista.innerHTML = `
      <div class="barra-lector">
        <button class="volver" data-accion="abrir-libro" data-id="${id}">← ${esc(l.titulo)}</button>
        <div class="tamano">
          <button class="btn" data-accion="tam" data-d="-1" aria-label="Letra más pequeña">A−</button>
          <button class="btn" data-accion="tam" data-d="1" aria-label="Letra más grande">A+</button>
        </div>
      </div>
      <img class="caratula-parte" src="${base}/${p.caratula || 'caratula.png'}" alt="Carátula de ${esc(p.titulo)}" onerror="this.remove()">
      <h3 class="titulo-parte">${esc(p.titulo)}</h3>
      <div class="controles" id="ctrl-musica">${controlVoz}</div>
      <div class="texto-lector" style="font-size:${tam}px"><p class="aviso-voz">Cargando capítulo…</p></div>
      <div class="nav-partes">
        <button class="btn" data-accion="abrir-parte" data-id="${id}" data-i="${i - 1}" ${hayAnt ? '' : 'disabled'}>← Anterior</button>
        <button class="btn" data-accion="abrir-libro" data-id="${id}">Partes</button>
        <button class="btn" data-accion="abrir-parte" data-id="${id}" data-i="${i + 1}" ${haySig ? '' : 'disabled'}>Siguiente →</button>
      </div>`;
    arriba();
    musicaDeParte(l, i, p).then(src => {
      if (mi === tokenParte) activarMusica(src, document.getElementById('ctrl-musica'));
    });

    // Carga el texto del capítulo desde su archivo
    let texto = '';
    try {
      const r = await fetch(`${base}/${p.texto || 'texto.txt'}`);
      if (!r.ok) throw new Error('no encontrado');
      texto = (await r.text()).replace(/^﻿/, '');
    } catch (e) { texto = ''; }
    if (mi !== tokenParte) return; // el lector ya cambió de pantalla

    const caja = vista.querySelector('.texto-lector');
    if (!caja) return;
    // Cada salto de línea es un párrafo nuevo
    const parrafos = texto.trim().split(/\n+/).filter(t => t.trim()).map(t => `<p>${esc(t.trim())}</p>`).join('');
    caja.innerHTML = parrafos || '<p class="aviso-voz">No se pudo cargar este capítulo.</p>';

    // Recupera dónde se quedó la lectura de esta parte
    claveActual = 'pos-' + id + '-' + i;
    chunks = parrafos ? construirChunks() : [];
    pos = parseInt(leer(claveActual), 10) || 0;
    if (pos >= chunks.length) pos = 0;
    botonesVoz();
    if (pos > 0 && chunks[pos]) setTimeout(() => irA(chunks[pos].p, false), 60);
  }

  // ---------- Eventos ----------
  vista.addEventListener('click', e => {
    const el = e.target.closest('[data-accion]');
    if (!el) return;
    const { accion, id } = el.dataset;
    if (accion === 'biblioteca') biblioteca();
    else if (accion === 'abrir-libro') libro(id);
    else if (accion === 'abrir-parte') parte(id, parseInt(el.dataset.i, 10));
    else if (accion === 'votar') {
      guardar('estrellas-' + id, el.dataset.valor);
      const caja = document.getElementById('caja-estrellas');
      if (caja) caja.innerHTML = estrellas(id);
    } else if (accion === 'tam') {
      tam = Math.min(30, Math.max(15, tam + parseInt(el.dataset.d, 10)));
      guardar('tam-letra', tam);
      const t = vista.querySelector('.texto-lector');
      if (t) t.style.fontSize = tam + 'px';
    } else if (accion === 'leer') alternarVoz();
    else if (accion === 'parar-voz') detenerVoz();
    else if (accion === 'reiniciar-voz') reiniciarVoz();
    else if (accion === 'musica') alternarMusica();
  });

  vista.addEventListener('input', e => {
    const a = e.target.dataset.accion;
    if (a === 'velocidad') {
      velocidad = parseFloat(e.target.value);
      guardar('vel-voz', velocidad);
      if (leyendo && !pausado) { sesion++; speechSynthesis.cancel(); hablar(pos); }
    } else if (a === 'volumen') {
      vol = parseFloat(e.target.value);
      audio.volume = vol;
      guardar('vol-musica', vol);
    }
  });

  vista.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.classList.contains('libro')) e.target.click();
  });

  // Si el lector cambia de sección del menú, se detienen voz y música
  document.querySelectorAll('nav button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.seccion !== 'libros') { detenerVoz(); audio.pause(); musicaOn = false; botonMusica(); }
    });
  });

  // ---------- Arranque: carga la lista de libros ----------
  async function cargarBiblioteca() {
    vista.innerHTML = '<p class="aviso-voz">Cargando biblioteca…</p>';
    try {
      const rl = await fetch('libros/lista.json');
      if (!rl.ok) throw new Error('lista');
      const ids = await rl.json();
      const libros = await Promise.all(ids.map(async id => {
        try {
          const r = await fetch(`libros/${id}/libro.json`);
          if (!r.ok) return null;
          const d = await r.json();
          d.id = id;
          return d;
        } catch (e) { return null; }
      }));
      LIBROS = libros.filter(Boolean);
      biblioteca();
    } catch (e) {
      vista.innerHTML = '<div class="tarjeta"><p>No se pudo cargar la biblioteca. Si abriste index.html con doble clic, ábrelo con Live Server o desde la página publicada en GitHub.</p></div>';
    }
  }

  cargarBiblioteca();
})();
