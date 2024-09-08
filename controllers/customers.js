const Customer = require('../models/Customer')

class CustomerController {
    static async getAll(req, res) {
        try {
            let customers = await Customer.find({})
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
        } catch (error) {
            console.error(error)
        }
    }

    static async getById(req, res) {
        try {
            const id = req.params.id
            const customer = await Customer.findById(id)

            if (!customer) {
                return res.status(404).json({ error: 'customer not found' })
            }

            res.status(200).json(customer)
        } catch (error) {
            console.error(error)
        }
    }

    static async create(req, res) {
        try {
            const { name, email, phone } = req.body

            if (!name || !email || !phone) {
                return res.status(400).json({ error: 'name, email or phone is missing' })
            }

            const customer = await Customer.find({ email: { $regex: new RegExp(email, 'i') } })

            if (customer.length > 0) {
                return res.status(400).json({ error: 'the email has already been registered' })
            }

            const newCustomer = new Customer({
                name: name,
                email: email,
                phone: parseInt(phone),
                active_reservations: 0
            })

            const saveNewCustomer = await newCustomer.save()

            res.status(201).json(saveNewCustomer)
        } catch (error) {
            console.error(error)
        }
    }

    static async update(req, res) {
        try {
            const id = req.params.id
            const newInfo = req.body

            if (newInfo.name || newInfo.email || newInfo.active_reservations) {
                return res.status(400).json({ error: 'you cannot edit the name, email or active reservations' })
            }

            if (!newInfo.phone) {
                return res.status(400).json({ error: 'number is missing' })
            }

            const customer = await Customer.findByIdAndUpdate(id, newInfo, { new: true })

            if (!customer) {
                return res.status(404).json({ error: 'customer not found' })
            }

            res.status(200).json(customer)
        } catch (error) {
            console.error(error)
        }
    }

    static async delete(req, res) {
        try {
            const id = req.params.id
            const customer = await Customer.findById(id)

            if (!customer) {
                return res.status(404).json({ error: 'customer not found' })
            }

            await Customer.findByIdAndDelete(id)

            res.status(200).json(customer)
        } catch (error) {
            console.error(error)
        }
    }
}

module.exports = CustomerController