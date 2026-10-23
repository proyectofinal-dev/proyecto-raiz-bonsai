import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Pagina from '../components/Pagina.jsx'
import { useApi } from '../hooks/useApi.js'
import { pedirApi } from '../lib/api.js'

// Mismas reglas que valida el backend. Se repiten aquí para dar respuesta
// inmediata al usuario, pero el backend sigue siendo la validación que cuenta:
// cualquiera puede saltarse el frontend y enviar peticiones directamente.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_MENSAJE = 2000

function validar(form) {
  const errores = {}
  if (!form.nombre.trim()) errores.nombre = 'Cuéntanos cómo te llamas'
  if (!form.email.trim()) errores.email = 'Necesitamos un email para responderte'
  else if (!EMAIL_REGEX.test(form.email.trim())) errores.email = 'Revisa el email, parece incompleto'
  if (!form.mensaje.trim()) errores.mensaje = 'Escribe tu mensaje'
  else if (form.mensaje.length > MAX_MENSAJE) errores.mensaje = `Máximo ${MAX_MENSAJE} caracteres`
  return errores
}

const claseCampo = (conError) =>
  `mt-1 w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:ring-2 ${
    conError ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:border-musgo-600 focus:ring-musgo-100'
  }`

function Campo({ id, etiqueta, error, opcional, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-musgo-900">
        {etiqueta} {opcional && <span className="font-normal text-stone-400">(opcional)</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  )
}

export default function Contacto() {
  // ?bonsai=Ficus%20Retusa llega desde el botón "Me interesa" del detalle.
  const [params] = useSearchParams()
  const bonsaiInicial = params.get('bonsai') ?? ''

  // El catálogo alimenta el selector de interés. Si falla, el formulario
  // sigue funcionando: el selector solo pierde opciones, no bloquea el envío.
  const { datos: bonsais } = useApi('/api/bonsais')

  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', bonsai_interes: bonsaiInicial, mensaje: '',
  })
  const [errores, setErrores] = useState({})
  const [estado, setEstado] = useState('editando') // editando | enviando | enviado
  const [errorEnvio, setErrorEnvio] = useState(null)

  const cambiar = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    // El error de un campo desaparece apenas el usuario lo corrige.
    if (errores[name]) setErrores((er) => ({ ...er, [name]: undefined }))
  }

  const enviar = async (e) => {
    e.preventDefault()
    const encontrados = validar(form)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setEstado('enviando')
    setErrorEnvio(null)
    try {
      await pedirApi('/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setEstado('enviado')
    } catch (err) {
      // Si el backend rechazó campos concretos (400), se marcan en el formulario.
      if (err.campos) setErrores(err.campos)
      setErrorEnvio(err.message)
      setEstado('editando')
    }
  }

  const reiniciar = () => {
    setForm({ nombre: '', email: '', telefono: '', bonsai_interes: '', mensaje: '' })
    setEstado('editando')
  }

  // Opciones del selector: el catálogo, más el bonsái precargado aunque ya no
  // esté disponible (para no perder el dato si viene de un enlace viejo).
  const nombres = bonsais?.map((b) => b.nombre) ?? []
  if (bonsaiInicial && !nombres.includes(bonsaiInicial)) nombres.unshift(bonsaiInicial)

  const enviando = estado === 'enviando'

  return (
    <Pagina className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-5">
      <header className="md:col-span-2">
        <h1 className="font-serif text-4xl text-musgo-900 sm:text-5xl">Hablemos</h1>
        <p className="mt-4 text-stone-600">
          ¿Te interesa un bonsái, tienes dudas de cuidado o quieres visitarnos?
          Escríbenos y te respondemos en menos de un día hábil.
        </p>
      </header>

      <div className="md:col-span-3">
        <AnimatePresence mode="wait">
          {estado === 'enviado' ? (
            <motion.div
              key="exito"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl bg-musgo-50 p-10 text-center ring-1 ring-musgo-100"
              role="status"
            >
              <p className="font-serif text-3xl text-musgo-900">¡Mensaje recibido!</p>
              <p className="mt-3 text-stone-600">
                Gracias, {form.nombre.trim().split(' ')[0]}. Te escribiremos a <strong>{form.email.trim()}</strong> muy pronto.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/catalogo" className="rounded-full bg-musgo-800 px-6 py-3 text-white hover:bg-musgo-700">
                  Seguir viendo bonsáis
                </Link>
                <button type="button" onClick={reiniciar} className="rounded-full px-6 py-3 text-musgo-800 ring-1 ring-musgo-600 hover:bg-white">
                  Enviar otro mensaje
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="formulario"
              exit={{ opacity: 0 }}
              onSubmit={enviar}
              noValidate
              className="space-y-5 rounded-3xl bg-white p-6 ring-1 ring-stone-200 sm:p-10"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo id="nombre" etiqueta="Nombre" error={errores.nombre}>
                  <input id="nombre" name="nombre" value={form.nombre} onChange={cambiar} autoComplete="name"
                    aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? 'nombre-error' : undefined}
                    className={claseCampo(errores.nombre)} />
                </Campo>
                <Campo id="telefono" etiqueta="Teléfono" opcional>
                  <input id="telefono" name="telefono" type="tel" value={form.telefono} onChange={cambiar}
                    autoComplete="tel" className={claseCampo(false)} />
                </Campo>
              </div>

              <Campo id="email" etiqueta="Email" error={errores.email}>
                <input id="email" name="email" type="email" value={form.email} onChange={cambiar} autoComplete="email"
                  aria-invalid={!!errores.email} aria-describedby={errores.email ? 'email-error' : undefined}
                  className={claseCampo(errores.email)} />
              </Campo>

              <Campo id="bonsai_interes" etiqueta="Bonsái que te interesa" opcional>
                <select id="bonsai_interes" name="bonsai_interes" value={form.bonsai_interes} onChange={cambiar}
                  className={claseCampo(false)}>
                  <option value="">Ninguno en particular</option>
                  {nombres.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Campo>

              <Campo id="mensaje" etiqueta="Mensaje" error={errores.mensaje}>
                <textarea id="mensaje" name="mensaje" rows={5} value={form.mensaje} onChange={cambiar}
                  aria-invalid={!!errores.mensaje} aria-describedby={errores.mensaje ? 'mensaje-error' : undefined}
                  className={claseCampo(errores.mensaje)} />
              </Campo>

              {errorEnvio && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{errorEnvio}</p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-musgo-800 px-6 py-3 text-white transition-colors hover:bg-musgo-700 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
              >
                {enviando && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                {enviando ? 'Enviando…' : 'Enviar mensaje'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Pagina>
  )
}
