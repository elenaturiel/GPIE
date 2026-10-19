import { dondeSeUsa } from "@/content/textos";
import { Rich } from "../Rich";

export function Where() {
  const d = dondeSeUsa;
  return (
    <section className="sec" data-pose="where" aria-labelledby="where-t">
      <div className="slot" aria-hidden="true" />
      <div className="wrap">
        <div className="side-l blk">
          <span className="mono kicker">{d.antetitulo}</span>
          <h2 className="display h2" id="where-t">
            <Rich text={d.titular} />
          </h2>
          <ul className="where">
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
