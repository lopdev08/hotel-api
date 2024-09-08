const Room = require('../models/Room')
const Reservation = require('../models/Reservation')

class RoomController {
    static async getAll(req, res) {
        try {
            let rooms = await Room.find({})
            const { type, availability, min_price, max_price, number, description } = req.query

            if (type) {
                const roomTypes = ['individual', 'suite', 'double']

                if (!roomTypes.includes(type.toLowerCase())) {
                    return res.status(400).json({ error: 'invalid room type' })
                }

                rooms = rooms.filter(room => room.type.toLowerCase() === type.toLowerCase())
            }

            if (availability) {
                const availabilityFilter = availability === 'true'
                rooms = rooms.filter(room => room.availability === availabilityFilter)
            }

            if (min_price) {
                rooms = rooms.filter(room => room.price_per_night >= parseFloat(min_price))
            }

            if (max_price) {
                rooms = rooms.filter(room => room.price_per_night <= parseFloat(max_price))
            }

            if (number) {
                rooms = rooms.filter(room => room.number === parseInt(number))
            }

            if (description) {
                rooms = rooms.filter(room => room.description.toLowerCase().includes(description.toLowerCase()))
            }

            res.status(200).json(rooms)
        } catch (error) {
            console.error(error)
        }
    }

    static async getById(req, res) {
        try {
            const id = req.params.id
            const room = await Room.findById(id)

            if (!room) {
                return res.status(404).json({ error: 'room not found' })
            }

            res.status(200).json(room)
        } catch (error) {
            console.error(error)
        }
    }

    static async create(req, res) {
        try {
            const { number, type, description, price_per_nigth, availability } = req.body

            if (!number || !type || !description || !price_per_nigth || availability === "") {
                return res.status(400).json({ error: "number, type, description, price_per_nigth or availability is missing" })
            }

            const roomTypes = ['doble', 'individual', 'suite']

            if (!roomTypes.includes(type.toLowerCase())) {
                return res.status(400).json({ error: 'invalid room type' })
            }

            const roomExist = await Room.find({ number: number })

            if (roomExist.length > 0) {
                return res.status(400).json({ error: 'The room number is already registered' })
            }

            const newRoom = new Room({
                number: parseInt(number),
                type: type,
                description: description,
                price_per_nigth: parseFloat(price_per_nigth),
                availability: availability
            })

            const saveNewRoom = await newRoom.save()

            res.status(201).json(saveNewRoom)
        } catch (error) {
            console.error(error)
        }
    }

    static async update(req, res) {
        try {
            const id = req.params.id
            const newInfo = req.body

            if (newInfo.number || newInfo.description) {
                return res.status(400).json({ error: 'you cannot edit the number or description' })
            }

            const hasAtLeastOneFiel = newInfo.type || newInfo.price_per_nigth || newInfo.availability

            if (!hasAtLeastOneFiel) {
                return res.status(400).json({ error: 'at least one field is required to edit' })
            }

            if (newInfo.type) {
                const roomTypes = ['doble', 'individual', 'suite']

                if (!roomTypes.includes(newInfo.type)) {
                    return res.status(400).json({ error: 'invalid room type' })
                }
            }

            if (newInfo.price_per_nigth) {
                const reservation = await Reservation.find({ room_id: id })

                if (reservation) {
                    const checkInDateReservation = new Date(reservation.check_in_date).getTime()
                    const checkOutDateReservation = new Date(reservation.check_out_date).getTime()
                    const diff = (checkOutDateReservation - checkInDateReservation) / (1000 * 60 * 60 * 24)

                    const newAmmount = { total_amount: parseFloat(newInfo.price_per_nigth) * parseInt(diff) }

                    await Reservation.updateOne({ room_id: id, newAmmount })
                }

            }

            const room = await Room.findByIdAndUpdate(id, newInfo, { new: true })

            if (!room) {
                return res.status(404).json({ error: 'room not found' })
            }

            res.status(200).json(room)
        } catch (error) {
            console.error(error)
        }
    }

    static async delete(req, res) {
        try {
            const id = req.params.id
            const room = await Room.findById(id)

            if (!room) {
                return res.status(404).json({ error: 'room not found' })
            }

            const reservation = Reservation.find({ room_id: id })

            if (reservation) {
                return res.status(400).json({ error: 'The room is being occupied on a reservation' })
            }

            await Room.findByIdAndDelete(id)

            res.status(200).json(room)
        } catch (error) {
            console.error(error)
        }
    }
}

module.exports = RoomController