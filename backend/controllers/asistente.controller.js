import { pool } from '../db/pool.js'
import { DIFICULTAD, LUZ } from '../lib/etiquetas.js'

// DECISIÓN DE SEGURIDAD: la API key de Gemini vive SOLO aquí, en el backend
// (variable de entorno). Si estuviera en el frontend, cualquiera podría verla
// en las herramientas del navegador y gastar nuestra cuota. El navegador habla
// con nuestro backend, y solo el backend habla con Gemini.
const API_KEY = process.env.GEMINI_API_KEY
// Modelos configurables por si Google retira uno: se cambian en el .env, no en el código.
// Si el principal está saturado (algo frecuente en el plan gratis), se intenta
// con el de respaldo antes de darle al usuario el mensaje de falla.
const MODELOS = [
  process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  process.env.GEMINI_MODEL_RESPALDO || 'gemini-flash-lite-latest',
]
const urlModelo = (modelo) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`

// Errores temporales de Google en los que vale la pena probar otro modelo:
// 429 cuota/límite, 500 error interno, 503 "alta demanda".
const ERRORES_REINTENTABLES = [429, 500, 503]

const MAX_MENSAJE = 500
// Solo los últimos turnos: suficiente para que la conversación tenga contexto
// sin mandar (y pagar) textos cada vez más largos.
const MAX_HISTORIAL = 10
// Por intento. Con dos modelos, el peor caso queda por debajo de ~25 s,
// lo que el usuario aguanta viendo "pensando…".
const TIEMPO_LIMITE_MS = 12000

const RESPUESTA_FALLA =
  'Uy, nuestro asesor está regando el vivero y no pudo responderte. ' +
  'Intenta de nuevo en un momento o escríbenos desde la página de contacto.'

// El catálogo se lee de la base en CADA pregunta: si el admin agrega, edita
// u oculta un bonsái, la IA lo sabe de inmediato, sin tocar código.
async function catalogoParaPrompt() {
  const { rows } = await pool.query(
    `select nombre, especie, descripcion, precio, edad_anios, dificultad, luz, frecuencia_riego
     from bonsais where disponible = true order by precio`,
  )
  if (rows.length === 0) return '(Hoy no hay bonsáis disponibles.)'

  return rows
    .map((b) =>
      `- ${b.nombre} (${b.especie}): $${b.precio.toLocaleString('es-CO')} COP. ` +
      `Dificultad ${DIFICULTAD[b.dificultad] ?? b.dificultad}. ${LUZ[b.luz] ?? b.luz}. ` +
      `Riego ${b.frecuencia_riego}.${b.edad_anios ? ` Edad ~${b.edad_anios} años.` : ''} ${b.descripcion}`,
    )
    .join('\n')
}

function promptSistema(catalogo) {
  return `Eres el asesor virtual de "Raíz", un vivero colombiano especializado
en bonsáis. Tu tono es cercano, paciente y sin tecnicismos innecesarios.
Hablas como alguien que ama las plantas, no como un vendedor.

CATÁLOGO DISPONIBLE HOY:
${catalogo}

REGLAS:
- Solo recomienda bonsáis que estén en el catálogo de arriba.
- Si ninguno encaja con lo que pide, dilo con honestidad y sugiere
  lo más cercano explicando la diferencia.
- Si pregunta por cuidados, responde con consejos concretos y breves.
- Máximo 4 frases por respuesta.
- Nunca inventes precios ni especies que no estén en el catálogo.
- Responde en español de Colombia (sin modismos de otros países),
  en texto plano, sin formato markdown.
- Si te preguntan algo que no tiene que ver con bonsáis, plantas o el
  vivero, redirige la conversación con amabilidad.`
}

// Convierte el historial del frontend al formato de Gemini, descartando
// cualquier entrada mal formada (el historial viene del cliente: no se confía en él).
function historialGemini(historial) {
  if (!Array.isArray(historial)) return []
  return historial
    .filter((t) => (t?.rol === 'usuario' || t?.rol === 'asistente') && typeof t.texto === 'string' && t.texto.trim())
    .slice(-MAX_HISTORIAL)
    .map((t) => ({
      role: t.rol === 'usuario' ? 'user' : 'model',
      parts: [{ text: t.texto.slice(0, 1000) }],
    }))
}

// Una llamada a un modelo concreto. Devuelve el texto o lanza un error
// marcado como `reintentable` si vale la pena probar con otro modelo.
async function llamarGemini(modelo, cuerpo) {
  let respuesta
  try {
    respuesta = await fetch(urlModelo(modelo), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
      body: JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(TIEMPO_LIMITE_MS),
    })
  } catch (error) {
    // Tiempo agotado o fallo de red: otro modelo podría responder.
    throw Object.assign(new Error(`${modelo}: ${error.message}`), { reintentable: true })
  }

  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    throw Object.assign(
      new Error(`${modelo} ${respuesta.status}: ${datos?.error?.message ?? 'sin detalle'}`),
      { reintentable: ERRORES_REINTENTABLES.includes(respuesta.status) },
    )
  }

  const texto = datos?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim()
  if (!texto) throw new Error(`${modelo} no devolvió texto (finishReason: ${datos?.candidates?.[0]?.finishReason})`)
  return texto
}

export async function preguntarAsistente(req, res) {
  const mensaje = typeof req.body?.mensaje === 'string' ? req.body.mensaje.trim() : ''

  if (!mensaje) return res.status(400).json({ error: 'Escribe tu pregunta' })
  if (mensaje.length > MAX_MENSAJE) {
    return res.status(400).json({ error: `Tu pregunta es muy larga (máximo ${MAX_MENSAJE} caracteres)` })
  }

  if (!API_KEY) {
    console.error('Falta GEMINI_API_KEY en el .env')
    return res.status(503).json({ error: RESPUESTA_FALLA })
  }

  // Cualquier falla de la IA (red, cuota agotada, modelo caído, tiempo agotado)
  // termina en un mensaje amable. El resto de la app sigue funcionando.
  try {
    const catalogo = await catalogoParaPrompt()
    const cuerpo = {
      systemInstruction: { parts: [{ text: promptSistema(catalogo) }] },
      contents: [...historialGemini(req.body.historial), { role: 'user', parts: [{ text: mensaje }] }],
      // Temperatura moderada: natural al hablar, pero sin "creatividad" con los datos.
      generationConfig: { temperature: 0.6, maxOutputTokens: 400 },
    }

    let ultimoError
    for (const modelo of MODELOS) {
      try {
        return res.json({ respuesta: await llamarGemini(modelo, cuerpo) })
      } catch (error) {
        ultimoError = error
        console.error('Error del asistente:', error.message)
        // Errores permanentes (key inválida, petición mal formada): no tiene
        // sentido probar otro modelo, fallarían igual.
        if (!error.reintentable) break
      }
    }
    throw ultimoError
  } catch (error) {
    // Falló la base o todos los modelos. El detalle técnico queda en los logs;
    // al usuario solo le llega el mensaje amable.
    console.error('Asistente sin respuesta:', error.message)
    res.status(503).json({ error: RESPUESTA_FALLA })
  }
}
