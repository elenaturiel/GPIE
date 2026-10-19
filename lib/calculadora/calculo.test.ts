import { describe, expect, it } from "vitest";
import { valoresEjemplo, valoresSupuestos, type Entradas, type Supuestos } from "@/config/calculadora";
import { calcular, formatoEuros, rangoHabitaciones, sanear } from "./calculo";

const base: Entradas = {
  habitaciones: 100,
  piezasPorHabitacion: 2,
  piezasComunes: 50,
  porcentajeManchadas: 20,
  costeLimpieza: 40,
  porcentajeSustitucion: 10,
  costeSustitucion: 300,
  diasFuera: 2,
  horasPersonal: 1,
  costeHora: 20,
};
const sup: Supuestos = { precioPorPieza: 5, aplicacionesPorAno: 2, manchasEvitadas: 50, minutosPano: 6 };

describe("calcular", () => {
  const r = calcular(base, sup);

  it("cuenta piezas e incidencias", () => {
    expect(r.piezas).toBe(250);
    expect(r.incidencias).toBe(50);
  });

  it("calcula el coste actual por partidas", () => {
    // 45 limpiezas × 40 €, 5 sustituciones × 300 €, 50 h × 20 €
    expect(r.actual.limpieza).toBe(1800);
    expect(r.actual.sustituciones).toBe(1500);
    expect(r.actual.personal).toBe(1000);
    expect(r.actual.tratamiento).toBe(0);
    expect(r.actual.total).toBe(4300);
  });

  it("calcula el coste con INTACTA", () => {
    // tratamiento 250 × 5 € × 2 = 2500; quedan 25 incidencias: 22,5 × 40 + 2,5 × 300 + 25 h × 20; paño 25 × 0,1 h × 20 €
    expect(r.conIntacta.tratamiento).toBe(2500);
    expect(r.conIntacta.limpieza).toBe(900);
    expect(r.conIntacta.sustituciones).toBe(750);
    expect(r.conIntacta.personal).toBeCloseTo(500 + 50);
    expect(r.conIntacta.total).toBeCloseTo(4700);
  });

  it("da ahorro, retorno y meses de recuperación coherentes", () => {
    expect(r.ahorro).toBeCloseTo(4300 - 4700);
    expect(r.roi).toBeCloseTo(-400 / 2500);
    // ahorro bruto 2100 €/año = 175 €/mes → 2500 / 175
    expect(r.mesesRecuperacion).toBeCloseTo(2500 / 175);
  });

  it("cuenta los días-pieza fuera de servicio", () => {
    expect(r.diasFuera).toEqual({ actual: 100, conIntacta: 50 });
  });

  it("si INTACTA no evita nada, no hay recuperación", () => {
    const r2 = calcular(base, { ...sup, manchasEvitadas: 0, minutosPano: 0 });
    expect(r2.ahorro).toBeCloseTo(-2500);
    expect(r2.mesesRecuperacion).toBeNull();
  });

  it("sin coste de tratamiento, no hay ROI y se recupera en 0 meses", () => {
    const r3 = calcular(base, { ...sup, precioPorPieza: 0 });
    expect(r3.roi).toBeNull();
    expect(r3.mesesRecuperacion).toBe(0);
    expect(r3.ahorro).toBeGreaterThan(0);
  });

  it("sin manchas, no hay costes de gestión", () => {
    const r4 = calcular({ ...base, porcentajeManchadas: 0 }, sup);
    expect(r4.actual.total).toBe(0);
    expect(r4.ahorro).toBe(-2500);
  });

  it("los valores de ejemplo y los supuestos dan números finitos", () => {
    const r5 = calcular(valoresEjemplo(), valoresSupuestos());
    for (const v of [r5.ahorro, r5.actual.total, r5.conIntacta.total]) expect(Number.isFinite(v)).toBe(true);
  });
});

describe("sanear", () => {
  it("lleva cada entrada a su rango y cambia lo que no es número por el mínimo", () => {
    const s = sanear({ ...base, porcentajeManchadas: 180, costeLimpieza: -5, habitaciones: Number.NaN });
    expect(s.porcentajeManchadas).toBe(100);
    expect(s.costeLimpieza).toBe(0);
    expect(s.habitaciones).toBe(5);
  });
});

describe("rangoHabitaciones", () => {
  it("coincide con los rangos del formulario, sin solapes", () => {
    expect(rangoHabitaciones(49)).toBe("Menos de 50");
    expect(rangoHabitaciones(50)).toBe("50–149");
    expect(rangoHabitaciones(149)).toBe("50–149");
    expect(rangoHabitaciones(150)).toBe("150–299");
    expect(rangoHabitaciones(300)).toBe("300 o más");
  });
});

describe("formatoEuros", () => {
  it("usa el formato español", () => {
    expect(formatoEuros(12345.6).replace(/\s/g, " ")).toBe("12.346 €");
  });
});
