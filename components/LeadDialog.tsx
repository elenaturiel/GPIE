"use client";

import { useEffect, useRef, useState } from "react";
import { formulario as F } from "@/content/textos";
import { Rich } from "./Rich";
import { LeadForm } from "./LeadForm";

/**
 * Ventana con el formulario del piloto. La abren los botones de solicitar piloto que están lejos del
 * formulario (cabecera, portada, tras la demo, calculadora): así no hay que atravesar toda la página.
 * Es un <dialog> nativo (foco atrapado, Esc para cerrar). Sin JS, esos botones bajan a #piloto.
 */
export function LeadDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const [origen, setOrigen] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>("a.js-cta[data-cta]");
      if (!a || a.dataset.cta === "piloto" || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      setOrigen(a.dataset.cta ?? "desconocido");
      setKey((k) => k + 1); // formulario nuevo cada vez que se abre
      ref.current?.showModal();
      window.dispatchEvent(new Event("intacta:modal-open"));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      className="lead-dialog"
      aria-labelledby="dlg-t"
      onClose={() => window.dispatchEvent(new Event("intacta:modal-close"))}
      onClick={(e) => e.target === ref.current && close()} // clic en el fondo
    >
      <div className="dlg-body">
        <button type="button" className="dlg-x" onClick={close} aria-label={F.cerrar}>
          <span aria-hidden="true">×</span>
        </button>
        <h2 className="display dlg-t" id="dlg-t">
          <Rich text={F.titularModal} />
        </h2>
        {origen && <LeadForm key={key} origen={origen} onDone={close} />}
      </div>
    </dialog>
  );
}
