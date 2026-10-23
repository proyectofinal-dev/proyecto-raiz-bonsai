// Manejo de la sesión del admin en el navegador.
// El token se guarda en localStorage para que la sesión sobreviva a recargar
// la página. Es suficiente para este proyecto: el token expira en 8 h y el
// backend lo verifica en cada petición, así que alterarlo aquí no sirve de nada.
const CLAVE = 'raiz_token'

// El payload de un JWT es JSON en base64url; se lee para saber cuándo expira
// y no mostrar el panel con una sesión que el backend ya va a rechazar.
// Leerlo no es verificarlo: la verificación real (la firma) la hace el backend.
function leerPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export function guardarSesion(token) {
  localStorage.setItem(CLAVE, token)
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE)
}

// Devuelve el token si existe y no ha expirado; si expiró, lo borra.
export function obtenerToken() {
  const token = localStorage.getItem(CLAVE)
  if (!token) return null

  const payload = leerPayload(token)
  if (!payload?.exp || payload.exp * 1000 < Date.now()) {
    cerrarSesion()
    return null
  }
  return token
}

export function emailSesion() {
  const token = obtenerToken()
  return token ? leerPayload(token)?.email : null
}
