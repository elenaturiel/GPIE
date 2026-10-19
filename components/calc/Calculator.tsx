"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { entradas as defs, grupos, supuestosIntacta, valoresEjemplo, valoresSupuestos, type Entradas } from "@/config/calculadora";
import { calculadora as T } from "@/content/textos";
import { calcular, formatoEuros, formatoNumero, type Desglose } from "@/lib/calculadora/calculo";
import { guardarEstimacion } from "@/lib/calculadora/store";
import { Field } from "./Field";
import { Segmented } from "./Segmented";
import { useTween } from "./useTween";

const PARTIDAS: (keyof Desglose)[] = ["limpieza", "sustituciones", "personal", "tratamiento"];

function Money({ value, className }: { value: number; className?: string }) {
  const v = useTween(value);
  return <span className={className}>{formatoEuros(v)}</span>;
}

/** Barra apilada: cada partida es una capa que se desplaza y escala (solo transform). */
function Bar({ label, d, max, total }: { label: string; d: Desglose; max: number; total: number }) {
  // dónde empieza cada partida: la suma de las anteriores
  const starts = PARTIDAS.map((_, i) => PARTIDAS.slice(0, i).reduce((a, k) => a + d[k], 0));
  return (
    <div className="cbar">
      <div className="cbar-head">
        <span>{label}</span>
        <Money value={total} />
      </div>
      <div className="cbar-track" aria-hidden="true">
        {PARTIDAS.map((k, i) => {
          const w = max > 0 ? d[k] / max : 0;
          const x = max > 0 ? starts[i] / max : 0;
          return <i key={k} className={`seg-${k}`} style={{ transform: `translate3d(${(x * 100).toFixed(3)}%, 0, 0) scaleX(${w.toFixed(4)})` }} />;
        })}
      </div>
    </div>
  );
}

export function Calculator() {
  const [valores, setValores] = useState<Entradas>(valoresEjemplo);
  const [tab, setTab] = useState(grupos[0].id);
  const [periodo, setPeriodo] = useState<"anual" | "mensual">("anual");
  const supuestos = useMemo(() => valoresSupuestos(), []);
  const r = useMemo(() => calcular(valores, supuestos), [valores, supuestos]);
  const div = periodo === "mensual" ? 12 : 1;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Resumen para lectores de pantalla, sin repetir en cada paso del deslizador.
  const [anuncio, setAnuncio] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setAnuncio(`${T.ahorro}: ${formatoEuros(r.ahorro / div)} ${periodo === "anual" ? T.porAno : T.porMes}.`), 900);
    return () => clearTimeout(t);
  }, [r.ahorro, div, periodo]);

  const set = (k: keyof Entradas) => (v: number) => setValores((s) => ({ ...s, [k]: v }));
  const tabIndex = grupos.findIndex((g) => g.id === tab);
  const onTabKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const next = (tabIndex + d + grupos.length) % grupos.length;
    setTab(grupos[next].id);
    tabRefs.current[next]?.focus();
  };

  const max = Math.max(r.actual.total, r.conIntacta.total);
  const ahorroPositivo = r.ahorro >= 0;

  return (
    <div className="calc-grid">
      <div className="calc-in">
        <div className="ctabs" role="tablist" aria-label="Datos del hotel" onKeyDown={onTabKey}>
          <span className="ctabs-pill" aria-hidden="true" style={{ transform: `translate3d(${tabIndex * 100}%, 0, 0)`, width: `${100 / grupos.length}%` }} />
          {grupos.map((g, i) => (
            <button
              key={g.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`ctab-${g.id}`}
              aria-selected={tab === g.id}
              aria-controls={`cpanel-${g.id}`}
              tabIndex={tab === g.id ? 0 : -1}
              onClick={() => setTab(g.id)}
            >
              {g.titulo}
            </button>
          ))}
        </div>
        {grupos.map((g) => (
          <div key={g.id} role="tabpanel" id={`cpanel-${g.id}`} aria-labelledby={`ctab-${g.id}`} hidden={tab !== g.id} className="cpanel">
            {g.campos.map((k) => (
              <Field key={k} id={`c-${k}`} def={defs[k]} value={valores[k]} onChange={set(k)} />
            ))}
          </div>
        ))}
      </div>

      <div className="calc-out">
        <Segmented label="Periodo" value={periodo} onChange={setPeriodo} options={[{ value: "anual", label: T.periodo.anual }, { value: "mensual", label: T.periodo.mensual }]} />

        <div className="calc-total">
          <span className="mono eyebrow">{T.ahorro}</span>
          <strong className={`calc-big${ahorroPositivo ? "" : " neg"}`}>
            <Money value={r.ahorro / div} />
          </strong>
          <span className="calc-per">{periodo === "anual" ? T.porAno : T.porMes}</span>
        </div>

        <div className="calc-compare">
          <span>
            {T.hoy} <Money value={r.actual.total / div} className="strike" />
          </span>
          <span className="g">
            {T.con} <Money value={r.conIntacta.total / div} />
          </span>
        </div>

        <div className="cbars">
          <Bar label={T.hoy} d={r.actual} max={max} total={r.actual.total / div} />
          <Bar label={T.con} d={r.conIntacta} max={max} total={r.conIntacta.total / div} />
          <ul className="clegend">
            {PARTIDAS.map((k) => (
              <li key={k}>
                <i className={`seg-${k}`} aria-hidden="true" />
                {T.partidas[k]}
              </li>
            ))}
          </ul>
        </div>

        <table className="ctable">
          <caption className="sr-only">Desglose del coste {periodo === "anual" ? "anual" : "mensual"}</caption>
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Partida</span>
              </th>
              <th scope="col">{T.hoy}</th>
              <th scope="col">{T.con}</th>
            </tr>
          </thead>
          <tbody>
            {PARTIDAS.map((k) => (
              <tr key={k}>
                <th scope="row">{T.partidas[k]}</th>
                <td>{formatoEuros(r.actual[k] / div)}</td>
                <td>{formatoEuros(r.conIntacta[k] / div)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ckpis">
          <div>
            <dt>{T.retorno}</dt>
            <dd>{r.roi === null ? "—" : `${formatoNumero(Math.round(r.roi * 100))} %`}</dd>
          </div>
          <div>
            <dt>{T.recuperas}</dt>
            <dd>{r.mesesRecuperacion === null ? T.noRecupera : `${formatoNumero(Math.round(r.mesesRecuperacion * 10) / 10)} ${T.meses}`}</dd>
          </div>
          <div>
            <dt>{T.diasFuera}</dt>
            <dd>
              {formatoNumero(Math.round(r.diasFuera.actual))} → <span className="g">{formatoNumero(Math.round(r.diasFuera.conIntacta))}</span>
            </dd>
          </div>
        </dl>

        <a
          className="btn btn-primary js-cta calc-cta"
          data-cta="calculadora"
          href="#piloto"
          onClick={() => guardarEstimacion({ entradas: valores, resultado: r, usadaEn: new Date().toISOString() })}
        >
          {T.cta}
        </a>
        <p className="calc-note" role="note">
          {T.aviso}
        </p>
        <details className="calc-sup">
          <summary>{T.supuestosTitulo}</summary>
          <ul>
            {Object.values(supuestosIntacta).map((s) => (
              <li key={s.etiqueta}>
                {s.etiqueta}: <b>{`${formatoNumero(s.valor)} ${s.unidad}`.trim()}</b>
                {s.pendiente && <span className="pend"> · pendiente</span>}
              </li>
            ))}
          </ul>
          <p>{T.supuestosNota}</p>
        </details>
        <p className="sr-only" aria-live="polite">
          {anuncio}
        </p>
      </div>
    </div>
  );
}
