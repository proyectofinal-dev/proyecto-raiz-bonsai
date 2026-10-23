import { Router } from 'express'
import { listarBonsais, obtenerBonsai } from '../controllers/bonsais.controller.js'

// Las rutas solo conectan URL → controlador; la lógica vive en controllers/.
// Las rutas privadas (crear, editar, eliminar) se agregan en la Fase 6.
const router = Router()

router.get('/', listarBonsais)
router.get('/:id', obtenerBonsai)

export default router
