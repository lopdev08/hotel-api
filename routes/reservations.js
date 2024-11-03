const { Router } = require('express')

const ReservationController = require('../controllers/reservations')

const reservationsRouter = Router()

const { validateCreate, validateQuery, validateUpdate } = require('../validators/reservations')

const userExtractor = require('../middlewares/userExtractor')

reservationsRouter.get('/', validateQuery, ReservationController.getAll)

reservationsRouter.get('/:id', ReservationController.getById)

reservationsRouter.post('/', validateCreate, userExtractor, ReservationController.create)

reservationsRouter.put('/:id', validateUpdate, userExtractor, ReservationController.update)

reservationsRouter.delete('/:id', userExtractor, ReservationController.delete)

module.exports = reservationsRouter