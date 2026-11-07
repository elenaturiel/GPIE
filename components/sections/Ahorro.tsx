import { ahorro } from "@/content/textos";
import { Fold } from "../motion/Fold";

/**
 * Segunda puerta falsa: un botón muy grande «¿Quieres calcular cuánto vas a ahorrar?». No hay
 * calculadora (no hay datos reales todavía): el botón abre la ventana para dejar los datos, y en el
 * panel esas solicitudes salen marcadas como «Calcular ahorro».
 */
export function Ahorro() {
  return (
    <section className="sec ahorro" id="ahorro" data-pose="ahorro" aria-labelledby="ahorro-t">
      <div className="slot" aria-hidden="true" />
      <div className="wrap">
        <div className="side-l blk">
          <span className="mono kicker" data-reveal>
            {ahorro.antetitulo}
          </span>
          <Fold text={ahorro.titular} id="ahorro-t" className="h2" />
          <p className="intro" data-reveal>
            {ahorro.texto}
          </p>
          <div data-reveal>
            <a className="btn btn-primary btn-mega js-cta" data-cta="ahorro" href="#piloto">
              <span>{ahorro.boton}</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="1em" height="1em">
                <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
