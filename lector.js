// Lógica de la biblioteca, el buscador y el lector. No necesitas tocar este archivo.
// Lee los libros desde la carpeta "libros" (ver libros/lista.json).
(function () {
  const vista = document.getElementById('vista-libros');
  if (!vista) return;

  const T = (k, v) => (window.Idioma ? Idioma.t(k, v) : k);
  const lang = () => (window.Idioma ? Idioma.get() : 'es');

  let LIBROS = [];
  let actual = { v: 'biblioteca' }; // pantalla en la que está el lector

  // ---------- Utilidades ----------
  const leer = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const arriba = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const buscar = id => LIBROS.find(l => l.id === id);
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const recorta = s => (s.length > 110 ? s.slice(0, 107) + '…' : s);
  const ico = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  let seguir = leer('seguir') !== '0';   // seguir la lectura con la pantalla (bajada automática)
  let noSeguirHasta = 0;                 // si el lector mueve la pantalla, se pausa unos segundos

  // ---------- Textos en el idioma elegido ----------
  // libro.json puede traer un bloque "en": { titulo, descripcion, partes: ["Part 1: ...", ...] }
  const loc = l => {
    const e = (lang() === 'en' && l.en) ? l.en : {};
    return { titulo: e.titulo || l.titulo, descripcion: e.descripcion || l.descripcion || '' };
  };
  const tituloParte = (l, i) => {
    const e = lang() === 'en' && l.en && l.en.partes && l.en.partes[i];
    return e || l.partes[i].titulo;
  };

  // ---------- Rutas (todo lo de un libro vive en su carpeta) ----------
  //  libros/<libro>/portada.png
  //  libros/<libro>/libro.json
  //  libros/<libro>/parte-01/texto.txt (español)  texto.en.txt (inglés)  caratula.png
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
  let chunks = [];        // fragmentos de voz
  let claveActual = '';
  let lineas = [];        // líneas del capítulo en pantalla: { texto, pers }
  let vocesPers = {};     // voces de los personajes (libro.json)
  let idiomaVoz = 'es';   // idioma del texto que se está leyendo
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

  // ---------- Voces por personaje ----------
  // En el texto, una línea puede empezar con [Nombre]. Esa etiqueta no se muestra:
  // solo sirve para que los diálogos (con guion — o entre comillas) suenen con la voz de ese personaje.
  // Todo lo demás lo lee el narrador. Las voces se definen en libro.json, en "voces".
  const RE_TAG = /^\[([^\]\n]{1,30})\]\s*/;
  const tieneTexto = s => /[\p{L}\p{N}]/u.test(s);

  function segmentos(texto, pers) {
    const out = [];
    const t = texto.trim();
    if (t.startsWith('—')) {
      // Alterna: diálogo, aclaración del narrador, diálogo...
      t.split('—').forEach((s, i) => {
        if (i > 0 && tieneTexto(s)) out.push({ texto: s.trim(), pers: (i % 2 === 1) ? pers : 'narrador' });
      });
    } else if (pers !== 'narrador') {
      // Línea etiquetada sin guion: lo que va entre comillas es del personaje
      const re = /"([^"]+)"|“([^”]+)”|«([^»]+)»/g;
      let ult = 0, m;
      while ((m = re.exec(t))) {
        const antes = t.slice(ult, m.index);
        if (tieneTexto(antes)) out.push({ texto: antes.trim(), pers: 'narrador' });
        out.push({ texto: (m[1] || m[2] || m[3]).trim(), pers });
        ult = m.index + m[0].length;
      }
      const resto = t.slice(ult);
      if (tieneTexto(resto)) out.push({ texto: resto.trim(), pers: 'narrador' });
    } else if (tieneTexto(t)) {
      out.push({ texto: t, pers: 'narrador' });
    }
    return out;
  }

  function construirChunks() {
    const res = [];
    lineas.forEach((ln, p) => {
      const segs = segmentos(ln.texto, ln.pers);
      segs.forEach((sg, si) => {
        const letras = sg.texto.replace(/[^\p{L}]/gu, '');
        const grito = letras.length >= 3 && letras === letras.toUpperCase();
        const trozos = partir(sg.texto);
        trozos.forEach((t, ci) => {
          const u = t.trim();
          let pausa = 80;
          if (/[.]["”»')\]]*$/.test(u)) pausa = 280;
          if (/[?!]["”»')\]]*$/.test(u)) pausa = 260;
          if (/(\.\.\.|…)["”»')\]]*$/.test(u)) pausa = 520;
          const ultimaParte = ci === trozos.length - 1;
          if (ultimaParte && si < segs.length - 1) pausa = Math.max(pausa, 200);
          if (ultimaParte && si === segs.length - 1) pausa = Math.max(pausa, 550);
          res.push({ texto: t, p, pers: sg.pers, grito, excl: /[!¡]/.test(t), pausa });
        });
      });
    });
    const cuenta = {};
    res.forEach(x => { cuenta[x.p] = (cuenta[x.p] === undefined ? 0 : cuenta[x.p] + 1); x.k = cuenta[x.p]; });
    res.forEach(x => { x.n = cuenta[x.p] + 1; });
    return res;
  }

  // Género de las voces del dispositivo (se deduce por el nombre; si no se sabe, queda vacío)
  const NOM_MUJER = /helena|sabina|laura|paulina|m[oó]nica|dalia|elvira|salom[eé]|paloma|lupe|marisol|esperanza|jimena|camila|ang[eé]lica|soledad|samantha|victoria|karen|moira|tessa|fiona|zira|hazel|susan|aria|jenny|libby|sonia|emma|olivia|female|mujer|femenin/i;
  const NOM_HOMBRE = /pablo|ra[uú]l|jorge|juan|diego|[aá]lvaro|gonzalo|alonso|tom[aá]s|carlos|enrique|miguel|andr[eé]s|pedro|daniel|\balex\b|\bfred\b|david|\bmark\b|george|\bguy\b|ryan|james|thomas|arthur|oliver|\bmale\b|hombre|masculin/i;
  const generoDe = v => NOM_MUJER.test(v.name) ? 'mujer' : (NOM_HOMBRE.test(v.name) ? 'hombre' : '');

  let cacheVoces = [];
  const refrescarVoces = () => { if (hayVoz) cacheVoces = speechSynthesis.getVoices(); };
  if (hayVoz) { refrescarVoces(); speechSynthesis.addEventListener('voiceschanged', refrescarVoces); }

  function elegirVoz(genero) {
    if (!cacheVoces.length) refrescarVoces();
    const enIng = idiomaVoz === 'en';
    const esDelIdioma = v => (enIng ? /^en/i : /^es/i).test(v.lang);
    // Las voces locales respetan tono y velocidad; las de red (Google, "Online/Natural") suelen ignorarlos,
    // y entonces todos los personajes suenan igual. Por eso se prefieren las locales.
    const enRed = v => v.localService === false || /online|natural|google/i.test(v.name);
    const pref = v => (enRed(v) ? 2 : 0) + ((enIng ? /en-US/i : /es-(CO|MX|US|419)/i).test(v.lang) ? 0 : 1);
    const todas = cacheVoces.filter(esDelIdioma).sort((a, b) => pref(a) - pref(b));
    const conocidas = todas.filter(generoDe);
    const desconocidas = todas.filter(v => !generoDe(v));
    const igual = conocidas.find(v => generoDe(v) === genero);
    if (igual) return { voz: igual, ajuste: 1 };
    if (desconocidas.length) {
      if (genero === 'hombre' && desconocidas.length > 1) return { voz: desconocidas[1], ajuste: 1 };
      return { voz: desconocidas[0], ajuste: genero === 'hombre' ? 0.72 : 1 };
    }
    const otra = conocidas[0] || null;
    return { voz: otra, ajuste: otra ? (genero === 'hombre' ? 0.72 : 1.3) : 1 };
  }

  function configVoz(pers) {
    const n = vocesPers.narrador || {};
    const c = vocesPers[String(pers).toLowerCase()] || n;
    return {
      genero: c.genero || n.genero || 'mujer',
      tono: c.tono != null ? c.tono : 1,
      velocidad: c.velocidad != null ? c.velocidad : 1
    };
  }

  function guardarPos() { if (claveActual) guardar(claveActual, pos); }

  function botonesVoz() {
    const b = document.getElementById('btn-leer');
    const s = document.getElementById('btn-parar');
    const r = document.getElementById('btn-reiniciar');
    if (b) {
      const sonando = leyendo && !pausado;
      const txt = T(!leyendo ? (pos > 0 ? 'resume' : 'listen') : (pausado ? 'resume' : 'pause'));
      b.innerHTML = ico(sonando ? 'pause' : 'play');
      b.title = txt;
      b.setAttribute('aria-label', txt);
      b.classList.toggle('sonando', sonando);
    }
    if (s) s.hidden = !leyendo;
    if (r) r.hidden = !(pos > 0 || leyendo);
  }

  function irA(p, suave) {
    const ps = vista.querySelectorAll('.texto-lector p');
    if (ps[p]) ps[p].scrollIntoView({ block: 'center', behavior: suave ? 'smooth' : 'auto' });
  }

  // Resalta el párrafo que se está leyendo y baja la pantalla solo para seguirlo
  function marcar(n) {
    const c = chunks[n];
    if (!c) return;
    vista.querySelectorAll('.texto-lector p').forEach((el, i) => el.classList.toggle('leyendo', i === c.p));
    const cambio = c.p !== ultimoP;
    ultimoP = c.p;
    seguirLectura(c, cambio);
  }

  function seguirLectura(c, cambio) {
    if (!seguir || Date.now() < noSeguirHasta) return;
    const el = vista.querySelectorAll('.texto-lector p')[c.p];
    if (!el) return;
    const rep = document.getElementById('reproductor');
    const tope = (rep ? rep.getBoundingClientRect().bottom : 0) + 12;   // lo que tapan el menú y el reproductor
    const alto = window.innerHeight - tope - 24;
    const r = el.getBoundingClientRect();
    const largo = r.height > alto * 0.8;                                // párrafo más alto que la pantalla
    if (!cambio && !largo) return;
    const frac = largo ? c.k / Math.max(1, c.n - 1) : 0;
    const deseado = largo ? tope + 8 - frac * (r.height - alto * 0.55) : tope + alto * 0.12;
    const delta = r.top - deseado;
    if (Math.abs(delta) > 6) window.scrollBy({ top: delta, behavior: 'smooth' });
  }

  // Si el lector mueve la pantalla con el dedo, el mouse o el teclado, la bajada automática espera unos segundos
  ['wheel', 'touchmove', 'keydown'].forEach(ev => {
    window.addEventListener(ev, e => {
      if (ev === 'keydown' && !/^(Arrow|Page|Home|End| )/.test(e.key)) return;
      if (e.target && e.target.closest && e.target.closest('.reproductor')) return;
      noSeguirHasta = Date.now() + 5000;
    }, { passive: true });
  });

  function hablar(n) {
    if (n >= chunks.length) {
      pos = 0; guardarPos();
      detenerVoz();
      return;
    }
    pos = n;
    guardarPos();
    marcar(n);
    const mi = ++sesion;
    const c = chunks[n];
    const cfg = configVoz(c.pers);
    const { voz, ajuste } = elegirVoz(cfg.genero);
    const u = new SpeechSynthesisUtterance(c.texto);
    u.lang = voz ? voz.lang : (idiomaVoz === 'en' ? 'en-US' : 'es-ES');
    if (voz) u.voice = voz;
    u.pitch = Math.min(2, Math.max(0.1, cfg.tono * ajuste * (c.grito ? 1.15 : (c.excl ? 1.06 : 1))));
    u.rate = Math.min(2, Math.max(0.5, velocidad * cfg.velocidad * (c.grito ? 1.12 : 1)));
    const siguiente = () => {
      if (mi !== sesion || !leyendo || pausado) return;
      pos = n + 1; guardarPos();
      setTimeout(() => { if (mi === sesion && leyendo && !pausado) hablar(n + 1); }, c.pausa);
    };
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
    if (!b) return;
    b.innerHTML = ico('music') + `<span class="t">${esc(T(musicaOn ? 'music_on' : 'music_off'))}</span>`;
    b.classList.toggle('on', musicaOn);
    b.setAttribute('aria-pressed', String(musicaOn));
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
      cont.insertAdjacentHTML('beforeend', '<button class="rb rb-toggle" id="btn-musica" data-accion="musica"></button>');
      const slider = `<input type="range" data-accion="volumen" min="0" max="1" step="0.05" value="${vol}" aria-label="${esc(T('vol_aria'))}">`;
      const gv = document.getElementById('grupo-vol');
      if (gv) { gv.hidden = false; gv.querySelector('.ctl').innerHTML = slider; }
      else cont.insertAdjacentHTML('beforeend', slider);
    }
    ponerMusica(src);
  }

  // ---------- Vistas ----------
  function estrellas(id) {
    const n = parseInt(leer('estrellas-' + id), 10) || 0;
    let h = `<div class="estrellas" role="group" aria-label="${esc(T('rate_aria'))}">`;
    for (let i = 1; i <= 5; i++) {
      h += `<button class="estrella ${i <= n ? 'on' : ''}" data-accion="votar" data-id="${id}" data-valor="${i}" aria-label="${esc(T('stars_aria', { n: i }))}">★</button>`;
    }
    h += `</div><div class="estrellas-nota">${esc(n ? T('rate_yours', { n }) : T('rate_hint'))}</div>`;
    return h;
  }

  function biblioteca() {
    actual = { v: 'biblioteca' };
    tokenParte++;
    detenerVoz();
    pararMusica();
    const tarjetas = LIBROS.map(l => `
      <div class="libro" data-accion="abrir-libro" data-id="${l.id}" tabindex="0">
        <img src="${portadaDe(l)}" alt="${esc(loc(l).titulo)}">
        <div class="libro-titulo">${esc(loc(l).titulo)}</div>
      </div>`).join('');
    vista.innerHTML = `<div class="rejilla">${tarjetas}<div class="libro"><div class="portada sin-clic">${esc(T('soon'))}</div></div></div>`;
  }

  function libro(id, quieto) {
    actual = { v: 'libro', id };
    const mi = ++tokenParte;
    detenerVoz();
    const l = buscar(id);
    if (!l) return biblioteca();
    const L = loc(l);
    const partes = (l.partes || []).map((p, i) => `
      <button class="parte" data-accion="abrir-parte" data-id="${id}" data-i="${i}">
        <span>${esc(tituloParte(l, i))}</span>
        <span class="leida">${leer('leida-' + id + '-' + i) ? esc(T('read_mark')) : ''}</span>
      </button>`).join('');
    vista.innerHTML = `
      <button class="volver" data-accion="biblioteca">${esc(T('back_lib'))}</button>
      <div class="detalle">
        <img src="${portadaDe(l)}" alt="${esc(L.titulo)}">
        <div class="detalle-info">
          <h3>${esc(L.titulo)}</h3>
          <p>${esc(L.descripcion)}</p>
          <div id="caja-estrellas">${estrellas(id)}</div>
          <div class="controles" id="ctrl-musica" style="margin:16px 0 0"></div>
        </div>
      </div>
      <h3 class="subtitulo">${esc(T('parts'))}</h3>
      <div class="lista-partes">${partes}</div>`;
    if (!quieto) arriba();
    musicaDeLibro(l).then(src => {
      if (mi === tokenParte) activarMusica(src, document.getElementById('ctrl-musica'));
    });
  }

  async function parte(id, i, quieto) {
    detenerVoz();
    const l = buscar(id);
    const p = l && l.partes && l.partes[i];
    if (!p) return libro(id);
    actual = { v: 'parte', id, i };
    const mi = ++tokenParte;
    guardar('leida-' + id + '-' + i, '1');

    const base = carpParte(id, i);
    const L = loc(l);
    const hayAnt = i > 0;
    const haySig = i < l.partes.length - 1;
    const chipsVel = [['0.85', 'slow'], ['1', 'normal'], ['1.2', 'fast']]
      .map(([v, k]) => `<button class="chip ${parseFloat(v) === velocidad ? 'on' : ''}" data-accion="vel" data-v="${v}">${esc(T(k))}</button>`).join('');
    const controlVoz = hayVoz
      ? `<button class="rb rb-play" id="btn-leer" data-accion="leer" title="${esc(T('listen'))}" aria-label="${esc(T('listen'))}">${ico('play')}</button>
         <button class="rb" id="btn-parar" data-accion="parar-voz" hidden title="${esc(T('stop'))}" aria-label="${esc(T('stop'))}">${ico('stop')}<span class="t">${esc(T('stop'))}</span></button>
         <button class="rb" id="btn-reiniciar" data-accion="reiniciar-voz" hidden title="${esc(T('restart'))}" aria-label="${esc(T('restart'))}">${ico('restart')}<span class="t">${esc(T('restart'))}</span></button>`
      : `<span class="aviso-voz">${esc(T('no_voice'))}</span>`;
    vista.innerHTML = `
      <div class="barra-lector">
        <button class="volver" data-accion="abrir-libro" data-id="${id}">← ${esc(L.titulo)}</button>
      </div>
      <img class="caratula-parte" src="${base}/${p.caratula || 'caratula.png'}" alt="${esc(T('cover_alt', { t: tituloParte(l, i) }))}" onerror="this.remove()">
      <h3 class="titulo-parte">${esc(tituloParte(l, i))}</h3>
      <div class="reproductor" id="reproductor">
        <div class="rep-fila">
          ${controlVoz}
          <span class="rep-sep"></span>
          <button class="rb rb-toggle ${seguir ? 'on' : ''}" id="btn-seguir" data-accion="seguir" aria-pressed="${seguir}" title="${esc(T('follow'))}" aria-label="${esc(T('follow'))}">${ico('down')}<span class="t">${esc(T('follow'))}</span></button>
          <span class="rep-musica" id="ctrl-musica"></span>
          <button class="rb rb-ajustes" data-accion="ajustes" aria-expanded="false" title="${esc(T('settings'))}" aria-label="${esc(T('settings'))}">${ico('gear')}<span class="t">${esc(T('settings'))}</span></button>
        </div>
        <div class="rep-ajustes" id="rep-ajustes" hidden>
          <div class="grupo"><span class="lbl">${esc(T('speed_lbl'))}</span><div class="chips">${chipsVel}</div></div>
          <div class="grupo" id="grupo-vol" hidden><span class="lbl">${esc(T('volume_lbl'))}</span><span class="ctl"></span></div>
          <div class="grupo"><span class="lbl">${esc(T('size_lbl'))}</span>
            <div class="chips">
              <button class="chip" data-accion="tam" data-d="-1" aria-label="${esc(T('size_down'))}">A−</button>
              <button class="chip" data-accion="tam" data-d="1" aria-label="${esc(T('size_up'))}">A+</button>
            </div>
          </div>
        </div>
      </div>
      <div class="aviso-voz" id="aviso-idioma" style="text-align:center;margin-bottom:12px"></div>
      <div class="texto-lector" style="font-size:${tam}px"><p class="aviso-voz">${esc(T('ch_loading'))}</p></div>
      <div class="nav-partes">
        <button class="btn" data-accion="abrir-parte" data-id="${id}" data-i="${i - 1}" ${hayAnt ? '' : 'disabled'}>${esc(T('prev'))}</button>
        <button class="btn" data-accion="abrir-libro" data-id="${id}">${esc(T('parts'))}</button>
        <button class="btn" data-accion="abrir-parte" data-id="${id}" data-i="${i + 1}" ${haySig ? '' : 'disabled'}>${esc(T('next'))}</button>
      </div>`;
    if (!quieto) arriba();
    musicaDeParte(l, i, p).then(src => {
      if (mi === tokenParte) activarMusica(src, document.getElementById('ctrl-musica'));
    });

    // Carga el texto del capítulo desde su archivo (en inglés si existe texto.en.txt)
    let texto = '';
    let usoEn = false;
    async function traer(nombre) {
      try {
        const r = await fetch(`${base}/${nombre}`);
        if (!r.ok) return '';
        return (await r.text()).replace(/^﻿/, '');
      } catch (e) { return ''; }
    }
    if (lang() === 'en') {
      texto = await traer(p.textoEn || 'texto.en.txt');
      usoEn = !!texto.trim();
    }
    if (!usoEn) texto = await traer(p.texto || 'texto.txt');
    if (mi !== tokenParte) return; // el lector ya cambió de pantalla

    const caja = vista.querySelector('.texto-lector');
    if (!caja) return;
    idiomaVoz = usoEn ? 'en' : 'es';
    const aviso = document.getElementById('aviso-idioma');
    if (aviso) aviso.textContent = (lang() === 'en' && !usoEn && texto.trim()) ? T('ch_no_lang') : '';
    // Diagnóstico: abre la página con ?voces al final de la dirección para ver qué voces usa el dispositivo
    if (aviso && /[?&]voces\b/.test(location.search)) {
      const d = g => { const x = elegirVoz(g); return x.voz ? `${x.voz.name} (${x.voz.localService ? 'local' : 'red'})` : 'ninguna'; };
      aviso.textContent = `[${idiomaVoz}] mujer: ${d('mujer')} · hombre: ${d('hombre')}`;
    }

    // Cada salto de línea es un párrafo nuevo; [Nombre] al inicio indica quién habla (no se muestra)
    vocesPers = {};
    Object.keys(l.voces || {}).forEach(k => { vocesPers[k.toLowerCase()] = l.voces[k]; });
    lineas = texto.trim().split(/\n+/).filter(t => t.trim()).map(t => {
      const x = t.trim();
      const m = x.match(RE_TAG);
      return m ? { pers: m[1].trim(), texto: x.slice(m[0].length) } : { pers: 'narrador', texto: x };
    });
    const parrafos = lineas.map(ln => `<p>${esc(ln.texto)}</p>`).join('');
    caja.innerHTML = parrafos || `<p class="aviso-voz">${esc(T('ch_error'))}</p>`;

    // Recupera dónde se quedó la lectura de esta parte (cada idioma guarda la suya)
    claveActual = 'pos-' + id + '-' + i + (usoEn ? '-en' : '');
    chunks = lineas.length ? construirChunks() : [];
    pos = parseInt(leer(claveActual), 10) || 0;
    if (pos >= chunks.length) pos = 0;
    botonesVoz();
    if (!quieto && pos > 0 && chunks[pos]) setTimeout(() => irA(chunks[pos].p, false), 60);
  }

  // ---------- Buscador de la página de inicio ----------
  const inputBusca = document.getElementById('buscador');
  const salidaBusca = document.getElementById('resultados-busqueda');

  function buscarLibros(q) {
    const palabras = norm(q).trim().split(/\s+/).filter(Boolean);
    if (!palabras.length) return [];
    return LIBROS.filter(l => {
      const L = loc(l);
      const heno = [l.titulo, l.en && l.en.titulo, L.titulo, L.descripcion, l.descripcion]
        .concat((l.partes || []).map((p, i) => tituloParte(l, i))).map(norm).join(' ');
      return palabras.every(w => heno.includes(w));
    });
  }

  function renderBusqueda() {
    if (!inputBusca || !salidaBusca) return;
    const q = inputBusca.value.trim();
    if (!q) { salidaBusca.innerHTML = ''; return; }
    const r = buscarLibros(q);
    salidaBusca.innerHTML = r.length
      ? r.map(l => `
        <button class="resultado" data-abrir="${l.id}">
          <img src="${portadaDe(l)}" alt="">
          <span><strong>${esc(loc(l).titulo)}</strong><small>${esc(recorta(loc(l).descripcion))}</small></span>
        </button>`).join('')
      : `<p class="aviso-voz">${esc(T('search_none'))}</p>`;
  }

  // Historias destacadas del inicio
  const cajaDest = document.getElementById('destacados');
  function renderDestacados() {
    if (!cajaDest) return;
    const tarjetas = LIBROS.slice(0, 4).map(l => `
      <button class="dest" data-abrir="${l.id}">
        <img src="${portadaDe(l)}" alt="${esc(loc(l).titulo)}">
        <span class="dest-t">${esc(loc(l).titulo)}</span>
      </button>`).join('');
    const hueco = LIBROS.length < 4 ? `<div class="dest dest-pronto"><span>${esc(T('soon'))}</span></div>` : '';
    cajaDest.innerHTML = tarjetas + hueco;
  }
  if (cajaDest) cajaDest.addEventListener('click', e => {
    const b = e.target.closest('[data-abrir]');
    if (!b) return;
    irASeccion('libros');
    libro(b.dataset.abrir);
  });

  function irASeccion(nombre) {
    const b = document.querySelector(`nav button[data-seccion="${nombre}"]`);
    if (b) b.click();
  }

  if (inputBusca) {
    inputBusca.addEventListener('input', () => { salidaBusca.hidden = false; renderBusqueda(); });
    inputBusca.addEventListener('focus', () => { salidaBusca.hidden = false; });
    inputBusca.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const r = buscarLibros(inputBusca.value);
      if (r.length) { irASeccion('libros'); libro(r[0].id); cerrarBusqueda(); }
    });
  }
  if (salidaBusca) {
    salidaBusca.addEventListener('click', e => {
      const b = e.target.closest('[data-abrir]');
      if (!b) return;
      irASeccion('libros');
      libro(b.dataset.abrir);
      cerrarBusqueda();
    });
  }
  function cerrarBusqueda() {
    if (inputBusca) inputBusca.value = '';
    renderBusqueda();
  }
  document.addEventListener('click', e => {
    if (salidaBusca && !e.target.closest('.buscar')) salidaBusca.hidden = true;
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-ir]');
    if (!b) return;
    irASeccion(b.dataset.ir);
    if (b.dataset.ir === 'libros' && LIBROS.length) biblioteca();
  });

  // ---------- Eventos del lector ----------
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
    } else if (accion === 'seguir') {
      seguir = !seguir;
      guardar('seguir', seguir ? '1' : '0');
      noSeguirHasta = 0;
      el.classList.toggle('on', seguir);
      el.setAttribute('aria-pressed', String(seguir));
      if (seguir && leyendo && chunks[pos]) seguirLectura(chunks[pos], true);
    } else if (accion === 'ajustes') {
      const a = document.getElementById('rep-ajustes');
      if (a) { a.hidden = !a.hidden; el.setAttribute('aria-expanded', String(!a.hidden)); el.classList.toggle('on', !a.hidden); }
    } else if (accion === 'vel') {
      velocidad = parseFloat(el.dataset.v);
      guardar('vel-voz', velocidad);
      el.parentElement.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === el));
      if (leyendo && !pausado) { sesion++; speechSynthesis.cancel(); hablar(pos); }
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

  // Al cambiar el idioma se vuelve a dibujar la pantalla actual
  window.addEventListener('idioma', () => {
    detenerVoz();
    if (LIBROS.length) {
      if (actual.v === 'parte') parte(actual.id, actual.i, true);
      else if (actual.v === 'libro') libro(actual.id, true);
      else biblioteca();
    } else {
      vista.innerHTML = '';
    }
    renderBusqueda();
    renderDestacados();
  });

  // ---------- Arranque: carga la lista de libros ----------
  async function cargarBiblioteca() {
    vista.innerHTML = `<p class="aviso-voz">${esc(T('lib_loading'))}</p>`;
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
      renderBusqueda();
      renderDestacados();
    } catch (e) {
      vista.innerHTML = `<div class="tarjeta"><p>${esc(T('lib_error'))}</p></div>`;
    }
  }

  cargarBiblioteca();
})();
