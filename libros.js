// =====================================================
//  BIBLIOTECA DE ONYX STUDIO
//  Para agregar un libro nuevo: copia un bloque { ... }
//  dentro de la lista LIBROS, sepáralo con coma y cambia los datos.
//  Para agregar una parte: copia un bloque dentro de "partes".
//  Cada salto de línea del texto cuenta como un párrafo nuevo.
//  Los nombres de las imágenes deben coincidir EXACTO
//  con los archivos de la carpeta "imagenes".
// =====================================================

const LIBROS = [
  {
    id: 'linterna-roja',
    titulo: 'Linterna Roja',
    portada: 'imagenes/linterna-roja.png',
    descripcion: 'David Roja, un niño de 12 años, una noche de Halloween logra liberar accidentalmente a la criatura más temida, poderosa y sanguinaria de la historia, ¿será capaz de afrontar las consecuencias de sus actos?',
    musica: 'soundtrack1lr.mp3',
    partes: [
      {
        titulo: 'Parte 1: La Noche de Cristal',
        caratula: 'imagenes/LR-pc1.png',
        texto: `
Todo inicia en San Francisco, Estados Unidos, un 31 de octubre de 2011. Los niños salen en la tarde, pidiendo dulces puerta a puerta, pero no todos tienen esa misma suerte.

La alegría de afuera no es igual para alguien, alguien que sufre lo peor…

En una de las costas de la ciudad está la casa de Julian y Janet, una pareja de esposos a cargo de tres hijos. En el interior todo parece tenso: es el día en que dos de ellos se irán del país junto a su padre. En el sótano de la misma casa hay un niño llorando, tapa sus ojos con sus manos mientras se acurruca.

—Levántate —dice una voz detrás del niño—. Aún no acabamos…

—N-no puedo más, papá… —responde el chico entre sollozos.

El padre, quien estaba sentado junto al escritorio de ese sótano, se levanta y arremete. Toma al chico del pelo mientras grita: «¡DEJA DE SER UN COBARDE, ¿QUÉ HARÁS CUANDO YA NO ESTÉ YO?!». El chico, de apenas 12 años, de cabello desordenado y ojos miel, lo aparta, empujándolo.

—No quiero pelear más, papá —dice el chico, temblando del miedo.

El hombre lanza un golpe directo, que el mismo logra evitar cruzando sus brazos y recibiendo el impacto. Sin embargo, el niño se agacha rápidamente y trata de tomar por sorpresa los pies de Julian, pero es inútil. Este da un salto por encima del chico y, sin remordimiento, lanza una patada, golpeando la cara del chico y haciéndolo volar un par de metros.

—Cuando me vaya, solo quiero que protejas a tu madre, niño… —dice Julian fríamente.

Desde el suelo, David llora, pero con enojo vuelve a levantarse.

—¡Aprendí todo, papá! —dice el mismo—. Kárate, Kung Fu, Taekwondo, Jiu-Jitsu, hasta lucha callejera. ¿CUÁNDO ESTARÉ LISTO?

—Cuando yo lo diga… —dice Julian mientras se prepara para arremeter de nuevo…

Pero desde la sala se escucha la voz de quien es la madre de David, Janet:

—¡Vengan ahora, chicos! Dejen sus juegos para después.

El padre ve a su hijo y se inclina con una reverencia, a lo que él corresponde amablemente…

—Mamá, deja de acomodar mi corbata —dice Ken, el hijo mayor de los tres, con 20 años—. Ya casi nos tenemos que ir.

—Aguarda, ya casi termino. ¿Y tú no te pondrás algo formal, Joseph? —pregunta la madre.

—No, mamá, no quiero parecer un tonto —responde el segundo hijo, Joseph, gemelo menor de Ken, de 20 años—. Como otros… ¡Jajajaja!

—¿Tratas de decirme algo? —responde Ken, con el ceño fruncido, murmurando.

—Claro que no, pero no vamos a un funeral, hermanito. Estamos de vacaciones.

—Vamos a trabajar, así que sé un poco más maduro, por favor.

—Ya dejen de pelear, tenemos que irnos —dice Julian, el padre de los tres chicos, interrumpiendo la conversación de la sala.

David entra a la sala también y rápidamente es abrazado por su hermano, Joseph, quien, como siempre, parece sentirse feliz.

—Hermanito, ¿entrenando con papá de nuevo? Te ves terrible, jajaja —dice el hermano mayor.

—Cállate, Joseph, tú te ves peor, ¿dónde está tu traje? Jajaja.

—Hijo —dice Janet al hermano menor—, tienes un morado en la cara. Julian, mira cómo dejaste al niño, pídele una disculpa.

—No es mi problema esta vez —responde el padre—. Sabe que no lo hizo tan bien esta vez...

Janet abraza a sus dos hijos mayores mientras, entre lágrimas, se despide, lo que la deja totalmente destruida. Luego va con su esposo, a quien con un largo beso lo despide también, pero ninguno de los dos es capaz de aguantar el llanto. Joseph va con su hermano y lo abraza; este se siente cálido, como si llevase tiempo sin abrazarlo. Luego Ken, este choca los cinco con David y gira su cuerpo.

Julian va con su hijo menor y le da un pequeño abrazo, algo alejado, mientras se agacha.

—Cuida de tu madre, David —dice Julian—, por favor... Volveré pronto.

—¿Prometes volver...? ¿Podemos entrenar cuando lo hagas, papá? —responde el niño.

—Jaja, no me hagas reír... Nos veremos, David.

El niño suelta a su padre mientras hace una reverencia y se despide. Janet, con sus ojos aguados, abre la puerta, mientras los tres hombres de su hogar salen hacia el taxi. El clima vuelve a ser frío, acercándose la noche, y el auto arranca, llevándolos al aeropuerto, mientras la mujer de esa casa queda de rodillas, destruida por dentro.

A las horas, David parece distraído, juega con su balón de fútbol mientras su madre llora en la habitación. El niño solo pensaba en que se iba a disfrazar para esa noche de Halloween, pero las telas estaban en el cuarto de sus padres, con llave, y entrar no era ninguna opción.

Empieza a recorrer la casa, siente un fuerte olor a azufre, pero es algo desconocido, jamás lo había sentido en su hogar, y tampoco sabe de dónde proviene, así que trata de seguir el rastro hasta que llega a la causa del olor: era el cuarto seguro de su padre, una puerta blindada con contraseña.

David trata de digitar una clave básica: uno, dos, tres, cuatro, pero ve que faltan números, parecen ser seis, así que no le funciona. Coloca la fecha de nacimiento de su padre, pero no parece funcionar; luego la de su madre, pero lo mismo. Así que, a punto de rendirse, le llega la curiosidad y prueba su propia fecha de nacimiento; y la puerta se abre.

Un cuarto oscuro, con unas escaleras al subterráneo. Empieza a bajar, mientras ese olor se intensifica y parece ahogarlo un poco, pero sigue bajando mientras tapa su nariz. Al llegar abajo ve algunas computadoras viejas, tubos de experimentos y muchas máquinas que no entendía.

Empieza a caminar, mientras el olor ya es casi inevitable, y encuentra lo que parece la fuente del olor: una vitrina abierta que da una luz brillante, dorada. Con curiosidad, el chico va a ver y se da cuenta de un póster en la pared. Era un hombre fuerte, de cabello negro, vestido casi como un militar, con un chaleco rojo y un cristal dorado en la mano, donde en la parte inferior está escrito: "Linterna Roja".

El chico lo ve con ojos de alegría, como si el destino quisiera que estuviera justo en ese lugar. Al ver hacia la vitrina, ve algo que jamás esperaría: el cristal dorado de la imagen colgado como un collar y, junto a él, en un perchero, el chaleco rojo, brillando con intensidad. También ve ese anillo, con runas para nada legibles, pero se le ocurre una idea para esa noche tan especial. Toma el anillo, el chaleco y el collar y, mientras posa frente al póster, dice en voz alta: "¡Ahora yo soy Linterna Roja!".

Cierra la puerta de ese lugar, mientras parece estar listo para ir a pedir dulces, pero ya parece una hora bastante tarde. Su madre empieza a gritar: "David, ¿dónde estás?", así que el chico disimula con su balón mientras ve a su madre bajar.

—¿Dónde estabas, hijo? Me preocupaste —dice la madre, con sus ojos llorosos—. ¿Qué te he dicho de jugar con el balón adentro de la casa? ¿Y qué traes puesto?

—Mamá... yo... —dice el niño, temblando.

—No me digas que sacaste eso del almacén de tu padre, sabes que está prohibido.

—No tengo disfraz, mamá, y quiero pedir dulces —dice el niño mientras patea su balón.

—Es muy tarde, hijo... No vas a salir, mañana te compro tus galguerías.

—¿No saldré? Yo solo quería mi disfraz y salir en Halloween, mamá, no me hagas esto.

—No hagas una escena, por favor, estoy muy estresada, y ya deja ese balón —dice Janet mientras su voz empieza a alterarse.

—¿Por qué? Quiero jugar con mi balón y no puedo, quiero ir a pedir dulces y no puedo.

—David, cálmate ahora, ve a tu cuarto y dame esas cosas de papá.

—¡No! —grita David.

—¿Cómo diablos me dijiste, niño?

—Yo no soy un niño, soy un héroe, mamá, y voy a pedir dulces, es lo único que he querido en todo el año.

—¡VE A TU CUARTO AHORA, DAVID!

—¡NO LO VOY A HACER, ENTIÉNDELO, JANICE!

De repente, la madre da una bofetada a su hijo, quien queda perplejo por lo que acaba de pasar. Su cachete se enrojece, la casa se queda en un silencio total, mientras el balón rueda.

—Da-David —dice la madre, asustada.

Pero el niño, lleno de ira, con sus ojos llenos de lágrimas, golpea su balón con todas sus fuerzas, sin pensarlo. Este rebota fuertemente contra una pared y se devuelve hacia él, chocando con el cristal que encontró en el sótano, haciendo que se estrellase y se quebrara en partes contra el suelo.

—Me iré —exclama el niño— y no volverás a verme, como a papá.

Luego David corre hacia su habitación, sin ver a su madre, quien camina detrás de él, muy alterada, mientras llora, dejando atrás los fragmentos rotos. El niño azota la puerta en la cara de Janet, y esta se desploma mientras llora en el suelo.

El niño, enojado, abre la ventana de su habitación y se va, yéndose al exterior de su casa. El viento frío llena sus oídos, la arena se mete en sus ojos, pero este, con sus ojos llorosos, corre hacia la ciudad, que parece algo calmada, pues ya no hay tantos niños pidiendo dulces, pero él lo intentará.

De repente, el cristal roto en la casa empieza a latir, como si fuera un corazón a punto de despertar, mientras un líquido negro y espeso se escurre por dentro del cristal. La casa parece temblar un poco, y la madre, llorando, arrodillada frente a la puerta de su hijo, no se da cuenta. El líquido viscoso parece levantarse a gran velocidad, mientras una risa se escucha e inunda la habitación.

La madre gira y ve cómo una figura demoniaca se forma de ese líquido. Aterrada, empieza a gritar: "DAVID, ABRE LA PUERTA, TENEMOS QUE IRNOS". Golpea, rasguña, pero la puerta está con seguro, la risa se intensifica y sobre la casa de los Roja se forma una gran nube de humo negro, mientras que el líquido ya casi tiene forma.

"HIJO, TE PROMETO QUE TE AMO, NO ME HAGAS ESTO, PERDÓNAME POR TODO, NO FUE MI INTENCIÓN GOLPEARTE, NUNCA QUISE SER UNA MALA MADRE".

Pero en medio de su discurso, la voz de Janet es silenciada: un brazo gigante con la forma de una estaca atraviesa su espalda y abdomen. La sangre chorrea lentamente por su cintura, mientras sus ojos van dando sus últimos destellos de vida. La criatura que acaba de nacer del cristal parece medir dos metros, es completamente oscura y, al parecer, puede estirar sus extremidades a voluntad. Tiene una pequeña corona sobre su cabeza sin cabello, y sus ojos son blancos, sin pupilas.

La madre, por última vez, llora, y entre susurros solo puede decir: "David, te amo...". Antes de desplomarse en el suelo y apagar por completo su vida...

El niño corre por las calles de San Francisco, parece que sabe adónde va, hasta que llega. Empieza a tocar una de las puertas de esa calle, como si alguna vez ya hubiera estado allí, toca una, y otra, y otra vez, hasta que parece abrirse lentamente. Adentro hay un hombre cansado, sin cabello, con ropa holgada y vieja: es Luis, un hombre con cáncer en su fase terminal. Parecía empapado de pies a cabeza, y toda su ropa.

—Truco o trato, señor Luis —dice David, sonriente.

—¿Qué? ¿El hijo de Julian? Ve a casa —responde Luis.

—El amigo de mi papá, pensé que tendrías algunos dulces para mí.

—Tienes un morado cerca de tu ojo, ¿te peleaste?

—¿Esto? Fue entrenando un nuevo arte marcial.

—Lo suponía, bueno, vete —exclama Luis con arrogancia.

—Oh, no, señor, quiero dulces, pero casi todas las tiendas están cerradas y apenas tengo 3 caramelos, ¿podría darme algo? Por favor.

—Yo quiero dejar de estarme muriendo ahora mismo, pero no todo se tiene con un simple "por favor y gracias", niño, vete.

De repente una explosión se escucha a unos metros del lugar, acompañada de sonidos de un helicóptero de la policía, gritos de las personas y una nube negra que se acerca cada vez más. El niño, asustado, da un paso atrás, mientras su calabaza, donde guarda las golosinas, cae. Luis se pone frente a él rápidamente, pues sabe que si muere, Luis, no lo perdonaría.

A lo lejos se ve otra vez esa criatura, caminando lentamente, mientras un helicóptero la ilumina. La gente corre, entra en pánico. David ve la criatura, totalmente anonadado de lo que está viendo, como si viera al mismo diablo en persona, y este, mientras aún camina hacia David, solo dice:

—¡Nos volvemos a ver... Linterna Roja!
`
      }
      // Para agregar la Parte 2, escribe una coma después de la llave de arriba
      // y copia el bloque completo de la Parte 1 aquí abajo.
    ]
  }
  // Para agregar otro libro, escribe una coma después de la llave de arriba
  // y copia el bloque completo del libro aquí abajo.
];
