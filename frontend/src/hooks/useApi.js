import { useCallback, useEffect, useState } from 'react'
import { pedirApi } from '../lib/api.js'

// Encapsula el patrón cargando / error / datos que repiten todas las vistas
// que leen de la API, y expone `reintentar` para el botón de los errores.
export function useApi(ruta) {
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: null })

  // Cada combinación ruta + intento es una petición distinta. "Cargando" no se
  // guarda en el estado: se deduce de que el último resultado no corresponde a
  // la petición actual. Así no hay que resetear estados al cambiar de ruta.
  const clave = `${ruta}#${intento}`
  const cargando = resultado.clave !== clave

  useEffect(() => {
    // AbortController cancela la petición si el usuario cambia de página antes
    // de que responda; así no se actualiza el estado de un componente que ya no existe.
    const controlador = new AbortController()

    pedirApi(ruta, { signal: controlador.signal })
      .then((datos) => setResultado({ clave, datos, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setResultado({ clave, datos: null, error })
      })

    return () => controlador.abort()
  }, [ruta, clave])

  const reintentar = useCallback(() => setIntento((n) => n + 1), [])

  return {
    datos: cargando ? null : resultado.datos,
    error: cargando ? null : resultado.error,
    cargando,
    reintentar,
  }
}
