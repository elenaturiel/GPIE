/**
 * SUPUESTOS DE INTACTA PARA LA CALCULADORA DE AHORRO.
 *
 * ⚠️ PENDIENTE: todavía no hay datos reales de Tecnan ni del piloto. Los valores de abajo son
 *    marcadores para poder construir y probar la calculadora; la web muestra siempre el aviso
 *    «Estimación orientativa con valores de ejemplo». Cámbialos aquí cuando haya datos y pon
 *    `pendiente: false` en cada uno que quede confirmado (con su fuente).
 *
 * La lógica del cálculo (funciones puras con tests) llega en la fase 3.
 */
export type Supuesto = { valor: number; unidad: string; pendiente: boolean; fuente: string };

export const supuestosIntacta = {
  /** Precio del tratamiento por pieza tapizada y aplicación. */
  precioPorPieza: { valor: 0, unidad: "€/pieza", pendiente: true, fuente: "Tecnan" },
  /** Cuántas veces al año hay que volver a aplicarlo. */
  aplicacionesPorAno: { valor: 0, unidad: "veces/año", pendiente: true, fuente: "Tecnan" },
  /** % de manchas que no llegan a hacer falta limpieza profesional (se quedan en gotas y se retiran). */
  manchasEvitadas: { valor: 0, unidad: "%", pendiente: true, fuente: "Tecnan / piloto" },
} satisfies Record<string, Supuesto>;
