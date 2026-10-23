import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Pagina from '../../components/Pagina.jsx'
import { conJson, pedirApi } from '../../lib/api.js'
import { guardarSesion, obtenerToken } from '../../lib/auth.js'

export default function Login() {
  const navegar = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  // Si ya hay sesión, no tiene sentido mostrar el login.
  if (obtenerToken()) return <Navigate to="/admin" replace />

  const entrar = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Escribe tu email y tu contraseña')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const { token } = await pedirApi('/api/auth/login', conJson('POST', { email, password }))
      guardarSesion(token)
      navegar('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  const campo = 'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-musgo-600 focus:ring-2 focus:ring-musgo-100'

  return (
    <Pagina className="flex justify-center px-4 py-20">
      <form onSubmit={entrar} noValidate className="w-full max-w-sm space-y-5 rounded-3xl bg-white p-8 ring-1 ring-stone-200">
        <div>
          <h1 className="font-serif text-3xl text-musgo-900">Panel de Raíz</h1>
          <p className="mt-1 text-sm text-stone-500">Acceso solo para el equipo del vivero.</p>
        </div>

        <label className="block text-sm font-medium text-musgo-900">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" className={campo} />
        </label>
        <label className="block text-sm font-medium text-musgo-900">
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className={campo} />
        </label>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-musgo-800 py-3 text-white hover:bg-musgo-700 disabled:cursor-wait disabled:opacity-70"
        >
          {enviando && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </Pagina>
  )
}
