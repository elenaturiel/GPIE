import type { Metadata } from "next";
import { OBJETIVO_CONVERSION } from "@/config/pretotipo";
import { formatoEuros } from "@/lib/calculadora/calculo";
import { listarInteresados, type Interesado } from "@/lib/lead/repo";
import { leerTotales, ORIGENES, sumaTipo, type Totales } from "@/lib/metrics/stats";
import { panelConfigurado, sesionValida } from "@/lib/panel/auth";
import { KvNoConfigurado } from "@/lib/store/kv";
import { salir } from "./actions";
import { Borrar, Login } from "./ui";

export const metadata: Metadata = { title: "Panel · INTACTA", robots: { index: false, follow: false } };

const pct = (a: number, b: number) => (b > 0 ? `${((a / b) * 100).toLocaleString("es-ES", { maximumFractionDigits: 1 })} %` : "—");
const fecha = (iso: string) => new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Madrid" });
const NOMBRES: Record<string, string> = { cabecera: "Cabecera", portada: "Portada", "tras-demo": "Tras la demo", calculadora: "Calculadora", piloto: "Sección piloto" };

function Embudo({ t, titulo }: { t: Totales; titulo: string }) {
  const visitas = t.visita ?? 0;
  const clics = sumaTipo(t, "cta");
  const empezados = sumaTipo(t, "empezado");
  const envios = sumaTipo(t, "envio");
  return (
    <section className="pnl-card">
      <h2 className="mono">{titulo}</h2>
      <div className="pnl-funnel">
        <div>
          <b>{visitas}</b>
          <span>Visitas</span>
        </div>
        <div>
          <b>{clics}</b>
          <span>Clics en «Solicitar piloto»</span>
          <em>{pct(clics, visitas)} de las visitas</em>
        </div>
        <div>
          <b>{empezados}</b>
          <span>Empezaron a rellenar</span>
          <em>{pct(empezados, clics)} de los clics</em>
        </div>
        <div className="pnl-hit">
          <b>{envios}</b>
          <span>Dejaron sus datos</span>
          <em>
            {pct(envios, visitas)} de las visitas · {pct(envios, clics)} de los clics
          </em>
        </div>
      </div>
      <p className="pnl-note">
        Objetivo de la hipótesis:{" "}
        {OBJETIVO_CONVERSION === null ? "pendiente (config/pretotipo.ts)" : `${OBJETIVO_CONVERSION} % de las visitas`} · Calculadora usada {t.calculadora ?? 0} veces.
      </p>
      <table className="pnl-mini">
        <thead>
          <tr>
            <th scope="col">Botón</th>
            <th scope="col">Clics</th>
            <th scope="col">Datos</th>
          </tr>
        </thead>
        <tbody>
          {ORIGENES.map((o) => (
            <tr key={o}>
              <th scope="row">{NOMBRES[o]}</th>
              <td>{t[`cta.${o}`] ?? 0}</td>
              <td>{t[`envio.${o}`] ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Tabla({ lista }: { lista: Interesado[] }) {
  if (!lista.length) return <p className="pnl-empty">Todavía no ha dejado sus datos nadie.</p>;
  return (
    <div className="pnl-scroll">
      <table className="pnl-table">
        <thead>
          <tr>
            {["Fecha", "Nombre", "Cargo", "Hotel", "Ciudad", "Habitaciones", "Email", "Teléfono", "Dónde lo usaría", "Novedades", "Botón", "Origen (UTM)", "Calculadora", ""].map((h, i) => (
              <th key={i} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lista.map((i) => (
            <tr key={i.id}>
              <td>{fecha(i.fecha)}</td>
              <td>{i.nombre}</td>
              <td>{i.cargo || "—"}</td>
              <td>{i.hotel}</td>
              <td>{i.ciudad}</td>
              <td>{i.habitaciones}</td>
              <td>
                <a href={`mailto:${i.email}`}>{i.email}</a>
              </td>
              <td>{i.telefono || "—"}</td>
              <td>{i.usos?.length ? i.usos.join(", ") : "—"}</td>
              <td>{i.aceptaComunicaciones ? "Sí" : "No"}</td>
              <td>{NOMBRES[i.origen] ?? i.origen}</td>
              <td>{[i.utm?.source, i.utm?.medium, i.utm?.campaign].filter(Boolean).join(" / ") || "—"}</td>
              <td>{i.calculadora ? `${formatoEuros(i.calculadora.ahorroAnual)}/año · ${i.calculadora.habitaciones} hab.` : "—"}</td>
              <td>
                <Borrar id={i.id} hotel={i.hotel} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function leerDatos() {
  try {
    const [lista, mes, todo] = await Promise.all([listarInteresados(), leerTotales(30), leerTotales(400)]);
    return { lista, mes, todo };
  } catch (e) {
    console.error("[panel]", (e as Error).message);
    return { error: e instanceof KvNoConfigurado ? e.message : "No se ha podido leer la base de datos. Inténtalo de nuevo en un momento." };
  }
}

export default async function Panel() {
  if (!panelConfigurado())
    return (
      <main className="pnl wrap">
        <h1 className="display">Panel</h1>
        <p>Falta configurar la contraseña: añade la variable PANEL_PASSWORD en Vercel (Settings → Environment Variables) y vuelve a desplegar.</p>
      </main>
    );

  if (!(await sesionValida()))
    return (
      <main className="pnl wrap">
        <h1 className="display">
          Panel <span className="g">INTACTA</span>
        </h1>
        <Login />
      </main>
    );

  const datos = await leerDatos();
  const contenido =
    "error" in datos ? (
      <p className="err" role="alert">
        {datos.error}
      </p>
    ) : (
      <>
        <div className="pnl-grid">
          <Embudo t={datos.mes.total} titulo="Últimos 30 días" />
          <Embudo t={datos.todo.total} titulo="Desde el principio" />
        </div>
        <section className="pnl-card">
          <div className="pnl-row">
            <h2 className="mono">Interesados ({datos.lista.length})</h2>
            {datos.lista.length > 0 && (
              <a className="btn btn-ghost" href="/panel/csv">
                Descargar CSV
              </a>
            )}
          </div>
          <Tabla lista={datos.lista} />
          <p className="pnl-note">
            Se borran solos a los 12 meses. Si alguien pide sus datos, descarga el CSV; si pide que lo borres, pulsa «Borrar» en su fila.
          </p>
        </section>
      </>
    );

  return (
    <main className="pnl wrap">
      <div className="pnl-row">
        <h1 className="display">
          Panel <span className="g">INTACTA</span>
        </h1>
        <form action={salir}>
          <button className="btn btn-ghost" type="submit">
            Cerrar sesión
          </button>
        </form>
      </div>
      {contenido}
    </main>
  );
}
