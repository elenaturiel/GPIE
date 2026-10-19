import { marca } from "@/content/textos";

export function Footer() {
  return (
    <footer>
      <div className="wrap mono">
        {marca.pie.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </footer>
  );
}
