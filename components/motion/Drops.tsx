/**
 * Gotitas decorativas «en bolitas» (como el líquido sobre tela tratada).
 * variant="scroll": se desplazan con el scroll de la portada (CSS animation-timeline, sin JS).
 * variant="float": flotan despacio en bucle (fondo del piloto).
 */
const SPOTS = {
  scroll: [
    { l: "38%", t: "9%", s: 14, c: "drift-up" },
    { l: "52%", t: "52%", s: 9, c: "drift-down" },
    { l: "6%", t: "56%", s: 11, c: "drift-up" },
    { l: "30%", t: "64%", s: 7, c: "drift-down" },
  ],
  float: [
    { l: "58%", t: "8%", s: 16, c: "float a" },
    { l: "88%", t: "22%", s: 10, c: "float b" },
    { l: "70%", t: "62%", s: 12, c: "float c" },
    { l: "94%", t: "78%", s: 8, c: "float a" },
    { l: "50%", t: "88%", s: 9, c: "float b" },
  ],
};

export function Drops({ variant }: { variant: keyof typeof SPOTS }) {
  return (
    <div className={`drops drops-${variant}`} aria-hidden="true">
      {SPOTS[variant].map((d, i) => (
        <i key={i} className={`drop ${d.c}`} style={{ left: d.l, top: d.t, width: d.s, height: d.s * 0.9 }} />
      ))}
    </div>
  );
}
