const Reservation = require('../models/Reservation')
const Room = require('../models/Room')
const Customer = require('../models/Customer')

class ReservationController {
    static async getAll(req, res) {
        try {
            let reservations = await Reservation.find({})
            const { check_in_date, check_out_date, customer_id, room_id } = req.query

            if (check_in_date) {
                reservations = reservations.filter(reservation => Date.parse(reservation.check_in_date) === Date.parse(check_in_date))
            }

            if (check_out_date) {
                reservations = reservations.filter(reservation => Date.parse(reservation.check_out_date) === Date.parse(check_out_date))
            }

            if (customer_id) {
                reservations = reservations.filter(reservation => reservation.customer_id === parseInt(customer_id))
            }

            if (room_id) {
                reservations = reservations.filter(reservation => reservation.room_id === parseInt(room_id))
            }

            res.status(200).json(reservations)
        } catch (error) {
            console.error(error)
        }
    }

    static async getById(req, res) {
        try {
            const id = req.params.id
            const reservation = await Reservation.findById(id)

            if (!reservation) {
                return res.status(404).json({ error: 'reservation not found' })
            }

            res.status(200).json(reservation)
        } catch (error) {
            console.error(error)
        }
    }

    static async create(req, res) {
        try {
            const { customer_id, room_id, check_in_date, check_out_date } = req.body

            if (!customer_id || !room_id || !check_in_date || !check_out_date) {
                return res.status(400).json({ error: 'customer_id, room_id, check_in_date or check_out_date is missing' })
            }

            const customer = await Customer.findById(customer_id)
            const room = await Room.findById(room_id)

            if (!customer || !room) {
                return res.status(404).json({ error: 'customer or room not found' })
            }

            if (!room.availability) {
                return res.status(400).json({ error: 'the room is already in use' })
            }

            const checkInDate = new Date(check_in_date).getTime()
            const checkOutDate = new Date(check_out_date).getTime()
            const diff = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)

            const newReservation = new Reservation({
                customer_id: customer_id,
                customer_name: customer.name,
                room_id: room_id,
                room_number: room.number,
                check_in_date: check_in_date,
                check_out_date: check_out_date,
                total_amount: parseFloat(room.price_per_nigth) * parseInt(diff),
                status: "confirmed",
            })
            const saveNewReservation = await newReservation.save()

            const updatedRoom = { availability: false }

            await Room.findByIdAndUpdate(room_id, updatedRoom, { new: true })

            if (customer.active_reservations >= 5) {
                return res.status(400).json({ error: 'There can only be a maximum of 5 active reservations' })
            } else {
                const newActiveReservations = { active_reservations: customer.active_reservations + 1 }

                await Customer.findByIdAndUpdate(customer_id, newActiveReservations, { new: true })
            }

            res.status(201).json(saveNewReservation)
        } catch (error) {
            console.error(error)
        }
    }

    static async update(req, res) {
        try {
            const id = req.params.id
            let newInfo = req.body

            if (newInfo.customer_name || newInfo.room_number || newInfo.check_in_date || newInfo.total_amount) {
                return res.status(400).json({ error: 'you cannot edit the customer_name, room_number, check_in_date or total_amount' })
            }

            const reservation = await Reservation.findById(id)

            if (!reservation) {
                return res.status(404).json({ error: 'reservation not found' })
            }

            const nonEditableStatuses = ['completed', 'checked-out', 'canceled', 'no-show']

            if (nonEditableStatuses.includes(reservation.status.toLowerCase())) {
                return res.status(400).json({ error: 'you cannot edit reservations in completed, canceled, no-show or checked-out status' })
            }

            const hasAtLeastOneFiel = newInfo.customer_id || newInfo.room_id || newInfo.check_out_date || newInfo.status

            if (!hasAtLeastOneFiel) {
                return res.status(400).json({ error: 'at least one field is required to edit' })
            }

            if (newInfo.customer_id) {
                const customer = await Customer.findById(newInfo.customer_id)

                if (!customer) {
                    return res.status(404).json({ error: 'customer not found' })
                }

                const newCustomer = {
                    customer_name: customer.name
                }

                newInfo = { ...newInfo, ...newCustomer }
            }

            if (newInfo.room_id) {
                const room = await Room.findById(newInfo.room_id)

                if (!room) {
                    return res.status(404).json({ error: 'room not found' })
                }

                if (!room.availability) {
                    return res.status(404).json({ error: 'the room is not available' })
                }

                const checkInDate = new Date(reservation.check_in_date).getTime()
                const checkOutDate = new Date(reservation.check_out_date).getTime()
                const diff = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)

                const newRoom = {
                    room_number: room.number,
                    total_amount: parseFloat(room.price_per_night) * parseInt(diff)
                }


                const updatedRoom = { vailability: false }

                await Room.findByIdAndUpdate(newInfo.room_id, updatedRoom, { new: true })

                const updatedOldRoom = { ...oldRoom, availability: true }

                const oldRoom = await Room.findByIdAndUpdate(reservation.room_id, updatedOldRoom, { new: true })

                newInfo = { ...newInfo, ...newRoom }
            }

            if (newInfo.check_out_date) {
                const checkOutDate = new Date(newInfo.check_out_date).getTime()
                const checkInDate = new Date(reservation.check_in_date).getTime()
                const diff = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)

                const room = await Room.findById(reservation.room_id)

                const newAmmount = {
                    total_amount: parseFloat(room.price_per_night) * parseInt(diff)
                }

                newInfo = { ...newInfo, ...newAmmount }
            }

            if (newInfo.status) {
                const possiblStates = ['confirmed', 'checked-in', 'checked-out', 'completed', 'canceled', 'no-show']

                if (!possiblStates.includes(newInfo.status.toLowerCase())) {
                    return res.status(400).json({ error: 'invalid status' })
                }

                switch (newInfo.status.toLowerCase()) {
                    case "confirmed":
                    case "checked-in": {
                        const newStatus = { ...reservation, status: newInfo.status.toLowerCase() }

                        newInfo = { ...newInfo, ...newStatus }
                        break
                    }

                    case "checked-out":
                    case "completed":
                    case "canceled":
                    case "no-show": {
                        const customer = await Customer.findById(reservation.customer_id)

                        const newActiveReservations = { active_reservations: customer.active_reservations > 0 ? customer.active_reservations - 1 : 0 }

                        await Customer.findByIdAndUpdate(reservation.customer_id, newActiveReservations, { new: true })

                        const updatedRoom = { availability: true }

                        await Room.findByIdAndUpdate(reservation.room_id, updatedRoom, { new: true })
                        break
                    }
                }
            }

            const updatedReservation = await Reservation.findByIdAndUpdate(id, newInfo, { new: true })

            res.status(200).json(updatedReservation)
        } catch (error) {
            console.error(error)
        }
    }

    static async delete(req, res) {
        try {
            const id = req.params.id
            const reservation = await Reservation.findById(id)

            if (!reservation) {
                return res.status(404).json({ error: 'reservation not found' })
            }

            await Reservation.findByIdAndDelete(id)

            const updatedRoom = { availability: true }

            await Room.findByIdAndUpdate(reservation.room_id, updatedRoom, { new: true })

            const activeStates = ['checked-in', 'confirmed']

            if (activeStates.includes(reservation.status.toLowerCase())) {
                const newActiveResevations = { active_reservations: customer.active_reservations - 1 }
                await Customer.findByIdAndUpdate(reservation.customer_id, newActiveResevations, { new: true })
            }

            res.status(200).json(reservation)
        } catch (error) {
            console.error(error)
        }
    }
}

module.exports = ReservationController