const mongoose = require('mongoose')
const supertest = require('supertest')
const { app, server } = require('../index')

const Customer = require('../models/Customer')

const api = supertest(app)

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
    await Customer.deleteMany({})

    const customer1 = new Customer(initialCustomers[0])
    await customer1.save()

    const customer2 = new Customer(initialCustomers[1])
    await customer2.save()
})

test('customers are returned json', async () => {
    await api
        .get('/customers')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('there are two customers', async () => {
    const response = await api.get('/customers')
    expect(response.body).toHaveLength(initialCustomers.length)
})

test('the first customer name is John', async () => {
    const response = await api.get('/customers')
    const names = response.body.map(customer => customer.name)
    expect(names).toContain('John Doe')
})

test('the client is created successfully', async () => {
    const newCustomer = {
        name: "Jane Doe",
        email: "doe@gmail.com",
        phone: "1029384756"
    }

    await api
        .post('/customers')
        .send(newCustomer)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/customers')
    const names = response.body.map(customer => customer.name)

    expect(response.body).toHaveLength(initialCustomers.length + 1)
    expect(names).toContain(newCustomer.name)
})

test('should return an error if the name field is empty', async () => {
    const newCustomer = {
        name: "",
        email: "john@gmail.com",
        phone: "1234567890"
    }

    await api
        .post('/customers')
        .send(newCustomer)
        .expect(403)
        .expect('Content-Type', /application\/json/)
})

test('should return an error if the name length is shorter or longer than allowed', async () => {
    const newCustomer = {
        name: "J",
        email: "john@gmail.com",
        phone: "1234567890"
    }

    await api
        .post('/customers')
        .send(newCustomer)
        .expect(403)
        .expect('Content-Type', /application\/json/)
})

test('should return an error if the name contains invalid characters', async () => {
    const newCustomer = {
        name: "John @Doe 123",
        email: "john@gmail.com",
        phone: "1234567890"
    }

    await api
        .post('/customers')
        .send(newCustomer)
        .expect(403)
        .expect('Content-Type', /application\/json/)
})

test('should return an error if the email field is empty', async () => {
    const newCustomer = {
        name: "John Doe",
        email: "",
        phone: "1234567890"
    }

    await api
        .post('/customers')
        .send(newCustomer)
        .expect(403)
        .expect('Content-Type', /application\/json/)
})

test('should return an error if the email is already registered', async () => {
    const newCustomer = {
        name: "John Doe",
        email: "john@gmail.com",
        phone: "1234567890"
    }

    await api
        .post('/customers')
        .send(newCustomer)
        .expect(403)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/customers')
    const emails = response.body.map(customer => customer.email)

    expect(response.body).toHaveLength(initialCustomers.length)
    expect(emails).toContain(newCustomer.email)
})

test('should return an error if the phone is not valid', async () => {
    const newCustomer = {
        name: "Juan Perez",
        email: "juan@gmail.com",
        phone: "123"
    }

    await api
        .post('/customers')
        .send(newCustomer)
        .expect(403)
        .expect('Content-Type', /application\/json/)
})

test('should pass validation when query params are optional', async () => {
    const queryParams = {
        name: "John"
    }

    const response = await api.get('/customers').query(queryParams)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(Array.isArray(response.body)).toBe(true)

    response.body.forEach(customer => {
        expect(customer).toHaveProperty('name')
        expect(customer).toHaveProperty('email')
        expect(customer).toHaveProperty('phone')
    })

})

test('should return an error if the name in query params is invalid', async () => {
    const queryParams = {
        name: "John @Doe 123"
    }

    const response = await api.get('/customers').query(queryParams)

    expect(response.status).toBe(403)
})

test('should return an error if the email in query params is invalid', async () => {
    const queryParams = {
        email: "john@example"
    }

    const response = await api.get('/customers').query(queryParams)

    expect(response.status).toBe(403)
})

test('should return an error if the phone in query params is invalid', async () => {
    const queryParams = {
        phone: "2"
    }

    const response = await api.get('/customers').query(queryParams)

    expect(response.status).toBe(403)
})

test('should return an error if trying to edit name, email, or active_reservations', async () => {
    const customer = await Customer.findOne({ name: "John Doe" })
    const id = customer.id

    const updatedCustomer = {
        name: "John Doe Updated",
        active_reservations: 2
    }

    await api
        .put(`/customers/${id}`)
        .send(updatedCustomer)
        .expect(403)
        .expect('Content-Type', /application\/json/)
})

test('should update the phone if a valid and different value is provided', async () => {
    const customer = await Customer.findOne({ name: "John Doe" })
    const id = customer.id

    const updatedCustomer = {
        phone: 1987654322
    }

    await api
        .put(`/customers/${id}`)
        .send(updatedCustomer)
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('should return an error if phone is missing during update', async () => {
    const customer = await Customer.findOne({ name: "John Doe" })
    const id = customer.id

    const updatedCustomer = {
        phone: ""
    }

    await api
        .put(`/customers/${id}`)
        .send(updatedCustomer)
        .expect(403)
        .expect('Content-Type', /application\/json/)
})

test('should return all customers when no query params are passed', async () => {
    const queryParams = {}

    const response = await api.get('/customers').query(queryParams)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(initialCustomers.length)
    expect(Array.isArray(response.body)).toBe(true)

    response.body.forEach(customer => {
        expect(customer).toHaveProperty('name')
        expect(customer).toHaveProperty('email')
        expect(customer).toHaveProperty('phone')
    })
})

test('should return an error if query params are invalid', async () => {
    const queryParams = {
        name: "John@",
        phone: "123a"
    }

    const response = await api.get('/customers').query(queryParams)

    expect(response.status).toBe(403)
})

test('should return an error if there are validation errors in the creation request', async () => {
    const newCustomer = {
        name: "",
        email: "sdadasdada.com",
        phone: "1234567890"
    }

    await api
        .post('/customers')
        .send(newCustomer)
        .expect(403)
        .expect('Content-Type', /application\/json/)
})

test('should update the customer with a new valid phone', async () => {
    const customer = await Customer.findOne({ name: "John Doe" })
    const id = customer.id

    const updatedCustomer = {
        phone: 1023458902
    }

    await api
        .put(`/customers/${id}`)
        .send(updatedCustomer)
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('should return an error if trying to update the phone with the same value', async () => {
    const customer = await Customer.findOne({ name: "John Doe" })
    const id = customer.id

    const updatedCustomer = {
        phone: 1234567890
    }

    await api
        .put(`/customers/${id}`)
        .send(updatedCustomer)
        .expect(403)
        .expect('Content-Type', /application\/json/)
})

test('should delete the customer if there are no active reservations', async () => {
    const customer = await Customer.findOne({ name: "John Doe" })
    const id = customer.id

    await api
        .delete(`/customers/${id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('should return an error if trying to delete a customer with active reservations', async () => {
    const customer = await Customer.findOne({ name: "Jane Smith" })
    const id = customer.id

    await api
        .delete(`/customers/${id}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)
})

test('should return an error if the customer to be deleted is not found', async () => {
    const id = "66dbf097f88eec62a71a2bd9"

    await api
        .delete(`/customers/${id}`)
        .expect(404)
        .expect('Content-Type', /application\/json/)
})

afterAll(() => {
    mongoose.connection.close()
    server.close()
})