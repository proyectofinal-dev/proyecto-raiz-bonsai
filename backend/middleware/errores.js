// Cualquier /api/... que no exista responde JSON, no la página HTML por defecto
// de Express, para que el frontend siempre pueda leer `error`.
export function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` })
}

// Express 5 envía aquí automáticamente los errores de las funciones async
// (por ejemplo, si Supabase no responde), sin necesidad de try/catch en cada controlador.
// Los 4 parámetros son obligatorios: así reconoce Express que es un manejador de errores.
export function manejarErrores(err, req, res, next) {
  // JSON mal formado en el body: es culpa del cliente, no del servidor.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido' })
  }

  // El detalle técnico queda en los logs del servidor; al cliente nunca se le
  // muestra (podría revelar nombres de tablas o datos de conexión).
  console.error(err)
  res.status(500).json({ error: 'Ocurrió un error en el servidor. Intenta de nuevo en un momento.' })
}
