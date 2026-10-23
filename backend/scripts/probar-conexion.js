// Verifica que el .env apunta a Supabase y que las tablas existen.
// Uso: npm run probar-conexion
import { pool } from '../db/pool.js'

try {
  const { rows } = await pool.query('select count(*)::int as total from bonsais')
  console.log(`Conexión OK. Bonsáis en la base: ${rows[0].total}`)
} catch (error) {
  console.error('Falló la conexión:', error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
