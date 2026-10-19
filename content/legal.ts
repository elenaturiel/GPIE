/**
 * DATOS DEL TITULAR Y TEXTOS DE PROTECCIÓN DE DATOS.
 *
 * ⚠️ PENDIENTE: no hay sociedad constituida. Rellena aquí quién es el titular de la web y
 *    responsable del tratamiento (nombre, NIF, domicilio, email) antes de publicar.
 *    Un abogado o asesor en protección de datos debe revisar estos textos.
 */
export const titular = {
  nombre: "[TITULAR PENDIENTE]",
  nif: "[NIF PENDIENTE]",
  domicilio: "[DOMICILIO PENDIENTE]",
  email: "[EMAIL DE CONTACTO PENDIENTE]",
};

/**
 * Versión del texto de privacidad que acepta quien envía el formulario. Se guarda con cada
 * solicitud como prueba del consentimiento: si cambias `primeraCapa` o la política, sube la versión.
 */
export const VERSION_PRIVACIDAD = "2026-10-19";

/** Información básica (primera capa, art. 13 RGPD) junto al botón de envío. */
export const primeraCapa = {
  responsable: `Responsable: ${titular.nombre}.`,
  finalidad: "Finalidad: gestionar tu solicitud de piloto y contactarte sobre ella.",
  legitimacion: "Legitimación: tu consentimiento.",
  destinatarios: "Destinatarios: no se ceden datos; Google (hoja de cálculo y email) y Vercel (alojamiento) actúan como encargados.",
  derechos: "Derechos: acceso, rectificación, supresión, oposición, limitación y portabilidad.",
  masInfo: "Más información en la",
  enlace: "política de privacidad",
};

export const casillas = {
  privacidad: "He leído y acepto la política de privacidad.",
  comunicaciones: "Quiero recibir novedades de INTACTA por email. Si no lo marcas, solo te escribiremos sobre tu solicitud de piloto.",
};
