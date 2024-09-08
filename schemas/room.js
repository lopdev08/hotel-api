const { Schema } = require('mongoose')

const roomSchema = new Schema({
    number: Number,
    type: String,
    description: String,
    price_per_nigth: Number,
    availability: Boolean
})

roomSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id

        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = roomSchema