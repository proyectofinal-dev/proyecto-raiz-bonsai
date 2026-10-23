import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db/pool.js'

if (!process.env.JWT_SECRET) {
  throw new Error('Falta JWT_SECRET en el .env (ver .env.example)')
}

// 8 horas: cubre una jornada de trabajo del admin sin dejar sesiones eternas
// si alguien olvida cerrar sesión en un computador compartido.
const DURACION_TOKEN = '8h'

// Hash de una contraseña cualquiera. Si el email no existe se compara contra
// este hash igualmente, para que la respuesta tarde lo mismo y no se pueda
// adivinar qué emails están registrados midiendo el tiempo.
const HASH_FALSO = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.6v5r1pYqJ8mX3yW0Fz2pQ6uO7kTe'

export async function login(req, res) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' })
  }

  const { rows } = await pool.query('select id, email, password_hash from usuarios where email = $1', [email])
  const usuario = rows[0]
  const coincide = await bcrypt.compare(password, usuario?.password_hash ?? HASH_FALSO)

  // Mismo mensaje para "no existe" y "contraseña incorrecta": no revelar cuál falló.
  if (!usuario || !coincide) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' })
  }

  const token = jwt.sign({ sub: usuario.id, email: usuario.email }, process.env.JWT_SECRET, {
    expiresIn: DURACION_TOKEN,
  })
  res.json({ token, email: usuario.email })
}
