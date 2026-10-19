import { pasosPiloto } from "@/content/textos";

/**
 * Lista grande fija con scroll: la sección mide varias pantallas y su escenario se queda quieto; la
 * línea en foco se rellena y las demás quedan en contorno, más pequeñas y desplazadas. Lo mueve
 * lib/experience/scroll-effects.ts. Sin JS o con movimiento reducido es una lista normal.
 */
export function Steps() {
  const p = pasosPiloto;
  return (
    <section className="steps" data-pose="steps" aria-labelledby="steps-t" style={{ "--n": p.pasos.length } as React.CSSProperties}>
      <div className="slot" aria-hidden="true" />
      <div className="steps-stage">
        <div className="wrap">
          <h2 className="mono kicker" id="steps-t">
            {p.antetitulo}
          </h2>
          <ol className="steps-list">
            {p.pasos.map((s, i) => (
              <li key={s.titulo} className="step">
                <span className="step-n mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="step-t display">{s.titulo}</span>
                <span className="step-d">{s.texto}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
