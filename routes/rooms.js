const { Router } = require('express')

const RoomController = require('../controllers/rooms')

const roomsRouter = Router()

const { validateCreate, validateUpdate, validateQuery } = require('../validators/rooms')

roomsRouter.get('/', validateQuery, RoomController.getAll)

roomsRouter.get('/:id', RoomController.getById)

roomsRouter.post('/', validateCreate, RoomController.create)

roomsRouter.put('/:id', validateUpdate, RoomController.update)

roomsRouter.delete('/:id', RoomController.delete)

module.exports = roomsRouter