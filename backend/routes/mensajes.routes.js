import { Router } from 'express'
import { crearMensaje } from '../controllers/mensajes.controller.js'

// Público solo el envío. Listar y marcar como leído son del admin (Fase 6).
const router = Router()

router.post('/', crearMensaje)

export default router
