import { describe, expect, it } from "vitest";
import { crearLimitador } from "./rate-limit";
import { seguroParaHoja, TIEMPO_MINIMO_MS, validarLead, type LeadInput } from "./validate";

const valido: LeadInput = {
  nombre: "  Ana   García ",
  tipo: "VTC y taxis",
  empresa: "Ana VTC",
  ciudad: "Pamplona",
  email: "Ana@Ejemplo.com",
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
    expect(r.lead.email).toBe("ana@ejemplo.com");
    expect(r.lead.aceptaComunicaciones).toBe(false);
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
    const r = validarLead({ aceptaPrivacidad: false, email: "no-es-email", tipo: "Nave espacial", telefono: "abc" });
    expect(r.ok).toBe(false);
    if (r.ok || r.bot) return;
    expect(Object.keys(r.errores).sort()).toEqual(["aceptaPrivacidad", "ciudad", "email", "nombre", "telefono", "tipo"].sort());
  });

  it("la empresa es opcional (también para particulares)", () => {
    const r = validarLead({ ...valido, tipo: "En casa", empresa: "" });
    expect(r.ok && r.lead.empresa).toBe("");
  });

  it("detecta bots: campo trampa relleno o envío demasiado rápido", () => {
    expect(validarLead({ ...valido, web: "http://spam" })).toEqual({ ok: false, bot: true });
    expect(validarLead({ ...valido, tiempo: TIEMPO_MINIMO_MS - 1 })).toEqual({ ok: false, bot: true });
  });

  it("recorta textos largos y quita caracteres de control", () => {
    const r = validarLead({ ...valido, empresa: "E\u0000mpresa " + "x".repeat(500) });
    expect(r.ok && r.lead.empresa.length).toBe(120);
    expect(r.ok && r.lead.empresa.startsWith("E mpresa")).toBe(true);
  });

  it("acepta todos los usos de la lista, incluido «Otro»", () => {
    for (const tipo of ["Hoteles y hostales", "Airbnb y pisos turísticos", "VTC y taxis", "Restaurantes y cafeterías", "Tiendas y oficinas", "En casa", "Otro"])
      expect(validarLead({ ...valido, tipo }).ok).toBe(true);
  });

  it("solo admite orígenes conocidos", () => {
    const r = validarLead({ ...valido, origen: "<script>" });
    expect(r.ok && r.lead.origen).toBe("desconocido");
  });

  it("acepta las dos puertas falsas como origen", () => {
    const r = validarLead({ ...valido, origen: "ahorro" });
    expect(r.ok && r.lead.origen).toBe("ahorro");
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
import { vi } from "vitest";
import { actualizarDoc, AlmacenNoConfigurado, Conflicto, escribirDoc, leerDoc } from "@/lib/store/docs";
import { borrarInteresado, guardarInteresado, listarInteresados, nuevoInteresado } from "./repo";
import { campo, INTERVALO_MS, leerTotales, pendientes, puertaDe, sumar, sumaTipo, TOPE_ESCRITURAS_MES } from "@/lib/metrics/stats";

const blob = vi.hoisted(() => ({ put: vi.fn(), get: vi.fn() }));
vi.mock("@vercel/blob", async (orig) => ({ ...(await orig<typeof import("@vercel/blob")>()), put: blob.put, get: blob.get }));

describe("interesados en el almacén", () => {
  const r = validarLead(valido);
  if (!r.ok) throw new Error("debería ser válido");

  it("guarda, lista (más reciente primero) y borra", async () => {
    const a = nuevoInteresado(r.lead, new Date("2026-11-01T10:00:00Z"));
    const b = nuevoInteresado({ ...r.lead, empresa: "Otro" }, new Date("2026-11-02T10:00:00Z"));
    await guardarInteresado(a);
    await guardarInteresado(b);
    const lista = await listarInteresados(new Date("2026-11-03T00:00:00Z"));
    expect(lista.map((i) => i.empresa)).toEqual(["Otro", "Ana VTC"]);
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

  it("dos solicitudes a la vez no se pisan", async () => {
    const xs = Array.from({ length: 6 }, (_, k) => nuevoInteresado({ ...r.lead, empresa: `H${k}` }, new Date()));
    await Promise.all(xs.map(guardarInteresado));
    const lista = await listarInteresados();
    expect(lista.map((i) => i.empresa).sort()).toEqual(["H0", "H1", "H2", "H3", "H4", "H5"]);
    for (const x of xs) await borrarInteresado(x.id);
  });
});

describe("almacén de documentos", () => {
  it("una escritura con un etag viejo da Conflicto, y actualizarDoc lo reintenta", async () => {
    await actualizarDoc("prueba.json", { n: 0 }, (d) => ({ n: d.n + 1 }));
    const { etag } = await leerDoc("prueba.json", { n: 0 });
    await escribirDoc("prueba.json", { n: 5 }, etag);
    await expect(escribirDoc("prueba.json", { n: 9 }, etag)).rejects.toBeInstanceOf(Conflicto);
    expect((await leerDoc("prueba.json", { n: 0 })).data).toEqual({ n: 5 });
  });

  it("sin configuración avisa claramente", async () => {
    await expect(leerDoc("x.json", [], {})).rejects.toBeInstanceOf(AlmacenNoConfigurado);
  });

  it("en Vercel Blob lee y escribe en privado, con escritura condicional", async () => {
    const env = { BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_x" };
    blob.get.mockResolvedValueOnce({ statusCode: 200, stream: new Response('{"n":1}').body, headers: new Headers(), blob: { etag: '"e1"' } });
    const d = await leerDoc("c.json", { n: 0 }, env);
    expect(d).toEqual({ data: { n: 1 }, etag: '"e1"' });
    expect(blob.get).toHaveBeenCalledWith("intacta/c.json", { access: "private", useCache: false });
    blob.put.mockResolvedValueOnce({});
    await escribirDoc("c.json", { n: 2 }, '"e1"', env);
    expect(blob.put).toHaveBeenCalledWith("intacta/c.json", '{"n":2}', expect.objectContaining({ access: "private", ifMatch: '"e1"', allowOverwrite: true, addRandomSuffix: false }));
    blob.put.mockResolvedValueOnce({});
    await escribirDoc("nuevo.json", [], null, env);
    expect(blob.put).toHaveBeenLastCalledWith("intacta/nuevo.json", "[]", expect.objectContaining({ access: "private", allowOverwrite: false }));
  });
});

describe("contadores del embudo", () => {
  it("solo acepta eventos y orígenes conocidos", () => {
    expect(campo("visita")).toBe("visita");
    expect(campo("cta", "portada")).toBe("cta.portada");
    expect(campo("cta", "otra-web")).toBeNull();
    expect(campo("borrar-todo", "portada")).toBeNull();
    expect(campo("cta", "ahorro")).toBe("cta.ahorro");
    expect(campo("calculadora")).toBeNull(); // ya no existe
    expect(campo("video")).toBe("video");
  });

  it("agrupa los eventos y los guarda juntos como mucho cada 30 minutos", async () => {
    const t0 = new Date("2026-11-07T12:00:00Z");
    await sumar("cta.cabecera", t0, { inmediato: true }); // deja la instancia «recién guardada»
    await sumar("visita", new Date(t0.getTime() + 1000));
    await sumar("visita", new Date(t0.getTime() + 60_000));
    expect(pendientes()["2026-11-07"]).toEqual({ visita: 2 }); // aún sin guardar…
    const antes = (await leerTotales(1, t0)).escriturasMes;
    await sumar("cta.portada", new Date(t0.getTime() + INTERVALO_MS)); // …hasta que pasan 30 min
    expect(pendientes()).toEqual({});
    const { total, escriturasMes } = await leerTotales(7, t0);
    expect(total.visita).toBeGreaterThanOrEqual(2);
    expect(sumaTipo(total, "cta")).toBeGreaterThanOrEqual(1);
    expect(escriturasMes).toBe(antes + 1); // tres eventos, una sola escritura
  });

  it("una solicitud se guarda al momento", async () => {
    const t = new Date("2026-11-07T13:00:00Z");
    await sumar("envio.ahorro", t, { inmediato: true });
    expect(pendientes()).toEqual({});
    expect((await leerTotales(1, t)).total["envio.ahorro"]).toBe(1);
  });

  it("al llegar al tope de escrituras del mes deja de escribir (y el panel lo sabe)", async () => {
    const t = new Date("2027-01-15T10:00:00Z");
    // simula un mes en el que ya se han hecho todas las escrituras permitidas
    await actualizarDoc<{ dias: object; escrituras: Record<string, number> }>("contadores.json", { dias: {}, escrituras: {} }, (d) => ({ ...d, escrituras: { ...d.escrituras, "2027-01": TOPE_ESCRITURAS_MES } }));
    await sumar("visita", t, { inmediato: true });
    const r2 = await leerTotales(1, t);
    expect(r2.topeAlcanzado).toBe(true);
    expect(r2.escriturasMes).toBe(TOPE_ESCRITURAS_MES);
  });
});

describe("puertas falsas", () => {
  it("el botón de ahorro va a «ahorro» y el resto a «piloto»", () => {
    expect(puertaDe("ahorro")).toBe("ahorro");
    for (const o of ["cabecera", "portada", "tras-demo", "piloto", "desconocido"]) expect(puertaDe(o)).toBe("piloto");
  });
});
