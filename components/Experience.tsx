"use client";

import { useEffect } from "react";
import { startExperience } from "@/lib/experience/engine";

/** Monta la coreografía del bote y la demo sobre el HTML del servidor. */
export function Experience() {
  useEffect(() => startExperience(), []);
  return null;
}
