"use client";

import { useEffect } from "react";
import { startExperience } from "@/lib/experience/engine";
import { startMagnetic } from "@/lib/experience/magnetic";
import { startProximity } from "@/lib/experience/proximity";
import { startReveal } from "@/lib/experience/reveal";

/** Monta la coreografía del bote, la demo y las microinteracciones sobre el HTML del servidor. */
export function Experience() {
  useEffect(() => {
    // la experiencia va primero: decide qué titulares dispara el scroll en vez del reveal
    const stops = [startExperience(), startReveal(), startProximity(), startMagnetic()];
    return () => stops.forEach((stop) => stop());
  }, []);
  return null;
}
