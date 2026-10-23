import { useState } from 'react'
import { conJson, pedirAdmin } from '../../lib/api.js'
import { DIFICULTAD, LUZ } from '../../lib/formato.js'

const VACIO = {
  nombre: '', especie: '', descripcion: '', precio: '', edad_anios: '',
  dificultad: 'facil', luz: 'media', frecuencia_riego: '', imagen_url: '', disponible: true,
}

function ErrorCampo({ mensaje }) {
  return mensaje ? <span className="mt-1 block text-xs text-red-700">{mensaje}</span> : null
}

// Sirve para crear (sin `bonsai`) y para editar (con `bonsai`).
// La validación completa la hace el backend; aquí solo se muestran sus errores
// por campo, para no duplicar las reglas en dos lugares.
export default function FormBonsai({ bonsai, onGuardado, onCancelar }) {
  const editando = Boolean(bonsai)
  const [form, setForm] = useState(() =>
    editando ? { ...bonsai, edad_anios: bonsai.edad_anios ?? '', imagen_url: bonsai.imagen_url ?? '' } : VACIO,
  )
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrores({})
    setErrorGeneral(null)

    // Los inputs devuelven texto; el backend espera números en precio y edad.
    const cuerpo = {
      ...form,
      precio: form.precio === '' ? '' : Number(form.precio),
      edad_anios: form.edad_anios === '' ? null : Number(form.edad_anios),
    }

    try {
      const guardado = editando
        ? await pedirAdmin(`/api/bonsais/${bonsai.id}`, conJson('PUT', cuerpo))
        : await pedirAdmin('/api/bonsais', conJson('POST', cuerpo))
      onGuardado(guardado)
    } catch (err) {
      setErrores(err.campos ?? {})
      setErrorGeneral(err.message)
      setGuardando(false)
    }
  }

  const campo = (nombre) =>
    `mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-musgo-100 ${
      errores[nombre] ? 'border-red-400' : 'border-stone-300 focus:border-musgo-600'
    }`

  return (
    <form onSubmit={guardar} noValidate className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-stone-200">
      <h3 className="font-serif text-2xl text-musgo-900">{editando ? `Editar ${bonsai.nombre}` : 'Nuevo bonsái'}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-musgo-900">Nombre
          <input name="nombre" value={form.nombre} onChange={cambiar} className={campo('nombre')} /><ErrorCampo mensaje={errores.nombre} />
        </label>
        <label className="text-sm font-medium text-musgo-900">Especie (nombre científico)
          <input name="especie" value={form.especie} onChange={cambiar} className={campo('especie')} /><ErrorCampo mensaje={errores.especie} />
        </label>
      </div>

      <label className="block text-sm font-medium text-musgo-900">Descripción
        <textarea name="descripcion" rows={3} value={form.descripcion} onChange={cambiar} className={campo('descripcion')} /><ErrorCampo mensaje={errores.descripcion} />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-medium text-musgo-900">Precio (COP)
          <input name="precio" type="number" min="0" step="1000" value={form.precio} onChange={cambiar} className={campo('precio')} /><ErrorCampo mensaje={errores.precio} />
        </label>
        <label className="text-sm font-medium text-musgo-900">Edad (años)
          <input name="edad_anios" type="number" min="0" value={form.edad_anios} onChange={cambiar} className={campo('edad_anios')} /><ErrorCampo mensaje={errores.edad_anios} />
        </label>
        <label className="text-sm font-medium text-musgo-900">Riego
          <input name="frecuencia_riego" placeholder="cada 3 días" value={form.frecuencia_riego} onChange={cambiar} className={campo('frecuencia_riego')} /><ErrorCampo mensaje={errores.frecuencia_riego} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-musgo-900">Dificultad
          <select name="dificultad" value={form.dificultad} onChange={cambiar} className={campo('dificultad')}>
            {Object.entries(DIFICULTAD).map(([valor, { texto }]) => <option key={valor} value={valor}>{texto}</option>)}
          </select><ErrorCampo mensaje={errores.dificultad} />
        </label>
        <label className="text-sm font-medium text-musgo-900">Luz
          <select name="luz" value={form.luz} onChange={cambiar} className={campo('luz')}>
            {Object.entries(LUZ).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
          </select><ErrorCampo mensaje={errores.luz} />
        </label>
      </div>

      <label className="block text-sm font-medium text-musgo-900">URL de la imagen
        <input name="imagen_url" type="url" placeholder="https://…" value={form.imagen_url} onChange={cambiar} className={campo('imagen_url')} /><ErrorCampo mensaje={errores.imagen_url} />
      </label>

      <label className="flex items-center gap-2 text-sm text-musgo-900">
        <input name="disponible" type="checkbox" checked={form.disponible} onChange={cambiar} className="h-4 w-4 accent-musgo-700" />
        Disponible en el catálogo público
      </label>

      {errorGeneral && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{errorGeneral}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={guardando} className="rounded-full bg-musgo-800 px-5 py-2 text-sm text-white hover:bg-musgo-700 disabled:opacity-70">
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear bonsái'}
        </button>
        <button type="button" onClick={onCancelar} className="rounded-full px-5 py-2 text-sm text-stone-600 ring-1 ring-stone-300 hover:bg-stone-50">
          Cancelar
        </button>
      </div>
    </form>
  )
}
