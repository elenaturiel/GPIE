# INTACTA · web del pretotipo

Landing para medir el interés de hoteles en un piloto de INTACTA (antimanchas textil para hoteles).
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
| Formulario: textos | `content/textos.ts` (`formulario`) |
| Titular, primera capa de privacidad y casillas | `content/legal.ts` (⚠️ titular pendiente) |
| Calculadora: valores de ejemplo y supuestos | `config/calculadora.ts` (⚠️ supuestos pendientes) |
| Prototipo original de referencia | `intacta-landing.html` |

## Imagen del bote

`public/img/bote-intacta*.webp` se genera desde el propio 3D: abre `/?poster` (fondo transparente, bote centrado),
haz una captura sin fondo y recórtala centrada en el eje del bote. Esa imagen se ve mientras carga el 3D, si el
dispositivo no tiene WebGL y con «reducir movimiento».

Para ver el 3D en un equipo sin GPU (que normalmente usaría la imagen): `/?3d=force`.

## Puerta falsa, interesados y panel

Todos los botones «Solicitar piloto» son una **puerta falsa**: al pulsarlos se cuenta el interés y se abre una ventana
que dice, sin rodeos, que el piloto está en preparación y que quien quiera puede ser de los primeros dejando sus datos.

- **Interesados** (lo que dejan en el formulario) → base de datos de la web.
- **Contadores del embudo** (visitas, clics en «Solicitar piloto» por botón, formularios empezados, datos enviados,
  uso de la calculadora) → la misma base de datos, como totales por día, **sin datos personales ni cookies**.
- Todo se ve en **`/panel`** (en tu dominio de Vercel), con contraseña: embudo y tasas de conversión, lista de
  interesados, **Descargar CSV** y **Borrar** (si alguien pide que borres sus datos). Los interesados se borran solos
  a los 12 meses.

### Puesta en marcha en Vercel (una vez, ~5 minutos)

1. Proyecto en Vercel → pestaña **Storage** → **Create Database** → **Upstash for Redis** (plan gratuito) →
   región **Frankfurt (eu-central-1)** → conéctala al proyecto. Vercel añade solas las variables
   `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
2. **Settings → Environment Variables** → añade `PANEL_PASSWORD` con una contraseña larga.
3. **Deployments → Redeploy**.
4. Entra en `https://TU-DOMINIO.vercel.app/panel` con esa contraseña.

Para probar en local sin base de datos: `STORE=memory PANEL_PASSWORD=prueba npm run dev` (los datos se pierden al parar).

**Si un contacto pide sus datos o que los borres:** en `/panel`, descarga el CSV (acceso / portabilidad) o pulsa
«Borrar» en su fila (supresión). Cada interesado guarda la fecha, la versión y el texto exacto del consentimiento.
