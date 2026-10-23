import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { conJson, pedirApi } from '../lib/api.js'

const SALUDO = {
  rol: 'asistente',
  texto: '¡Hola! Soy el asesor de Raíz 🌿 Cuéntame cuánta luz tienes en casa o cuánto tiempo puedes dedicarle, y te ayudo a elegir tu bonsái.',
}

const SUGERENCIAS = [
  'Soy principiante, ¿cuál me recomiendas?',
  'Vivo en apartamento con poca luz',
  '¿Cada cuánto riego un Ficus?',
]

// La API key de la IA NO está aquí: este componente solo habla con nuestro
// backend (/api/asistente), que es quien llama a Gemini con la key guardada.
export default function Asistente() {
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([SALUDO])
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const finRef = useRef(null)

  // Cada mensaje nuevo desplaza la conversación hasta el final.
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, pensando])

  // El asistente es para clientes: no aparece en el panel de administración.
  if (pathname.startsWith('/admin')) return null

  const preguntar = async (pregunta) => {
    const limpia = pregunta.trim()
    if (!limpia || pensando) return

    // El saludo no se envía como historial: es un texto fijo del frontend.
    const historial = mensajes.filter((m) => m !== SALUDO && !m.error)
    setMensajes((ms) => [...ms, { rol: 'usuario', texto: limpia }])
    setTexto('')
    setPensando(true)

    try {
      const { respuesta } = await pedirApi('/api/asistente', conJson('POST', { mensaje: limpia, historial }))
      setMensajes((ms) => [...ms, { rol: 'asistente', texto: respuesta }])
    } catch (err) {
      // El backend ya devuelve un mensaje amable; se muestra como burbuja de error.
      setMensajes((ms) => [...ms, { rol: 'asistente', texto: err.message, error: true }])
    } finally {
      setPensando(false)
    }
  }

  const enviar = (e) => {
    e.preventDefault()
    preguntar(texto)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {abierto && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            aria-label="Asesor de bonsáis"
            className="flex h-[min(32rem,calc(100dvh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-stone-200 sm:w-96"
          >
            <header className="bg-musgo-900 px-5 py-4 text-white">
              <p className="font-serif text-lg">Asesor de Raíz</p>
              <p className="text-xs text-musgo-100/80">Recomendaciones con nuestro catálogo real</p>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {mensajes.map((m, i) => (
                <p
                  key={i}
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2 text-sm ${
                    m.rol === 'usuario'
                      ? 'ml-auto rounded-br-sm bg-musgo-800 text-white'
                      : m.error
                        ? 'rounded-bl-sm bg-red-50 text-red-800'
                        : 'rounded-bl-sm bg-musgo-50 text-stone-800'
                  }`}
                >
                  {m.texto}
                </p>
              ))}

              {/* Sugerencias solo al inicio, para que nadie se quede sin saber qué preguntar. */}
              {mensajes.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGERENCIAS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => preguntar(s)}
                      className="rounded-full px-3 py-1 text-xs text-musgo-800 ring-1 ring-musgo-600/40 hover:bg-musgo-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {pensando && (
                <p className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-musgo-50 px-4 py-3" role="status" aria-label="Pensando">
                  {[0, 1, 2].map((n) => (
                    <motion.span
                      key={n}
                      className="h-2 w-2 rounded-full bg-musgo-600"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: n * 0.2 }}
                    />
                  ))}
                  <span className="ml-2 text-xs text-stone-500">pensando…</span>
                </p>
              )}
              <div ref={finRef} />
            </div>

            <form onSubmit={enviar} className="flex gap-2 border-t border-stone-200 p-3">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe tu pregunta…"
                maxLength={500}
                aria-label="Tu pregunta"
                className="flex-1 rounded-full border border-stone-300 px-4 py-2 text-sm outline-none focus:border-musgo-600 focus:ring-2 focus:ring-musgo-100"
              />
              <button
                type="submit"
                disabled={pensando || !texto.trim()}
                className="rounded-full bg-musgo-800 px-4 py-2 text-sm text-white hover:bg-musgo-700 disabled:opacity-50"
              >
                Enviar
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={abierto ? 'Cerrar asesor' : 'Abrir asesor de bonsáis'}
        aria-expanded={abierto}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-musgo-800 text-2xl text-white shadow-lg hover:bg-musgo-700"
      >
        {abierto ? '×' : '🌿'}
      </motion.button>
    </div>
  )
}
