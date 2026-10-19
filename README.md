# INTACTA · web del pretotipo

Landing para medir el interés de hoteles en un piloto de INTACTA (antimanchas textil con tecnología Tecnan).
Proyecto GPIE · Universidad de Navarra.

> README provisional (fases 0–1). La versión completa —contactos, métricas, cookies, calculadora— llega en la fase 7.

## Arrancar en local

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # tests unitarios (Vitest)
npm run lint && npm run typecheck
```

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Todos los textos de la web (y de la etiqueta del bote 3D) | `content/textos.ts` — las líneas marcadas `TECNAN` o `PILOTO` están pendientes de confirmar |
| Supuestos de la calculadora (pendientes) | `config/calculadora.ts` |
| Poses del bote según el scroll | `lib/experience/poses.ts` |
| Demo de la butaca (canvas 2D) | `lib/experience/stain-demo.ts` |
| Bote 3D (Three.js) | `lib/experience/bottle/` |
| Cabeceras de seguridad y CSP | `lib/security.ts`, `proxy.ts` |
| Estilos | `app/globals.css` |
| Prototipo original de referencia | `intacta-landing.html` |

## Imagen del bote

`public/img/bote-intacta*.webp` se genera desde el propio 3D: abre `/?poster` (fondo transparente, bote centrado),
haz una captura sin fondo y recórtala centrada en el eje del bote. Esa imagen se ve mientras carga el 3D, si el
dispositivo no tiene WebGL y con «reducir movimiento».

Para ver el 3D en un equipo sin GPU (que normalmente usaría la imagen): `/?3d=force`.
