import { motion } from 'framer-motion'

// Envoltorio de cada página: fade suave al entrar, igual en todas las vistas.
export default function Pagina({ children, className = '' }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.main>
  )
}
