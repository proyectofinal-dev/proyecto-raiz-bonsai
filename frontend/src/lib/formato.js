// Etiquetas legibles para los valores que guarda la base (facil, sol_directo…).
// Centralizarlas evita escribir "Fácil" de tres formas distintas en la app.

const formatoPesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export const formatearPrecio = (precio) => formatoPesos.format(precio)

export const DIFICULTAD = {
  facil: { texto: 'Fácil', clases: 'bg-musgo-100 text-musgo-800' },
  media: { texto: 'Media', clases: 'bg-tierra-100 text-tierra-800' },
  dificil: { texto: 'Difícil', clases: 'bg-red-100 text-red-800' },
}

export const LUZ = {
  baja: 'Luz baja',
  media: 'Luz indirecta',
  sol_directo: 'Sol directo',
}
