import type { Rich } from "@/content/textos";

type Props = { text: Rich; as?: "h2" | "h3"; className?: string; id?: string };

const plain = (text: Rich) => text.map((p) => (typeof p === "string" ? p : "g" in p ? p.g : p.b)).join("");

/**
 * Titular que se despliega letra a letra al entrar en pantalla (cada letra gira desde su bisagra
 * superior). El texto real va aparte para lectores de pantalla; las letras animadas están ocultas
 * para ellos. La animación la arranca el reveal (data-reveal) y la define el CSS (.fold .ch).
 */
export function Fold({ text, as: Tag = "h2", className = "", id }: Props) {
  let i = 0;
  const chars = (s: string) =>
    s.split(/(\s+)/).map((word, w) =>
      /^\s+$/.test(word) ? (
        " "
      ) : word ? (
        <span key={w} className="w">
          {[...word].map((c, k) => (
            <span key={k} className="ch" style={{ "--i": i++ } as React.CSSProperties}>
              {c}
            </span>
          ))}
        </span>
      ) : null,
    );
  return (
    <Tag className={`display fold ${className}`} id={id} data-reveal="fold">
      <span className="sr-only">{plain(text)}</span>
      <span aria-hidden="true">
        {text.map((p, k) =>
          typeof p === "string" ? (
            <span key={k}>{chars(p)}</span>
          ) : "g" in p ? (
            <span key={k} className="g">
              {chars(p.g)}
            </span>
          ) : (
            <b key={k}>{chars(p.b)}</b>
          ),
        )}
      </span>
    </Tag>
  );
}
