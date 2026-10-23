import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Pagina from '../components/Pagina.jsx'
import IlustracionBonsai from '../components/IlustracionBonsai.jsx'
import BonsaiCard from '../components/BonsaiCard.jsx'
import { MensajeError, SkeletonTarjetas } from '../components/Estados.jsx'
import { useApi } from '../hooks/useApi.js'

const VALORES = [
  {
    titulo: 'Cultivados aquí',
    texto: 'Cada árbol crece en nuestro vivero, adaptado al clima colombiano desde el primer brote.',
  },
  {
    titulo: 'Para cada ritmo',
    texto: 'Te decimos con honestidad cuánta luz, riego y tiempo necesita cada uno antes de llevártelo.',
  },
  {
    titulo: 'Te acompañamos',
    texto: 'Después de la compra seguimos ahí: resolvemos tus dudas de poda, riego y trasplante.',
  },
]

// Los hijos aparecen uno tras otro (stagger) cuando la sección entra en pantalla.
const contenedor = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export default function Home() {
  const { datos: bonsais, cargando, error, reintentar } = useApi('/api/bonsais')

  return (
    <Pagina>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-tierra-600">Vivero de bonsáis</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-musgo-900 sm:text-6xl">
            Paciencia que echa raíz.
          </h1>
          <p className="mt-6 max-w-md text-lg text-stone-600">
            Árboles en miniatura cultivados con calma, para que tengas un pedazo de bosque en casa.
          </p>
          <Link
            to="/catalogo"
            className="mt-8 inline-block rounded-full bg-musgo-800 px-7 py-3 text-white transition-colors hover:bg-musgo-700"
          >
            Ver catálogo
          </Link>
        </div>
        <IlustracionBonsai className="mx-auto w-full max-w-md" />
      </section>

      {/* Valores */}
      <motion.section
        variants={contenedor}
        initial="oculto"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-white py-16"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-3">
          {VALORES.map((v) => (
            <motion.div key={v.titulo} variants={{ oculto: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
              <div className="mb-4 h-1 w-10 rounded bg-tierra-500" />
              <h2 className="font-serif text-2xl text-musgo-900">{v.titulo}</h2>
              <p className="mt-3 text-stone-600">{v.texto}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Destacados: los tres más accesibles del catálogo real */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl text-musgo-900">Para empezar</h2>
          <Link to="/catalogo" className="text-sm text-musgo-700 hover:underline">Ver todos →</Link>
        </div>

        {cargando && <SkeletonTarjetas cantidad={3} />}
        {error && <MensajeError mensaje={error.message} onReintentar={reintentar} />}
        {bonsais && (
          <motion.ul variants={contenedor} initial="oculto" animate="visible" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bonsais.slice(0, 3).map((b) => <BonsaiCard key={b.id} bonsai={b} />)}
          </motion.ul>
        )}
      </section>
    </Pagina>
  )
}
