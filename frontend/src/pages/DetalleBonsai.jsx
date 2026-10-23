import { Link, useParams } from 'react-router-dom'
import Pagina from '../components/Pagina.jsx'
import BadgeDificultad from '../components/BadgeDificultad.jsx'
import { MensajeError, Spinner } from '../components/Estados.jsx'
import { useApi } from '../hooks/useApi.js'
import { LUZ, formatearPrecio } from '../lib/formato.js'

export default function DetalleBonsai() {
  const { id } = useParams()
  const { datos: bonsai, cargando, error, reintentar } = useApi(`/api/bonsais/${id}`)

  if (cargando) return <Spinner texto="Buscando tu bonsái…" />

  if (error) {
    // Un 404 no se arregla reintentando: se ofrece volver al catálogo.
    const noExiste = error.status === 404 || error.status === 400
    return (
      <Pagina className="px-4 py-24">
        <MensajeError
          mensaje={noExiste ? 'Este bonsái no existe o ya no está en el vivero.' : error.message}
          onReintentar={noExiste ? undefined : reintentar}
        />
        <p className="mt-6 text-center">
          <Link to="/catalogo" className="text-musgo-700 hover:underline">← Volver al catálogo</Link>
        </p>
      </Pagina>
    )
  }

  const ficha = [
    { etiqueta: 'Edad aproximada', valor: bonsai.edad_anios ? `${bonsai.edad_anios} años` : '—' },
    { etiqueta: 'Luz', valor: LUZ[bonsai.luz] ?? bonsai.luz },
    { etiqueta: 'Riego', valor: bonsai.frecuencia_riego },
  ]

  return (
    <Pagina className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link to="/catalogo" className="text-sm text-musgo-700 hover:underline">← Catálogo</Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-musgo-50 ring-1 ring-stone-200">
          <img src={bonsai.imagen_url} alt={bonsai.nombre} className="aspect-square h-full w-full object-cover" />
        </div>

        <div className="flex flex-col">
          <BadgeDificultad dificultad={bonsai.dificultad} />
          <h1 className="mt-4 font-serif text-4xl text-musgo-900 sm:text-5xl">{bonsai.nombre}</h1>
          <p className="mt-2 italic text-stone-500">{bonsai.especie}</p>
          <p className="mt-6 text-3xl font-medium text-tierra-600">{formatearPrecio(bonsai.precio)}</p>
          {!bonsai.disponible && (
            <p className="mt-2 text-sm font-medium text-red-700">Agotado por ahora</p>
          )}
          <p className="mt-6 leading-relaxed text-stone-700">{bonsai.descripcion}</p>

          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-stone-200 pt-6">
            {ficha.map((f) => (
              <div key={f.etiqueta}>
                <dt className="text-xs uppercase tracking-wider text-stone-500">{f.etiqueta}</dt>
                <dd className="mt-1 font-medium text-musgo-900">{f.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Pagina>
  )
}
