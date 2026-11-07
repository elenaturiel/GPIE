"use client";

import { useActionState } from "react";
import { borrar, entrar } from "./actions";

export function Login() {
  const [error, action, pending] = useActionState(entrar, null);
  return (
    <form action={action} className="pnl-login">
      <label htmlFor="pnl-pw">Contraseña</label>
      <input id="pnl-pw" name="password" type="password" autoComplete="current-password" required autoFocus />
      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        Entrar
      </button>
    </form>
  );
}

/** Botón de borrar con confirmación (derecho de supresión). */
export function Borrar({ id, nombre }: { id: string; nombre: string }) {
  return (
    <form action={borrar} onSubmit={(e) => !confirm(`¿Borrar definitivamente a ${nombre}?`) && e.preventDefault()}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="pnl-del">
        Borrar
      </button>
    </form>
  );
}
