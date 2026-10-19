/**
 * Capa fija del bote: el canvas 3D y su foto. La foto se ve al cargar (y sin WebGL o con
 * movimiento reducido); en cuanto el 3D pinta su primer fotograma, se funden.
 */
export function BottleLayer() {
  return (
    <>
      <canvas id="bottle" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element -- se mueve con CSS por píxeles; next/image no aporta aquí */}
      <img
        id="bottle-img"
        src="/img/bote-intacta.webp"
        srcSet="/img/bote-intacta-290.webp 290w, /img/bote-intacta.webp 580w"
        sizes="(max-width: 760px) 38vh, 45vh"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
      />
    </>
  );
}
