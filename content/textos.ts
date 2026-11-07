/**
 * TODOS LOS TEXTOS DE LA WEB.
 *
 * Cambia aquí cualquier frase y se actualiza en la página (y en la etiqueta del bote 3D).
 *
 * ⚠️ Las líneas marcadas con «TECNAN» son afirmaciones sobre el producto que hay que
 *    confirmar con el fabricante antes de publicar. Hasta entonces se muestran tal cual,
 *    pero no deben salir a producción sin esa confirmación.
 * ⚠️ Las marcadas con «PILOTO» son condiciones del piloto que tiene que confirmar el equipo.
 *
 * Reglas: nada de claims biocidas o sanitarios (desinfecta, antibacteriano, elimina gérmenes…)
 * y nada de cifras de eficacia o de mercado sin fuente.
 *
 * Formato de los titulares: una lista de trozos. Un texto normal va tal cual;
 * { g: "…" } va en verde; { b: "…" } va en negrita.
 */

export type Rich = (string | { g: string } | { b: string })[];

export const marca = {
  nombre: "INTACTA",
  // La web no menciona al fabricante (decisión del equipo): ni en la cabecera, ni en el pie, ni en el bote.
  apellido: "",
  pie: ["INTACTA · Antimanchas textil para hoteles"],
};

export const cta = {
  cabecera: "Solicitar piloto",
  principal: "Solicitar piloto gratuito",
  secundario: "Conocer el producto",
};

export const portada = {
  titular: ["La mancha", "no entra."], // TECNAN
  antetitulo: "Antimanchas para tapicería de hotel",
  texto: "INTACTA protege butacas, sofás y cabeceros con nanotecnología.", // TECNAN
  textoSuave: "Lo que se derrama se queda en gotas: un paño y listo.", // TECNAN
  desliza: "Desliza",
};

export const especificaciones = {
  antetitulo: "El producto",
  titular: ["Un bote para ", { g: "cada tapicería." }] as Rich,
  puntos: [
    { etiqueta: "Gatillo", titulo: "Niebla fina", texto: "Cubre el tejido de forma uniforme sin empaparlo." }, // TECNAN
    { etiqueta: "Fórmula", titulo: "Nanotecnología", texto: "Una capa invisible que recubre cada fibra." }, // TECNAN
    { etiqueta: "Formato", titulo: "750 ml profesional", texto: "Cabe en el carro de la camarera de pisos." }, // TECNAN (formato sin decidir)
    { etiqueta: "Resultado", titulo: "Tejido intacto", texto: "El líquido se queda en gotas y se retira con un paño." }, // TECNAN
  ],
};

/** La demo: el producto PROTEGE (no quita manchas ya hechas). */
export const demo = {
  etiquetaAria:
    "Una butaca limpia. El pulverizador la rocía con INTACTA; después caen vino, café y zumo, que se quedan en gotas sobre la tela, y un paño las retira de una pasada.",
  telaEtiqueta: "BUTACA · HABITACIÓN 214",
  telaSinTratar: "SIN TRATAR",
  telaTratada: "TRATADA CON INTACTA",
  fases: [
    {
      paso: "Paso 1 · Sobre la tela limpia",
      titular: ["Rocía."] as Rich,
      pie: ["Una pasada de niebla a un palmo del tejido. ", { b: "La capa no se ve." }] as Rich, // TECNAN
    },
    {
      paso: "Después · Vino, café y zumo",
      titular: ["La mancha ", { g: "no entra." }] as Rich,
      pie: ["Lo que cae sobre la butaca ", { b: "se queda en gotas, encima de la tela." }] as Rich, // TECNAN
    },
    {
      paso: "Paso 2 · Sin frotar",
      titular: ["Pasa un ", { g: "paño." }] as Rich,
      pie: ["Una sola pasada ", { g: "y la butaca queda lista." }] as Rich, // TECNAN
    },
  ],
};

export const problema = {
  antetitulo: "El problema",
  titular: ["Hoy una mancha es un ", { g: "proceso." }] as Rich,
  intro:
    "Cada mancha en una pieza tapizada moviliza a varias personas y deja la habitación incompleta mientras la pieza está fuera.",
  sin: {
    titulo: "Sin tratar",
    resumen: "5 pasos",
    pasos: [
      "La camarera de pisos encuentra la mancha.",
      "Aviso a gobernanta y mantenimiento.",
      "Desmontar la funda o retirar la pieza.",
      "Tintorería o tapicero externo.",
      "La habitación espera a que vuelva.",
    ],
  },
  con: {
    titulo: "Con INTACTA",
    resumen: "2 pasos",
    pasos: ["Tapicería tratada de antemano.", "Si cae algo, paño húmedo y una pasada."], // TECNAN
    final: "Habitación lista.",
  },
};

export const comoFunciona = {
  antetitulo: "Cómo funciona",
  titular: ["Una capa que ", { g: "no se ve." }] as Rich,
  intro:
    "La niebla deposita nanopartículas que recubren cada fibra. El líquido no encuentra por dónde entrar y se queda en la superficie formando gotas.", // TECNAN
  sinTratar: {
    titulo: "Fibra sin tratar",
    texto: "El líquido se cuela y se queda dentro.",
    aria: "Fibras sin tratar: el líquido se mete entre ellas",
    etiqueta: "EL LÍQUIDO ENTRA",
  },
  tratada: {
    titulo: "Fibra tratada",
    texto: "Cada fibra recubierta. La gota se queda encima.", // TECNAN
    aria: "Fibras tratadas: la gota queda redonda encima",
    etiqueta: "GOTA ENCIMA",
    capa: "NANOCAPA",
  },
};

export const dondeSeUsa = {
  antetitulo: "Dónde se usa",
  titular: ["Todo lo que tiene ", { g: "tela." }] as Rich,
  lugares: [
    { zona: "Habitación", titulo: "Butacas y sillones", texto: "La pieza que más vino y café recibe." },
    { zona: "Habitación", titulo: "Cabeceros tapizados", texto: "Maquillaje, cremas y manos." }, // TECNAN (¿repele grasa?)
    { zona: "Lobby", titulo: "Sofás de zonas comunes", texto: "Uso intensivo, a la vista de todos." },
    { zona: "Restaurante", titulo: "Sillas y bancadas", texto: "Desayunos, salsas y zumos cada día." }, // TECNAN (¿repele grasa?)
    { zona: "Habitación", titulo: "Cojines y plaids", texto: "Piezas sueltas que se manchan y se pierden en lavandería." }, // TECNAN (¿aguanta lavados?)
    { zona: "Terraza", titulo: "Cojines de exterior", texto: "Bebidas y cremas solares." }, // TECNAN (¿exterior y grasa?)
  ],
};

export const piloto = {
  antetitulo: "Piloto para hoteles",
  titular: ["Pruébalo antes de ", { g: "decidir." }] as Rich,
  cifras: [
    { valor: 3, sufijo: "", texto: "habitaciones tratadas por nuestro equipo." }, // PILOTO
    { valor: 30, sufijo: "", texto: "días de uso normal con huéspedes reales." }, // PILOTO
    { valor: 0, sufijo: "€", texto: "de coste para el hotel durante el piloto." }, // PILOTO
  ],
  informe:
    "Al terminar te entregamos un informe con las manchas registradas, el tiempo de limpieza y las piezas que no tuvieron que salir a tintorería, comparado con habitaciones sin tratar.", // PILOTO
  formTitular: ["Reserva una de las ", { g: "plazas." }] as Rich, // PILOTO (¿cuántas plazas hay?)
  formTexto: "Estamos eligiendo los primeros hoteles. Cuéntanos quién eres y te escribimos.",
};

/** Textos de la etiqueta del bote 3D (también son afirmaciones de producto). */
export const etiquetaBote = {
  arriba: "ANTIMANCHAS TEXTIL · USO PROFESIONAL", // TECNAN
  nombre: "INTACTA",
  lema: "PROTECCIÓN INVISIBLE PARA TAPICERÍA", // TECNAN
  usos: "Butacas · Sofás · Cabeceros · Cojines",
  tecnologia: "", // vacío: no se pinta (la web no menciona al fabricante)
  formato: "750 ml", // TECNAN (formato sin decidir)
  origen: "Navarra",
};

/** Cinta en movimiento entre la demo y el problema (tipos de mancha). */
export const cinta = ["Vino", "Café", "Zumo", "Maquillaje", "Cremas", "Salsas"]; // TECNAN (¿repele grasa?)

/** Banda que se abre a pantalla completa después de la demo. */
export const banda = {
  antetitulo: "Piloto gratuito para hoteles",
  titular: ["¿Lo probamos en ", { g: "tu hotel?" }] as Rich,
  texto: "Tratamos tres habitaciones y medimos durante 30 días cuántas manchas se quedan en gotas.", // PILOTO
};

/** Pasos del piloto (lista grande fija con scroll). */
export const pasosPiloto = {
  antetitulo: "Cómo funciona el piloto",
  pasos: [
    { titulo: "Visitamos el hotel", texto: "Elegimos contigo tres habitaciones y las piezas que se van a tratar." }, // PILOTO
    { titulo: "Tratamos las piezas", texto: "Nuestro equipo aplica INTACTA. Vuestra rutina de limpieza no cambia." }, // PILOTO
    { titulo: "30 días de uso", texto: "Huéspedes reales. Se apunta cada mancha y el tiempo que lleva quitarla." }, // PILOTO
    { titulo: "Te damos los datos", texto: "Un informe que compara las habitaciones tratadas con las que no." }, // PILOTO
  ],
};

/** Sello giratorio junto a la portada. */
export const sello = "Piloto gratuito · Para hoteles · ";

/** Segunda puerta falsa: «¿Quieres calcular cuánto vas a ahorrar?» (sin cifras inventadas). */
export const ahorro = {
  antetitulo: "Calcula tu ahorro",
  titular: ["¿Cuánto ", { g: "ahorrarías?" }] as Rich,
  texto: "Butacas a la tintorería, piezas que se retapizan, horas de personal y habitaciones a medias. Descubre lo que te cuestan hoy las manchas y lo que podrías ahorrar con INTACTA.",
  boton: "¿Quieres calcular cuánto vas a ahorrar?",
};

/** Formulario del piloto. */
export const formulario = {
  // Puerta falsa: el botón dice «Solicitar piloto»; al pulsarlo, contamos el interés y lo decimos claro.
  titularModal: ["¿Te ", { g: "interesa?" }] as Rich,
  introModal:
    "Estamos preparando un piloto gratuito con los primeros hoteles. Si te interesa, puedes ser de los primeros en probar INTACTA: déjanos tus datos y te escribimos.",
  // Ventana de la segunda puerta falsa (botón «¿Quieres calcular cuánto vas a ahorrar?»).
  titularAhorro: ["¿Cuánto vas a ", { g: "ahorrar?" }] as Rich,
  introAhorro:
    "Estamos preparando la calculadora con los datos reales de los primeros hoteles del piloto. Sé de los primeros en usarla y en probar INTACTA: déjanos tus datos y te escribimos en cuanto esté lista.",
  graciasAhorroTexto: "Estamos preparando la calculadora con los datos del piloto. Te escribimos en cuanto esté lista.",
  usosPregunta: "¿Dónde lo usarías? (opcional)",
  campos: {
    nombre: "Nombre",
    cargo: "Cargo",
    hotel: "Hotel",
    ciudad: "Ciudad",
    habitaciones: "Habitaciones",
    email: "Email",
    telefono: "Teléfono (opcional)",
  },
  ejemplos: {
    nombre: "Ana García",
    cargo: "Gobernanta, director/a…",
    hotel: "Nombre del hotel",
    ciudad: "Pamplona",
    email: "ana@hotel.com",
    telefono: "600 000 000",
  },
  elegirRango: "Elige un rango",
  enviar: "Solicitar piloto gratuito",
  enviando: "Enviando…",
  graciasAntetitulo: "Solicitud recibida",
  gracias: "Gracias",
  // Mensaje honesto: es un piloto en selección, no un producto a la venta.
  graciasTexto: "Estamos seleccionando los primeros hoteles para el piloto. Te escribimos en 48 horas.",
  errorEnvio: "No hemos podido enviar tu solicitud. Inténtalo de nuevo en unos minutos.",
  cerrar: "Cerrar",
};

/** Vídeo (YouTube). Se carga solo al pulsar «reproducir»: hasta entonces no se conecta con YouTube. */
export const video = {
  id: "T2c1X1Gsi34",
  titulo: "INTACTA - la mancha se va, tu mueble se queda",
  antetitulo: "En vídeo",
  titular: ["Así se ve en ", { g: "un hotel." }] as Rich,
  reproducir: "Reproducir el vídeo",
  aviso: "Al reproducirlo se conecta con YouTube (Google), que recibe tu IP. Usamos su versión sin cookies de seguimiento.",
};
