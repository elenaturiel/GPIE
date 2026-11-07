import { dondeSeUsa } from "@/content/textos";

/** Dónde usaría INTACTA quien deja sus datos. Salen de «Dónde se usa», más «Otro». */
export const TIPOS = [...dondeSeUsa.lugares.map((l) => l.titulo), "Otro"];
