const mongoose = require('mongoose')
const supertest = require('supertest')
const { app, server } = require('../index')

const Room = require('../models/Room')
const Reservation = require('../models/Reservation')
const Customer = require('../models/Customer')

const api = supertest(app)

const initialRooms = [
    {
        number: 101,
        type: "doble",
        description: 'This is room one, it has a view of the city',
        price_per_nigth: 233,
        availability: true
    },
    {
        number: 102,
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
        phone: "1234567890",
        active_reservations: 0
    },
    {
        name: "Jane Smith",
        email: "jane@gmail.com",
        phone: "0987654321",
        active_reservations: 3
    }
]


beforeEach(async () => {
    await Room.deleteMany({})
    await Reservation.deleteMany({})
    await Customer.deleteMany({})

    const room1 = new Room(initialRooms[0])
    await room1.save()

    const room2 = new Room(initialRooms[1])
    await room2.save()

    const customer1 = new Customer(initialCustomers[0])
    await customer1.save()

    const customer2 = new Customer(initialCustomers[1])
    await customer2.save()

})

test('rooms are returned as json', async () => {
    await api
        .get('/rooms')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('there are two rooms', async () => {
    const response = await api.get('/rooms')

    expect(response.body).toHaveLength(initialRooms.length)
})

test('the first room is "doble"', async () => {
    const response = await api.get('/rooms')
    const types = response.body.map(room => room.type)

    expect(types).toContain('doble')
})

test('a valid room can be added', async () => {
    const newRoom = {
        number: 103,
        type: 'suite',
        description: 'This is room three has a sea view',
        price_per_nigth: 450,
        availability: true
    }

    await api
        .post('/rooms')
        .send(newRoom)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/rooms')
    const numbers = response.body.map(room => room.number)

    expect(response.body).toHaveLength(initialRooms.length + 1)
    expect(numbers).toContain(newRoom.number)
})

test('should return all rooms without filters', async () => {
    const queryParams = {}

    const response = await api.get('/rooms').query(queryParams)

    expect(response.body).toHaveLength(initialRooms.length)
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)

    response.body.forEach(room => {
        expect(room).toHaveProperty('number')
        expect(room).toHaveProperty('type')
        expect(room).toHaveProperty('description')
        expect(room).toHaveProperty('price_per_nigth')
        expect(room).toHaveProperty('availability')
    })
})

test('should return rooms filtered by type', async () => {
    const queryParams = { type: 'doble' }

    const response = await api.get('/rooms').query(queryParams)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)

    response.body.forEach(room => {
        expect(room.type).toBe('doble')
    })
})

test('should return rooms filtered by availability', async () => {
    const queryParams = { availability: 'false' }

    const response = await api.get('/rooms').query(queryParams)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)

    response.body.forEach(room => {
        expect(room.availability).toBe(false)
    })
})

test('should return rooms filtered by price range', async () => {
    const queryParams = { min_price: 200, max_price: 300 }

    const response = await api.get('/rooms').query(queryParams)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)

    response.body.forEach(room => {
        expect(room.price_per_nigth).toBeGreaterThanOrEqual(queryParams.min_price)
        expect(room.price_per_nigth).toBeLessThanOrEqual(queryParams.max_price)
    })
})

test('should return rooms filtered by number', async () => {
    const queryParams = { number: 101 }

    const response = await api.get('/rooms').query(queryParams)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBe(1)

    response.body.forEach(room => {
        expect(room.number).toBe(queryParams.number)
    })
})

test('should return rooms filtered by description', async () => {
    const queryParams = { description: 'city' }

    const response = await api.get('/rooms').query(queryParams)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBe(1)

    response.body.forEach(room => {
        expect(room.description.toLowerCase()).toContain(queryParams.description.toLowerCase())
    })
})

test('should return a room by its ID', async () => {
    const room = await Room.findOne({ number: 101 })
    const response = await api.get(`/rooms/${room.id}`)

    expect(response.status).toBe(200)
    expect(response.body.number).toBe(room.number)
    expect(response.body.type).toBe(room.type)
    expect(response.body.description).toBe(room.description)
    expect(response.body.price_per_nigth).toBe(room.price_per_nigth)
    expect(response.body.availability).toBe(room.availability)
})

test('should return 404 if the room is not found', async () => {
    const nonExistingId = '66dbf097f88eec62a71a2bd9'
    const response = await api.get(`/rooms/${nonExistingId}`)

    expect(response.status).toBe(404)
})

test('should update an existing room with valid data', async () => {
    const room = await Room.findOne({ number: 101 })
    const updatedRoom = {
        type: 'suite',
        price_per_nigth: 300,
        availability: false
    }

    const response = await api
        .put(`/rooms/${room.id}`)
        .send(updatedRoom)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(response.body.availability).toBe(updatedRoom.availability)
    expect(response.body.type).toBe(updatedRoom.type)
    expect(response.body.price_per_nigth).toBe(updatedRoom.price_per_nigth)
})

test('should return error 404 if the room to update does not exist', async () => {
    const nonExistingId = '66dbf097f88eec62a71a2bd9'

    await api
        .put(`/rooms/${nonExistingId}`)
        .send({ type: 'suite' })
        .expect(404)
})

test('should update only specified fields of the room', async () => {
    const room = await Room.findOne({ number: 101 })
    const updatedRoom = {
        availability: false
    }

    const response = await api
        .put(`/rooms/${room.id}`)
        .send(updatedRoom)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(response.body.availability).toBe(updatedRoom.availability)
    expect(response.body.type).toBe(room.type)
    expect(response.body.price_per_nigth).toBe(room.price_per_nigth)
})

test('should delete a room by its ID', async () => {
    const room = await Room.findOne({ number: 101 })

    await api
        .delete(`/rooms/${room.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const rooms = await Room.find({})

    expect(rooms).toHaveLength(initialRooms.length - 1)
})

test('should return 404 if the room to delete does not exist', async () => {
    const nonExistingId = '66dbf097f88eec62a71a2bd9'

    await api
        .delete(`/rooms/${nonExistingId}`)
        .expect(404)
})

test('should return error if the room has active reservations', async () => {
    const room = await Room.findOne({ number: 101 })
    const customer = await Customer.findOne({ name: 'John Doe' })

    const reservation = {
        customer_id: customer.id,
        room_id: room.id,
        check_in_date: '2024-10-10',
        check_out_date: '2024-10-15'
    }

    await api
        .post('/reservations')
        .send(reservation)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    await api
        .delete(`/rooms/${room.id}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const rooms = await Room.find({})

    expect(rooms).toHaveLength(initialRooms.length)
})

test('should return 200 with room data after successful deletion', async () => {
    const room = await Room.findOne({ number: 102 })

    const response = await api
        .delete(`/rooms/${room.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const rooms = await Room.find({})

    expect(response.body.number).toBe(room.number)
    expect(response.body.type).toBe(room.type)
    expect(response.body.description).toBe(room.description)
    expect(response.body.price_per_nigth).toBe(room.price_per_nigth)
    expect(response.body.availability).toBe(room.availability)
    expect(response.status).toBe(200)
    expect(rooms).toHaveLength(initialRooms.length - 1)
})

test('should return error if number is missing', async () => {
    const newRoom = {
        type: 'suite',
        description: 'This is room three has a sea view',
        price_per_nigth: 450,
        availability: true
    }

    await api
        .post('/rooms')
        .send(newRoom)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/rooms')
    expect(response.body).toHaveLength(initialRooms.length)
})

test('should return error if price per night is invalid', async () => {
    const newRoom = {
        number: 103,
        type: 'suite',
        description: 'This is room three has a sea view',
        price_per_nigth: 1500,
        availability: true
    }

    await api
        .post('/rooms')
        .send(newRoom)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/rooms')
    expect(response.body).toHaveLength(initialRooms.length)
})

test('should return error if room type is invalid', async () => {
    const newRoom = {
        number: 103,
        type: 'familiar',
        description: 'This is room three has a sea view',
        price_per_nigth: 450,
        availability: true
    }

    await api
        .post('/rooms')
        .send(newRoom)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/rooms')
    expect(response.body).toHaveLength(initialRooms.length)
})

test('should return error if number already exists', async () => {
    const newRoom = {
        number: 101,
        type: 'suite',
        description: 'This is room three has a sea view',
        price_per_nigth: 450,
        availability: true
    }

    await api
        .post('/rooms')
        .send(newRoom)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/rooms')
    expect(response.body).toHaveLength(initialRooms.length)
})

test('should return error if availability is missing', async () => {
    const newRoom = {
        number: 103,
        type: 'suite',
        description: 'This is room three has a sea view',
        price_per_nigth: 450
    }

    await api
        .post('/rooms')
        .send(newRoom)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/rooms')
    expect(response.body).toHaveLength(initialRooms.length)
})

test('should return error if required fields are missing', async () => {
    const newRoom = {
        type: 'suite',
        description: 'This is room three has a sea view',
        price_per_nigth: 450
    }

    await api
        .post('/rooms')
        .send(newRoom)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/rooms')
    expect(response.body).toHaveLength(initialRooms.length)
})

test('should return error if the room ID is invalid', async () => {
    const nonExistingId = '132db231ases324ed'

    await api
        .get(`/rooms/${nonExistingId}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)
})

test('should return error if price per night is invalid during update', async () => {
    const room = await Room.findOne({ number: 101 })
    const updatedRoom = {
        price_per_nigth: 1500
    }

    await api
        .put(`/rooms/${room.id}`)
        .send(updatedRoom)
        .expect(403)
        .expect('Content-Type', /application\/json/)
})

test('should return error if room availability is not provided during update', async () => {
    const room = await Room.findOne({ number: 101 })
    const updatedRoom = {
        availability: "available"
    }

    await api
        .put(`/rooms/${room.id}`)
        .send(updatedRoom)
        .expect(403)
        .expect('Content-Type', /application\/json/)
})

afterAll(() => {
    mongoose.connection.close()
    server.close()
})