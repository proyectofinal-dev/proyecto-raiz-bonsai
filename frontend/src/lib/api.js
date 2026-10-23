// La URL del backend viene de una variable de entorno de Vite (VITE_API_URL):
// en local apunta a localhost y en producción a Render, sin tocar el código.
// Ojo: todo lo que empieza por VITE_ queda visible en el navegador, por eso
// aquí solo va la URL pública, nunca claves (la de la IA vive en el backend).
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// fetch no lanza error con respuestas 404/500, solo si se cae la red.
// Este envoltorio unifica ambos casos para que las vistas manejen un solo `catch`.
export async function pedirApi(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, opciones)
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('No pudimos conectar con el vivero. Revisa tu conexión e intenta de nuevo.')
  }

  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    const error = new Error(datos?.error || 'Algo salió mal. Intenta de nuevo en un momento.')
    error.status = respuesta.status
    // En un 400 el backend indica qué campo falló (ej. { email: 'no es válido' }).
    error.campos = datos?.campos
    throw error
  }
  return datos
}
