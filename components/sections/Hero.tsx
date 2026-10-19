import { cta, portada } from "@/content/textos";

export function Hero() {
  return (
    <section className="hero" aria-label="INTACTA">
      <h1 className="display hero-type">
        <span className="ln">
          <span>{portada.titular[0]}</span>
        </span>
        <span className="ln">
          <span className="g">{portada.titular[1]}</span>
        </span>
      </h1>
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
