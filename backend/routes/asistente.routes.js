import { Router } from 'express'
import { preguntarAsistente } from '../controllers/asistente.controller.js'
import { limitarPeticiones } from '../middleware/limitarPeticiones.js'

const router = Router()

// 10 preguntas por minuto por visitante: de sobra para una conversación real.
router.post('/', limitarPeticiones({ maximo: 10, ventanaMs: 60_000 }), preguntarAsistente)

export default router
