const mongoose = require('mongoose')
const supertest = require('supertest')
const { app, server } = require('../index')

const Room = require('../models/Room')
const Customer = require('../models/Customer')
const Reservation = require('../models/Reservation')

const api = supertest(app)

const initialReservations = [
    {
        customer_id: "",
        customer_name: "John Doe",
        room_id: "",
        room_number: 104,
        check_in_date: "2024-11-01",
        check_out_date: "2024-11-05",
        total_amount: 500,
        status: "confirmed"
    },
    {
        customer_id: "",
        customer_name: "Jane Doe",
        room_id: "",
        room_number: 105,
        check_in_date: "2024-11-06",
        check_out_date: "2024-11-10",
        total_amount: 1000,
        status: "checked-out"
    }
]

const initialRooms = [
    {
        number: 104,
        type: "doble",
        description: 'This is room one, it has a view of the city',
        price_per_nigth: 233,
        availability: true
    },
    {
        number: 105,
        type: "suite",
        description: 'This is room two and it has a jacuzzi',
        price_per_nigth: 350,
        availability: false
    }
]

const initialCustomers = [
    {
        name: "John Doe",
        email: "john@gmail.com",
        phone: 1234567890,
        active_reservations: 0
    },
    {
        name: "Jane Smith",
        email: "jane@gmail.com",
        phone: 1987654321,
        active_reservations: 3
    },
    {
        name: "Bob Johnson",
        email: "bob.johnson@gmail.com",
        phone: 293456891,
        active_reservations: 5
    }
]

beforeEach(async () => {
    await Reservation.deleteMany({})
    await Room.deleteMany({})
    await Customer.deleteMany({})

    const customer1 = new Customer(initialCustomers[0])
    await customer1.save()

    const customer2 = new Customer(initialCustomers[1])
    await customer2.save()

    const customer3 = new Customer(initialCustomers[2])
    await customer3.save()

    const room1 = new Room(initialRooms[0])
    await room1.save()

    const room2 = new Room(initialRooms[1])
    await room2.save()

    const reservation1 = new Reservation({ ...initialReservations[0], room_id: room1.id, customer_id: customer1.id })
    await reservation1.save()

    const reservation2 = new Reservation({ ...initialReservations[1], room_id: room2.id, customer_id: customer2.id })
    await reservation2.save()
})

test('create a new reservation successfully', async () => {
    const customer = await Customer.findOne({ name: "John Doe" })
    const room = await Room.findOne({ number: 104 })

    const newReservation = {
        customer_id: customer.id,
        room_id: room.id,
        check_in_date: "2024-11-11",
        check_out_date: "2024-11-15",
    }


    await api
        .post('/reservations')
        .send(newReservation)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/reservations')
    expect(response.body).toHaveLength(initialReservations.length + 1)

    const checkInDates = response.body.map(reservation => reservation.check_in_date)
    expect(checkInDates).toContain(newReservation.check_in_date)
})

test('return an error if customer_id does not exist', async () => {
    const room = await Room.findOne({ number: 104 })

    const newReservation = {
        customer_id: "5f9f1b9b9c7d1b0e8c8b4569",
        room_id: room.id,
        check_in_date: "2024-11-11",
        check_out_date: "2024-11-15",
    }

    await api
        .post('/reservations')
        .send(newReservation)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/reservations')
    expect(response.body).toHaveLength(initialReservations.length)
})

test('return an error if room_id does not exist', async () => {
    const customer = await Customer.findOne({ name: "John Doe" })

    const newReservation = {
        customer_id: customer.id,
        room_id: "5f9f1b9b9c7d1b0e8c8b4569",
        check_in_date: "2024-11-11",
        check_out_date: "2024-11-15",
    }

    await api
        .post('/reservations')
        .send(newReservation)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/reservations')
    expect(response.body).toHaveLength(initialReservations.length)
})

test('return an error if check_in_date is in the past', async () => {
    const customer = await Customer.findOne({ name: "John Doe" })
    const room = await Room.findOne({ number: 104 })

    const newReservation = {
        customer_id: customer.id,
        room_id: room.id,
        check_in_date: "2024-09-23",
        check_out_date: "2024-11-15",
    }

    await api
        .post('/reservations')
        .send(newReservation)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/reservations')
    expect(response.body).toHaveLength(initialReservations.length)
})

test('return an error if check_out_date is before check_in_date', async () => {
    const customer = await Customer.findOne({ name: "John Doe" })
    const room = await Room.findOne({ number: 104 })

    const newReservation = {
        customer_id: customer.id,
        room_id: room.id,
        check_in_date: "2024-11-11",
        check_out_date: "2024-11-10",
    }

    await api
        .post('/reservations')
        .send(newReservation)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/reservations')
    expect(response.body).toHaveLength(initialReservations.length)
})

test('update a reservation successfully', async () => {
    const reservation = await Reservation.findOne({ customer_name: "John Doe" })
    const room = await Room.findOne({ number: 104 })

    const updatedReservation = {
        room_id: room.id,
        check_out_date: "2024-11-06"
    }

    await api
        .put(`/reservations/${reservation.id}`)
        .send(updatedReservation)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/reservations')
    expect(response.body).toHaveLength(initialReservations.length)

    const checkOutDates = response.body.map(reservation => reservation.check_out_date)
    expect(checkOutDates).toContain(updatedReservation.check_out_date)

    const roomIds = response.body.map(reservation => reservation.room_id)
    expect(roomIds).toContain(room.id)
})

test('return an error if trying to update a non-existent reservation', async () => {
    const updatedReservation = {
        check_out_date: "2024-11-06"
    }

    const nonExistentId = "66dbf097f88eec62a71a2bd9"

    await api
        .put(`/reservations/${nonExistentId}`)
        .send(updatedReservation)
        .expect(403)
})

test('return an error if trying to update a reservation with invalid status', async () => {
    const reservation = await Reservation.findOne({ customer_name: "Jane Doe" })

    const updatedReservation = {
        check_out_date: "2024-11-06"
    }

    await api
        .put(`/reservations/${reservation.id}`)
        .send(updatedReservation)
        .expect(403)
})

test('check check-out date is greater than check-in date', async () => {
    const newReservation = {
        customer_id: "5f9f1b9b9c7d1b0e8c8b4569",
        customer_name: "John Doe",
        room_id: "5f9f1b9b9c7d1b0e8c8b4568",
        room_number: 107,
        check_in_date: "2024-11-11",
        check_out_date: "2024-11-10",
    }

    await api
        .post('/reservations')
        .send(newReservation)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    expect(await Reservation.find({})).toHaveLength(initialReservations.length)
})

test('check if customer_id exists and is valid', async () => {
    const newReservation = {
        customer_id: "e",
        customer_name: "John Doe",
        room_id: "5f9f1b9b9c7d1b0e8c8b4568",
        room_number: 107,
        check_in_date: "2024-11-11",
        check_out_date: "2024-11-15",
    }

    await api
        .post('/reservations')
        .send(newReservation)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    expect(await Reservation.find({})).toHaveLength(initialReservations.length)
})

test('check customer exists and has fewer than 5 active reservations', async () => {
    const customer = await Customer.findOne({ name: "Bob Johnson" })

    const newReservation = {
        customer_id: customer.id,
        customer_name: customer.name,
        room_id: "5f9f1b9b9c7d1b0e8c8b4568",
        room_number: 107,
        check_in_date: "2024-11-11",
        check_out_date: "2024-11-15",
    }

    await api
        .post('/reservations')
        .send(newReservation)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    expect(await Reservation.find({})).toHaveLength(initialReservations.length)
})

test('check if room_id exists and is valid', async () => {
    const newReservation = {
        customer_id: "5f9f1b9b9c7d1b0e8c8b4568",
        customer_name: "John Doe",
        room_id: "e",
        room_number: 107,
        check_in_date: "2024-11-11",
        check_out_date: "2024-11-15",
    }

    await api
        .post('/reservations')
        .send(newReservation)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    expect(await Reservation.find({})).toHaveLength(initialReservations.length)
})

test('check room exists and is available', async () => {
    const room = await Room.findOne({ number: 105 })

    const newReservation = {
        customer_id: "5f9f1b9b9c7d1b0e8c8b4568",
        customer_name: "John Doe",
        room_id: room.id,
        room_number: room.number,
        check_in_date: "2024-11-11",
        check_out_date: "2024-11-15",
    }

    await api
        .post('/reservations')
        .send(newReservation)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    expect(await Reservation.find({})).toHaveLength(initialReservations.length)
})

test('check if check-in date is valid and not in the past', async () => {
    const newReservation = {
        customer_id: "5f9f1b9b9c7d1b0e8c8b4568",
        customer_name: "John Doe",
        room_id: "5f9f1b9b9c7d1b0e8c8b4566",
        room_number: 107,
        check_in_date: "11/11/2024",
        check_out_date: "2024-11-15",
    }

    await api
        .post('/reservations')
        .send(newReservation)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    expect(await Reservation.find({})).toHaveLength(initialReservations.length)
})

test('check if check-out date is valid and not in the past', async () => {
    const newReservation = {
        customer_id: "5f9f1b9b9c7d1b0e8c8b4565",
        customer_name: "John Doe",
        room_id: "5f9f1b9b9c7d1b0e8c8b4566",
        room_number: 107,
        check_in_date: "2024-11-11",
        check_out_date: "11/11/2024",
    }

    await api
        .post('/reservations')
        .send(newReservation)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    expect(await Reservation.find({})).toHaveLength(initialReservations.length)
})

test('check if query check-in date is in valid format', async () => {
    const queryParams = {
        check_in_date: "2024-11-06"
    }

    const response = await api.get('/reservations').query(queryParams)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)

    response.body.forEach(reservation => {
        expect(reservation.check_in_date).toContain(queryParams.check_in_date)
    })
})

test('check if query check-out date is in valid format', async () => {
    const queryParams = {
        check_out_date: "2024-11-06"
    }

    const response = await api.get('/reservations').query(queryParams)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)

    response.body.forEach(reservation => {
        expect(reservation.check_out_date).toContain(queryParams.check_out_date)
    })
})

test('check if query customer_id is in valid format', async () => {
    const customer = await Customer.findOne({ name: "John Doe" })

    const queryParams = {
        customer_id: customer.id
    }

    const response = await api.get('/reservations').query(queryParams)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)

    response.body.forEach(reservation => {
        expect(reservation.customer_id).toContain(queryParams.customer_id)
    })
})

test('check if query room_id is valid', async () => {
    const room = await Room.findOne({ number: 104 })

    const queryParams = {
        room_id: room.id
    }

    const response = await api.get('/reservations').query(queryParams)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)

    response.body.forEach(reservation => {
        expect(reservation.room_id).toContain(queryParams.room_id)
    })
})

test('prevent editing customer_name, room_number, check_in_date, total_amount', async () => {
    const reservation = await Reservation.findOne({ customer_name: "John Doe" })

    const updatedReservation = {
        customer_name: "Jane Doe",
        room_number: 108,
        check_in_date: "2024-11-12",
        total_amount: 200
    }

    await api
        .put(`/reservations/${reservation.id}`)
        .send(updatedReservation)
        .expect(403)

    const response = await api.get('/reservations')
    expect(response.body).toHaveLength(initialReservations.length)

    const customerNames = response.body.map(reservation => reservation.customer_name)
    expect(customerNames).toContain("John Doe")

    const roomNumbers = response.body.map(reservation => reservation.room_number)
    expect(roomNumbers).toContain(104)

    const checkInDates = response.body.map(reservation => reservation.check_in_date)
    expect(checkInDates).toContain("2024-11-01")

    const totalAmounts = response.body.map(reservation => reservation.total_amount)
    expect(totalAmounts).toContain(1000)
})

test('require at least one editable field for reservation update', async () => {
    const reservation = await Reservation.findOne({ customer_name: "John Doe" })

    const updatedReservation = {
    }

    await api
        .put(`/reservations/${reservation.id}`)
        .send(updatedReservation)
        .expect(403)

    const response = await api.get('/reservations')
    expect(response.body).toHaveLength(initialReservations.length)

    const customerNames = response.body.map(reservation => reservation.customer_name)
    expect(customerNames).toContain("John Doe")
})

test('check if updated customer_id is valid and exists', async () => {
    const reservation = await Reservation.findOne({ customer_name: "John Doe" })
    const customer = await Customer.findOne({ name: "Jane Smith" })

    const updatedReservation = {
        customer_id: customer.id
    }

    await api
        .put(`/reservations/${reservation.id}`)
        .send(updatedReservation)
        .expect(200)

    const response = await api.get('/reservations')
    expect(response.body).toHaveLength(initialReservations.length)

    const customerIds = response.body.map(reservation => reservation.customer_id)
    expect(customerIds).toContain(updatedReservation.customer_id)
})

test('check if updated room_id is valid and available', async () => {
    const reservation = await Reservation.findOne({ customer_name: "John Doe" })
    const room = await Room.findOne({ number: 105 })

    const updatedReservation = {
        room_id: room.id
    }

    await api
        .put(`/reservations/${reservation.id}`)
        .send(updatedReservation)
        .expect(403)

    const response = await api.get('/reservations')
    expect(response.body).toHaveLength(initialReservations.length)

    const roomIds = response.body.map(reservation => reservation.room_id)
    expect(roomIds).toContain(updatedReservation.room_id)
})

test('check if updated check-out date is valid and different from current', async () => {
    const reservation = await Reservation.findOne({ customer_name: "John Doe" })

    const updatedReservation = {
        check_out_date: "2024-11-01"
    }

    await api
        .put(`/reservations/${reservation.id}`)
        .send(updatedReservation)
        .expect(403)

    const response = await api.get('/reservations')
    expect(response.body).toHaveLength(initialReservations.length)
})

test('check if updated status is valid', async () => {
    const reservation = await Reservation.findOne({ customer_name: "John Doe" })

    const updatedReservation = {
        status: "active"
    }

    await api
        .put(`/reservations/${reservation.id}`)
        .send(updatedReservation)
        .expect(403)

    const response = await api.get('/reservations')
    expect(response.body).toHaveLength(initialReservations.length)

    const statuses = response.body.map(reservation => reservation.status)
    expect(statuses).toContain("confirmed")
})

afterAll(() => {
    mongoose.connection.close()
    server.close()
})