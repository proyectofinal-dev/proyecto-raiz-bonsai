import { useState } from 'react'
import { MensajeError, Spinner } from '../Estados.jsx'
import { useApi } from '../../hooks/useApi.js'
import { conJson, pedirAdmin } from '../../lib/api.js'

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

export default function SeccionMensajes() {
  const { datos: mensajes, error, reintentar } = useApi('/api/mensajes', pedirAdmin)
  const [actualizando, setActualizando] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)

  const cambiarLeido = async (mensaje) => {
    setActualizando(mensaje.id)
    setErrorAccion(null)
    try {
      await pedirAdmin(`/api/mensajes/${mensaje.id}`, conJson('PATCH', { leido: !mensaje.leido }))
      reintentar()
    } catch (err) {
      setErrorAccion(err.message)
    } finally {
      setActualizando(null)
    }
  }

  if (error && !mensajes) return <MensajeError mensaje={error.message} onReintentar={reintentar} />
  if (!mensajes) return <Spinner texto="Cargando mensajes…" />

  if (mensajes.length === 0) {
    return <p className="py-16 text-center text-stone-500">Todavía no han llegado mensajes desde el formulario de contacto.</p>
  }

  return (
    <section className="space-y-4">
      {errorAccion && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{errorAccion}</p>}

      <ul className="space-y-4">
        {mensajes.map((m) => (
          <li
            key={m.id}
            className={`rounded-2xl p-5 ring-1 transition-colors ${
              m.leido ? 'bg-stone-50 ring-stone-200' : 'bg-white ring-musgo-600/40'
            } ${actualizando === m.id ? 'opacity-60' : ''}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-musgo-900">
                  {!m.leido && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-musgo-600" aria-label="No leído" />}
                  {m.nombre}
                </p>
                <p className="text-sm text-stone-500">
                  <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a>
                  {m.telefono && <> · <a href={`tel:${m.telefono}`} className="hover:underline">{m.telefono}</a></>}
                </p>
              </div>
              <time className="text-xs text-stone-400" dateTime={m.creado_en}>{formatoFecha.format(new Date(m.creado_en))}</time>
            </div>

            {m.bonsai_interes && (
              <p className="mt-3 inline-block rounded-full bg-tierra-100 px-3 py-1 text-xs text-tierra-800">
                Interesado en: {m.bonsai_interes}
              </p>
            )}
            <p className="mt-3 whitespace-pre-line text-sm text-stone-700">{m.mensaje}</p>

            <button
              type="button"
              onClick={() => cambiarLeido(m)}
              disabled={actualizando === m.id}
              className="mt-4 text-sm text-musgo-700 hover:underline"
            >
              {m.leido ? 'Marcar como no leído' : 'Marcar como leído'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
