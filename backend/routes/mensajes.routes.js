import { Router } from 'express'
import { crearMensaje, listarMensajes, marcarLeido } from '../controllers/mensajes.controller.js'
import { verificarToken } from '../middleware/verificarToken.js'

const router = Router()

// Público: cualquiera puede escribir desde el formulario de contacto.
router.post('/', crearMensaje)

// Privados: solo el admin lee los mensajes y los marca como leídos.
router.get('/', verificarToken, listarMensajes)
router.patch('/:id', verificarToken, marcarLeido)

export default router
