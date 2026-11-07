import { cta, piloto } from "@/content/textos";
import { Drops } from "../motion/Drops";
import { Fold } from "../motion/Fold";
import { RollingNumber } from "../motion/RollingNumber";

export function Pilot() {
  const p = piloto;
  return (
    <section className="sec pilot" id="piloto" data-pose="pilot" aria-labelledby="pilot-t">
      <Drops variant="float" />
      <div className="slot" aria-hidden="true" />
      <div className="wrap">
        <div className="side-l blk">
          <span className="mono kicker" data-reveal>
            {p.antetitulo}
          </span>
          <Fold text={p.titular} id="pilot-t" className="h2" />
          <ul className="nums">
            {p.cifras.map((c) => (
              <li key={c.texto} className="num">
                <RollingNumber value={c.valor} suffix={c.sufijo} />
                <span>{c.texto}</span>
              </li>
            ))}
          </ul>
          <p className="report" data-reveal>{p.informe}</p>
          <div className="formbox">
            <Fold as="h3" text={p.formTitular} />
            <p className="formbox-text" data-reveal>
              {p.formTexto}
            </p>
            <div data-reveal>
              <a className="btn btn-primary btn-xl js-cta" data-cta="piloto" href="#piloto">
                {cta.principal}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
