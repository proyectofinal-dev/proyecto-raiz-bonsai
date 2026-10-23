import { pool } from '../db/pool.js'

// Columnas públicas explícitas en vez de `select *`: si mañana se agrega una
// columna interna (costo, proveedor…), no se filtra a la API por accidente.
const COLUMNAS = `id, nombre, especie, descripcion, precio, edad_anios,
  dificultad, luz, frecuencia_riego, imagen_url, disponible`

const DIFICULTADES = ['facil', 'media', 'dificil']
const LUCES = ['baja', 'media', 'sol_directo']

// Convierte el id de la URL y responde 400 si no es válido.
// Validar antes de consultar: "abc" o "1.5" harían fallar a Postgres con un 500.
function leerId(req, res) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'El id debe ser un número entero positivo' })
    return null
  }
  return id
}

// Valida el cuerpo para crear y editar. Se usa la misma función en ambos casos
// para que las reglas no se desincronicen. Devuelve { datos } o { errores }.
function validarBonsai(body = {}) {
  const texto = (v) => (typeof v === 'string' ? v.trim() : '')
  const datos = {
    nombre: texto(body.nombre),
    especie: texto(body.especie),
    descripcion: texto(body.descripcion),
    precio: Number(body.precio),
    // Edad opcional: vacío o ausente se guarda como null.
    edad_anios: body.edad_anios === '' || body.edad_anios == null ? null : Number(body.edad_anios),
    dificultad: body.dificultad,
    luz: body.luz,
    frecuencia_riego: texto(body.frecuencia_riego),
    imagen_url: texto(body.imagen_url) || null,
    disponible: body.disponible !== false,
  }

  const errores = {}
  if (!datos.nombre) errores.nombre = 'El nombre es obligatorio'
  if (!datos.especie) errores.especie = 'La especie es obligatoria'
  if (!datos.descripcion) errores.descripcion = 'La descripción es obligatoria'
  if (!Number.isInteger(datos.precio) || datos.precio < 0) errores.precio = 'El precio debe ser un entero en pesos'
  if (datos.edad_anios !== null && (!Number.isInteger(datos.edad_anios) || datos.edad_anios < 0)) {
    errores.edad_anios = 'La edad debe ser un número entero'
  }
  if (!DIFICULTADES.includes(datos.dificultad)) errores.dificultad = 'Elige fácil, media o difícil'
  if (!LUCES.includes(datos.luz)) errores.luz = 'Elige baja, media o sol directo'
  if (!datos.frecuencia_riego) errores.frecuencia_riego = 'La frecuencia de riego es obligatoria'
  // Solo URLs externas o rutas de /public: no se suben archivos (ver guía, §1).
  if (datos.imagen_url && !/^(https?:\/\/|\/)/.test(datos.imagen_url)) {
    errores.imagen_url = 'Debe ser una URL que empiece por https://'
  }

  return Object.keys(errores).length > 0 ? { errores } : { datos }
}

// ---------- Públicos ----------

export async function listarBonsais(req, res) {
  // El catálogo público solo muestra lo que se puede comprar hoy.
  const { rows } = await pool.query(
    `select ${COLUMNAS} from bonsais where disponible = true order by precio`,
  )
  res.json(rows)
}

export async function obtenerBonsai(req, res) {
  const id = leerId(req, res)
  if (id === null) return

  // Sin filtrar por `disponible`: un enlace compartido a un bonsái agotado
  // sigue mostrando su ficha (el frontend puede marcarlo como "no disponible").
  // Los parámetros $1 evitan inyección SQL: nunca se concatena input del usuario.
  const { rows } = await pool.query(`select ${COLUMNAS} from bonsais where id = $1`, [id])

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Bonsái no encontrado' })
  }
  res.json(rows[0])
}

// ---------- Privados (requieren token) ----------

export async function listarTodosBonsais(req, res) {
  // El admin necesita ver también los no disponibles para poder reactivarlos.
  const { rows } = await pool.query(`select ${COLUMNAS} from bonsais order by id`)
  res.json(rows)
}

export async function crearBonsai(req, res) {
  const { datos, errores } = validarBonsai(req.body)
  if (errores) return res.status(400).json({ error: 'Revisa los campos del bonsái', campos: errores })

  const { rows } = await pool.query(
    `insert into bonsais (nombre, especie, descripcion, precio, edad_anios, dificultad, luz,
       frecuencia_riego, imagen_url, disponible)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     returning ${COLUMNAS}`,
    [datos.nombre, datos.especie, datos.descripcion, datos.precio, datos.edad_anios,
      datos.dificultad, datos.luz, datos.frecuencia_riego, datos.imagen_url, datos.disponible],
  )
  res.status(201).json(rows[0])
}

export async function actualizarBonsai(req, res) {
  const id = leerId(req, res)
  if (id === null) return

  // PUT reemplaza el bonsái completo: se exigen todos los campos, igual que al crear.
  const { datos, errores } = validarBonsai(req.body)
  if (errores) return res.status(400).json({ error: 'Revisa los campos del bonsái', campos: errores })

  const { rows } = await pool.query(
    `update bonsais set nombre = $1, especie = $2, descripcion = $3, precio = $4, edad_anios = $5,
       dificultad = $6, luz = $7, frecuencia_riego = $8, imagen_url = $9, disponible = $10
     where id = $11
     returning ${COLUMNAS}`,
    [datos.nombre, datos.especie, datos.descripcion, datos.precio, datos.edad_anios,
      datos.dificultad, datos.luz, datos.frecuencia_riego, datos.imagen_url, datos.disponible, id],
  )
  if (rows.length === 0) return res.status(404).json({ error: 'Bonsái no encontrado' })
  res.json(rows[0])
}

export async function eliminarBonsai(req, res) {
  const id = leerId(req, res)
  if (id === null) return

  const { rowCount } = await pool.query('delete from bonsais where id = $1', [id])
  if (rowCount === 0) return res.status(404).json({ error: 'Bonsái no encontrado' })
  // 204: éxito sin contenido que devolver.
  res.status(204).end()
}
