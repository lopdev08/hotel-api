const mongoose = require('mongoose')
const { server } = require('../index')

const Room = require('../models/Room')
const Reservation = require('../models/Reservation')
const Customer = require('../models/Customer')

const { api, initialRooms, initialCustomers, getAllRooms, getRoomByNumber } = require('./helpers/room_helper')

beforeEach(async () => {
    await Customer.deleteMany({})
    await Room.deleteMany({})
    await Reservation.deleteMany({})

    for (const room of initialRooms) {
        const roomObject = new Room(room)
        await roomObject.save()
    }

    for (const customer of initialCustomers) {
        const customerObject = new Customer(customer)
        await customerObject.save()
    }

})

test('rooms are returned as json', async () => {
    await api
        .get('/rooms')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('there are two rooms', async () => {
    const { response } = await getAllRooms()

    expect(response.body).toHaveLength(initialRooms.length)
})

test('the first room is "doble"', async () => {
    const { types } = await getAllRooms()

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

    const { numbers, response } = await getAllRooms()

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
    // const room = await Room.findOne({ number: 101 })
    const room = await getRoomByNumber(101)
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
    // const room = await Room.findOne({ number: 101 })
    const room = await getRoomByNumber(101)
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
    // const room = await Room.findOne({ number: 101 })
    const room = await getRoomByNumber(101)
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
    // const room = await Room.findOne({ number: 101 })
    const room = await getRoomByNumber(101)

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
    // const room = await Room.findOne({ number: 101 })
    const room = await getRoomByNumber(101)
    const customer = await Customer.findOne({ name: 'John Doe' })

    const reservation = {
        customer_id: customer.id,
        room_id: room.id,
        check_in_date: '2025-10-10',
        check_out_date: '2025-10-15'
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
    // const room = await Room.findOne({ number: 102 })
    const room = await getRoomByNumber(102)

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

    const { response } = await getAllRooms()
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

    const { response } = await getAllRooms()
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

    const { response } = await getAllRooms()
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

    const { response } = await getAllRooms()
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

    const { response } = await getAllRooms()
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

    const { response } = await getAllRooms()
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
    // const room = await Room.findOne({ number: 101 })
    const room = await getRoomByNumber(101)
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
    // const room = await Room.findOne({ number: 101 })
    const room = await getRoomByNumber(101)
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