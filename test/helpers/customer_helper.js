const supertest = require('supertest')
const { app } = require('../../index')
const api = supertest(app)

const Customer = require('../../models/Customer')

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

const getAllCustomers = async () => {
    const response = await api.get('/customers')
    return {
        names: response.body.map(customer => customer.name),
        emails: response.body.map(customer => customer.email),
        response
    }
}


const getCustomerByName = async (name) => {
    const customer = await Customer.findOne({ name: name })

    return customer
}

module.exports = { initialCustomers, api, getAllCustomers, getCustomerByName }