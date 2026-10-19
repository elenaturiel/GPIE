import type { Rich as RichText } from "@/content/textos";

/** Pinta un texto con trozos en verde ({ g }) o en negrita ({ b }). */
export function Rich({ text }: { text: RichText }) {
  return (
    <>
      {text.map((part, i) =>
        typeof part === "string" ? (
          part
        ) : "g" in part ? (
          <span key={i} className="g">
            {part.g}
          </span>
        ) : (
          <b key={i}>{part.b}</b>
        ),
      )}
    </>
  );
}
