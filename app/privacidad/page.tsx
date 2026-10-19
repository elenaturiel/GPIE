import type { Metadata } from "next";
import Link from "next/link";
import { titular } from "@/content/legal";

export const metadata: Metadata = { title: "Política de privacidad · INTACTA", robots: { index: false } };

// ⚠️ BORRADOR: el texto completo (arts. 13 y 14 RGPD) se redacta en la fase 6 con los datos reales del titular.
export default function Privacidad() {
  return (
    <main className="legal wrap">
      <Link href="/" className="mono">
        ← Volver
      </Link>
      <h1 className="display">Política de privacidad</h1>
      <p>
        <b>Borrador.</b> La política de privacidad completa está en preparación. Mientras tanto, si has enviado tus datos o quieres ejercer tus
        derechos (acceso, rectificación, supresión, oposición, limitación y portabilidad), escribe a {titular.email}.
      </p>
      <p>Responsable: {titular.nombre}.</p>
    </main>
  );
}
