import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

const ENLACES = [
  { a: '/', texto: 'Inicio' },
  { a: '/catalogo', texto: 'Catálogo' },
]

const claseEnlace = ({ isActive }) =>
  `transition-colors hover:text-musgo-700 ${isActive ? 'text-musgo-800 font-medium' : 'text-stone-600'}`

export default function Navbar() {
  const [abierto, setAbierto] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-arena/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="font-serif text-2xl font-semibold tracking-tight text-musgo-900">
          Raíz
        </Link>

        <ul className="hidden gap-8 sm:flex">
          {ENLACES.map((e) => (
            <li key={e.a}>
              <NavLink to={e.a} end className={claseEnlace}>{e.texto}</NavLink>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="rounded-md p-2 text-musgo-900 sm:hidden"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {abierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      <AnimatePresence>
        {abierto && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-stone-200 px-4 sm:hidden"
          >
            {ENLACES.map((e) => (
              <li key={e.a}>
                {/* Al elegir un enlace en móvil, el menú se cierra solo. */}
                <NavLink
                  to={e.a}
                  end
                  onClick={() => setAbierto(false)}
                  className={(s) => `block py-3 ${claseEnlace(s)}`}
                >
                  {e.texto}
                </NavLink>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}
