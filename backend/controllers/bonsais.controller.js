import { pool } from '../db/pool.js'

// Columnas públicas explícitas en vez de `select *`: si mañana se agrega una
// columna interna (costo, proveedor…), no se filtra a la API por accidente.
const COLUMNAS = `id, nombre, especie, descripcion, precio, edad_anios,
  dificultad, luz, frecuencia_riego, imagen_url, disponible`

export async function listarBonsais(req, res) {
  // El catálogo público solo muestra lo que se puede comprar hoy.
  const { rows } = await pool.query(
    `select ${COLUMNAS} from bonsais where disponible = true order by precio`,
  )
  res.json(rows)
}

export async function obtenerBonsai(req, res) {
  const id = Number(req.params.id)

  // Validar antes de consultar: "abc" o "1.5" harían fallar a Postgres con un 500.
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El id debe ser un número entero positivo' })
  }

  // Sin filtrar por `disponible`: un enlace compartido a un bonsái agotado
  // sigue mostrando su ficha (el frontend puede marcarlo como "no disponible").
  // Los parámetros $1 evitan inyección SQL: nunca se concatena input del usuario.
  const { rows } = await pool.query(`select ${COLUMNAS} from bonsais where id = $1`, [id])

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Bonsái no encontrado' })
  }
  res.json(rows[0])
}
