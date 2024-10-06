const Room = require('../models/Room')
const Reservation = require('../models/Reservation')
const calculateDiff = require('../helpers/calculateDiff')

class RoomController {
    static async getAll(req, res, next) {
        try {
            let rooms = await Room.find({})
            const { type, availability, min_price, max_price, number, description } = req.query

            if (type !== undefined) {
                rooms = rooms.filter(room => room.type.toLowerCase() === type.toLowerCase())
            }

            if (availability !== undefined) {
                rooms = rooms.filter(room => room.availability === availability)
            }

            if (min_price !== undefined) {
                rooms = rooms.filter(room => room.price_per_nigth >= parseFloat(min_price))
            }

            if (max_price !== undefined) {
                rooms = rooms.filter(room => room.price_per_nigth <= parseFloat(max_price))
            }

            if (number !== undefined) {
                rooms = rooms.filter(room => room.number === parseInt(number))
            }

            if (description !== undefined) {
                rooms = rooms.filter(room => room.description.toLowerCase().includes(description.toLowerCase()))
            }

            res.status(200).json(rooms)
        } catch (error) {
            next(error)
        }
    }

    static async getById(req, res, next) {
        try {
            const id = req.params.id
            const room = await Room.findById(id)

            if (!room) {
                return res.status(404).json({ error: 'room not found' })
            }

            res.status(200).json(room)
        } catch (error) {
            next(error)
        }
    }

    static async create(req, res, next) {
        try {
            const { number, type, description, price_per_nigth, availability } = req.body

            const newRoom = new Room({
                number: number,
                type: type,
                description: description,
                price_per_nigth: price_per_nigth,
                availability: availability
            })

            const saveNewRoom = await newRoom.save()

            res.status(201).json(saveNewRoom)
        } catch (error) {
            next(error)
        }
    }

    static async update(req, res, next) {
        try {
            const id = req.params.id
            const newInfo = req.body

            if (newInfo.price_per_nigth) {
                const reservation = await Reservation.find({ room_id: id })

                if (reservation.length >= 1) {
                    console.log('hay reservacion')
                    const diff = calculateDiff(reservation[0].check_in_date, reservation[0].check_out_date)

                    const newAmmount = { total_amount: parseFloat(newInfo.price_per_nigth) * parseInt(diff) }

                    await Reservation.updateOne({ room_id: id }, newAmmount)
                }

            }

            const room = await Room.findByIdAndUpdate(id, newInfo, { new: true })

            if (!room) {
                return res.status(404).json({ error: 'room not found' })
            }

            res.status(200).json(room)
        } catch (error) {
            next(error)
        }
    }

    static async delete(req, res, next) {
        try {
            const id = req.params.id
            const room = await Room.findById(id)

            if (!room) {
                return res.status(404).json({ error: 'room not found' })
            }

            const reservation = await Reservation.findOne({ room_id: id })

            if (reservation) {
                const activeStates = ['checked-in', 'confirmed']

                if (activeStates.includes(reservation.status)) {
                    console.log('esta activa')
                    return res.status(400).json({ error: 'The room is being occupied on a reservation' })
                }
            }

            await Room.findByIdAndDelete(id)

            res.status(200).json(room)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = RoomController