const { Router } = require('express')

const RoomController = require('../controllers/rooms')

const roomsRouter = Router()

roomsRouter.get('/', RoomController.getAll)

roomsRouter.get('/:id', RoomController.getById)

roomsRouter.post('/', RoomController.create)

roomsRouter.put('/:id', RoomController.update)

roomsRouter.delete('/:id', RoomController.delete)

module.exports = roomsRouter