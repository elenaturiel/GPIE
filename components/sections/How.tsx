import { comoFunciona } from "@/content/textos";
import { Fold } from "../motion/Fold";

/** Corte del tejido: tres filas de fibras; sin tratar el líquido se mete, tratada la gota queda encima. */
function Fibers({ treated }: { treated: boolean }) {
  const t = comoFunciona;
  const id = treated ? "gb1" : "gb0";
  const fibers: { cx: number; cy: number }[] = [];
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < 10; i++) {
      const cx = 26 + i * 32 + (row % 2 ? 16 : 0);
      if (cx <= 330) fibers.push({ cx, cy: 138 + row * 28 });
    }
  return (
    <svg viewBox="0 0 340 230" role="img" aria-label={treated ? t.tratada.aria : t.sinTratar.aria}>
      <defs>
        <radialGradient id={id} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#D2465E" />
          <stop offset=".55" stopColor="#8A1830" />
          <stop offset="1" stopColor="#3D0714" />
        </radialGradient>
      </defs>
      {!treated && <path className="soak" d="M60 118 C110 112 230 112 280 118 L300 210 L40 210 Z" />}
      {fibers.map(({ cx, cy }) => (
        <g key={`${cx}-${cy}`}>
          <circle className="fiber" cx={cx} cy={cy} r={14} />
          <circle className="fiber-core" cx={cx + 3} cy={cy + 3} r={6.3} />
          {treated && <circle className="coat" cx={cx} cy={cy} r={17} />}
        </g>
      ))}
      {treated ? (
        <>
          <ellipse cx="172" cy="122" rx="30" ry="5" fill="#0F3B2C" opacity=".18" />
          <circle cx="170" cy="86" r="34" fill={`url(#${id})`} />
          <ellipse cx="158" cy="72" rx="9" ry="5" fill="#fff" opacity=".9" transform="rotate(-30 158 72)" />
          <text className="svg-label" x="216" y="58">
            {t.tratada.etiqueta}
          </text>
          <text className="svg-label" x="18" y="226">
            {t.tratada.capa}
          </text>
        </>
      ) : (
        <>
          <ellipse cx="170" cy="112" rx="96" ry="9" fill="#8A1830" opacity=".85" />
          <text className="svg-label" x="18" y="40">
            {t.sinTratar.etiqueta}
          </text>
        </>
      )}
    </svg>
  );
}

export function How() {
  const c = comoFunciona;
  return (
    <section className="sec" data-pose="how" aria-labelledby="how-t">
      <div className="slot" aria-hidden="true" />
      <div className="wrap">
        <div className="side-r blk">
          <span className="mono kicker" data-reveal>{c.antetitulo}</span>
          <Fold text={c.titular} id="how-t" className="h2" />
          <p className="intro" data-reveal>{c.intro}</p>
          <div className="how" data-reveal-stagger>
            {[c.sinTratar, c.tratada].map((f, i) => (
              <figure key={f.titulo} className="fig">
                <Fibers treated={i === 1} />
                <figcaption>
                  <b>{f.titulo}</b>
                  <span>{f.texto}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
