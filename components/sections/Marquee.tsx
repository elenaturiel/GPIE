import { cinta } from "@/content/textos";

/** Cinta de tipos de mancha que se desplaza sin fin (se para al pasar el ratón). */
export function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="mq-row" aria-hidden={hidden || undefined}>
      {cinta.map((t) => (
        <li key={t}>
          <span className="display">{t}</span>
          <i aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <section className="mq" aria-label="Manchas habituales en tapicería de hotel">
      <div className="mq-track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
