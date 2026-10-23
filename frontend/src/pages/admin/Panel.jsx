import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Pagina from '../../components/Pagina.jsx'
import SeccionBonsais from '../../components/admin/SeccionBonsais.jsx'
import SeccionMensajes from '../../components/admin/SeccionMensajes.jsx'
import { cerrarSesion, emailSesion } from '../../lib/auth.js'

const PESTANAS = [
  { id: 'bonsais', texto: 'Bonsáis' },
  { id: 'mensajes', texto: 'Mensajes' },
]

export default function Panel() {
  const navegar = useNavigate()
  const [pestana, setPestana] = useState('bonsais')

  const salir = () => {
    cerrarSesion()
    navegar('/admin/login', { replace: true })
  }

  return (
    <Pagina className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-musgo-900">Panel</h1>
          <p className="mt-1 text-sm text-stone-500">Sesión iniciada como {emailSesion()}</p>
        </div>
        <button type="button" onClick={salir} className="rounded-full px-5 py-2 text-sm text-stone-600 ring-1 ring-stone-300 hover:bg-white">
          Cerrar sesión
        </button>
      </header>

      <nav className="mb-8 flex gap-2 border-b border-stone-200" role="tablist">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestana === p.id}
            onClick={() => setPestana(p.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors ${
              pestana === p.id ? 'border-musgo-700 font-medium text-musgo-900' : 'border-transparent text-stone-500 hover:text-musgo-700'
            }`}
          >
            {p.texto}
          </button>
        ))}
      </nav>

      {pestana === 'bonsais' ? <SeccionBonsais /> : <SeccionMensajes />}
    </Pagina>
  )
}
