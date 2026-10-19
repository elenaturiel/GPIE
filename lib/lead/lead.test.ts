import { describe, expect, it } from "vitest";
import { crearLimitador } from "./rate-limit";
import { seguroParaHoja, TIEMPO_MINIMO_MS, validarLead, type LeadInput } from "./validate";

const valido: LeadInput = {
  nombre: "  Ana   García ",
  cargo: "Gobernanta",
  hotel: "Hotel Ejemplo",
  ciudad: "Pamplona",
  habitaciones: "50–149",
  email: "Ana@Hotel.com",
  telefono: "",
  aceptaPrivacidad: true,
  aceptaComunicaciones: false,
  origen: "portada",
  web: "",
  tiempo: 8000,
};

describe("validarLead", () => {
  it("acepta una solicitud correcta y limpia los textos", () => {
    const r = validarLead(valido);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.lead.nombre).toBe("Ana García");
    expect(r.lead.email).toBe("ana@hotel.com");
    expect(r.lead.aceptaComunicaciones).toBe(false);
    expect(r.lead.calculadora).toBeNull();
  });

  it("exige la casilla de privacidad marcada (no vale un texto 'true')", () => {
    for (const v of [false, undefined, "true", 1]) {
      const r = validarLead({ ...valido, aceptaPrivacidad: v });
      expect(r.ok).toBe(false);
      if (!r.ok && !r.bot) expect(r.errores.aceptaPrivacidad).toBeTruthy();
    }
  });

  it("las comunicaciones comerciales solo cuentan si se marcan expresamente", () => {
    const r = validarLead({ ...valido, aceptaComunicaciones: "sí" });
    expect(r.ok && r.lead.aceptaComunicaciones).toBe(false);
  });

  it("da un error por cada campo obligatorio vacío o mal", () => {
    const r = validarLead({ aceptaPrivacidad: false, email: "no-es-email", habitaciones: "mil", telefono: "abc" });
    expect(r.ok).toBe(false);
    if (r.ok || r.bot) return;
    expect(Object.keys(r.errores).sort()).toEqual(["aceptaPrivacidad", "ciudad", "email", "habitaciones", "hotel", "nombre", "telefono"].sort());
  });

  it("detecta bots: campo trampa relleno o envío demasiado rápido", () => {
    expect(validarLead({ ...valido, web: "http://spam" })).toEqual({ ok: false, bot: true });
    expect(validarLead({ ...valido, tiempo: TIEMPO_MINIMO_MS - 1 })).toEqual({ ok: false, bot: true });
  });

  it("recorta textos largos y quita caracteres de control", () => {
    const r = validarLead({ ...valido, hotel: "H\u0000otel " + "x".repeat(500) });
    expect(r.ok && r.lead.hotel.length).toBe(120);
    expect(r.ok && r.lead.hotel.startsWith("H otel")).toBe(true);
  });

  it("solo admite orígenes conocidos", () => {
    const r = validarLead({ ...valido, origen: "<script>" });
    expect(r.ok && r.lead.origen).toBe("desconocido");
  });

  it("guarda la estimación de la calculadora solo si los números son válidos", () => {
    const calc = { habitaciones: 80, piezas: 200, ahorroAnual: 601.234, costeActual: 4362, costeIntacta: 3761, entradas: { habitaciones: 80, "mal-nombre": 3, x: "texto" } };
    const r = validarLead({ ...valido, calculadora: calc });
    expect(r.ok && r.lead.calculadora).toEqual({ habitaciones: 80, piezas: 200, ahorroAnual: 601.23, costeActual: 4362, costeIntacta: 3761, entradas: { habitaciones: 80 } });
    const r2 = validarLead({ ...valido, calculadora: { ...calc, ahorroAnual: "mucho" } });
    expect(r2.ok && r2.lead.calculadora).toBeNull();
  });
});

describe("seguroParaHoja", () => {
  it("neutraliza fórmulas", () => {
    expect(seguroParaHoja("=HYPERLINK(\"x\")")).toBe("'=HYPERLINK(\"x\")");
    expect(seguroParaHoja("+34 600")).toBe("'+34 600");
    expect(seguroParaHoja("Hotel")).toBe("Hotel");
  });
});

describe("crearLimitador", () => {
  it("deja pasar max envíos por ventana y luego frena", () => {
    const ok = crearLimitador(3, 1000);
    expect([ok("a", 0), ok("a", 10), ok("a", 20), ok("a", 30)]).toEqual([true, true, true, false]);
    expect(ok("b", 30)).toBe(true); // otra IP, otra cuenta
    expect(ok("a", 1015)).toBe(true); // pasada la ventana vuelve a dejar
  });
});

import { aFila, COLUMNAS, guardarEnHoja } from "./sheets";

describe("aFila / guardarEnHoja", () => {
  const r = validarLead({ ...valido, nombre: "=SUMA(A1)", calculadora: { habitaciones: 80, piezas: 200, ahorroAnual: 601, costeActual: 4362, costeIntacta: 3761, entradas: {} } });
  if (!r.ok) throw new Error("debería ser válido");
  const fila = aFila(r.lead, new Date("2026-10-19T10:00:00Z"));

  it("rellena todas las columnas, con la prueba del consentimiento", () => {
    expect(Object.keys(fila)).toEqual([...COLUMNAS]);
    expect(fila.consentimiento_fecha).toBe("2026-10-19T10:00:00.000Z");
    expect(fila.consentimiento_texto).toContain("He leído y acepto la política de privacidad");
    expect(fila.calc_ahorro_anual).toBe("601");
    expect(fila.acepta_comunicaciones).toBe("no");
  });

  it("neutraliza fórmulas en lo que escribe el usuario", () => {
    expect(fila.nombre).toBe("'=SUMA(A1)");
  });

  it("sin configuración no intenta enviar", async () => {
    const res = await guardarEnHoja(fila, {} as NodeJS.ProcessEnv, () => {
      throw new Error("no debería llamar");
    });
    expect(res.ok).toBe(false);
  });

  it("envía la clave y la fila, y entiende las respuestas del Apps Script", async () => {
    const env = { GOOGLE_SHEETS_WEBHOOK_URL: "https://script.google.com/x/exec", GOOGLE_SHEETS_SECRET: "s3cr3t" } as unknown as NodeJS.ProcessEnv;
    let sent: { secret: string; row: object } | null = null;
    const ok = await guardarEnHoja(fila, env, (async (_u: string, init: RequestInit) => {
      sent = JSON.parse(String(init.body));
      return new Response(JSON.stringify({ ok: true }));
    }) as typeof fetch);
    expect(ok).toEqual({ ok: true });
    expect(sent!.secret).toBe("s3cr3t");
    expect(sent!.row).toEqual(fila);
    const bad = await guardarEnHoja(fila, env, (async () => new Response(JSON.stringify({ ok: false, error: "unauthorized" }))) as typeof fetch);
    expect(bad.ok === false && bad.detalle).toMatch(/clave no coincide/);
  });
});
