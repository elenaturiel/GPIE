import { especificaciones } from "@/content/textos";
import { Fold } from "../motion/Fold";

const PLACES = ["r c1", "l c2", "r c3", "l c4"];

export function Specs() {
  const e = especificaciones;
  return (
    <section className="specs" id="specs" aria-labelledby="specs-t">
      <div className="sstage">
        <div className="stitle blk">
          <span className="mono kicker">{e.antetitulo}</span>
          <Fold text={e.titular} id="specs-t" className="h2" />
        </div>
        {e.puntos.map((p, i) => (
          <div key={p.titulo} className={`call ${PLACES[i]} blk`}>
            <span className="mono">{p.etiqueta}</span>
            <b>{p.titulo}</b>
            <p>{p.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
