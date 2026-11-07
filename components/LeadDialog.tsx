"use client";

import { useEffect, useRef, useState } from "react";
import { formulario as F } from "@/content/textos";
import { track } from "@/lib/metrics/track";
import { Rich } from "./Rich";
import { LeadForm } from "./LeadForm";

/**
 * Puertas falsas del pretotipo. Los botones «Solicitar piloto» y el de «¿Quieres calcular cuánto vas a
 * ahorrar?» abren esta ventana: el clic se cuenta como interés (sin datos personales) y aquí se explica,
 * sin rodeos, que el piloto (o la calculadora) está en preparación y que quien quiera puede ser de los
 * primeros dejando sus datos. Todo llega al mismo sitio (/panel), marcado con su puerta.
 * Es un <dialog> nativo (foco atrapado, Esc para cerrar). Sin JS, los botones bajan a #piloto.
 */
export function LeadDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const [origen, setOrigen] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    track("visita");
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>("a.js-cta[data-cta]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      const o = a.dataset.cta ?? "piloto";
      track("cta", o);
      setOrigen(o);
      setKey((k) => k + 1); // formulario nuevo cada vez que se abre
      ref.current?.showModal();
      window.dispatchEvent(new Event("intacta:modal-open"));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const close = () => ref.current?.close();
  const esAhorro = origen === "ahorro";

  return (
    <dialog
      ref={ref}
      className="lead-dialog"
      aria-labelledby="dlg-t"
      aria-describedby="dlg-d"
      onClose={() => window.dispatchEvent(new Event("intacta:modal-close"))}
      onClick={(e) => e.target === ref.current && close()} // clic en el fondo
    >
      <div className="dlg-body">
        <button type="button" className="dlg-x" onClick={close} aria-label={F.cerrar}>
          <span aria-hidden="true">×</span>
        </button>
        <div className="dlg-head">
          <h2 className="display dlg-t" id="dlg-t">
            <Rich text={esAhorro ? F.titularAhorro : F.titularModal} />
          </h2>
          <p className="dlg-intro" id="dlg-d">
            {esAhorro ? F.introAhorro : F.introModal}
          </p>
        </div>
        {origen && <LeadForm key={key} origen={origen} onDone={close} />}
      </div>
    </dialog>
  );
}
