// Estados de carga y error reutilizados por todas las vistas que llaman a la API.

// Esqueleto con la misma forma que BonsaiCard: la página no "salta" al llegar los datos.
export function SkeletonTarjetas({ cantidad = 6 }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cargando catálogo">
      {Array.from({ length: cantidad }, (_, i) => (
        <li key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
          <div className="aspect-square bg-stone-200" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 rounded bg-stone-200" />
            <div className="h-4 w-1/2 rounded bg-stone-200" />
            <div className="h-4 w-1/3 rounded bg-stone-200" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function Spinner({ texto = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-stone-500" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-musgo-100 border-t-musgo-700" />
      <span className="text-sm">{texto}</span>
    </div>
  )
}

export function MensajeError({ mensaje, onReintentar }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center ring-1 ring-red-200" role="alert">
      <p className="font-serif text-xl text-musgo-900">Algo no salió como esperábamos</p>
      <p className="mt-2 text-sm text-stone-600">{mensaje}</p>
      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className="mt-6 rounded-full bg-musgo-800 px-5 py-2 text-sm text-white transition-colors hover:bg-musgo-700"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}
