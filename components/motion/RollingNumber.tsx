const LAPS = 2; // vueltas completas de 0 a 9 antes de caer en la cifra
const COLUMN = Array.from({ length: 10 * (LAPS + 1) }, (_, i) => i % 10);

/**
 * Número que rueda cifra a cifra, como un cuentakilómetros, cuando su contenedor entra en pantalla
 * (data-reveal). Lo que se lee (lectores de pantalla, sin CSS, movimiento reducido) es el número final.
 */
export function RollingNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const digits = String(value).split("");
  return (
    <strong className="roll" data-reveal="roll">
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span aria-hidden="true" className="roll-digits">
        {digits.map((d, i) => (
          <span key={i} className="roll-d" style={{ "--to": 10 * LAPS + Number(d), "--n": i } as React.CSSProperties}>
            <span className="roll-final">{d}</span>
            <span className="roll-col">
              {COLUMN.map((n, k) => (
                <span key={k}>{n}</span>
              ))}
            </span>
          </span>
        ))}
        {suffix && <small>{suffix}</small>}
      </span>
    </strong>
  );
}
