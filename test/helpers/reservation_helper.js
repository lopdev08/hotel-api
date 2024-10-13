const supertest = require('supertest')
const { app } = require('../../index')
const api = supertest(app)

const Reservation = require('../../models/Reservation')

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

const getAllReservations = async () => {
    const response = await api.get('/reservations')

    return {
        checkInDates: response.body.map(reservation => reservation.check_in_date),
        checkOutDates: response.body.map(reservation => reservation.check_out_date),
        customerNames: response.body.map(reservation => reservation.customer_name),
        customerIds: response.body.map(reservation => reservation.customer_id),
        roomNumbers: response.body.map(reservation => reservation.room_number),
        roomIds: response.body.map(reservation => reservation.room_id),
        totalAmounts: response.body.map(reservation => reservation.total_amount),
        statuses: response.body.map(reservation => reservation.status),
        response
    }
}

const getReservationByCustomerName = async (name) => {
    const reservation = await Reservation.findOne({ customer_name: name })

    return reservation
}

module.exports = {
    api,
    initialReservations,
    initialRooms,
    initialCustomers,
    getAllReservations,
    getReservationByCustomerName
}