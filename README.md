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
| Formulario: textos | `content/textos.ts` (`formulario`) |
| Titular, primera capa de privacidad y casillas | `content/legal.ts` (⚠️ titular pendiente) |
| Calculadora: valores de ejemplo y supuestos | `config/calculadora.ts` (⚠️ supuestos pendientes) |
| Prototipo original de referencia | `intacta-landing.html` |

## Imagen del bote

`public/img/bote-intacta*.webp` se genera desde el propio 3D: abre `/?poster` (fondo transparente, bote centrado),
haz una captura sin fondo y recórtala centrada en el eje del bote. Esa imagen se ve mientras carga el 3D, si el
dispositivo no tiene WebGL y con «reducir movimiento».

Para ver el 3D en un equipo sin GPU (que normalmente usaría la imagen): `/?3d=force`.

## Solicitudes de piloto → Google Sheets

Cada solicitud se guarda como una fila en una hoja de Google Sheets y te llega un email de aviso. Lo hace un
Apps Script instalado en la hoja (`google-apps-script/Code.gs`); la web no habla con Google desde el navegador: el
servidor (`/api/lead`) valida los datos, frena bots y envíos repetidos, y reenvía la fila con una clave secreta.

1. Con la cuenta de Google del proyecto, crea una hoja de cálculo (p. ej. «INTACTA · Solicitudes de piloto»).
2. **Extensiones → Apps Script**, borra lo que haya y pega `google-apps-script/Code.gs`. Guarda.
3. **⚙️ Configuración del proyecto → Propiedades de la secuencia de comandos → Añadir**:
   - `SECRET` = una clave larga inventada
   - `NOTIFY_EMAIL` = el email que recibe los avisos (si no, va a la cuenta dueña del script)
4. **Implementar → Nueva implementación → Aplicación web** · Ejecutar como: *Yo* · Acceso: *Cualquier usuario* → Autorizar.
5. **Activadores (⏰) → Añadir activador** → `purgarAntiguas`, según tiempo, cada día (borra solicitudes de más de
   12 meses salvo las que tengan `MANTENER` en la columna *Estado*).
6. En Vercel → **Settings → Environment Variables**: `GOOGLE_SHEETS_WEBHOOK_URL` (la URL que acaba en `/exec`) y
   `GOOGLE_SHEETS_SECRET` (la misma clave del paso 3). Después, **Deployments → Redeploy**.

La primera solicitud crea la pestaña «Solicitudes» con las cabeceras. Si algo falla, el motivo queda en los logs de
la función en Vercel (`[lead] …`) y el formulario le dice al hotel que lo intente de nuevo.

**Si un contacto pide sus datos o que los borres:** búscalo en la hoja (Ctrl+F con su email), copia su fila
(acceso / portabilidad) o bórrala (supresión). La columna *Consentimiento* guarda la fecha, la versión y el texto
exacto que aceptó.
