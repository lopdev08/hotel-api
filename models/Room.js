const { model } = require('mongoose')

const roomSchema = require('../schemas/room')

const Room = model('Room', roomSchema)

module.exports = Room