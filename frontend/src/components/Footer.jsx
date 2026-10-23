import { Link } from 'react-router-dom'

// Se calcula una vez al cargar la app, no en cada render.
const ANIO = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="mt-24 bg-musgo-900 text-musgo-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-serif text-2xl text-white">Raíz</p>
          <p className="mt-2 text-sm text-musgo-100/80">Bonsáis cultivados con paciencia en Colombia.</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          <Link to="/" className="hover:text-white">Inicio</Link>
          <Link to="/catalogo" className="hover:text-white">Catálogo</Link>
        </nav>
        <p className="text-sm text-musgo-100/80 sm:text-right">
          © {ANIO} Raíz · Vivero de bonsáis
        </p>
      </div>
    </footer>
  )
}
