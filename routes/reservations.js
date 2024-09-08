const { Router } = require('express')

const ReservationController = require('../controllers/reservations')

const reservationsRouter = Router()

reservationsRouter.get('/', ReservationController.getAll)

reservationsRouter.get('/:id', ReservationController.getById)

reservationsRouter.post('/', ReservationController.create)

reservationsRouter.put('/:id', ReservationController.update)

reservationsRouter.delete('/:id', ReservationController.delete)

module.exports = reservationsRouter