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
  pie: ["INTACTA · Antimanchas textil"],
};

export const cta = {
  cabecera: "Solicitar piloto",
  principal: "Solicitar piloto gratuito",
  secundario: "Conocer el producto",
};

export const portada = {
  titular: ["La mancha", "no entra."], // TECNAN
  antetitulo: "Antimanchas para cualquier tapicería",
  texto: "INTACTA protege sofás, sillas, asientos y cualquier tapicería de tela con nanotecnología.", // TECNAN
  textoSuave: "Lo que se derrama se queda en gotas: un paño y listo.", // TECNAN
  desliza: "Desliza",
};

export const especificaciones = {
  antetitulo: "El producto",
  titular: ["Un bote para ", { g: "cada tapicería." }] as Rich,
  puntos: [
    { etiqueta: "Gatillo", titulo: "Niebla fina", texto: "Cubre el tejido de forma uniforme sin empaparlo." }, // TECNAN
    { etiqueta: "Fórmula", titulo: "Nanotecnología", texto: "Una capa invisible que recubre cada fibra." }, // TECNAN
    { etiqueta: "Formato", titulo: "750 ml profesional", texto: "Cabe en un carro de limpieza, un armario o la guantera." }, // TECNAN (formato sin decidir)
    { etiqueta: "Resultado", titulo: "Tejido intacto", texto: "El líquido se queda en gotas y se retira con un paño." }, // TECNAN
  ],
};

/** La demo: el producto PROTEGE (no quita manchas ya hechas). */
export const demo = {
  etiquetaAria:
    "Una tapicería limpia. El pulverizador la rocía con INTACTA; después caen vino, café y zumo, que se quedan en gotas sobre la tela, y un paño las retira de una pasada.",
  telaEtiqueta: "TAPICERÍA DE TELA",
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
      pie: ["Lo que cae ", { b: "se queda en gotas, encima de la tela." }] as Rich, // TECNAN
    },
    {
      paso: "Paso 2 · Sin frotar",
      titular: ["Pasa un ", { g: "paño." }] as Rich,
      pie: ["Una sola pasada ", { g: "y la tela queda lista." }] as Rich, // TECNAN
    },
  ],
};

export const problema = {
  antetitulo: "El problema",
  titular: ["Hoy una mancha es un ", { g: "proceso." }] as Rich,
  intro:
    "Una mancha en un sofá, un asiento o una silla tapizada cuesta tiempo y dinero, y mientras tanto la pieza no se puede usar.",
  sin: {
    titulo: "Sin tratar",
    resumen: "5 pasos",
    pasos: [
      "Cae café, vino o lo que sea.",
      "Se frota y la mancha se extiende.",
      "Productos especiales o limpieza profesional.",
      "Tintorería o tapicero si no sale.",
      "La pieza fuera de uso mientras tanto.",
    ],
  },
  con: {
    titulo: "Con INTACTA",
    resumen: "2 pasos",
    pasos: ["Tapicería tratada de antemano.", "Si cae algo, paño húmedo y una pasada."], // TECNAN
    final: "Lista para usar.",
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
    { zona: "Hoteles", titulo: "Hoteles y hostales", texto: "Butacas, sofás y cabeceros en habitaciones y zonas comunes." },
    { zona: "Alojamiento turístico", titulo: "Airbnb y pisos turísticos", texto: "Sofás y sillas que pasan por muchas manos cada mes." },
    { zona: "Transporte", titulo: "VTC y taxis", texto: "Asientos de tela entre un viaje y el siguiente." }, // TECNAN (¿apto para tapicería de coche?)
    { zona: "Hostelería", titulo: "Restaurantes y cafeterías", texto: "Sillas, bancadas y cojines con salsas, café y zumos." }, // TECNAN (¿repele grasa?)
    { zona: "Comercio", titulo: "Tiendas y oficinas", texto: "Probadores, salas de espera y sillas de trabajo." },
    { zona: "Casa", titulo: "En casa", texto: "El sofá, las sillas del comedor y el coche familiar." }, // TECNAN (¿apto para tapicería de coche?)
  ],

};

export const piloto = {
  antetitulo: "Piloto gratuito",
  titular: ["Pruébalo antes de ", { g: "decidir." }] as Rich,
  cifras: [
    { valor: 30, sufijo: "", texto: "días de uso normal, en tu negocio o en tu casa." }, // PILOTO
    { valor: 0, sufijo: "€", texto: "de coste durante el piloto." }, // PILOTO
  ],
  informe:
    "Al terminar te entregamos un informe con las manchas registradas, el tiempo de limpieza y las piezas que no tuvieron que salir a tintorería, comparado con piezas sin tratar.", // PILOTO
  formTitular: ["Reserva una de las ", { g: "plazas." }] as Rich, // PILOTO (¿cuántas plazas hay?)
  formTexto: "Estamos eligiendo a los primeros participantes. Cuéntanos quién eres y te escribimos.",
};

/** Textos de la etiqueta del bote 3D (también son afirmaciones de producto). */
export const etiquetaBote = {
  arriba: "ANTIMANCHAS TEXTIL · USO PROFESIONAL", // TECNAN
  nombre: "INTACTA",
  lema: "PROTECCIÓN INVISIBLE PARA TAPICERÍA", // TECNAN
  usos: "Sofás · Sillas · Asientos · Cojines",
  tecnologia: "", // vacío: no se pinta (la web no menciona al fabricante)
  formato: "750 ml", // TECNAN (formato sin decidir)
  origen: "Navarra",
};

/** Cinta en movimiento entre la demo y el problema (tipos de mancha). */
export const cinta = ["Vino", "Café", "Zumo", "Maquillaje", "Cremas", "Salsas"]; // TECNAN (¿repele grasa?)

/** Banda que se abre a pantalla completa después de la demo. */
export const banda = {
  antetitulo: "Piloto gratuito",
  titular: ["¿Lo probamos ", { g: "contigo?" }] as Rich,
  texto: "Tratamos tus piezas y medimos durante 30 días cuántas manchas se quedan en gotas.", // PILOTO
};

/** Pasos del piloto (lista grande fija con scroll). */
export const pasosPiloto = {
  antetitulo: "Cómo funciona el piloto",
  pasos: [
    { titulo: "Hablamos contigo", texto: "Vemos qué piezas tratar: sofás, sillas, asientos, cojines…" }, // PILOTO
    { titulo: "Tratamos las piezas", texto: "Nuestro equipo aplica INTACTA. Tú sigues como siempre." }, // PILOTO
    { titulo: "30 días de uso", texto: "Uso real. Se apunta cada mancha y lo que cuesta quitarla." }, // PILOTO
    { titulo: "Te damos los datos", texto: "Un informe que compara lo tratado con lo que no." }, // PILOTO
  ],
};

/** Sello giratorio junto a la portada. */
export const sello = "Piloto gratuito · Sé de los primeros · ";

/** Segunda puerta falsa: «¿Quieres calcular cuánto vas a ahorrar?» (sin cifras inventadas). */
export const ahorro = {
  antetitulo: "Calcula tu ahorro",
  titular: ["¿Cuánto ", { g: "ahorrarías?" }] as Rich,
  texto: "Tintorería, retapizados, horas de limpieza y piezas fuera de uso. Descubre lo que te cuestan hoy las manchas y lo que podrías ahorrar con INTACTA.",
  boton: "¿Quieres calcular cuánto vas a ahorrar?",
};

/** Formulario del piloto. */
export const formulario = {
  // Puerta falsa: el botón dice «Solicitar piloto»; al pulsarlo, contamos el interés y lo decimos claro.
  titularModal: ["¿Te ", { g: "interesa?" }] as Rich,
  introModal:
    "Estamos preparando un piloto gratuito con los primeros negocios y hogares. Si te interesa, puedes ser de los primeros en probar INTACTA: déjanos tus datos y te escribimos.",
  // Ventana de la segunda puerta falsa (botón «¿Quieres calcular cuánto vas a ahorrar?»).
  titularAhorro: ["¿Cuánto vas a ", { g: "ahorrar?" }] as Rich,
  introAhorro:
    "Estamos preparando la calculadora con los datos reales de los primeros participantes del piloto. Sé de los primeros en usarla y en probar INTACTA: déjanos tus datos y te escribimos en cuanto esté lista.",
  graciasAhorroTexto: "Estamos preparando la calculadora con los datos del piloto. Te escribimos en cuanto esté lista.",
  campos: {
    nombre: "Nombre",
    tipo: "¿Dónde lo usarías?",
    empresa: "Empresa o negocio (opcional)",
    ciudad: "Ciudad",
    email: "Email",
    telefono: "Teléfono (opcional)",
  },
  ejemplos: {
    nombre: "Ana García",
    empresa: "Si tienes un negocio",
    ciudad: "Pamplona",
    email: "ana@ejemplo.com",
    telefono: "600 000 000",
  },
  elegirTipo: "Elige una opción",
  enviar: "Solicitar piloto gratuito",
  enviando: "Enviando…",
  graciasAntetitulo: "Solicitud recibida",
  gracias: "Gracias",
  // Mensaje honesto: es un piloto en selección, no un producto a la venta.
  graciasTexto: "Estamos seleccionando a los primeros participantes del piloto. Te escribimos en 48 horas.",
  errorEnvio: "No hemos podido enviar tu solicitud. Inténtalo de nuevo en unos minutos.",
  cerrar: "Cerrar",
};

/** Vídeo (YouTube). Se carga solo al pulsar «reproducir»: hasta entonces no se conecta con YouTube. */
export const video = {
  id: "T2c1X1Gsi34",
  titulo: "INTACTA - la mancha se va, tu mueble se queda",
  antetitulo: "En vídeo",
  titular: ["Míralo en ", { g: "acción." }] as Rich,
  reproducir: "Reproducir el vídeo",
  aviso: "Al reproducirlo se conecta con YouTube (Google), que recibe tu IP. Usamos su versión sin cookies de seguimiento.",
};
