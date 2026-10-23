import jwt from 'jsonwebtoken'

// Protege las rutas privadas. El frontend envía el token en la cabecera
// `Authorization: Bearer <token>`; si falta, está alterado o expiró → 401.
export function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ')

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Necesitas iniciar sesión' })
  }

  try {
    // verify comprueba la firma con JWT_SECRET: un token inventado o modificado
    // en el navegador no pasa, porque nadie más conoce la clave.
    req.usuario = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Tu sesión no es válida o expiró. Inicia sesión de nuevo.' })
  }
}
