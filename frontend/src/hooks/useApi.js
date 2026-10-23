import { useCallback, useEffect, useState } from 'react'
import { pedirApi } from '../lib/api.js'

// Encapsula el patrón cargando / error / datos que repiten todas las vistas
// que leen de la API, y expone `reintentar` para recargar (botón de error, o
// después de crear/editar algo en el panel admin).
// `pedir` permite usar pedirAdmin en las vistas privadas.
export function useApi(ruta, pedir = pedirApi) {
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: null })

  // Cada combinación ruta + intento es una petición distinta. "Cargando" no se
  // guarda en el estado: se deduce de que el último resultado no corresponde a
  // la petición actual. Así no hay que resetear estados al cambiar de ruta.
  const clave = `${ruta}#${intento}`
  const cargando = resultado.clave !== clave
  // Al recargar la misma ruta se conservan los datos anteriores mientras llega
  // la respuesta, para que la tabla del admin no parpadee tras cada cambio.
  const mismaRuta = resultado.clave?.startsWith(`${ruta}#`)

  useEffect(() => {
    // AbortController cancela la petición si el usuario cambia de página antes
    // de que responda; así no se actualiza el estado de un componente que ya no existe.
    const controlador = new AbortController()

    pedir(ruta, { signal: controlador.signal })
      .then((datos) => setResultado({ clave, datos, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setResultado({ clave, datos: null, error })
      })

    return () => controlador.abort()
  }, [ruta, clave, pedir])

  const reintentar = useCallback(() => setIntento((n) => n + 1), [])

  return {
    datos: cargando && !mismaRuta ? null : resultado.datos,
    error: cargando ? null : resultado.error,
    cargando,
    reintentar,
  }
}
