import { sello } from "@/content/textos";

/** Sello circular que gira despacio junto a la portada. Decorativo: lo mismo lo dice el botón. */
export function Stamp() {
  return (
    <div className="stamp" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs>
          <path id="stamp-circle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <circle cx="100" cy="100" r="97" className="stamp-bg" />
        <g className="stamp-ring">
          <text>
            <textPath href="#stamp-circle" textLength="462">
              {sello.repeat(2)}
            </textPath>
          </text>
        </g>
        <path className="stamp-drop" d="M100 62c6 16 24 28 24 46a24 24 0 0 1-48 0c0-18 18-30 24-46z" />
        <ellipse cx="92" cy="104" rx="5" ry="8" transform="rotate(-28 92 104)" fill="#fff" opacity=".85" />
      </svg>
    </div>
  );
}
