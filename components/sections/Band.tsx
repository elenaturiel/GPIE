import { banda, cta } from "@/content/textos";
import { Drops } from "../motion/Drops";
import { Fold } from "../motion/Fold";

/**
 * Banda verde que se abre a pantalla completa con el scroll (empieza como un marco redondeado en el
 * centro). El recorte (clip-path) lo mueve lib/experience/scroll-effects.ts.
 */
export function Band() {
  return (
    <section className="xp" aria-labelledby="band-t">
      <div className="xp-stage">
        <div className="xp-frame">
          <Drops variant="float" />
          <div className="xp-content wrap">
            <span className="mono kicker">{banda.antetitulo}</span>
            <Fold text={banda.titular} id="band-t" className="xp-title" />
            <p className="xp-text">{banda.texto}</p>
            <a className="btn btn-light js-cta" data-cta="tras-demo" href="#piloto">
              {cta.principal}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
