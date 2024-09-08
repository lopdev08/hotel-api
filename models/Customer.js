const { model } = require('mongoose')

const customerSchema = require('../schemas/customer')

const Customer = model('Customer', customerSchema)

module.exports = Customer