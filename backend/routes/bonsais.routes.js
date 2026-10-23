import { Router } from 'express'
import {
  listarBonsais, obtenerBonsai, listarTodosBonsais, crearBonsai, actualizarBonsai, eliminarBonsai,
} from '../controllers/bonsais.controller.js'
import { verificarToken } from '../middleware/verificarToken.js'

// Las rutas solo conectan URL → controlador; la lógica vive en controllers/.
const router = Router()

// Públicas
router.get('/', listarBonsais)

// Privada. Debe declararse antes de '/:id'; si no, Express tomaría "admin" como un id.
router.get('/admin', verificarToken, listarTodosBonsais)

router.get('/:id', obtenerBonsai)

// Privadas: verificarToken corre antes del controlador y corta con 401 si no hay sesión.
router.post('/', verificarToken, crearBonsai)
router.put('/:id', verificarToken, actualizarBonsai)
router.delete('/:id', verificarToken, eliminarBonsai)

export default router
