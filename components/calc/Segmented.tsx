"use client";

import { useId } from "react";

/**
 * Selector de dos o más opciones con una pastilla que se desliza a la elegida (transform, 250 ms).
 * Son radios nativos: se maneja con flechas y Tab como cualquier grupo de radio.
 */
export function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const name = useId();
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <fieldset className="seg" style={{ "--n": options.length } as React.CSSProperties}>
      <legend className="sr-only">{label}</legend>
      <span className="seg-thumb" aria-hidden="true" style={{ transform: `translate3d(${idx * 100}%, 0, 0)` }} />
      {options.map((o, i) => (
        <label key={o.value} className={i === idx ? "on" : undefined}>
          <input type="radio" name={name} value={o.value} checked={i === idx} onChange={() => onChange(o.value)} />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}
