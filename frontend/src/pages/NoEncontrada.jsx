import { Link } from 'react-router-dom'
import Pagina from '../components/Pagina.jsx'

export default function NoEncontrada() {
  return (
    <Pagina className="px-4 py-32 text-center">
      <p className="font-serif text-6xl text-musgo-900">404</p>
      <p className="mt-4 text-stone-600">Esta página no ha brotado todavía.</p>
      <Link to="/" className="mt-8 inline-block text-musgo-700 hover:underline">Volver al inicio</Link>
    </Pagina>
  )
}
