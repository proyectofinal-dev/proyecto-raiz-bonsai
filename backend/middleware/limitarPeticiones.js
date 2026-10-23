// Límite simple de peticiones por IP, en memoria.
// El asistente es público y cada pregunta gasta cuota de Gemini: sin esto,
// un script podría agotarla en minutos. Para un solo servidor (Render gratis)
// un Map es suficiente; con varios servidores haría falta algo como Redis.
export function limitarPeticiones({ maximo, ventanaMs }) {
  const registros = new Map() // ip → { cuenta, reinicio }

  return (req, res, next) => {
    const ahora = Date.now()
    const ip = req.ip
    let registro = registros.get(ip)

    if (!registro || ahora > registro.reinicio) {
      registro = { cuenta: 0, reinicio: ahora + ventanaMs }
      registros.set(ip, registro)
    }
    registro.cuenta++

    // Limpieza ocasional para que el Map no crezca sin fin.
    if (registros.size > 5000) {
      for (const [clave, r] of registros) if (ahora > r.reinicio) registros.delete(clave)
    }

    if (registro.cuenta > maximo) {
      const segundos = Math.ceil((registro.reinicio - ahora) / 1000)
      res.set('Retry-After', String(segundos))
      return res.status(429).json({
        error: `Vas muy rápido 🌱 Espera ${segundos} segundos y vuelve a preguntar.`,
      })
    }
    next()
  }
}
