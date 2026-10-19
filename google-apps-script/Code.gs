/**
 * INTACTA — guarda las solicitudes de piloto de la web en esta hoja y te avisa por email.
 *
 * Instalación (una sola vez, con la cuenta de Google del proyecto):
 *  1. Crea una hoja de cálculo nueva (p. ej. "INTACTA · Solicitudes de piloto").
 *  2. Menú Extensiones → Apps Script. Borra lo que haya y pega este archivo entero. Guarda.
 *  3. Configuración del proyecto (⚙️) → Propiedades de la secuencia de comandos → Añadir:
 *       SECRET        = una clave larga inventada (la misma que pondrás en Vercel)
 *       NOTIFY_EMAIL  = el email que recibe los avisos (si no lo pones, va a la cuenta dueña del script)
 *  4. Implementar → Nueva implementación → Tipo: Aplicación web.
 *     Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario → Implementar → Autorizar.
 *  5. Copia la URL que acaba en /exec y ponla en Vercel como GOOGLE_SHEETS_WEBHOOK_URL.
 *  6. (Plazo de conservación) Activadores (⏰) → Añadir activador → función purgarAntiguas,
 *     según tiempo, cada día. Borra las solicitudes de más de 12 meses salvo las que tengan
 *     "MANTENER" en la columna Estado (p. ej. hoteles que están en el piloto).
 *
 * Si cambias el código: Implementar → Gestionar implementaciones → editar → Versión nueva
 * (así la URL /exec no cambia).
 */

var SHEET_NAME = 'Solicitudes'
var CONSERVAR_MESES = 12

// Columnas que llegan de la web (en este orden; deben coincidir con COLUMNAS en lib/lead/sheets.ts).
var FIELDS = [
  'fecha', 'nombre', 'cargo', 'hotel', 'ciudad', 'habitaciones', 'email', 'telefono',
  'acepta_comunicaciones', 'origen_cta', 'utm_source', 'utm_medium', 'utm_campaign',
  'calc_habitaciones', 'calc_piezas', 'calc_ahorro_anual', 'calc_coste_actual', 'calc_coste_intacta', 'calc_entradas',
  'consentimiento_fecha', 'consentimiento_version', 'consentimiento_texto',
]
var HEADERS = [
  'Fecha', 'Nombre', 'Cargo', 'Hotel', 'Ciudad', 'Habitaciones', 'Email', 'Teléfono',
  'Acepta comunicaciones', 'Botón de origen', 'UTM source', 'UTM medium', 'UTM campaign',
  'Calc: habitaciones', 'Calc: piezas', 'Calc: ahorro anual (€)', 'Calc: coste actual (€)', 'Calc: coste con INTACTA (€)', 'Calc: datos usados',
  'Consentimiento: fecha', 'Consentimiento: versión', 'Consentimiento: texto aceptado',
  'Estado', // la rellenas tú: contactado, en piloto, MANTENER…
]

function doPost(e) {
  var body
  try {
    body = JSON.parse(e.postData.contents)
  } catch (err) {
    return json_({ ok: false, error: 'bad json' })
  }
  var props = PropertiesService.getScriptProperties()
  var secret = props.getProperty('SECRET')
  if (!secret || body.secret !== secret) return json_({ ok: false, error: 'unauthorized' })

  var row = body.row || {}
  var lock = LockService.getScriptLock()
  lock.waitLock(10000) // evita filas pisadas si llegan dos envíos a la vez
  try {
    var values = FIELDS.map(function (f) {
      return row[f] == null ? '' : String(row[f])
    })
    values.push('') // Estado
    getSheet_().appendRow(values)
  } finally {
    lock.releaseLock()
  }

  try {
    avisar_(row, props.getProperty('NOTIFY_EMAIL') || Session.getEffectiveUser().getEmail())
  } catch (err) {
    // la fila ya está guardada: un fallo del email no debe perder la solicitud
    console.error('Aviso por email: ' + err)
  }
  return json_({ ok: true })
}

// Para comprobar en el navegador que la URL funciona.
function doGet() {
  return json_({ ok: true, service: 'INTACTA · solicitudes de piloto' })
}

function avisar_(row, to) {
  if (!to) return
  // en la hoja un apóstrofo inicial evita que «+34…» o «=…» se lean como fórmula; en el email sobra
  var r = {}
  Object.keys(row).forEach(function (k) {
    r[k] = String(row[k] == null ? '' : row[k]).replace(/^'/, '')
  })
  row = r
  var lineas = [
    'Nueva solicitud de piloto desde la web de INTACTA.',
    '',
    'Nombre: ' + row.nombre,
    'Cargo: ' + (row.cargo || '—'),
    'Hotel: ' + row.hotel + ' (' + row.ciudad + ')',
    'Habitaciones: ' + row.habitaciones,
    'Email: ' + row.email,
    'Teléfono: ' + (row.telefono || '—'),
    'Acepta comunicaciones comerciales: ' + row.acepta_comunicaciones,
    'Botón de origen: ' + row.origen_cta,
  ]
  if (row.calc_ahorro_anual) lineas.push('Calculadora: ahorro estimado ' + row.calc_ahorro_anual + ' €/año con ' + row.calc_habitaciones + ' habitaciones (valores de ejemplo)')
  lineas.push('', 'Recuerda: le hemos dicho que le escribimos en 48 horas.', SpreadsheetApp.getActiveSpreadsheet().getUrl())
  MailApp.sendEmail({ to: to, subject: 'INTACTA · Nueva solicitud: ' + row.hotel, body: lineas.join('\n'), replyTo: row.email })
}

/** Borra las solicitudes de más de CONSERVAR_MESES salvo las marcadas "MANTENER" en Estado. */
function purgarAntiguas() {
  var sheet = getSheet_()
  var last = sheet.getLastRow()
  if (last < 2) return
  var limite = new Date()
  limite.setMonth(limite.getMonth() - CONSERVAR_MESES)
  var data = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues()
  for (var i = data.length - 1; i >= 0; i--) {
    var fecha = new Date(data[i][0])
    var estado = String(data[i][HEADERS.length - 1] || '').toUpperCase()
    if (!isNaN(fecha) && fecha < limite && estado.indexOf('MANTENER') === -1) sheet.deleteRow(i + 2)
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  return sheet
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
