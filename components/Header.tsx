import { cta, marca } from "@/content/textos";

export function Header() {
  return (
    <header className="nav">
      <div className="wrap">
        <a className="brand" href="#top" aria-label={`${marca.nombre}, ir al inicio`}>
          <b>{marca.nombre}</b>
          <span className="mono">{marca.apellido}</span>
        </a>
        <a className="btn btn-primary js-cta" data-cta="cabecera" href="#piloto">
          {cta.cabecera}
        </a>
      </div>
    </header>
  );
}
