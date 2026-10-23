import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BadgeDificultad from './BadgeDificultad.jsx'
import { formatearPrecio } from '../lib/formato.js'

// `variants` permite que el grid padre anime las tarjetas en cascada (stagger).
const aparecer = {
  oculto: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export default function BonsaiCard({ bonsai }) {
  return (
    <motion.li variants={aparecer} whileHover={{ y: -4 }} transition={{ duration: 0.25 }}>
      <Link
        to={`/bonsai/${bonsai.id}`}
        className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition-shadow hover:shadow-lg"
      >
        <div className="aspect-square overflow-hidden bg-musgo-50">
          <img
            src={bonsai.imagen_url}
            alt={bonsai.nombre}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="space-y-2 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-xl text-musgo-900">{bonsai.nombre}</h3>
            <BadgeDificultad dificultad={bonsai.dificultad} />
          </div>
          <p className="text-sm italic text-stone-500">{bonsai.especie}</p>
          <p className="pt-1 font-medium text-tierra-600">{formatearPrecio(bonsai.precio)}</p>
        </div>
      </Link>
    </motion.li>
  )
}
