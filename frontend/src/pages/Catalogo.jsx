import { motion } from 'framer-motion'
import Pagina from '../components/Pagina.jsx'
import BonsaiCard from '../components/BonsaiCard.jsx'
import { MensajeError, SkeletonTarjetas } from '../components/Estados.jsx'
import { useApi } from '../hooks/useApi.js'

const grid = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function Catalogo() {
  const { datos: bonsais, cargando, error, reintentar } = useApi('/api/bonsais')

  return (
    <Pagina className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="mb-12 max-w-2xl">
        <h1 className="font-serif text-4xl text-musgo-900 sm:text-5xl">Catálogo</h1>
        <p className="mt-4 text-stone-600">
          Todos nuestros bonsáis disponibles hoy. La etiqueta de cada uno te dice qué tanto cuidado pide.
        </p>
      </header>

      {cargando && <SkeletonTarjetas />}
      {error && <MensajeError mensaje={error.message} onReintentar={reintentar} />}
      {bonsais?.length === 0 && (
        <p className="py-16 text-center text-stone-500">
          En este momento no hay bonsáis disponibles. Vuelve pronto: el vivero siempre está creciendo.
        </p>
      )}
      {bonsais?.length > 0 && (
        <motion.ul variants={grid} initial="oculto" animate="visible" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bonsais.map((b) => <BonsaiCard key={b.id} bonsai={b} />)}
        </motion.ul>
      )}
    </Pagina>
  )
}
