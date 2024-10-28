const Customer = require('../models/Customer')

const bcrypt = require('bcrypt')

class CustomerController {
    static async getAll(req, res, next) {
        try {
            let customers = await Customer.find({}).populate('reservations', {
                room_number: 1,
                check_in_date: 1,
                check_out_date: 1,
                total_amount: 1,
                status: 1
            })
            const { name, email, phone } = req.query

            if (name !== undefined) {
                customers = customers.filter(customer => customer.name.toLowerCase().includes(name.toLowerCase()))
            }

            if (email !== undefined) {
                customers = customers.filter(customer => customer.email.toLowerCase().includes(email.toLowerCase()))
            }

            if (phone !== undefined) {
                customers = customers.filter(customer => customer.phone.contains(parseInt(phone)))
            }

            res.status(200).json(customers)
        } catch (error) {
            next(error)
        }
    }

    static async getById(req, res, next) {
        try {
            const id = req.params.id
            const customer = await Customer.findById(id)

            if (!customer) {
                return res.status(404).json({ error: 'customer not found' })
            }

            res.status(200).json(customer)
        } catch (error) {
            next(error)
        }
    }

    static async create(req, res, next) {
        try {
            const { username, name, email, password, phone } = req.body

            const saltRounds = 10
            const passwordHash = await bcrypt.hash(password, saltRounds)

            const newCustomer = new Customer({
                username: username,
                name: name,
                email: email,
                passwordHash: passwordHash,
                phone: phone,
                active_reservations: 0
            })

            const saveNewCustomer = await newCustomer.save()

            res.status(201).json(saveNewCustomer)
        } catch (error) {
            next(error)
        }
    }

    static async update(req, res, next) {
        try {
            const id = req.params.id
            const newInfo = req.body

            const customer = await Customer.findByIdAndUpdate(id, newInfo, { new: true })

            if (!customer) {
                return res.status(404).json({ error: 'customer not found' })
            }

            res.status(200).json(customer)
        } catch (error) {
            next(error)
        }
    }

    static async delete(req, res, next) {
        try {
            const id = req.params.id
            const customer = await Customer.findById(id)

            if (!customer) {
                return res.status(404).json({ error: 'customer not found' })
            }

            if (customer.active_reservations > 0) {
                return res.status(400).json({
                    error: 'you cannot delete a customer with active reservations'
                })
            }

            await Customer.findByIdAndDelete(id)

            res.status(200).json(customer)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = CustomerController