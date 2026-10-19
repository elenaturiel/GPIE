import { dondeSeUsa } from "@/content/textos";
import { Fold } from "../motion/Fold";

export function Where() {
  const d = dondeSeUsa;
  return (
    <section className="sec" data-pose="where" aria-labelledby="where-t">
      <div className="slot" aria-hidden="true" />
      <div className="wrap">
        <div className="side-l blk">
          <span className="mono kicker" data-reveal>{d.antetitulo}</span>
          <Fold text={d.titular} id="where-t" className="h2" />
          <ul className="where" data-reveal-stagger>
            {d.lugares.map((l) => (
              <li key={l.titulo} className="spot">
                <span className="mono">{l.zona}</span>
                <b>{l.titulo}</b>
                <p>{l.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
