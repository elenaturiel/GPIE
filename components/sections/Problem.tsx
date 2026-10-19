import { problema } from "@/content/textos";
import { Fold } from "../motion/Fold";

const n = (i: number) => String(i + 1).padStart(2, "0");

export function Problem() {
  const p = problema;
  return (
    <section className="sec" data-pose="problem" aria-labelledby="problem-t">
      <div className="slot" aria-hidden="true" />
      <div className="wrap">
        <div className="side-l blk">
          <span className="mono kicker" data-reveal>{p.antetitulo}</span>
          <Fold text={p.titular} id="problem-t" className="h2" />
          <p className="intro" data-reveal>{p.intro}</p>
          <div className="compare" data-reveal-stagger>
            <div className="col">
              <h3>
                {p.sin.titulo} <small>{p.sin.resumen}</small>
              </h3>
              <ol>
                {p.sin.pasos.map((s, i) => (
                  <li key={s}>
                    <span>{n(i)}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
            <div className="col after">
              <h3>
                {p.con.titulo} <small>{p.con.resumen}</small>
              </h3>
              <ol>
                {p.con.pasos.map((s, i) => (
                  <li key={s}>
                    <span>{n(i)}</span>
                    {s}
                  </li>
                ))}
                <li className="done">{p.con.final}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
