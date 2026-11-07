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

  it("guarda solo los usos de la lista", () => {
    const r = validarLead({ ...valido, usos: ["Butacas y sillones", "<b>otro</b>", 3] });
    expect(r.ok && r.lead.usos).toEqual(["Butacas y sillones"]);
    const r2 = validarLead({ ...valido, usos: "Butacas y sillones" });
    expect(r2.ok && r2.lead.usos).toEqual([]);
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

process.env.STORE = "memory";
import { kv, KvNoConfigurado } from "@/lib/store/kv";
import { borrarInteresado, guardarInteresado, listarInteresados, nuevoInteresado } from "./repo";
import { campo, leerTotales, sumar, sumaTipo } from "@/lib/metrics/stats";

describe("interesados en la base de datos", () => {
  const r = validarLead(valido);
  if (!r.ok) throw new Error("debería ser válido");

  it("guarda, lista (más reciente primero) y borra", async () => {
    const a = nuevoInteresado(r.lead, new Date("2026-11-01T10:00:00Z"));
    const b = nuevoInteresado({ ...r.lead, hotel: "Otro" }, new Date("2026-11-02T10:00:00Z"));
    await guardarInteresado(a);
    await guardarInteresado(b);
    const lista = await listarInteresados(new Date("2026-11-03T00:00:00Z"));
    expect(lista.map((i) => i.hotel)).toEqual(["Otro", "Hotel Ejemplo"]);
    expect(lista[1].consentimiento.texto).toContain("He leído y acepto la política de privacidad");
    expect(await borrarInteresado(a.id)).toBe(true);
    expect(await borrarInteresado(a.id)).toBe(false);
    expect((await listarInteresados(new Date("2026-11-03T00:00:00Z"))).map((i) => i.id)).toEqual([b.id]);
    await borrarInteresado(b.id);
  });

  it("borra solos los de más de 12 meses al listar", async () => {
    const viejo = nuevoInteresado(r.lead, new Date("2025-10-01T10:00:00Z"));
    const reciente = nuevoInteresado(r.lead, new Date("2026-10-01T10:00:00Z"));
    await guardarInteresado(viejo);
    await guardarInteresado(reciente);
    const lista = await listarInteresados(new Date("2026-11-07T00:00:00Z"));
    expect(lista.map((i) => i.id)).toEqual([reciente.id]);
    await borrarInteresado(reciente.id);
  });
});

describe("contadores del embudo", () => {
  it("solo acepta eventos y orígenes conocidos", () => {
    expect(campo("visita")).toBe("visita");
    expect(campo("cta", "portada")).toBe("cta.portada");
    expect(campo("cta", "otra-web")).toBeNull();
    expect(campo("borrar-todo", "portada")).toBeNull();
  });

  it("suma por día y totaliza", async () => {
    const hoy = new Date("2026-11-07T12:00:00Z");
    const ayer = new Date("2026-11-06T12:00:00Z");
    await sumar("visita", ayer);
    await sumar("visita", hoy);
    await sumar("cta.portada", hoy);
    await sumar("cta.cabecera", hoy);
    const { total, porDia } = await leerTotales(7, hoy);
    expect(total.visita).toBe(2);
    expect(sumaTipo(total, "cta")).toBe(2);
    expect(porDia.at(-1)).toEqual({ dia: "2026-11-07", t: { visita: 1, "cta.portada": 1, "cta.cabecera": 1 } });
  });
});

describe("kv", () => {
  it("sin configuración avisa claramente", async () => {
    await expect(kv([["LRANGE", "x", 0, -1]], {})).rejects.toBeInstanceOf(KvNoConfigurado);
  });

  it("habla con Upstash por /pipeline con su token", async () => {
    let call: { url: string; init: RequestInit } | null = null;
    const res = await kv([["HINCRBY", "k", "f", 1]], { KV_REST_API_URL: "https://eu1.upstash.io/", KV_REST_API_TOKEN: "tok" }, (async (url: string, init: RequestInit) => {
      call = { url, init };
      return new Response(JSON.stringify([{ result: 5 }]));
    }) as typeof fetch);
    expect(res).toEqual([5]);
    expect(call!.url).toBe("https://eu1.upstash.io/pipeline");
    expect((call!.init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
    expect(JSON.parse(String(call!.init.body))).toEqual([["HINCRBY", "k", "f", "1"]]);
  });
});
