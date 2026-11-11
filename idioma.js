// Idiomas de la página (español / inglés). No necesitas tocar este archivo,
// salvo para cambiar algún texto de la página.
(function () {
  const D = {
    es: {
      nav_inicio: 'Inicio', nav_noticias: 'Noticias', nav_galeria: 'Galería', nav_libros: 'Libros',
      hero_lema: 'Lee. Descubre. Comparte.',
      hero_text: 'Historias de fantasía, ciencia ficción y terror para leer parte por parte, escuchar en voz alta con música y compartir con quien quieras. Gratis y sin registro.',
      search_ph: 'Busca tu libro...',
      search_none: 'No encontramos libros con esa búsqueda.',
      see_all: 'Ver todos los libros',
      act1_t: 'Ver todos los libros', act1_d: 'Explora la biblioteca completa y encuentra tu próxima lectura.',
      act2_t: 'Leer por partes', act2_d: 'Lee cada historia parte por parte, a tu ritmo y en el orden que quieras.',
      act3_t: 'Conoce al autor', act3_d: 'Descubre a la persona detrás de las historias.',
      featured: 'Historias destacadas', more: 'Ver más', latest: 'Últimas noticias',
      about_title: 'Sobre el autor',
      about_bio: 'Juan David Rokrack, un joven colombiano de 18 años, en busca de crecer, escribir y crear más cada día, espera el momento perfecto para hacer de este sueño una realidad.',
      written_title: 'Lo que he escrito',
      written_text: 'Desde el año 2017 empezó con historias simples, que ahora ha transformado, siendo la primera de ellas "Linterna Roja".',
      news_title: 'Noticias',
      news_empty: 'Aún no hay noticias. Pronto habrá novedades.',
      gallery_title: 'Galería',
      cover_n: 'Portada {n}',
      books_title: 'Libros',
      footer: '© 2026 Onyx Studio · Todos los derechos reservados',
      lang_aria: 'Idioma',
      // Lector
      lib_loading: 'Cargando biblioteca…',
      lib_error: 'No se pudo cargar la biblioteca. Si abriste index.html con doble clic, ábrelo con Live Server o desde la página publicada en GitHub.',
      soon: 'Próximamente',
      back_lib: '← Volver a la biblioteca',
      parts: 'Partes',
      read_mark: '✓ Leída',
      rate_hint: 'Toca una estrella para calificar',
      rate_yours: 'Tu calificación: {n} de 5',
      rate_aria: 'Tu calificación',
      stars_aria: '{n} estrellas',
      cover_alt: 'Carátula de {t}',
      ch_loading: 'Cargando capítulo…',
      ch_error: 'No se pudo cargar este capítulo.',
      ch_no_lang: 'Este capítulo aún no está disponible en español; se muestra en el otro idioma.',
      listen: 'Escuchar', pause: 'Pausar', resume: 'Continuar', stop: 'Detener', restart: 'Desde el inicio',
      follow: 'Seguir lectura', settings: 'Ajustes',
      speed_lbl: 'Velocidad', volume_lbl: 'Volumen música', size_lbl: 'Tamaño de letra',
      slow: 'Lenta', normal: 'Normal', fast: 'Rápida',
      no_voice: 'Tu navegador no permite lectura en voz alta.',
      music_on: 'Música: sí', music_off: 'Música: no', vol_aria: 'Volumen de la música',
      size_down: 'Letra más pequeña', size_up: 'Letra más grande',
      prev: '← Anterior', next: 'Siguiente →'
    },
    en: {
      nav_inicio: 'Home', nav_noticias: 'News', nav_galeria: 'Gallery', nav_libros: 'Books',
      hero_lema: 'Read. Discover. Share.',
      hero_text: 'Fantasy, science fiction and horror stories to read part by part, listen to read aloud with music, and share with anyone. Free, no sign-up.',
      search_ph: 'Search your book...',
      search_none: 'We couldn\'t find any books for that search.',
      see_all: 'See all books',
      act1_t: 'See all books', act1_d: 'Explore the full library and find your next read.',
      act2_t: 'Read by parts', act2_d: 'Read each story part by part, at your own pace and in any order.',
      act3_t: 'Meet the author', act3_d: 'Discover the person behind the stories.',
      featured: 'Featured stories', more: 'See more', latest: 'Latest news',
      about_title: 'About the author',
      about_bio: 'Juan David Rokrack, an 18-year-old Colombian, looking to grow, write and create more every day, is waiting for the perfect moment to turn this dream into reality.',
      written_title: 'What I\'ve written',
      written_text: 'Since 2017 he started with simple stories, which he has now transformed, the first of them being "Linterna Roja".',
      news_title: 'News',
      news_empty: 'No news yet. Updates are coming soon.',
      gallery_title: 'Gallery',
      cover_n: 'Cover {n}',
      books_title: 'Books',
      footer: '© 2026 Onyx Studio · All rights reserved',
      lang_aria: 'Language',
      lib_loading: 'Loading library…',
      lib_error: 'The library could not be loaded. If you opened index.html by double-clicking it, open it with Live Server or from the published GitHub page.',
      soon: 'Coming soon',
      back_lib: '← Back to the library',
      parts: 'Parts',
      read_mark: '✓ Read',
      rate_hint: 'Tap a star to rate',
      rate_yours: 'Your rating: {n} of 5',
      rate_aria: 'Your rating',
      stars_aria: '{n} stars',
      cover_alt: 'Cover of {t}',
      ch_loading: 'Loading chapter…',
      ch_error: 'This chapter could not be loaded.',
      ch_no_lang: 'This chapter isn\'t available in English yet; it is shown in Spanish.',
      listen: 'Listen', pause: 'Pause', resume: 'Resume', stop: 'Stop', restart: 'From the start',
      follow: 'Auto-scroll', settings: 'Settings',
      speed_lbl: 'Speed', volume_lbl: 'Music volume', size_lbl: 'Text size',
      slow: 'Slow', normal: 'Normal', fast: 'Fast',
      no_voice: 'Your browser does not support read-aloud.',
      music_on: 'Music: on', music_off: 'Music: off', vol_aria: 'Music volume',
      size_down: 'Smaller text', size_up: 'Larger text',
      prev: '← Previous', next: 'Next →'
    }
  };

  let lang = 'es';
  try { const g = localStorage.getItem('idioma'); if (g === 'en' || g === 'es') lang = g; } catch (e) {}

  function t(k, v) {
    let s = (D[lang] && D[lang][k]) || D.es[k] || k;
    if (v) Object.keys(v).forEach(x => { s = s.replace('{' + x + '}', v[x]); });
    return s;
  }

  function aplicar() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n, { n: el.dataset.n }); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPh);
      el.setAttribute('aria-label', el.placeholder);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.querySelectorAll('[data-idioma-actual]').forEach(el => { el.textContent = lang.toUpperCase(); });
    document.querySelectorAll('[data-idioma]').forEach(b => {
      b.classList.toggle('on', b.dataset.idioma === lang);
      b.setAttribute('aria-pressed', b.dataset.idioma === lang ? 'true' : 'false');
    });
  }

  function set(l) {
    if (l === lang || !D[l]) return;
    lang = l;
    try { localStorage.setItem('idioma', l); } catch (e) {}
    aplicar();
    window.dispatchEvent(new Event('idioma'));
  }

  window.Idioma = { get: () => lang, set, t, aplicar };

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-idioma]');
    if (b) set(b.dataset.idioma);
  });

  aplicar();
})();
