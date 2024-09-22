const Reservation = require('../models/Reservation')
const Room = require('../models/Room')
const Customer = require('../models/Customer')
const calculateDiff = require('../helpers/calculateDiff')

class ReservationController {
    static async getAll(req, res, next) {
        try {
            let reservations = await Reservation.find({})
            const { check_in_date, check_out_date, customer_id, room_id } = req.query

            if (check_in_date !== undefined) {
                reservations = reservations.filter(reservation => Date.parse(reservation.check_in_date) === Date.parse(check_in_date))
            }

            if (check_out_date !== undefined) {
                reservations = reservations.filter(reservation => Date.parse(reservation.check_out_date) === Date.parse(check_out_date))
            }

            if (customer_id !== undefined) {
                reservations = reservations.filter(reservation => reservation.customer_id === parseInt(customer_id))
            }

            if (room_id !== undefined) {
                reservations = reservations.filter(reservation => reservation.room_id === parseInt(room_id))
            }

            res.status(200).json(reservations)
        } catch (error) {
            next(error)
        }
    }

    static async getById(req, res, next) {
        try {
            const id = req.params.id
            const reservation = await Reservation.findById(id)

            if (!reservation) {
                return res.status(404).json({ error: 'reservation not found' })
            }

            res.status(200).json(reservation)
        } catch (error) {
            next(error)
        }
    }

    static async create(req, res, next) {
        try {
            const { customer_id, room_id, check_in_date, check_out_date } = req.body

            const customer = await Customer.findById(customer_id)
            const room = await Room.findById(room_id)

            const diff = calculateDiff(check_in_date, check_out_date)

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

            const newActiveReservations = { active_reservations: customer.active_reservations + 1 }

            await Customer.findByIdAndUpdate(customer_id, newActiveReservations, { new: true })

            res.status(201).json(saveNewReservation)
        } catch (error) {
            next(error)
        }
    }

    static async update(req, res, next) {
        try {
            const id = req.params.id
            let newInfo = req.body

            const reservation = await Reservation.findById(id)

            if (newInfo.customer_id) {
                const customer = await Customer.findById(newInfo.customer_id)

                const newCustomer = {
                    customer_name: customer.name
                }

                newInfo = { ...newInfo, ...newCustomer }
            }

            if (newInfo.room_id) {
                const room = await Room.findById(newInfo.room_id)

                const diff = calculateDiff(reservation[0].check_in_date, reservation[0].check_out_date)

                const newRoom = {
                    room_number: room.number,
                    total_amount: parseFloat(room.price_per_nigth) * parseInt(diff)
                }


                const updatedRoom = { vailability: false }

                await Room.findByIdAndUpdate(newInfo.room_id, updatedRoom, { new: true })

                const updatedOldRoom = { ...oldRoom, availability: true }

                const oldRoom = await Room.findByIdAndUpdate(reservation.room_id, updatedOldRoom, { new: true })

                newInfo = { ...newInfo, ...newRoom }
            }

            if (newInfo.check_out_date) {
                const diff = calculateDiff(reservation[0].check_in_date, newInfo.check_out_date)

                const room = await Room.findById(reservation.room_id)

                const newAmmount = {
                    total_amount: parseFloat(room.price_per_night) * parseInt(diff)
                }

                newInfo = { ...newInfo, ...newAmmount }
            }

            if (newInfo.status) {
                switch (newInfo.status.toLowerCase()) {
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
            next(error)
        }
    }

    static async delete(req, res, next) {
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
                const customer = await Customer.findById(reservation.customer_id)
                const newActiveResevations = { active_reservations: customer.active_reservations - 1 }
                await Customer.findByIdAndUpdate(reservation.customer_id, newActiveResevations, { new: true })
            }

            res.status(200).json(reservation)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = ReservationController