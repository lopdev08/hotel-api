const uniqueValidator = require('mongoose-unique-validator')
const { Schema } = require('mongoose')

const customerSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    name: String,
    email: String,
    passwordHash: String,
    phone: Number,
    active_reservations: Number,
    reservations: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Reservation'
        }
    ]
})

customerSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id

        delete returnedObject._id
        delete returnedObject.__v

        delete returnedObject.passwordHash
    }
})

customerSchema.plugin(uniqueValidator)

module.exports = customerSchema