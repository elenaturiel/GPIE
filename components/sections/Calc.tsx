import { calculadora } from "@/content/textos";
import { Calculator } from "../calc/Calculator";
import { Fold } from "../motion/Fold";

export function Calc() {
  const c = calculadora;
  return (
    <section className="sec calc" id="calculadora" data-pose="calc" aria-labelledby="calc-t">
      <div className="wrap">
        <div className="blk">
          <span className="mono kicker" data-reveal>
            {c.antetitulo}
          </span>
          <Fold text={c.titular} id="calc-t" className="h2" />
          <p className="intro" data-reveal>
            {c.intro}
          </p>
          <div data-reveal>
            <Calculator />
          </div>
        </div>
      </div>
    </section>
  );
}
