# INTACTA · web del pretotipo

Landing para medir el interés en un piloto de INTACTA, antimanchas textil para cualquier tapicería: hoteles, alojamientos
turísticos, VTC y taxis, hostelería, comercios, oficinas y casas.
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
| Poses del bote según el scroll | `lib/experience/poses.ts` |
| Demo de la butaca (canvas 2D) | `lib/experience/stain-demo.ts` |
| Bote 3D (Three.js) | `lib/experience/bottle/` |
| Cabeceras de seguridad y CSP | `lib/security.ts`, `proxy.ts` |
| Estilos | `app/globals.css` |
| Formulario: textos | `content/textos.ts` (`formulario`) |
| Titular, primera capa de privacidad y casillas | `content/legal.ts` (⚠️ titular pendiente) |
| Prototipo original de referencia | `intacta-landing.html` |

## Imagen del bote

`public/img/bote-intacta*.webp` se genera desde el propio 3D: abre `/?poster` (fondo transparente, bote centrado),
haz una captura sin fondo y recórtala centrada en el eje del bote. Esa imagen se ve mientras carga el 3D, si el
dispositivo no tiene WebGL y con «reducir movimiento».

Para ver el 3D en un equipo sin GPU (que normalmente usaría la imagen): `/?3d=force`.

## Puerta falsa, interesados y panel

Hay **dos puertas falsas**. Al pulsarlas se cuenta el interés y se abre una ventana que dice, sin rodeos, que aquello
está en preparación y que quien quiera puede ser de los primeros dejando sus datos:

- **Prueba piloto**: todos los botones «Solicitar piloto» (cabecera, portada, tras la demo, sección piloto).
- **Calcular ahorro**: el botón grande «¿Quieres calcular cuánto vas a ahorrar?». No hay calculadora (no hay datos
  reales todavía); los textos están en `content/textos.ts` (`ahorro` y `formulario`).

Los datos de las dos llegan al mismo sitio, marcados con su puerta.

- **Interesados** (lo que dejan en el formulario) → almacenamiento privado de la web en **Vercel Blob**.
- **Contadores del embudo** (visitas, clics por puerta y por botón, formularios empezados, datos enviados) → el mismo
  almacén, como totales por día, **sin datos personales ni cookies**.
- Todo se ve en **`/panel`** (en tu dominio de Vercel), con contraseña: embudo y tasas de conversión, lista de
  interesados con su puerta falsa y filtros, **Descargar CSV** y **Borrar** (si alguien pide que borres sus datos).
  Los interesados se borran solos a los 12 meses.

### Puesta en marcha en Vercel (una vez, ~5 minutos, gratis en el plan Hobby)

1. Proyecto en Vercel → pestaña **Storage** → **Create** → **Blob** → acceso **Private** → región **Frankfurt (fra1)** →
   conéctalo al proyecto (Vercel pone solo las credenciales).
2. **Settings → Environment Variables** → añade `PANEL_PASSWORD` con una contraseña larga.
3. **Deployments → Redeploy**.
4. Entra en `https://TU-DOMINIO.vercel.app/panel` con esa contraseña.

**Límites del plan gratuito de Vercel Blob:** 1 GB y 2.000 escrituras al mes. Si se superan no se paga nada, pero
Vercel bloquea el almacén 30 días. Para no acercarse: cada solicitud es una sola escritura; los contadores se guardan
agrupados (al llegar una solicitud o, como mucho, cada 30 minutos) y tienen un tope de 1.200 escrituras al mes, que
deja sitio de sobra para los interesados. Por eso visitas y clics son cifras aproximadas. El panel avisa si se llega
al tope (`lib/metrics/stats.ts`).

Para probar en local sin Vercel: `STORE=memory PANEL_PASSWORD=prueba npm run dev` (los datos se pierden al parar).

**Si un contacto pide sus datos o que los borres:** en `/panel`, descarga el CSV (acceso / portabilidad) o pulsa
«Borrar» en su fila (supresión). Cada interesado guarda la fecha, la versión y el texto exacto del consentimiento.
