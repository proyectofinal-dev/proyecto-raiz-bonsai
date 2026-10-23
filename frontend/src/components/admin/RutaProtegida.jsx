import { Navigate } from 'react-router-dom'
import { obtenerToken } from '../../lib/auth.js'

// Sin sesión válida, redirige al login. Esto solo evita mostrar un panel vacío:
// la protección real está en el backend, que rechaza cualquier petición sin token.
export default function RutaProtegida({ children }) {
  return obtenerToken() ? children : <Navigate to="/admin/login" replace />
}
