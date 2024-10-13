const supertest = require('supertest')
const { app } = require('../../index')
const api = supertest(app)

const Room = require('../../models/Room')

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

const getAllRooms = async () => {
    const response = await api.get('/rooms')
    return {
        types: response.body.map(room => room.type),
        numbers: response.body.map(room => room.number),
        response
    }
}

const getRoomByNumber = async (number) => {
    const room = await Room.findOne({ number: number })

    return room
}

module.exports = {
    api,
    initialRooms,
    initialCustomers,
    getAllRooms,
    getRoomByNumber
}