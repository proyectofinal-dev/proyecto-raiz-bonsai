import express from 'express'
import cors from 'cors'

const app = express()

// Render asigna el puerto por variable de entorno; 3000 es solo para desarrollo local.
const PORT = process.env.PORT || 3000

// CORS abierto por ahora: en producción el frontend (GitHub Pages) y el backend
// (Render) viven en dominios distintos. Se restringirá al dominio real en el despliegue.
app.use(cors())
app.use(express.json())

// Endpoint de salud: permite verificar que el servidor está vivo
// (y "despertar" Render antes de la defensa).
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`API de Raíz escuchando en http://localhost:${PORT}`)
})
