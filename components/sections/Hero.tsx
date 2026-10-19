import { Fragment } from "react";
import { cta, portada } from "@/content/textos";
import { Drops } from "../motion/Drops";
import { Stamp } from "../motion/Stamp";

/** Letras sueltas para el efecto de proximidad (cada letra se ensancha cerca del cursor). */
function Letters({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i, all) => (
        <Fragment key={i}>
          <span className="w">
            {[...w].map((c, k) => (
              <span key={k} className="vp">
                {c}
              </span>
            ))}
          </span>
          {i < all.length - 1 && " "}
        </Fragment>
      ))}
    </>
  );
}

export function Hero() {
  return (
    <section className="hero" aria-label="INTACTA">
      <Drops variant="scroll" />
      <h1 className="display hero-type">
        <span className="sr-only">{portada.titular.join(" ")}</span>
        <span className="ln" aria-hidden="true">
          <span>
            <Letters text={portada.titular[0]} />
          </span>
        </span>
        <span className="ln" aria-hidden="true">
          <span className="g">
            <Letters text={portada.titular[1]} />
          </span>
        </span>
      </h1>
      <Stamp />
      <div className="hero-foot">
        <div className="hero-copy">
          <span className="mono eyebrow">{portada.antetitulo}</span>
          <p>
            {portada.texto} <em>{portada.textoSuave}</em>
          </p>
          <div className="ctas">
            <a className="btn btn-primary js-cta" data-cta="portada" href="#piloto">
              {cta.principal}
            </a>
            <a className="btn btn-ghost" href="#specs">
              {cta.secundario}
            </a>
          </div>
        </div>
        <div className="hint mono" aria-hidden="true">
          <i />
          {portada.desliza}
        </div>
      </div>
    </section>
  );
}
