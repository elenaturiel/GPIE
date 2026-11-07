"use client";

import { useState } from "react";
import { video } from "@/content/textos";
import { track } from "@/lib/metrics/track";

/**
 * Vídeo de YouTube que no carga nada de Google hasta que se pulsa: antes es solo una portada servida
 * desde esta web. Al pulsar se crea el reproductor de youtube-nocookie.com (sin cookies de seguimiento
 * hasta que se reproduce) y empieza solo. Así no hace falta pedir consentimiento de cookies para mostrarlo.
 */
export function VideoFacade() {
  const [activo, setActivo] = useState(false);
  const src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  return (
    <div className="vid">
      {activo ? (
        <iframe
          src={src}
          title={video.titulo}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          className="vid-poster"
          onClick={() => {
            setActivo(true);
            track("video");
          }}
          aria-label={`${video.reproducir}: ${video.titulo}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- portada local, tamaño fijo por CSS */}
          <img
            src="/img/video-intacta.webp"
            srcSet="/img/video-intacta-640.webp 640w, /img/video-intacta.webp 1280w"
            sizes="(max-width: 760px) 100vw, 1100px"
            alt=""
            loading="lazy"
            decoding="async"
            width={1280}
            height={720}
          />
          <span className="vid-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="vid-label mono" aria-hidden="true">
            {video.reproducir}
          </span>
        </button>
      )}
    </div>
  );
}
