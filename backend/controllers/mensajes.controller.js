import { pool } from '../db/pool.js'

// Validación sencilla de forma (algo@algo.algo). La única prueba real de que
// un email existe es escribirle; esto solo atrapa errores de tipeo evidentes.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Límites de longitud: evitan que alguien llene la base con textos gigantes.
const MAX_MENSAJE = 2000
const MAX_CAMPO = 200

// Convierte cualquier valor en texto recortado; null/undefined/números quedan como ''.
const limpiar = (valor) => (typeof valor === 'string' ? valor.trim() : '')

export async function crearMensaje(req, res) {
  const nombre = limpiar(req.body?.nombre)
  const email = limpiar(req.body?.email).toLowerCase()
  const telefono = limpiar(req.body?.telefono)
  const bonsaiInteres = limpiar(req.body?.bonsai_interes)
  const mensaje = limpiar(req.body?.mensaje)

  // Se juntan todos los errores en vez de cortar en el primero, para que el
  // formulario del frontend pueda marcar todos los campos a la vez.
  const errores = {}
  if (!nombre) errores.nombre = 'El nombre es obligatorio'
  if (!email) errores.email = 'El email es obligatorio'
  else if (!EMAIL_REGEX.test(email)) errores.email = 'El email no es válido'
  if (!mensaje) errores.mensaje = 'El mensaje es obligatorio'
  else if (mensaje.length > MAX_MENSAJE) errores.mensaje = `Máximo ${MAX_MENSAJE} caracteres`
  for (const [campo, valor] of Object.entries({ nombre, email, telefono, bonsai_interes: bonsaiInteres })) {
    if (valor.length > MAX_CAMPO) errores[campo] = `Máximo ${MAX_CAMPO} caracteres`
  }

  if (Object.keys(errores).length > 0) {
    return res.status(400).json({ error: 'Revisa los campos del formulario', campos: errores })
  }

  const { rows } = await pool.query(
    `insert into mensajes (nombre, email, telefono, bonsai_interes, mensaje)
     values ($1, $2, $3, $4, $5)
     returning id, creado_en`,
    // Los opcionales vacíos se guardan como null, no como '', para distinguir "no lo dijo".
    [nombre, email, telefono || null, bonsaiInteres || null, mensaje],
  )

  res.status(201).json({ ok: true, id: rows[0].id })
}
