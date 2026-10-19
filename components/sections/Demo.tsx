import { demo } from "@/content/textos";
import { Rich } from "../Rich";

export function Demo() {
  return (
    <section className="demo" id="demo" aria-label="Prueba con manchas reales">
      <div className="stage">
        <div className="stage-top blk">
          {demo.fases.map((f, i) => (
            <div key={f.paso} className={`ph${i === 0 ? " on" : ""}`}>
              <span className="mono">{f.paso}</span>
              <h2 className="display">
                <Rich text={f.titular} />
              </h2>
            </div>
          ))}
        </div>
        <div className="canvas-wrap">
          <canvas id="stain" role="img" aria-label={demo.etiquetaAria} />
        </div>
        <div className="stage-bot blk">
          <div className="caps">
            {demo.fases.map((f, i) => (
              <p key={f.paso} className={`cap${i === 0 ? " on" : ""}`}>
                <Rich text={f.pie} />
              </p>
            ))}
          </div>
          <div className="bar" aria-hidden="true">
            <i />
          </div>
        </div>
      </div>
    </section>
  );
}
