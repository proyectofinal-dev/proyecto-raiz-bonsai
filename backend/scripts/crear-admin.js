// Crea (o actualiza la contraseña de) el único usuario admin.
// Uso: npm run crear-admin
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import bcrypt from 'bcryptjs'
import { pool } from '../db/pool.js'

// 10 rondas: el valor estándar. Más rondas = hash más lento de romper,
// pero también un login más lento.
const SALT_ROUNDS = 10

const rl = readline.createInterface({ input, output })

try {
  const email = (await rl.question('Email del admin: ')).trim().toLowerCase()
  const password = await rl.question('Contraseña (mínimo 8 caracteres): ')

  if (!email.includes('@') || password.length < 8) {
    throw new Error('Email inválido o contraseña demasiado corta')
  }

  // Nunca se guarda la contraseña en texto plano, solo su hash.
  const hash = await bcrypt.hash(password, SALT_ROUNDS)

  // ON CONFLICT permite volver a correr el script para cambiar la contraseña.
  await pool.query(
    `insert into usuarios (email, password_hash) values ($1, $2)
     on conflict (email) do update set password_hash = excluded.password_hash`,
    [email, hash],
  )

  console.log(`Admin ${email} guardado correctamente.`)
} catch (error) {
  console.error('No se pudo crear el admin:', error.message)
  process.exitCode = 1
} finally {
  rl.close()
  await pool.end()
}
