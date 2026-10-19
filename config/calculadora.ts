/**
 * CALCULADORA DE AHORRO: entradas del hotel y supuestos de INTACTA.
 *
 * ⚠️ Nada de esto es un dato de mercado ni de eficacia.
 *    - Las ENTRADAS son valores de ejemplo editables: el hotel los cambia con los controles.
 *    - Los SUPUESTOS de INTACTA están PENDIENTES de Tecnan y del piloto. Son marcadores para que la
 *      calculadora funcione; la web lo dice siempre («Estimación orientativa con valores de ejemplo»).
 *      Cuando haya datos, cambia `valor`, pon `pendiente: false` y apunta la `fuente`.
 *
 * La lógica del cálculo está en lib/calculadora/calculo.ts (con tests).
 */

export type Entrada = {
  etiqueta: string;
  ayuda?: string;
  valor: number; // valor de ejemplo con el que arranca
  min: number;
  max: number;
  paso: number;
  unidad: "" | "€" | "%" | "h" | "días" | "€/h";
};

/** Lo que mete el hotel. Agrupado en pestañas. */
export const entradas = {
  habitaciones: { etiqueta: "Habitaciones", valor: 80, min: 5, max: 600, paso: 5, unidad: "" },
  piezasPorHabitacion: {
    etiqueta: "Piezas tapizadas por habitación",
    ayuda: "Butacas, cabeceros, sofás…",
    valor: 2,
    min: 0,
    max: 8,
    paso: 0.5,
    unidad: "",
  },
  piezasComunes: { etiqueta: "Piezas en zonas comunes", ayuda: "Lobby, restaurante, terraza…", valor: 40, min: 0, max: 600, paso: 5, unidad: "" },
  porcentajeManchadas: { etiqueta: "Piezas que se manchan al año", valor: 25, min: 0, max: 100, paso: 1, unidad: "%" },
  costeLimpieza: { etiqueta: "Limpieza profesional por pieza", ayuda: "Tintorería o limpieza in situ", valor: 45, min: 0, max: 400, paso: 5, unidad: "€" },
  porcentajeSustitucion: { etiqueta: "Manchas que acaban en sustitución", ayuda: "O retapizado", valor: 5, min: 0, max: 100, paso: 1, unidad: "%" },
  costeSustitucion: { etiqueta: "Coste de sustituir una pieza", valor: 350, min: 0, max: 3000, paso: 10, unidad: "€" },
  diasFuera: { etiqueta: "Días que la pieza está fuera", valor: 3, min: 0, max: 30, paso: 1, unidad: "días" },
  horasPersonal: { etiqueta: "Horas de personal por mancha", ayuda: "Avisos, desmontar, llevar y traer", valor: 1.5, min: 0, max: 10, paso: 0.25, unidad: "h" },
  costeHora: { etiqueta: "Coste por hora de personal", valor: 18, min: 0, max: 60, paso: 1, unidad: "€/h" },
} satisfies Record<string, Entrada>;

export type Entradas = { [K in keyof typeof entradas]: number };

export const grupos: { id: string; titulo: string; campos: (keyof Entradas)[] }[] = [
  { id: "hotel", titulo: "Tu hotel", campos: ["habitaciones", "piezasPorHabitacion", "piezasComunes", "porcentajeManchadas"] },
  { id: "limpieza", titulo: "Limpieza", campos: ["costeLimpieza", "porcentajeSustitucion", "costeSustitucion", "diasFuera"] },
  { id: "personal", titulo: "Personal", campos: ["horasPersonal", "costeHora"] },
];

export type Supuesto = { etiqueta: string; valor: number; unidad: string; pendiente: boolean; fuente: string };

/** Supuestos de INTACTA. ⚠️ TODOS PENDIENTES: valores provisionales sin respaldo todavía. */
export const supuestosIntacta = {
  precioPorPieza: { etiqueta: "Precio del tratamiento por pieza y aplicación", valor: 6, unidad: "€", pendiente: true, fuente: "Tecnan" },
  aplicacionesPorAno: { etiqueta: "Aplicaciones al año", valor: 2, unidad: "", pendiente: true, fuente: "Tecnan" },
  manchasEvitadas: {
    etiqueta: "Manchas que se resuelven en el momento con un paño",
    valor: 70,
    unidad: "%",
    pendiente: true,
    fuente: "Tecnan / piloto",
  },
  minutosPano: { etiqueta: "Tiempo de pasar el paño por mancha", valor: 5, unidad: "min", pendiente: true, fuente: "piloto" },
} satisfies Record<string, Supuesto>;

export type Supuestos = { [K in keyof typeof supuestosIntacta]: number };

export const valoresSupuestos = (): Supuestos =>
  Object.fromEntries(Object.entries(supuestosIntacta).map(([k, v]) => [k, v.valor])) as Supuestos;

export const valoresEjemplo = (): Entradas => Object.fromEntries(Object.entries(entradas).map(([k, v]) => [k, v.valor])) as Entradas;
