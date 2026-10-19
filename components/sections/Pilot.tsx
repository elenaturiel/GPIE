import { piloto } from "@/content/textos";
import { LeadForm } from "../LeadForm";
import { Rich } from "../Rich";

export function Pilot() {
  const p = piloto;
  return (
    <section className="sec pilot" id="piloto" data-pose="pilot" aria-labelledby="pilot-t">
      <div className="slot" aria-hidden="true" />
      <div className="wrap">
        <div className="side-l blk">
          <span className="mono kicker">{p.antetitulo}</span>
          <h2 className="display h2" id="pilot-t">
            <Rich text={p.titular} />
          </h2>
          <ul className="nums">
            {p.cifras.map((c) => (
              <li key={c.texto} className="num">
                <strong>
                  {c.valor}
                  {c.sufijo && <small>{c.sufijo}</small>}
                </strong>
                <span>{c.texto}</span>
              </li>
            ))}
          </ul>
          <p className="report">{p.informe}</p>
          <div className="formbox">
            <h3 className="display">
              <Rich text={p.formTitular} />
            </h3>
            <LeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}
