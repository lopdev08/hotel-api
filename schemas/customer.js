const { Schema } = require('mongoose')

const customerSchema = new Schema({
    name: String,
    email: String,
    phone: Number,
    active_reservations: Number
})

customerSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id

        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = customerSchema