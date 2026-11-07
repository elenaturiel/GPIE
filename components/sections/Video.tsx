import { video } from "@/content/textos";
import { Fold } from "../motion/Fold";
import { VideoFacade } from "../VideoFacade";

/** El vídeo de INTACTA, justo después de la demo animada. */
export function Video() {
  return (
    <section className="vsec" id="video" aria-labelledby="video-t">
      <div className="wrap">
        <span className="mono kicker" data-reveal>
          {video.antetitulo}
        </span>
        <Fold text={video.titular} id="video-t" className="h2" />
        <div data-reveal>
          <VideoFacade />
          <p className="vid-aviso">{video.aviso}</p>
        </div>
      </div>
    </section>
  );
}
