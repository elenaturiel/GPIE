import { entradas as definiciones, type Entradas, type Supuestos } from "@/config/calculadora";

/**
 * Cálculo del ahorro anual con INTACTA. Funciones puras: mismas entradas, mismo resultado.
 *
 * Modelo (todo por año):
 *   piezas       = habitaciones × piezas por habitación + piezas en zonas comunes
 *   incidencias  = piezas × % que se manchan
 *   HOY, cada incidencia:
 *     - acaba en sustitución (con probabilidad %sustitución) o en limpieza profesional (el resto)
 *     - ocupa horas de personal × coste por hora
 *     - deja la pieza fuera de servicio unos días
 *   CON INTACTA:
 *     - se paga el tratamiento: piezas × precio por pieza × aplicaciones al año
 *     - un % de las manchas se resuelve en el momento con un paño (solo cuesta esos minutos)
 *     - el resto se gestiona como hoy
 */

export type Desglose = { limpieza: number; sustituciones: number; personal: number; tratamiento: number };

export type Resultado = {
  piezas: number;
  incidencias: number;
  actual: Desglose & { total: number };
  conIntacta: Desglose & { total: number };
  /** Ahorro anual neto (actual − con INTACTA, ya descontado el tratamiento). Puede ser negativo. */
  ahorro: number;
  /** Retorno de la inversión: ahorro neto / coste del tratamiento (0,5 = 50 %). null si no hay tratamiento. */
  roi: number | null;
  /** Meses para recuperar lo invertido en el tratamiento con el ahorro bruto. null si no se recupera. */
  mesesRecuperacion: number | null;
  /** Días-pieza fuera de servicio al año (no se pasa a euros: depende de cada hotel). */
  diasFuera: { actual: number; conIntacta: number };
};

/** Mantiene cada entrada dentro de su rango (los campos de texto admiten cualquier cosa). */
export function sanear(e: Entradas): Entradas {
  const out = { ...e };
  for (const k of Object.keys(definiciones) as (keyof Entradas)[]) {
    const { min, max } = definiciones[k];
    const v = Number(e[k]);
    out[k] = Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min;
  }
  return out;
}

const pct = (v: number) => Math.min(1, Math.max(0, v / 100));

/** Coste de gestionar `n` incidencias como hoy (sin el tratamiento). */
function gestion(n: number, e: Entradas) {
  const s = pct(e.porcentajeSustitucion);
  return {
    limpieza: n * (1 - s) * e.costeLimpieza,
    sustituciones: n * s * e.costeSustitucion,
    personal: n * e.horasPersonal * e.costeHora,
  };
}

const total = (d: Desglose) => d.limpieza + d.sustituciones + d.personal + d.tratamiento;

export function calcular(entrada: Entradas, sup: Supuestos): Resultado {
  const e = sanear(entrada);
  const piezas = e.habitaciones * e.piezasPorHabitacion + e.piezasComunes;
  const incidencias = piezas * pct(e.porcentajeManchadas);

  const actualD: Desglose = { ...gestion(incidencias, e), tratamiento: 0 };

  const evitadas = incidencias * pct(sup.manchasEvitadas);
  const restantes = incidencias - evitadas;
  const conD: Desglose = { ...gestion(restantes, e), tratamiento: piezas * Math.max(0, sup.precioPorPieza) * Math.max(0, sup.aplicacionesPorAno) };
  conD.personal += evitadas * (Math.max(0, sup.minutosPano) / 60) * e.costeHora;

  const actual = { ...actualD, total: total(actualD) };
  const conIntacta = { ...conD, total: total(conD) };
  const ahorro = actual.total - conIntacta.total;
  const bruto = ahorro + conD.tratamiento; // lo que se deja de gastar en gestión
  const roi = conD.tratamiento > 0 ? ahorro / conD.tratamiento : null;
  const mesesRecuperacion = conD.tratamiento > 0 && bruto > 0 ? conD.tratamiento / (bruto / 12) : conD.tratamiento === 0 ? 0 : null;

  return {
    piezas,
    incidencias,
    actual,
    conIntacta,
    ahorro,
    roi,
    mesesRecuperacion,
    diasFuera: { actual: incidencias * e.diasFuera, conIntacta: restantes * e.diasFuera },
  };
}

/** Rangos de habitaciones del formulario (sin solapes). */
export const RANGOS_HABITACIONES = ["Menos de 50", "50–149", "150–299", "300 o más"] as const;

/** Rango del formulario que corresponde a un número de habitaciones. */
export function rangoHabitaciones(n: number): (typeof RANGOS_HABITACIONES)[number] {
  if (n < 50) return "Menos de 50";
  if (n < 150) return "50–149";
  if (n < 300) return "150–299";
  return "300 o más";
}

const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });
export const formatoEuros = (v: number) => eur.format(Math.round(v));
export const formatoNumero = (v: number) => num.format(v);
