/**
 * Apariciones al hacer scroll, con un único IntersectionObserver para toda la página.
 *
 * - [data-reveal]          el elemento aparece al entrar en pantalla (el CSS define cómo).
 * - [data-reveal-stagger]  sus hijos aparecen uno tras otro (--i, 70 ms entre cada uno).
 *
 * Se anima una sola vez: repetirlo cada vez que pasa por pantalla sería pelearse con quien lee.
 * Lo que ya está a la vista al cargar se muestra sin animar. Sin JS no se oculta nada (el CSS solo
 * esconde con html.reveal-on).
 */
export function startReveal(): () => void {
  const root = document.documentElement;
  const els = [...document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-stagger]")];
  els.forEach((el) => {
    if (el.hasAttribute("data-reveal-stagger")) [...el.children].forEach((c, i) => (c as HTMLElement).style.setProperty("--i", String(i)));
  });

  const vh = innerHeight;
  const instant: HTMLElement[] = [];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) instant.push(el);
  }
  instant.forEach((el) => el.setAttribute("data-visible", ""));
  root.classList.add("reveal-on");

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.setAttribute("data-visible", "");
        io.unobserve(e.target);
      }
    },
    // se dispara un poco antes de que el elemento esté del todo dentro
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
  );
  els.filter((el) => !instant.includes(el)).forEach((el) => io.observe(el));

  return () => {
    io.disconnect();
    root.classList.remove("reveal-on");
  };
}
