const { model } = require('mongoose')

const reservationSchema = require('../schemas/reservation')

const Reservation = model('Reservation', reservationSchema)

module.exports = Reservation