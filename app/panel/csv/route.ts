import { empresaDe, listarInteresados, tipoDe } from "@/lib/lead/repo";
import { seguroParaHoja } from "@/lib/lead/validate";
import { puertaDe } from "@/lib/metrics/stats";
import { sesionValida } from "@/lib/panel/auth";

// GET /panel/csv → descarga de todos los interesados (solo con sesión del panel).

const celda = (v: unknown) => `"${seguroParaHoja(String(v ?? "")).replace(/"/g, '""')}"`;

export async function GET() {
  if (!(await sesionValida())) return new Response("No autorizado", { status: 401 });
  const lista = await listarInteresados();
  const cab = ["fecha", "puerta_falsa", "nombre", "donde_lo_usaria", "empresa", "ciudad", "email", "telefono", "acepta_novedades", "boton", "utm_source", "utm_medium", "utm_campaign", "consentimiento_fecha", "consentimiento_version", "consentimiento_texto"];
  const filas = lista.map((i) =>
    [i.fecha, puertaDe(i.origen) === "ahorro" ? "Calcular ahorro" : "Prueba piloto", i.nombre, tipoDe(i), empresaDe(i), i.ciudad, i.email, i.telefono, i.aceptaComunicaciones ? "sí" : "no", i.origen, i.utm?.source, i.utm?.medium, i.utm?.campaign, i.consentimiento.fecha, i.consentimiento.version, i.consentimiento.texto]
      .map(celda)
      .join(";"),
  );
  // BOM + «;» para que Excel en español lo abra bien
  const csv = "﻿" + [cab.join(";"), ...filas].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="intacta-interesados-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
