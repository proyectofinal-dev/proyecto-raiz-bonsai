import { useState } from 'react'
import BadgeDificultad from '../BadgeDificultad.jsx'
import { MensajeError, Spinner } from '../Estados.jsx'
import FormBonsai from './FormBonsai.jsx'
import { useApi } from '../../hooks/useApi.js'
import { pedirAdmin } from '../../lib/api.js'
import { formatearPrecio } from '../../lib/formato.js'

export default function SeccionBonsais() {
  // Ruta privada: incluye los no disponibles, que el catálogo público oculta.
  const { datos: bonsais, error, reintentar } = useApi('/api/bonsais/admin', pedirAdmin)
  // null = formulario cerrado · 'nuevo' = creando · objeto = editando ese bonsái
  const [enFormulario, setEnFormulario] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)

  const alGuardar = () => {
    setEnFormulario(null)
    reintentar()
  }

  const eliminar = async (bonsai) => {
    // Borrar no se puede deshacer; si solo está agotado, mejor desmarcar "disponible".
    if (!window.confirm(`¿Eliminar "${bonsai.nombre}" definitivamente?\nSi solo está agotado, puedes editarlo y desmarcar "Disponible".`)) return
    setEliminando(bonsai.id)
    setErrorAccion(null)
    try {
      await pedirAdmin(`/api/bonsais/${bonsai.id}`, { method: 'DELETE' })
      reintentar()
    } catch (err) {
      setErrorAccion(err.message)
    } finally {
      setEliminando(null)
    }
  }

  if (error && !bonsais) return <MensajeError mensaje={error.message} onReintentar={reintentar} />
  if (!bonsais) return <Spinner texto="Cargando bonsáis…" />

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-stone-500">{bonsais.length} bonsáis en total</p>
        {!enFormulario && (
          <button type="button" onClick={() => setEnFormulario('nuevo')} className="rounded-full bg-musgo-800 px-5 py-2 text-sm text-white hover:bg-musgo-700">
            + Nuevo bonsái
          </button>
        )}
      </div>

      {enFormulario && (
        <FormBonsai
          // key: al pasar de editar un bonsái a otro, el formulario se reinicia con sus datos.
          key={enFormulario === 'nuevo' ? 'nuevo' : enFormulario.id}
          bonsai={enFormulario === 'nuevo' ? null : enFormulario}
          onGuardado={alGuardar}
          onCancelar={() => setEnFormulario(null)}
        />
      )}

      {errorAccion && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{errorAccion}</p>}

      {/* overflow-x-auto: en móvil la tabla se desplaza de lado en vez de romper la página. */}
      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-stone-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Bonsái</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Dificultad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {bonsais.map((b) => (
              <tr key={b.id} className={eliminando === b.id ? 'opacity-50' : ''}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={b.imagen_url} alt="" className="h-10 w-10 rounded-lg bg-musgo-50 object-cover" />
                    <div>
                      <p className="font-medium text-musgo-900">{b.nombre}</p>
                      <p className="text-xs italic text-stone-500">{b.especie}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{formatearPrecio(b.precio)}</td>
                <td className="px-4 py-3"><BadgeDificultad dificultad={b.dificultad} /></td>
                <td className="px-4 py-3">
                  {b.disponible
                    ? <span className="text-musgo-700">Disponible</span>
                    : <span className="text-stone-400">Oculto</span>}
                </td>
                <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                  <button type="button" onClick={() => setEnFormulario(b)} className="text-musgo-700 hover:underline">Editar</button>
                  <button type="button" onClick={() => eliminar(b)} disabled={eliminando === b.id} className="text-red-700 hover:underline">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
