// =====================================================
//  BIBLIOTECA DE ONYX STUDIO
//  Para agregar un libro nuevo: copia un bloque { ... }
//  dentro de la lista LIBROS, sepáralo con coma y cambia los datos.
//  Para agregar una parte: copia un bloque dentro de "partes".
//  Los párrafos del texto se separan con una línea en blanco.
//  Los nombres de las imágenes deben coincidir EXACTO
//  con los archivos de la carpeta "imagenes".
// =====================================================

const LIBROS = [
  {
    id: 'linterna-roja',
    titulo: 'Linterna Roja',
    portada: 'imagenes/linterna-roja.png',
    descripcion: 'David Roja, un niño de 12 años, una noche de halloween logra liberar accidentalmente a la criatura más temida, poderosa y sanguinaría de la historia, ¿Será capaz de afrontar las consecuencias de sus actos?',
    partes: [
      {
        titulo: 'La Noche de Cristal',
        caratula: 'imagenes/LR-pc1.png',
        texto: `
TEXTO DE EJEMPLO. Reemplaza todo esto por el texto real de la Parte 1 de Linterna Roja.

Cada párrafo se separa del siguiente con una línea en blanco, como este. La página se encarga de darle el formato cómodo para leer.

Puedes copiar y pegar directamente desde tu Word. Solo asegúrate de dejar una línea vacía entre un párrafo y otro.
`
      }
      // Para agregar la Parte 2, escribe una coma después de la llave de arriba
      // y copia el bloque completo de la Parte 1 aquí abajo.
    ]
  }
  // Para agregar otro libro, escribe una coma después de la llave de arriba
  // y copia el bloque completo del libro aquí abajo.
];
