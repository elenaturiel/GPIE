import { useSyncExternalStore } from "react";
import type { Entradas } from "@/config/calculadora";
import type { Resultado } from "./calculo";

/**
 * Lo que el hotel ha calculado, para precargar el formulario del piloto.
 * Vive solo en memoria (ni cookies ni almacenamiento del navegador): si recarga, se pierde.
 */
export type Estimacion = { entradas: Entradas; resultado: Resultado; usadaEn: string };

let actual: Estimacion | null = null;
const listeners = new Set<() => void>();

export function guardarEstimacion(e: Estimacion) {
  actual = e;
  listeners.forEach((l) => l());
}

export function borrarEstimacion() {
  actual = null;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useEstimacion() {
  return useSyncExternalStore(
    subscribe,
    () => actual,
    () => null,
  );
}
