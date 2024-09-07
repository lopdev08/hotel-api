const express = require('express')
const app = express()

app.use(express.json())

let rooms = require('./rooms.json')

let customers = require('./customers.json')

let reservations = require('./reservations.json')

// Endpoints rooms
app.get('/rooms', (req, res) => {
    const { type, availability, min_price, max_price, number, description } = req.query

    if (type) {
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
})

app.get('/rooms/:id', (req, res) => {
    const id = Number(req.params.id)
    const room = rooms.find(room => room.id === id)

    if (!room) {
        return res.status(404).json({ error: 'room not found' })
    }

    res.status(200).json(room)
})

app.post('/rooms', (req, res) => {
    const { number, type, description, price_per_nigth, availability } = req.body

    if (!number || !type || !description || !price_per_nigth || availability === "") {
        return res.status(400).json({ error: "number, type, description, price_per_nigth or availability is missing" })
    }

    const roomTypes = ['doble', 'individual', 'suite']

    if (!roomTypes.includes(type.toLowerCase())) {
        return res.status(400).json({ error: 'invalid room type' })
    }

    const roomExist = rooms.find(room => room.number === number)

    if (roomExist) {
        return res.status(400).json({ error: 'The room number is already registered' })
    }

    const ids = rooms.map(room => room.id)
    const maxId = Math.max(...ids)

    const newRoom = {
        id: maxId + 1,
        number: parseInt(number),
        type: type,
        description: description,
        price_per_nigth: parseFloat(price_per_nigth),
        availability: availability
    }

    rooms = [...rooms, newRoom]

    res.status(201).json(newRoom)
})

app.put('/rooms/:id', (req, res) => {
    const id = Number(req.params.id)
    const newInfo = req.body

    if (newInfo.number || newInfo.description) {
        return res.status(400).json({ error: 'you cannot edit the number or description' })
    }

    const room = rooms.find(room => room.id === id)

    if (!room) {
        return res.status(404).json({ error: 'room not found' })
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
        const reservation = reservations.find(reservation => reservation.room_id === id)

        if (reservation) {
            const checkInDateReservation = new Date(reservation.check_in_date).getTime()
            const checkOutDateReservation = new Date(reservation.check_out_date).getTime()
            const diff = (checkOutDateReservation - checkInDateReservation) / (1000 * 60 * 60 * 24)

            const newAmmount = { ...reservation, total_amount: parseFloat(newInfo.price_per_nigth) * parseInt(diff) }

            const reservationIndex = reservations.indexOf(reservation)
            reservations[reservationIndex] = newAmmount
        }

    }

    const updatedRoom = { ...room, ...newInfo }

    const index = rooms.indexOf(room)
    rooms[index] = updatedRoom

    res.status(200).json(updatedRoom)

})

app.delete('/rooms/:id', (req, res) => {
    const id = Number(req.params.id)
    const room = rooms.find(room => room.id === id)

    if (!room) {
        return res.status(404).json({ error: 'room not found' })
    }

    const reservation = reservations.find(reservation => reservation.room_id === id)

    if (reservation) {
        return res.status(400).json({ error: 'The room is being occupied on a reservation' })
    }

    rooms = rooms.filter(room => room.id !== id)

    res.status(200).json(room)
})

// Endpoints customers
app.get('/customers', (req, res) => {
    const { name, email, phone } = req.query

    if (name) {
        customers = customers.filter(customer => customer.name.toLowerCase().includes(name.toLowerCase()))
    }

    if (email) {
        customers = customers.filter(customer => customer.email.toLowerCase().includes(email.toLowerCase()))
    }

    if (phone) {
        customers = customers.filter(customer => customer.phone === parseInt(phone))
    }

    res.status(200).json(customers)
})

app.get('/customers/:id', (req, res) => {
    const id = Number(req.params.id)
    const customer = customers.find(customer => customer.id === id)

    if (!customer) {
        return res.status(404).json({ error: 'customer not found' })
    }

    res.status(200).json(customer)
})

app.post('/customers', (req, res) => {
    const { name, email, phone } = req.body

    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'name, email or phone is missing' })
    }

    const customer = customers.find(customer => customer.email.toLowerCase() === email.toLowerCase())

    if (customer) {
        return res.status(400).json({ error: 'the email has already been registered' })
    }

    const ids = customers.map(customer => customer.id)
    const maxId = Math.max(...ids)

    const newCustomer = {
        id: maxId + 1,
        name: name,
        email: email,
        phone: parseInt(phone),
        active_reservations: 0
    }

    customers = [...customers, newCustomer]

    res.status(201).json(newCustomer)
})

app.put('/customers/:id', (req, res) => {
    const id = Number(req.params.id)
    const newInfo = req.body

    const customer = customers.find(customer => customer.id === id)

    if (!customer) {
        return res.status(404).json({ error: 'customer not found' })
    }

    if (newInfo.name || newInfo.email || newInfo.active_reservations) {
        return res.status(400).json({ error: 'you cannot edit the name, email or active reservations' })
    }

    if (!newInfo.phone) {
        return res.status(400).json({ error: 'number is missing' })
    }

    const updatedNumber = { ...customer, ...newInfo }

    const index = customers.indexOf(customer)
    customers[index] = updatedNumber

    res.status(200).json(updatedNumber)
})

app.delete('/customers/:id', (req, res) => {
    const id = Number(req.params.id)
    const customer = customers.find(customer => customer.id === id)

    if (!customer) {
        return res.status(404).json({ error: 'customer not found' })
    }

    customers = customers.filter(customer => customer.id !== id)

    res.status(200).json(customer)
})

//Endpoints reservations
app.get('/reservations', (req, res) => {
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
})

app.get('/reservations/:id', (req, res) => {
    const id = Number(req.params.id)
    const reservation = reservations.find(reservation => reservation.id === id)

    if (!reservation) {
        return res.status(404).json({ error: 'reservation not found' })
    }

    res.status(200).json(reservation)
})

app.post('/reservations', (req, res) => {
    const { customer_id, room_id, check_in_date, check_out_date } = req.body

    if (!customer_id || !room_id || !check_in_date || !check_out_date) {
        return res.status(400).json({ error: 'customer_id, room_id, check_in_date or check_out_date is missing' })
    }

    const customer = customers.find(customer => customer.id === customer_id)
    const room = rooms.find(room => room.id === room_id)

    if (!customer || !room) {
        return res.status(404).json({ error: 'customer or room not found' })
    }

    if (customer.active_reservations >= 5) {
        return res.status(400).json({ error: 'There can only be a maximum of 5 active reservations' })
    } else {
        const newActiveResevations = { ...customer, active_reservations: customer.active_reservations + 1 }

        const customerIndex = customers.indexOf(customer)
        customers[customerIndex] = newActiveResevations
    }

    if (!room.availability) {
        return res.status(400).json({ error: 'the room is already in use' })
    }

    const ids = reservations.map(reservation => reservation.id)
    const maxId = Math.max(...ids)

    const checkInDate = new Date(check_in_date).getTime()
    const checkOutDate = new Date(check_out_date).getTime()
    const diff = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)

    const newReservation = {
        id: maxId + 1,
        customer_id: customer_id,
        customer_name: customer.name,
        room_id: room_id,
        room_number: room.number,
        check_in_date: check_in_date,
        check_out_date: check_out_date,
        total_amount: parseFloat(room.price_per_night) * parseInt(diff),
        status: "confirmed",
    }

    const updatedRoom = { ...room, availability: false }

    const roomIndex = rooms.indexOf(room)
    rooms[roomIndex] = updatedRoom

    reservations = [...reservations, newReservation]

    res.status(201).json(newReservation)
})

app.put('/reservations/:id', (req, res) => {
    const id = Number(req.params.id)
    let newInfo = req.body

    if (newInfo.customer_name || newInfo.room_number || newInfo.check_in_date || newInfo.total_amount) {
        return res.status(400).json({ error: 'you cannot edit the customer_name, room_number, check_in_date or total_amount' })
    }

    const reservation = reservations.find(reservation => reservation.id === id)

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
        const customer = customers.find(customer => customer.id === newInfo.customer_id)

        if (!customer) {
            return res.status(404).json({ error: 'customer not found' })
        }

        const newCustomer = {
            customer_name: customer.name
        }

        newInfo = { ...newInfo, ...newCustomer }
    }

    if (newInfo.room_id) {
        const room = rooms.find(room => room.id === newInfo.room_id)

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


        const updatedRoom = { ...room, availability: false }

        const indexRoom = rooms.indexOf(room)
        rooms[indexRoom] = updatedRoom


        const oldRoom = rooms.find(room => room.id === reservation.room_id)

        const updatedOldRoom = { ...oldRoom, availability: true }

        const indexOldRoom = rooms.indexOf(oldRoom)
        rooms[indexOldRoom] = updatedOldRoom

        newInfo = { ...newInfo, ...newRoom }
    }

    if (newInfo.check_out_date) {
        const checkOutDate = new Date(newInfo.check_out_date).getTime()
        const checkInDate = new Date(reservation.check_in_date).getTime()
        const diff = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)

        const room = rooms.find(room => room.id === reservation.room_id)

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
                const customer = customers.find(customer => customer.id === reservation.customer_id)

                const newActiveResevations = { ...customer, active_reservations: customer.active_reservations > 0 ? customer.active_reservations - 1 : 0 }

                const customerIndex = customers.indexOf(customer)
                customers[customerIndex] = newActiveResevations

                const room = rooms.find(room => room.id === reservation.room_id)

                const updatedRoom = { ...room, availability: true }

                const roomIndex = rooms.indexOf(room)
                rooms[roomIndex] = updatedRoom
                break
            }
        }
    }

    const updatedReservation = { ...reservation, ...newInfo }

    const index = reservations.indexOf(reservation)
    reservations[index] = updatedReservation

    res.status(200).json(updatedReservation)

})

app.delete('/reservations/:id', (req, res) => {
    const id = Number(req.params.id)
    const reservation = reservations.find(reservation => reservation.id === id)


    if (!reservation) {
        return res.status(404).json({ error: 'reservation not found' })
    }

    const room = rooms.find(room => room.id === reservation.room_id)

    const updatedRoom = { ...room, availability: true }

    const roomIndex = rooms.indexOf(room)
    rooms[roomIndex] = updatedRoom

    reservations = reservations.filter(reservation => reservation.id !== id)

    const activeStates = ['checked-in', 'confirmed']

    if (activeStates.includes(reservation.status.toLowerCase())) {
        const customer = customers.find(customer => customer.id === reservation.customer_id)
        const newActiveResevations = { ...customer, active_reservations: customer.active_reservations - 1 }

        const customerIndex = customers.indexOf(customer)
        customers[customerIndex] = newActiveResevations
    }

    res.status(200).json(reservation)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})