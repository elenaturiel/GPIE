"use client";

import { useState } from "react";
import type { Entrada } from "@/config/calculadora";
import { formatoNumero } from "@/lib/calculadora/calculo";

/** Un dato del hotel: deslizador + campo numérico sincronizados (el campo admite escribir libre). */
export function Field({ id, def, value, onChange }: { id: string; def: Entrada; value: number; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = (raw: string) => {
    const v = Number(raw.replace(",", "."));
    if (raw.trim() !== "" && Number.isFinite(v)) onChange(Math.min(def.max, Math.max(def.min, v)));
    setDraft(null);
  };
  const fill = ((value - def.min) / (def.max - def.min)) * 100;
  return (
    <div className="cf">
      <div className="cf-head">
        <label htmlFor={`${id}-n`}>{def.etiqueta}</label>
        <span className="cf-num">
          <input
            id={`${id}-n`}
            type="text"
            inputMode="decimal"
            value={draft ?? formatoNumero(value)}
            aria-describedby={def.ayuda ? `${id}-h` : undefined}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit((e.target as HTMLInputElement).value)}
          />
          {def.unidad && <span aria-hidden="true">{def.unidad}</span>}
        </span>
      </div>
      {def.ayuda && (
        <p className="cf-help" id={`${id}-h`}>
          {def.ayuda}
        </p>
      )}
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.paso}
        value={value}
        aria-label={def.etiqueta}
        aria-valuetext={`${formatoNumero(value)} ${def.unidad}`.trim()}
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
