import { DIFICULTAD } from '../lib/formato.js'

export default function BadgeDificultad({ dificultad }) {
  const info = DIFICULTAD[dificultad] ?? { texto: dificultad, clases: 'bg-stone-100 text-stone-700' }
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${info.clases}`}>
      {info.texto}
    </span>
  )
}
