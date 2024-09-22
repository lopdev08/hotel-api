const { Router } = require('express')

const ReservationController = require('../controllers/reservations')

const reservationsRouter = Router()

const { validateCreate, validateQuery, validateUpdate } = require('../validators/reservations')

reservationsRouter.get('/', validateQuery, ReservationController.getAll)

reservationsRouter.get('/:id', ReservationController.getById)

reservationsRouter.post('/', validateCreate, ReservationController.create)

reservationsRouter.put('/:id', validateUpdate, ReservationController.update)

reservationsRouter.delete('/:id', ReservationController.delete)

module.exports = reservationsRouter